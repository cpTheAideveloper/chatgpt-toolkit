import { useState, useRef, useEffect } from "react";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { Banner } from "@/components/Banner";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessage } from "@/components/ChatMessage";
import { DeepResearchSettingsModal } from "@/components/DeepResearchSettingsModal";
import { ClarificationModal } from "@/components/ClarificationModal";

// Enhanced Deep Research Chat Interface with Progress Tracking
export function DeepResearch() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showClarifications, setShowClarifications] = useState(false);
  const [isBackgroundMode, setIsBackgroundMode] = useState(false);
  const [backgroundJobId, setBackgroundJobId] = useState(null);
  
  // Progress tracking states
  const [currentActivity, setCurrentActivity] = useState("");
  const [progressDetails, setProgressDetails] = useState({});
  const [toolCallsCount, setToolCallsCount] = useState(0);
  const [currentLinks, setCurrentLinks] = useState([]);
  const [allDiscoveredLinks, setAllDiscoveredLinks] = useState([]);

  // Clarification states
  const [clarificationQuestions, setClarificationQuestions] = useState([]);
  const [clarificationAnswers, setClarificationAnswers] = useState({});
  const [pendingResearchQuery, setPendingResearchQuery] = useState("");

  // Deep Research configuration with default values
  const [model, setModel] = useState("o3-deep-research");
  const [maxToolCalls, setMaxToolCalls] = useState(50);
  const [includeCodeInterpreter, setIncludeCodeInterpreter] = useState(true);
  const [enableClarifications, setEnableClarifications] = useState(false);
  const [customSources, setCustomSources] = useState([]);
  const [systemInstructions, setSystemInstructions] = useState(
    "You are a research analyst AI with access to web search and code execution. Conduct thorough research using multiple sources, provide specific figures and statistics, prioritize reliable sources, and include inline citations. Be analytical and data-driven."
  );

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Hide banner on first message
  useEffect(() => {
    if (messages.length > 0) {
      setShowBanner(false);
    }
  }, [messages]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showSettings || showClarifications) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [showSettings, showClarifications]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const pollBackgroundJob = async (jobId) => {
    try {
      const res = await fetch(`http://localhost:8000/deep-research/status/${jobId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      
      // Update progress information
      if (data.progress) {
        setCurrentActivity(data.progress.current_activity || "");
        setProgressDetails(data.progress.details || {});
        setToolCallsCount(data.progress.tool_calls_count || 0);
        setCurrentLinks(data.progress.current_links || []);
        setAllDiscoveredLinks(data.progress.all_discovered_links || []);
      }
      
      if (data.status === "completed") {
        // Job completed
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        
        setMessages((prev) => [...prev, {
          role: "assistant",
          content: data.response.output_text,
          citations: data.response.citations,
          toolCalls: data.response.tool_calls
        }]);
        
        setLoading(false);
        setIsBackgroundMode(false);
        setBackgroundJobId(null);
        setCurrentActivity("");
        setProgressDetails({});
        setToolCallsCount(0);
        setCurrentLinks([]);
        setAllDiscoveredLinks([]);
        setCurrentLinks([]);
        setAllDiscoveredLinks([]);
      } else if (data.status === "failed") {
        // Job failed
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "The deep research task failed. Please try again with a different query.",
          },
        ]);
        
        setLoading(false);
        setIsBackgroundMode(false);
        setBackgroundJobId(null);
        setCurrentActivity("");
        setProgressDetails({});
        setToolCallsCount(0);
      }
      // If status is "in_progress", continue polling
    } catch (error) {
      console.error("Error polling background job:", error);
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      setLoading(false);
      setIsBackgroundMode(false);
      setBackgroundJobId(null);
      setCurrentActivity("");
      setProgressDetails({});
      setToolCallsCount(0);
      setCurrentLinks([]);
      setAllDiscoveredLinks([]);
    }
  };

  const generateClarifications = async (userQuery) => {
    try {
      console.log("Generating clarifications for:", userQuery);
      
      const res = await fetch("http://localhost:8000/deep-research/clarify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userQuery: userQuery,
          customSources: Array.isArray(customSources) ? customSources : []
        }),
      });

      console.log("Clarification response status:", res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Clarification error response:", errorText);
        throw new Error(`Server returned ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      console.log("Clarification questions received:", data);
      
      return Array.isArray(data.questions) ? data.questions : [];
    } catch (error) {
      console.error("Error generating clarifications:", error);
      
      // Show error message to user but continue with research
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: `⚠️ Could not generate clarification questions: ${error.message}\n\nProceeding with research anyway...`,
        isBackgroundStatus: true
      }]);
      
      return [];
    }
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    if (showBanner) setShowBanner(false);

    const userMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Check if clarifications are enabled
    if (enableClarifications) {
      setPendingResearchQuery(trimmed);
      setLoading(true);
      setCurrentActivity("Generating clarification questions...");
      
      const questions = await generateClarifications(trimmed);
      setLoading(false);
      setCurrentActivity("");
      
      if (questions.length > 0) {
        setClarificationQuestions(questions);
        setClarificationAnswers({});
        setShowClarifications(true);
        return;
      }
    }

    // Proceed with research directly
    await executeResearch(trimmed, {});
  };

  const executeResearch = async (query, clarifications = {}) => {
    setLoading(true);
    setCurrentActivity("Initializing research...");
    setToolCallsCount(0);

    try {
      const requestBody = {
        userInput: query,
        model: model,
        maxToolCalls: maxToolCalls,
        includeCodeInterpreter: includeCodeInterpreter,
        systemInstructions: systemInstructions,
        backgroundMode: isBackgroundMode,
        clarifications: clarifications,
        customSources: Array.isArray(customSources) ? customSources : [],
      };

      console.log("Sending research request:", requestBody);

      const res = await fetch("http://localhost:8000/deep-research", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("Response status:", res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Server error response:", errorText);
        throw new Error(`Server returned ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      console.log("Research response:", data);

      if (isBackgroundMode && data.jobId) {
        // Background mode: start polling
        setBackgroundJobId(data.jobId);
        setCurrentActivity("Research started in background...");
        
        setMessages((prev) => [...prev, {
          role: "assistant",
          content: "🔍 Deep research task started in background mode. This may take several minutes to complete...",
          isBackgroundStatus: true
        }]);

        // Start polling every 5 seconds for better responsiveness
        pollIntervalRef.current = setInterval(() => {
          pollBackgroundJob(data.jobId);
        }, 5000);

      } else {
        // Immediate mode: display result
        setMessages((prev) => [...prev, {
          role: "assistant",
          content: data.content,
          citations: data.citations,
          toolCalls: data.toolCalls
        }]);
        setLoading(false);
        setCurrentActivity("");
        setToolCallsCount(0);
      }

    } catch (error) {
      console.error("Error sending message:", error);
      
      let errorMessage = "An error occurred while processing your deep research query.";
      
      if (error.message.includes("Failed to fetch")) {
        errorMessage = "Unable to connect to the server. Please check if the server is running on http://localhost:8000";
      } else if (error.message.includes("500")) {
        errorMessage = "Server error occurred. Please check the server console for details.";
      } else if (error.message.includes("404")) {
        errorMessage = "Deep research endpoint not found. Please ensure the server has the deep research routes configured.";
      }
      
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `❌ ${errorMessage}\n\nTechnical details: ${error.message}`,
        },
      ]);
      setLoading(false);
      setCurrentActivity("");
      setToolCallsCount(0);
    }
  };

  const handleClarificationComplete = (answers) => {
    setShowClarifications(false);
    setClarificationAnswers(answers);
    executeResearch(pendingResearchQuery, answers);
  };

  const handleClarificationSkip = () => {
    setShowClarifications(false);
    executeResearch(pendingResearchQuery, {});
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  const saveSettings = () => {
    setShowSettings(false);
  };

  const cancelBackgroundJob = async () => {
    if (backgroundJobId && pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
      
      try {
        await fetch(`http://localhost:8000/deep-research/cancel/${backgroundJobId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        console.error("Error canceling background job:", error);
      }
      
      setLoading(false);
      setIsBackgroundMode(false);
      setBackgroundJobId(null);
      setCurrentActivity("");
      setProgressDetails({});
      setToolCallsCount(0);
      
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "Deep research task was cancelled.",
        isBackgroundStatus: true
      }]);
    }
  };

  return (
    <div className="relative flex flex-col w-full h-screen bg-gray-50 dark:bg-gray-900">
      {/* Settings Modal */}
      <DeepResearchSettingsModal
        isOpen={showSettings}
        onClose={toggleSettings}
        title="Deep Research Settings"
        model={model}
        setModel={setModel}
        maxToolCalls={maxToolCalls}
        setMaxToolCalls={setMaxToolCalls}
        includeCodeInterpreter={includeCodeInterpreter}
        setIncludeCodeInterpreter={setIncludeCodeInterpreter}
        systemInstructions={systemInstructions}
        setSystemInstructions={setSystemInstructions}
        isBackgroundMode={isBackgroundMode}
        setIsBackgroundMode={setIsBackgroundMode}
        enableClarifications={enableClarifications}
        setEnableClarifications={setEnableClarifications}
        customSources={customSources}
        setCustomSources={setCustomSources}
        onSave={saveSettings}
      />

      {/* Clarification Modal */}
      <ClarificationModal
        isOpen={showClarifications}
        questions={clarificationQuestions}
        onComplete={handleClarificationComplete}
        onSkip={handleClarificationSkip}
        onClose={() => setShowClarifications(false)}
      />

      {/* Chat Container */}
      <div ref={chatContainerRef} className="flex-1 overflow-auto px-4 py-6 space-y-6">
        {/* Welcome Banner */}
        {showBanner && (
          <div className="max-w-4xl mx-auto">
            <Banner
              title="AI Deep Research"
              description="Conduct comprehensive research using AI with access to web search and code execution. Perfect for market analysis, scientific research, and detailed reports with hundreds of sources."
            />
          </div>
        )}

        {/* Messages */}
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((msg, index) => (
            <ChatMessage key={index} message={msg} />
          ))}

          {loading && (
            <div className="flex flex-col items-center space-y-4">
              {/* Progress Indicator */}
              <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <LoadingIndicator />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Research in Progress
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {currentActivity || "Processing your research query..."}
                    </p>
                  </div>
                </div>

                {/* Progress Details */}
                {(toolCallsCount > 0 || Object.keys(progressDetails).length > 0) && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tool Calls Made:
                      </span>
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        {toolCallsCount} / {maxToolCalls}
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((toolCallsCount / maxToolCalls) * 100, 100)}%` }}
                      />
                    </div>

                    {/* Research Statistics */}
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <div className="font-bold text-blue-600 dark:text-blue-400">
                          {progressDetails.searches_performed || 0}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">Searches</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                        <div className="font-bold text-green-600 dark:text-green-400">
                          {progressDetails.sources_found || 0}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">Sources</div>
                      </div>
                      <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                        <div className="font-bold text-purple-600 dark:text-purple-400">
                          {progressDetails.pages_accessed || 0}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">Pages Read</div>
                      </div>
                    </div>

                    {/* Current Links Being Processed */}
                    {currentLinks && currentLinks.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Currently Processing:
                        </h4>
                        <div className="space-y-1 max-h-24 overflow-y-auto">
                          {currentLinks.map((link, index) => (
                            <div key={index} className="flex items-center space-x-2 text-xs p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                              <div className={`w-2 h-2 rounded-full ${
                                link.status === 'reading' ? 'bg-yellow-500 animate-pulse' : 
                                link.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                              }`} />
                              <a 
                                href={link.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex-1 truncate text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                {link.title}
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* All Discovered Links */}
                    {allDiscoveredLinks && allDiscoveredLinks.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Sources Discovered ({allDiscoveredLinks.length}):
                          </h4>
                          <button 
                            onClick={() => {
                              const linksDiv = document.getElementById('discovered-links');
                              if (linksDiv) {
                                linksDiv.style.display = linksDiv.style.display === 'none' ? 'block' : 'none';
                              }
                            }}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Toggle View
                          </button>
                        </div>
                        <div id="discovered-links" className="space-y-1 max-h-32 overflow-y-auto" style={{display: 'none'}}>
                          {allDiscoveredLinks.map((link, index) => (
                            <div key={index} className="flex items-start space-x-2 text-xs p-2 bg-gray-50 dark:bg-gray-700 rounded">
                              <div className={`w-2 h-2 rounded-full mt-1 ${
                                link.status === 'accessed' ? 'bg-green-500' : 'bg-blue-500'
                              }`} />
                              <div className="flex-1 min-w-0">
                                <a 
                                  href={link.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 dark:text-blue-400 hover:underline block truncate"
                                >
                                  {link.title}
                                </a>
                                {link.snippet && (
                                  <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 line-clamp-2">
                                    {link.snippet}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Background Mode Controls */}
                {isBackgroundMode && backgroundJobId && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Running in background mode...
                      </p>
                      <button
                        onClick={cancelBackgroundJob}
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <ChatInput
        input={input}
        setInput={setInput}
        sendMessage={sendMessage}
        onOpenSettings={toggleSettings}
        isLoading={loading}
        placeholder={enableClarifications ? 
          "Enter your research query (I'll ask follow-up questions to clarify)" : 
          "Enter your research query (e.g., 'Analyze the economic impact of AI on the healthcare industry')"
        }
      />
    </div>
  );
}

/**
 * Enhanced DeepResearch.jsx
 *
 * This component provides an enhanced deep research AI interface with real-time progress
 * tracking, optional clarifications, and custom source configuration. It shows users
 * exactly what the AI is doing during research and allows for better control over the
 * research process.
 *
 * New Features:
 * - Real-time progress tracking with activity indicators
 * - Optional clarification questions before research
 * - Custom sources/links configuration
 * - Enhanced progress visualization
 * - Tool calls counter and progress bar
 * - Background mode with detailed status updates
 *
 * Key Features:
 * - Deep research with web search and code interpreter
 * - Background mode for long-running tasks with enhanced polling
 * - Configurable model selection (o3-deep-research, o4-mini-deep-research)
 * - Adjustable max tool calls and system instructions
 * - Citation and source tracking
 * - Real-time progress updates and cancellation
 * - Clarification workflow for better research targeting
 *
 * Dependencies:
 * - `ChatInput` for user input and settings toggle
 * - `ChatMessage` for displaying AI and user messages with citations
 * - `DeepResearchSettingsModal` for configuration
 * - `ClarificationModal` for interactive clarifications
 * - `Banner` and `LoadingIndicator` for UI enhancements
 *
 * Path: //GPT/gptcore/client/src/pages/TextGeneration&Chat/DeepResearch.jsx
 */