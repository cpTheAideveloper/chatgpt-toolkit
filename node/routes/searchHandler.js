import express from "express";
import { openai } from "../utils/openaiconfig.js";

const router = express.Router();
// Add this new route for search functionality
router.post("/", async (req, res) => {
    try {
      const userInput = req.body.userInput;
      const systemInstructions = req.body.systemInstructions || "You are a helpful assistant with access to web search. Provide accurate and up-to-date information based on search results.";
      const searchSize = req.body.searchSize || "low"; // Options: "low", "medium", "high"
      const model = req.body.model || "gpt-4o-mini";
      
      console.log(`Processing search request with input: "${userInput.substring(0, 50)}..."`);
      console.log(`Search context size: ${searchSize}`);
      
      // Create message object for the search function
      const messages =[ { role: "user", content: userInput }];
      

       const response = await openai.responses.create({
          model: model,
          tools: [{ type: "web_search_preview", search_context_size: searchSize }],
          input: messages,
          instructions: systemInstructions,
        });
      
      console.log("Search completed successfully");
      
      // Return the result in the expected format
      res.status(200).json({
        role: 'assistant', 
        content: response.output_text
      });
    } catch (error) {
      console.error("Error processing search request:", error);
      
      // Provide more detailed error information
      const errorMessage = error.message || "Unknown error";
      const statusCode = error.status || 500;
      
      res.status(statusCode).json({ 
        error: "Error processing search request",
        message: errorMessage
      });
    }
  });
  
  // Stream version of the search route
  router.post("/realtime", async (req, res) => {
    try {
      const userInput = req.body.userInput;
      const systemInstructions = req.body.systemInstructions || "You are a helpful assistant with access to web search. Provide accurate and up-to-date information based on search results.";
      const searchSize = req.body.searchSize || "medium";
      const model = req.body.model || "gpt-4o";
      
      // Set headers for streaming
      res.setHeader("Content-Type", "text/plain");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("Transfer-Encoding", "chunked");
      
      // Create message object for the API
      const message = [{ role: "user", content: userInput }];
      
      console.log(`Starting search stream with query: "${userInput.substring(0, 50)}..."`);
      
      // Call OpenAI API directly for streaming with search
      const stream = await openai.responses.create({
        model: model,
        tools: [{ type: "web_search_preview", search_context_size: searchSize }],
        input: message,
        instructions: systemInstructions,
        stream: true
      });
      
      // Process stream events
      for await (const event of stream) {
        switch (event.type) {
          case "response.output_text.delta":
            // Extract content from delta
            let textChunk = '';
            if (typeof event.delta === 'string') {
              textChunk = event.delta;
            } else if (event.delta && event.delta.text) {
              textChunk = event.delta.text;
            }
            
            if (textChunk) {
              res.write(textChunk);
              
              // Force flush if available
              if (res.flush) {
                res.flush();
              }
            }
            break;
            
          case "response.file_search_call.searching":
            // Optionally notify when search is happening
            console.log("Searching the web...");
            break;
            
          case "response.file_search_call.completed":
            // Optionally log when search completes
            console.log("Web search completed");
            break;
            
          case "error":
            console.error("Stream error:", event.error);
            res.write("\n[Error during search]");
            break;
        }
      }
      
      console.log("Search stream completed");
      res.end();
    } catch (error) {
      console.error("Error in search stream:", error);
      
      if (!res.headersSent) {
        res.status(500).json({ 
          error: "Error processing search stream request", 
          message: error.message 
        });
      } else {
        res.write("\n[Error: " + error.message + "]");
        res.end();
      }
    }
  });
  


export default router;
