### Overview

The `codeHandler.js` file defines two HTTP endpoints (`GET` and `POST`) using Express.js. These endpoints handle requests to generate code snippets through an AI assistant powered by OpenAI's API. The responses are streamed back to the client in real-time using Server-Sent Events (SSE), and the code snippets are wrapped with custom markers (`[CODE_START:language]` and `[CODE_END]`) to clearly delineate the code sections.

### Line-by-Line Explanation

```javascript
import express from "express";
import { generateChatResponse } from "../utils/openAiHelpers.js";
```
- **Import Statements**: The code imports the Express framework and a helper function `generateChatResponse` from a utility file. These are necessary for setting up the server and interacting with the OpenAI API.

```javascript
const router = express.Router();
```
- **Router Initialization**: Creates a new router object using Express. This router will handle the defined routes (`GET` and `POST`) for code generation.

#### GET Route

```javascript
// GET route for streaming code with artifact markers using query-based message history
router.get("/", async (req, res) => {
```
- **GET Route Definition**: Sets up a `GET` endpoint at the root path (`"/"`). This route will handle incoming GET requests to generate and stream code.

```javascript
  try {
    const messagesParam = req.query.message;
    let messages;
```
- **Try Block Start**: Begins a `try` block to handle potential errors.
- **Retrieve Query Parameter**: Extracts the `message` parameter from the query string of the request URL.
- **Initialize `messages` Variable**: Declares a variable `messages` to store the parsed messages.

```javascript
    try {
      messages = JSON.parse(messagesParam);
    } catch (error) {
      throw new Error("Invalid message format");
    }
```
- **Parse JSON Messages**: Attempts to parse the `messagesParam` from a JSON string into a JavaScript object.
- **Error Handling**: If parsing fails, throws an error indicating an invalid message format.

```javascript
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*"
    });
```
- **Set Response Headers**: Configures the response to use SSE by setting the `Content-Type` to `text/event-stream` and other headers to manage caching and connections.

```javascript
    const instructions = `You are a helpful AI assistant capable of generating detailed responses including code snippets and other artifacts.
    
    IMPORTANT INSTRUCTION ABOUT CODE FORMATTING:
    Whenever you need to write code:
    1. First, send the marker "[CODE_START:language]"
    2. Write your code without markdown backticks
    3. End with "[CODE_END]"
    
    Always use these markers and provide detailed explanations.`;
```
- **Define AI Instructions**: Creates a string `instructions` that instructs the AI on how to format code snippets with specific markers.

```javascript
    const completeMessages = [...messages.messages];
```
- **Prepare Messages**: Copies the `messages` array from the parsed `messages` object into a new array `completeMessages`.

```javascript
    const stream = await generateChatResponse({
      model: "gpt-4o",
      messages: completeMessages,
      stream: true,
      instructions,
    });
```
- **Generate Chat Response**: Calls the `generateChatResponse` function with the specified model, messages, streaming enabled, and the defined instructions. This returns a stream of events from the AI.

```javascript
    let contentSent = false;
```
- **Initialize Tracking Variable**: Sets a flag `contentSent` to `false` to monitor if any content has been sent to the client.

```javascript
    for await (const event of stream) {
      console.log("Received event type:", event.type);
```
- **Process Streamed Events**: Iterates over each event in the stream asynchronously and logs the event type.

```javascript
      let content = null;

      if (event.type === "response.output_text.delta") {
        content = typeof event.delta === "string" ? event.delta : event.delta?.text;
      }
```
- **Extract Content**: Initializes `content` to `null`. If the event type is `response.output_text.delta`, it extracts the text from the event's delta property.

```javascript
      if (event.type === "error") {
        console.error("Stream error:", event.error);
        res.write(`data: ${JSON.stringify({ error: "Stream error occurred" })}\n\n`);
      }
```
- **Handle Errors**: If the event type is `error`, logs the error and sends an error message to the client.

```javascript
      if (content) {
        contentSent = true;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
        if (res.flush) res.flush();
      }
    }
```
- **Send Content to Client**: If `content` is available, sets `contentSent` to `true`, writes the content to the response, and flushes the response if possible.

```javascript
    if (!contentSent) console.warn("No content was sent during the stream");
```
- **Warn if No Content**: Logs a warning if no content was sent during the stream.

```javascript
    res.write("data: [DONE]\n\n");
    res.end();
```
- **Finish Response**: Sends a `[DONE]` message to indicate the end of the stream and closes the response.

```javascript
  } catch (error) {
    console.error("Error in streaming:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Error processing stream request", message: error.message });
    } else {
      res.write(`data: ${JSON.stringify({ error: "Stream error occurred", message: error.message })}\n\n`);
      res.end();
    }
  }
});
```
- **Catch Block for Errors**: Handles any errors that occur within the `try` block. If headers have not been sent, it responds with a 500 status and error message. If headers are already sent, it sends an error message through the stream and ends the response.

#### POST Route

```javascript
// POST route for real-time code generation with system instruction injection
router.post("/", async (req, res) => {
```
- **POST Route Definition**: Sets up a `POST` endpoint at the root path (`"/"`). This route handles incoming POST requests to generate and stream code based on the request body.

```javascript
  try {
    const userInput = req.body.userInput;
    const history = req.body.history || [];
    const instructions = req.body.instructions || "";
    const model = req.body.model || "gpt-4o";
    const temperature = req.body.temperature || 0.7;
    const message = { role: "user", content: userInput };
```
- **Extract Request Body Data**: Retrieves `userInput`, `history`, `instructions`, `model`, and `temperature` from the request body. If some are not provided, it assigns default values.
- **Create User Message**: Constructs a `message` object with the user's input.

```javascript
    res.writeHead(200, {
      "Content-Type": "text/event-stream", 
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*"
    });
```
- **Set Response Headers**: Configures the response for SSE, similar to the GET route.

```javascript
    const artifactInstructions = `You are a helpful AI assistant capable of generating detailed responses including code snippets and other artifacts.
    
    IMPORTANT INSTRUCTION ABOUT CODE FORMATTING:
    Whenever you need to write code:
    1. First, send the marker "[CODE_START:language]"
    2. Write your code without markdown backticks
    3. End with "[CODE_END]"
    
    Always use these markers and provide detailed explanations.`;
```
- **Define Artifact Instructions**: Creates a string `artifactInstructions` containing instructions for formatting code with custom markers.

```javascript
    const combinedInstructions = instructions 
      ? `${instructions}\n\n${artifactInstructions}` 
      : artifactInstructions;
```
- **Combine Instructions**: If additional `instructions` are provided in the request, appends `artifactInstructions` to them. Otherwise, uses `artifactInstructions` alone.

```javascript
    const completeMessages = [...history, message];
```
- **Prepare Messages**: Combines the `history` array with the new `message` into `completeMessages`.

```javascript
    const stream = await generateChatResponse({
      model,
      messages: completeMessages,
      stream: true,
      instructions: combinedInstructions,
      temperature
    });
```
- **Generate Chat Response**: Calls `generateChatResponse` with the specified parameters, including the combined instructions and temperature setting. This returns a stream of events from the AI.

```javascript
    let contentSent = false;
```
- **Initialize Tracking Variable**: Sets a flag `contentSent` to `false` to monitor if any content has been sent to the client.

```javascript
    for await (const event of stream) {
      console.log("Received event type:", event.type);
```
- **Process Streamed Events**: Iterates over each event in the stream asynchronously and logs the event type.

```javascript
      let content = null;

      if (event.type === "response.output_text.delta") {
        content = typeof event.delta === "string" ? event.delta : event.delta?.text;
      } else if (event.type === "text_delta") {
        content = event.text;
      } else if (event.type === "error") {
        console.error("Stream error:", event.error);
        res.write(`data: ${JSON.stringify({ error: "Stream error occurred" })}\n\n`);
      }
```
- **Extract Content**: Initializes `content` to `null`.
  - If the event type is `response.output_text.delta`, extracts the text from the event's delta property.
  - If the event type is `text_delta`, extracts the text directly from the event.
  - If the event type is `error`, logs the error and sends an error message to the client.

```javascript
      if (content) {
        contentSent = true;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
        if (res.flush) res.flush();
      }
    }
```
- **Send Content to Client**: If `content` is available, sets `contentSent` to `true`, writes the content to the response, and flushes the response if possible.

```javascript
    if (!contentSent) console.warn("No content was sent during the stream");
```
- **Warn if No Content**: Logs a warning if no content was sent during the stream.

```javascript
    res.write("data: [DONE]\n\n");
    res.end();
```
- **Finish Response**: Sends a `[DONE]` message to indicate the end of the stream and closes the response.

```javascript
  } catch (error) {
    console.error("Error in streaming:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Error processing stream request", message: error.message });
    } else {
      res.write(`data: ${JSON.stringify({ error: "Stream error occurred", message: error.message })}\n\n`);
      res.end();
    }
  }
});
```
- **Catch Block for Errors**: Handles any errors that occur within the `try` block. If headers have not been sent, it responds with a 500 status and error message. If headers are already sent, it sends an error message through the stream and ends the response.

```javascript
export default router;
```
- **Export Router**: Exports the configured router so it can be used in other parts of the application.

```javascript
/**
 * codeHandler.js
 * 
 * This Express router provides streaming endpoints for AI-powered code generation,
 * integrated with custom artifact markers ([CODE_START:language] and [CODE_END]).
 * It supports both GET and POST requests using Server-Sent Events (SSE) to enable
 * real-time communication with the frontend.
 * 
 * Key Features:
 * - Real-time AI response streaming using OpenAI's Assistants API
 * - Custom system instructions to enforce code formatting rules
 * - Support for both query-based (GET) and body-based (POST) usage
 * - Graceful error handling with detailed logs
 * - Flushable chunked delivery compatible with front-end renderers
 * 
 * Endpoints:
 * - GET `/code`: Streams response from `messages` query parameter
 * - POST `/code`: Streams response from JSON body input (`userInput`, `history`, etc.)
 * 
 * Dependencies:
 * - `express` for route handling
 * - `openAiHelpers.js` for generating assistant responses
 * 
 * Path: //GPT/gptcore/node/routes/codeHandler.js
 */
```
- **File Documentation**: Provides a detailed description of the `codeHandler.js` file, its purpose, key features, available endpoints, dependencies, and its file path within the project structure.