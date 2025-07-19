import express from "express";
import { openai } from "../utils/openaiconfig.js";

const router = express.Router();

// Store for background jobs (in production, use Redis or database)
const backgroundJobs = new Map();

// Clarification endpoint
router.post("/clarify", async (req, res) => {
  try {
    const userQuery = req.body.userQuery;
    const customSources = req.body.customSources || [];
    
    console.log(`Generating clarification questions for: "${userQuery.substring(0, 50)}..."`);
    
    const clarificationPrompt = `
You are an AI assistant that helps generate clarifying questions before conducting deep research. 
Based on the user's research query, generate 3-5 relevant clarifying questions that would help 
improve the research quality and targeting.

User Query: "${userQuery}"

${customSources.length > 0 ? `Custom Sources Provided: ${customSources.map(s => s.name + ' (' + s.url + ')').join(', ')}` : ''}

Generate clarifying questions as a JSON array with this structure:
[
  {
    "id": "unique_id",
    "question": "What specific aspect would you like me to focus on?",
    "description": "Optional description for context",
    "type": "text|select|multiselect",
    "placeholder": "Optional placeholder text",
    "options": [{"label": "Option 1", "value": "opt1"}],
    "examples": ["Example 1", "Example 2"]
  }
]

Focus on questions that would help clarify:
- Specific scope and focus areas
- Target audience or use case
- Time period or geographical focus
- Depth of analysis required
- Specific metrics or outcomes of interest
- Industry or domain-specific requirements

Return only the JSON array, no other text.
`;

    const response = await openai.responses.create({
      model: "gpt-4o",
      input: clarificationPrompt,
      instructions: "Generate helpful clarifying questions as a JSON array. Be concise and relevant."
    });

    let questions = [];
    try {
      // Try to parse the response as JSON
      const jsonMatch = response.output_text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error("Error parsing clarification questions:", parseError);
      // Fallback questions
      questions = [
        {
          id: "scope",
          question: "What specific aspects of this topic are most important to you?",
          type: "text",
          placeholder: "e.g., financial impact, technical details, market trends..."
        },
        {
          id: "timeframe",
          question: "What time period should the research focus on?",
          type: "select",
          options: [
            { label: "Most recent (last 6 months)", value: "recent" },
            { label: "Current year", value: "current_year" },
            { label: "Last 2-3 years", value: "recent_years" },
            { label: "Historical perspective (5+ years)", value: "historical" }
          ]
        },
        {
          id: "depth",
          question: "How detailed should the analysis be?",
          type: "select",
          options: [
            { label: "High-level overview", value: "overview" },
            { label: "Moderate detail", value: "moderate" },
            { label: "Deep technical analysis", value: "deep" }
          ]
        }
      ];
    }

    console.log(`Generated ${questions.length} clarification questions`);
    
    res.status(200).json({ questions });
    
  } catch (error) {
    console.error("Error generating clarification questions:", error);
    res.status(500).json({
      error: "Error generating clarification questions",
      message: error.message
    });
  }
});

// Main deep research route
router.post("/", async (req, res) => {
  try {
    const userInput = req.body.userInput;
    const model = req.body.model || "o3-deep-research";
    const maxToolCalls = req.body.maxToolCalls || 50;
    const includeCodeInterpreter = req.body.includeCodeInterpreter !== false;
    const backgroundMode = req.body.backgroundMode || false;
    const clarifications = req.body.clarifications || {};
    const customSources = req.body.customSources || [];
    let systemInstructions = req.body.systemInstructions || 
      "You are a research analyst AI with access to web search and code execution. Conduct thorough research using multiple sources, provide specific figures and statistics, prioritize reliable sources, and include inline citations. Be analytical and data-driven.";
    
    console.log(`Processing deep research request with input: "${userInput.substring(0, 50)}..."`);
    console.log(`Model: ${model}, Max tool calls: ${maxToolCalls}, Background mode: ${backgroundMode}`);
    
    // Enhance system instructions with clarifications and custom sources
    if (Object.keys(clarifications).length > 0) {
      systemInstructions += "\n\nAdditional context from user clarifications:\n";
      Object.entries(clarifications).forEach(([key, value]) => {
        if (value) {
          // Handle both string and array values (for multiselect questions)
          let processedValue;
          if (Array.isArray(value)) {
            processedValue = value.join(", ");
          } else if (typeof value === 'string') {
            processedValue = value.trim();
          } else {
            processedValue = String(value);
          }
          
          if (processedValue) {
            systemInstructions += `- ${key}: ${processedValue}\n`;
          }
        }
      });
    }

    if (customSources.length > 0) {
      systemInstructions += "\n\nPriority sources to focus on:\n";
      customSources.forEach(source => {
        systemInstructions += `- ${source.name}: ${source.url}\n`;
      });
      systemInstructions += "Try to access and reference these sources when relevant to the research query.\n";
    }
    
    // Build tools array
    const tools = [{ type: "web_search_preview" }];
    if (includeCodeInterpreter) {
      tools.push({ type: "code_interpreter", container: { type: "auto" } });
    }

    // Create request parameters
    const requestParams = {
      model: model,
      input: userInput,
      instructions: systemInstructions,
      tools: tools,
      max_tool_calls: maxToolCalls,
    };

    if (backgroundMode) {
      // Background mode - start job and return immediately
      requestParams.background = true;
      
      console.log("Starting deep research in background mode");
      
      const response = await openai.responses.create(requestParams);
      
      // Store job info with enhanced tracking
      const jobId = response.id;
      backgroundJobs.set(jobId, {
        id: jobId,
        status: "in_progress",
        startTime: new Date(),
        userInput: userInput.substring(0, 100),
        maxToolCalls: maxToolCalls,
        progress: {
          current_activity: "🚀 Initializing research...",
          tool_calls_count: 0,
          current_links: [],
          all_discovered_links: [],
          details: {
            sources_found: 0,
            pages_accessed: 0,
            searches_performed: 0
          }
        }
      });
      
      console.log(`🚀 BACKGROUND JOB STARTED:`, {
        jobId: jobId,
        query: userInput.substring(0, 50) + "...",
        model: model,
        maxToolCalls: maxToolCalls
      });
      
      res.status(200).json({
        jobId: jobId,
        status: "started",
        message: "Deep research task started in background mode"
      });
      
    } else {
      // Immediate mode - wait for completion
      console.log("Starting deep research in immediate mode");
      
      const response = await openai.responses.create(requestParams);
      
      console.log("Deep research completed successfully");
      
      // Extract citations and tool calls from response
      const citations = extractCitations(response);
      const toolCalls = extractToolCalls(response);
      
      res.status(200).json({
        role: 'assistant',
        content: response.output_text,
        citations: citations,
        toolCalls: toolCalls
      });
    }
    
  } catch (error) {
    console.error("Error processing deep research request:", error);
    
    const errorMessage = error.message || "Unknown error";
    const statusCode = error.status || 500;
    
    res.status(statusCode).json({ 
      error: "Error processing deep research request",
      message: errorMessage
    });
  }
});

// Check status of background job with enhanced progress tracking
router.get("/status/:jobId", async (req, res) => {
  try {
    const jobId = req.params.jobId;
    
    console.log(`🔍 Checking status for job: ${jobId}`);
    
    // Check if job exists in our local store
    const jobInfo = backgroundJobs.get(jobId);
    if (!jobInfo) {
      return res.status(404).json({
        error: "Job not found",
        jobId: jobId
      });
    }
    
    // Check status with OpenAI
    const response = await openai.responses.retrieve(jobId);
    
    // Update progress based on response
    let updatedProgress = { ...jobInfo.progress };
    let currentLinks = [];
    
    if (response.output && Array.isArray(response.output)) {
      // Count tool calls made so far
      const toolCallsCount = response.output.filter(item => 
        item.type === "web_search_call" || item.type === "code_interpreter_call"
      ).length;
      
      // Extract current links and activities
      const webSearchCalls = response.output.filter(item => item.type === "web_search_call");
      const lastWebSearch = webSearchCalls[webSearchCalls.length - 1];
      
      // Determine current activity and extract links
      let currentActivity = "Processing research...";
      const lastItem = response.output[response.output.length - 1];
      
      if (lastItem) {
        switch (lastItem.type) {
          case "web_search_call":
            console.log(`📍 Web Search Call:`, {
              id: lastItem.id,
              status: lastItem.status,
              action: lastItem.action
            });
            
            if (lastItem.status === "in_progress") {
              if (lastItem.action?.type === "search") {
                currentActivity = `🔍 Searching: "${lastItem.action.query}"`;
                console.log(`🔍 SEARCHING: ${lastItem.action.query}`);
              } else if (lastItem.action?.type === "open_page") {
                currentActivity = `📖 Reading: ${lastItem.action.url}`;
                currentLinks.push({
                  url: lastItem.action.url,
                  title: lastItem.action.title || "Loading...",
                  status: "reading"
                });
                console.log(`📖 OPENING PAGE: ${lastItem.action.url}`);
              } else if (lastItem.action?.type === "find_in_page") {
                currentActivity = `🔎 Searching in page: "${lastItem.action.query}"`;
                console.log(`🔎 FINDING IN PAGE: ${lastItem.action.query} on ${lastItem.action.url}`);
              }
            } else if (lastItem.status === "completed") {
              currentActivity = "✅ Analyzing search results...";
              
              // Extract results from completed search
              if (lastItem.action?.type === "search" && lastItem.results) {
                console.log(`✅ SEARCH COMPLETED: Found ${lastItem.results.length} results`);
                lastItem.results.forEach((result, index) => {
                  console.log(`   ${index + 1}. ${result.title} - ${result.url}`);
                  currentLinks.push({
                    url: result.url,
                    title: result.title,
                    snippet: result.snippet,
                    status: "found"
                  });
                });
              } else if (lastItem.action?.type === "open_page") {
                console.log(`✅ PAGE READ: ${lastItem.action.url}`);
                currentLinks.push({
                  url: lastItem.action.url,
                  title: lastItem.action.title || "Page Read",
                  status: "completed"
                });
              }
            }
            break;
            
          case "code_interpreter_call":
            console.log(`💻 Code Interpreter Call:`, {
              id: lastItem.id,
              status: lastItem.status,
              code: lastItem.code?.substring(0, 100) + "..."
            });
            
            if (lastItem.status === "in_progress") {
              currentActivity = "💻 Running code analysis...";
              console.log(`💻 EXECUTING CODE: ${lastItem.code?.substring(0, 100)}...`);
            } else if (lastItem.status === "completed") {
              currentActivity = "✅ Processing code results...";
              console.log(`✅ CODE COMPLETED: ${lastItem.output?.substring(0, 100)}...`);
            }
            break;
            
          case "message":
            currentActivity = "📝 Finalizing research report...";
            console.log(`📝 GENERATING FINAL REPORT`);
            break;
            
          default:
            currentActivity = "🔄 Processing research...";
            console.log(`🔄 PROCESSING: ${lastItem.type}`);
        }
      }
      
      // Extract all discovered links from the entire response
      const allLinks = [];
      response.output.forEach(item => {
        if (item.type === "web_search_call" && item.status === "completed") {
          if (item.action?.type === "search" && item.results) {
            item.results.forEach(result => {
              allLinks.push({
                url: result.url,
                title: result.title,
                snippet: result.snippet,
                status: "discovered",
                timestamp: new Date().toISOString()
              });
            });
          } else if (item.action?.type === "open_page") {
            allLinks.push({
              url: item.action.url,
              title: item.action.title || "Page Content",
              status: "accessed",
              timestamp: new Date().toISOString()
            });
          }
        }
      });
      
      updatedProgress = {
        current_activity: currentActivity,
        tool_calls_count: toolCallsCount,
        current_links: currentLinks,
        all_discovered_links: allLinks,
        details: {
          sources_found: response.output.filter(item => 
            item.type === "web_search_call" && item.status === "completed"
          ).length,
          pages_accessed: response.output.filter(item => 
            item.type === "web_search_call" && 
            item.action?.type === "open_page" && 
            item.status === "completed"
          ).length,
          searches_performed: response.output.filter(item => 
            item.type === "web_search_call" && 
            item.action?.type === "search" && 
            item.status === "completed"
          ).length
        }
      };
      
      // Log summary of progress
      console.log(`📊 PROGRESS SUMMARY:`, {
        activity: currentActivity,
        toolCalls: `${toolCallsCount}/${jobInfo.maxToolCalls || 50}`,
        sourcesFound: updatedProgress.details.sources_found,
        pagesAccessed: updatedProgress.details.pages_accessed,
        searchesPerformed: updatedProgress.details.searches_performed
      });
    }
    
    if (response.status === "completed") {
      // Extract response data
      const citations = extractCitations(response);
      const toolCalls = extractToolCalls(response);
      
      // Update job status
      backgroundJobs.set(jobId, {
        ...jobInfo,
        status: "completed",
        completedTime: new Date(),
        progress: {
          current_activity: "Research completed",
          tool_calls_count: updatedProgress.tool_calls_count,
          details: updatedProgress.details
        }
      });
      
      console.log(`Job ${jobId} completed successfully`);
      
      res.status(200).json({
        status: "completed",
        progress: updatedProgress,
        response: {
          output_text: response.output_text,
          citations: citations,
          tool_calls: toolCalls
        }
      });
      
    } else if (response.status === "failed") {
      // Update job status
      backgroundJobs.set(jobId, {
        ...jobInfo,
        status: "failed",
        failedTime: new Date(),
        error: response.error,
        progress: {
          current_activity: "Research failed",
          tool_calls_count: updatedProgress.tool_calls_count,
          details: updatedProgress.details
        }
      });
      
      console.log(`Job ${jobId} failed:`, response.error);
      
      res.status(200).json({
        status: "failed",
        error: response.error,
        progress: updatedProgress
      });
      
    } else {
      // Still in progress - update job info with progress
      backgroundJobs.set(jobId, {
        ...jobInfo,
        progress: updatedProgress
      });
      
      res.status(200).json({
        status: "in_progress",
        progress: updatedProgress
      });
    }
    
  } catch (error) {
    console.error("Error checking job status:", error);
    
    res.status(500).json({
      error: "Error checking job status",
      message: error.message
    });
  }
});

// Cancel background job
router.post("/cancel/:jobId", async (req, res) => {
  try {
    const jobId = req.params.jobId;
    
    console.log(`Canceling job: ${jobId}`);
    
    // Check if job exists
    const jobInfo = backgroundJobs.get(jobId);
    if (!jobInfo) {
      return res.status(404).json({
        error: "Job not found",
        jobId: jobId
      });
    }
    
    // Try to cancel with OpenAI (if API supports it)
    try {
      await openai.responses.cancel(jobId);
    } catch (cancelError) {
      console.log("Cancel API not available or job already completed:", cancelError.message);
    }
    
    // Update job status
    backgroundJobs.set(jobId, {
      ...jobInfo,
      status: "cancelled",
      cancelledTime: new Date(),
      progress: {
        current_activity: "Research cancelled",
        tool_calls_count: jobInfo.progress?.tool_calls_count || 0,
        details: jobInfo.progress?.details || {}
      }
    });
    
    console.log(`Job ${jobId} cancelled`);
    
    res.status(200).json({
      status: "cancelled",
      jobId: jobId
    });
    
  } catch (error) {
    console.error("Error canceling job:", error);
    
    res.status(500).json({
      error: "Error canceling job",
      message: error.message
    });
  }
});

// List active jobs (utility endpoint)
router.get("/jobs", (req, res) => {
  try {
    const jobs = Array.from(backgroundJobs.values()).map(job => ({
      id: job.id,
      status: job.status,
      startTime: job.startTime,
      userInput: job.userInput,
      progress: job.progress
    }));
    
    res.status(200).json({ jobs });
  } catch (error) {
    console.error("Error listing jobs:", error);
    res.status(500).json({
      error: "Error listing jobs",
      message: error.message
    });
  }
});

// Helper function to extract citations from response
function extractCitations(response) {
  const citations = [];
  
  try {
    if (response.output && Array.isArray(response.output)) {
      response.output.forEach(item => {
        if (item.type === "message" && item.content) {
          item.content.forEach(content => {
            if (content.type === "output_text" && content.annotations) {
              content.annotations.forEach(annotation => {
                if (annotation.url && annotation.title) {
                  citations.push({
                    url: annotation.url,
                    title: annotation.title,
                    startIndex: annotation.start_index,
                    endIndex: annotation.end_index
                  });
                }
              });
            }
          });
        }
      });
    }
  } catch (error) {
    console.error("Error extracting citations:", error);
  }
  
  return citations;
}

// Helper function to extract tool calls from response
function extractToolCalls(response) {
  const toolCalls = [];
  
  try {
    if (response.output && Array.isArray(response.output)) {
      response.output.forEach(item => {
        if (item.type === "web_search_call") {
          toolCalls.push({
            type: "web_search",
            id: item.id,
            status: item.status,
            action: item.action,
            timestamp: item.timestamp || new Date().toISOString()
          });
        } else if (item.type === "code_interpreter_call") {
          toolCalls.push({
            type: "code_interpreter",
            id: item.id,
            status: item.status,
            code: item.code,
            output: item.output,
            timestamp: item.timestamp || new Date().toISOString()
          });
        }
      });
    }
  } catch (error) {
    console.error("Error extracting tool calls:", error);
  }
  
  return toolCalls;
}

// Cleanup old jobs (run periodically)
setInterval(() => {
  const now = new Date();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  
  for (const [jobId, job] of backgroundJobs) {
    const jobAge = now - job.startTime;
    if (jobAge > maxAge) {
      backgroundJobs.delete(jobId);
      console.log(`Cleaned up old job: ${jobId}`);
    }
  }
}, 60 * 60 * 1000); // Run every hour

export default router;

/**
 * Enhanced deepResearchHandler.js
 *
 * Express route handler for AI deep research functionality using OpenAI's o3-deep-research
 * and o4-mini-deep-research models. Now includes clarification workflow, custom sources,
 * real-time progress tracking, and enhanced job management.
 *
 * NEW Features:
 * - Clarification questions generation before research
 * - Custom sources integration and prioritization
 * - Real-time progress tracking with activity indicators
 * - Enhanced tool call counting and status updates
 * - Improved job status with detailed progress information
 * - Better error handling and logging
 *
 * Key Features:
 * - Deep research with configurable models (o3-deep-research, o4-mini-deep-research)
 * - Background mode for long-running research tasks with progress tracking
 * - Web search and code interpreter tool integration
 * - Job status tracking and cancellation with progress details
 * - Citation and tool call extraction with timestamps
 * - Automatic cleanup of old jobs
 * - Clarification workflow for better research targeting
 * - Custom sources support for focused research
 *
 * Routes:
 * - POST `/clarify`: Generate clarification questions for research query
 * - POST `/`: Start deep research task (immediate or background mode)
 * - GET `/status/:jobId`: Check status with detailed progress of background research job
 * - POST `/cancel/:jobId`: Cancel active background job
 * - GET `/jobs`: List all active jobs with progress information
 *
 * Dependencies:
 * - OpenAI Responses API with deep research models
 * - Express for HTTP routing
 * - In-memory job storage with progress tracking (use Redis/database in production)
 *
 * Path: //GPT/gptcore/node/routes/deepResearchHandler.js
 */