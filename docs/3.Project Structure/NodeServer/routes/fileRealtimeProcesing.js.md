### **Overview**

This code sets up an Express.js router that handles file uploads for Word documents (`.doc`, `.docx`) and PDF documents (`.pdf`). It processes the uploaded files by extracting their text content, sends this content along with user input to OpenAI's API to generate responses, and streams these responses back to the client in real-time.

---

### **Detailed Explanation**

#### **1. Importing Dependencies**

```javascript
import express from "express";
import multer from "multer";
import mammoth from "mammoth";
import {
  generateChatResponse
} from "../utils/openAiHelpers.js";
import { createTempFile, extractTextFromPdf } from "../utils/fileHelpers.js"; // Import helpers
import fs from "fs";
```

- **express**: Framework for building web applications.
- **multer**: Middleware for handling file uploads.
- **mammoth**: Library to extract text from Word documents.
- **generateChatResponse**: Function to interact with OpenAI's API.
- **createTempFile, extractTextFromPdf**: Helper functions for file handling.
- **fs**: Node.js file system module for file operations.

#### **2. Setting Up the Router and File Upload Middleware**

```javascript
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
```

- **router**: Creates a new router object to define routes.
- **upload**: Configures multer to store uploaded files in memory.

#### **3. Handling POST Requests for Word Documents**

```javascript
router.post("/word", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const userInput = req.body.userInput;
    if (!file) {
      return res.status(400).json({ error: "No file received" });
    }

    // 1) Create temp file, parse Word doc
    const tempFilePath = await createTempFile(file);
    const { value: extractedText } = await mammoth.extractRawText({ path: tempFilePath });
    await fs.promises.unlink(tempFilePath);

    // 2) SSE headers
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Transfer-Encoding", "chunked");

    // 3) Build messages
    const message = {
      role: "user",
      content: [
        { type: "input_text", text: userInput },
        { type: "input_text", text: `File content: ${extractedText}` }
      ]
    };

    console.log("Starting Word doc stream:", userInput);

    // 4) Start streaming
    const stream = await generateChatResponse({
      model: "gpt-4.1-nano",
      messages: [message],
      stream: true
    });

    // 5) for-await-of events
    for await (const event of stream) {
      console.log("Event type:", event.type);

      switch (event.type) {
        case "response.created":
          console.log("Response started (Word doc)");
          res.write(""); 
          break;

        case "response.output_text.delta":
          if (event.delta) {
            let textChunk = "";
            if (typeof event.delta === "string") {
              textChunk = event.delta;
            } else if (event.delta.text) {
              textChunk = event.delta.text;
            }

            if (textChunk) {
              console.log("Sending chunk:", textChunk);
              res.write(textChunk);
              if (res.flush) res.flush();
            }
          }
          break;

        case "response.completed":
          console.log("Response completed (Word doc)");
          break;

        case "response.output_text.done":
          console.log("Full text for Word doc done:", event.text);
          break;

        case "error":
          console.error("Stream error for Word doc:", event.error);
          res.write("\n[Error during Word doc stream]");
          break;

        default:
          console.log("Unhandled event:", event.type);
      }
    }

    console.log("Finished streaming Word doc");
    res.end();
  } catch (err) {
    console.error("Error processing Word doc stream:", err);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: "Error streaming Word doc", 
        message: err.message 
      });
    } else {
      res.write(`\n[Error: ${err.message}]`);
      res.end();
    }
  }
});
```

- **router.post("/word", ...)**: Defines a POST route at `/word`.
- **upload.single("file")**: Middleware to handle single file upload with the field name "file".
- **async (req, res) => { ... }**: Asynchronous route handler.
  
**Inside the Route Handler:**

1. **Extract File and User Input**
   ```javascript
   const file = req.file;
   const userInput = req.body.userInput;
   if (!file) {
     return res.status(400).json({ error: "No file received" });
   }
   ```
   - Retrieves the uploaded file and user input from the request.
   - Returns a 400 error if no file is uploaded.

2. **Create Temporary File and Extract Text from Word Document**
   ```javascript
   const tempFilePath = await createTempFile(file);
   const { value: extractedText } = await mammoth.extractRawText({ path: tempFilePath });
   await fs.promises.unlink(tempFilePath);
   ```
   - Creates a temporary file from the uploaded file.
   - Uses Mammoth to extract raw text from the Word document.
   - Deletes the temporary file after extraction.

3. **Set SSE Headers for Streaming**
   ```javascript
   res.setHeader("Content-Type", "text/plain");
   res.setHeader("Cache-Control", "no-cache");
   res.setHeader("Connection", "keep-alive");
   res.setHeader("Transfer-Encoding", "chunked");
   ```
   - Configures response headers for Server-Sent Events (SSE) to enable streaming.

4. **Build the Message for OpenAI**
   ```javascript
   const message = {
     role: "user",
     content: [
       { type: "input_text", text: userInput },
       { type: "input_text", text: `File content: ${extractedText}` }
     ]
   };
   ```
   - Constructs a message object combining user input and extracted file text.

5. **Start Streaming Response from OpenAI**
   ```javascript
   console.log("Starting Word doc stream:", userInput);

   const stream = await generateChatResponse({
     model: "gpt-4.1-nano",
     messages: [message],
     stream: true
   });
   ```
   - Logs the start of streaming.
   - Calls `generateChatResponse` with the message to initiate streaming from OpenAI.

6. **Handle Streaming Events**
   ```javascript
   for await (const event of stream) {
     console.log("Event type:", event.type);

     switch (event.type) {
       case "response.created":
         console.log("Response started (Word doc)");
         res.write(""); 
         break;

       case "response.output_text.delta":
         if (event.delta) {
           let textChunk = "";
           if (typeof event.delta === "string") {
             textChunk = event.delta;
           } else if (event.delta.text) {
             textChunk = event.delta.text;
           }

           if (textChunk) {
             console.log("Sending chunk:", textChunk);
             res.write(textChunk);
             if (res.flush) res.flush();
           }
         }
         break;

       case "response.completed":
         console.log("Response completed (Word doc)");
         break;

       case "response.output_text.done":
         console.log("Full text for Word doc done:", event.text);
         break;

       case "error":
         console.error("Stream error for Word doc:", event.error);
         res.write("\n[Error during Word doc stream]");
         break;

       default:
         console.log("Unhandled event:", event.type);
     }
   }

   console.log("Finished streaming Word doc");
   res.end();
   ```
   - Iterates over each event from the OpenAI stream.
   - **response.created**: Indicates the start of the response.
   - **response.output_text.delta**: Contains chunks of generated text to send to the client.
   - **response.completed**: Marks the completion of the response.
   - **response.output_text.done**: Indicates that the full text has been processed.
   - **error**: Handles any streaming errors.
   - **default**: Logs any unhandled event types.
   - Ends the response after streaming is complete.

7. **Error Handling**
   ```javascript
   } catch (err) {
     console.error("Error processing Word doc stream:", err);
     if (!res.headersSent) {
       res.status(500).json({ 
         error: "Error streaming Word doc", 
         message: err.message 
       });
     } else {
       res.write(`\n[Error: ${err.message}]`);
       res.end();
     }
   }
   ```
   - Catches any errors during processing.
   - Sends a 500 error response if headers haven't been sent.
   - Writes an error message to the stream if headers have already been sent.

#### **4. Handling POST Requests for PDF Documents**

```javascript
router.post("/pdf", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const userInput = req.body.userInput;

    if (!file) {
      return res.status(400).json({ error: "No file received" });
    }

    // 1) Generate a temporary file, parse the PDF text
    const tempFilePath = await createTempFile(file);
    const extractedText = await extractTextFromPdf(tempFilePath);
    await fs.promises.unlink(tempFilePath);

    // 2) Set up SSE-style headers for streaming
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Transfer-Encoding", "chunked");

    // 3) Build your messages or prompt
    const message = { 
      role: "user", 
      content: [
        { type: "input_text", text: userInput },
        { type: "input_text", text: `File content: ${extractedText}` }
      ]
    };

    // 4) Start streaming from OpenAI
    console.log("Starting PDF stream with user input:", userInput);
    const stream = await generateChatResponse({
      model: "gpt-4.1-nano", 
      messages: [message], 
      stream: true
    });

    // 5) Process each event in a for-await-of
    for await (const event of stream) {
      console.log("Received event type:", event.type);

      switch (event.type) {
        case "response.created":
          console.log("Response started");
          // Optionally send an initial chunk to "open" the connection
          res.write("");
          break;

        case "response.output_text.delta":
          // "delta" can be a plain string or an object with ".text"
          if (event.delta) {
            let textChunk = "";
            if (typeof event.delta === "string") {
              textChunk = event.delta;
            } else if (event.delta.text) {
              textChunk = event.delta.text;
            }

            if (textChunk) {
              console.log("Sending PDF text chunk:", textChunk);
              res.write(textChunk);

              // Force flush if possible
              if (res.flush) res.flush();
            }
          }
          break;

        case "response.completed":
          console.log("Stream completed");
          break;

        // Additional event types from logs
        case "response.output_text.done":
          console.log("Full text completed:", event.text);
          break;

        case "error":
          console.error("Stream error:", event.error);
          res.write("\n[Error during PDF generation]");
          break;

        default:
          // Possibly log or ignore
          console.log("Unhandled event type:", event.type, event);
      }
    }

    console.log("Finished streaming PDF response");
    res.end();
  } catch (error) {
    console.error("Error processing PDF stream:", error);
    if (!res.headersSent) {
      // Return JSON if no data was sent yet
      res.status(500).json({
        error: "Error processing PDF stream request",
        message: error.message
      });
    } else {
      // If already streaming, write an error chunk
      res.write(`\n[Error: ${error.message}]`);
      res.end();
    }
  }
});
```

- **router.post("/pdf", ...)**: Defines a POST route at `/pdf`.
- **upload.single("file")**: Middleware to handle single file upload with the field name "file".
- **async (req, res) => { ... }**: Asynchronous route handler.

**Inside the Route Handler:**

1. **Extract File and User Input**
   ```javascript
   const file = req.file;
   const userInput = req.body.userInput;

   if (!file) {
     return res.status(400).json({ error: "No file received" });
   }
   ```
   - Retrieves the uploaded file and user input from the request.
   - Returns a 400 error if no file is uploaded.

2. **Create Temporary File and Extract Text from PDF**
   ```javascript
   const tempFilePath = await createTempFile(file);
   const extractedText = await extractTextFromPdf(tempFilePath);
   await fs.promises.unlink(tempFilePath);
   ```
   - Creates a temporary file from the uploaded file.
   - Uses `extractTextFromPdf` to extract text from the PDF.
   - Deletes the temporary file after extraction.

3. **Set SSE Headers for Streaming**
   ```javascript
   res.setHeader("Content-Type", "text/plain");
   res.setHeader("Cache-Control", "no-cache");
   res.setHeader("Connection", "keep-alive");
   res.setHeader("Transfer-Encoding", "chunked");
   ```
   - Configures response headers for Server-Sent Events (SSE) to enable streaming.

4. **Build the Message for OpenAI**
   ```javascript
   const message = { 
     role: "user", 
     content: [
       { type: "input_text", text: userInput },
       { type: "input_text", text: `File content: ${extractedText}` }
     ]
   };
   ```
   - Constructs a message object combining user input and extracted file text.

5. **Start Streaming Response from OpenAI**
   ```javascript
   console.log("Starting PDF stream with user input:", userInput);
   const stream = await generateChatResponse({
     model: "gpt-4.1-nano", 
     messages: [message], 
     stream: true
   });
   ```
   - Logs the start of streaming.
   - Calls `generateChatResponse` with the message to initiate streaming from OpenAI.

6. **Handle Streaming Events**
   ```javascript
   for await (const event of stream) {
     console.log("Received event type:", event.type);

     switch (event.type) {
       case "response.created":
         console.log("Response started");
         // Optionally send an initial chunk to "open" the connection
         res.write("");
         break;

       case "response.output_text.delta":
         // "delta" can be a plain string or an object with ".text"
         if (event.delta) {
           let textChunk = "";
           if (typeof event.delta === "string") {
             textChunk = event.delta;
           } else if (event.delta.text) {
             textChunk = event.delta.text;
           }

           if (textChunk) {
             console.log("Sending PDF text chunk:", textChunk);
             res.write(textChunk);

             // Force flush if possible
             if (res.flush) res.flush();
           }
         }
         break;

       case "response.completed":
         console.log("Stream completed");
         break;

       // Additional event types from logs
       case "response.output_text.done":
         console.log("Full text completed:", event.text);
         break;

       case "error":
         console.error("Stream error:", event.error);
         res.write("\n[Error during PDF generation]");
         break;

       default:
         // Possibly log or ignore
         console.log("Unhandled event type:", event.type, event);
     }
   }

   console.log("Finished streaming PDF response");
   res.end();
   ```
   - Iterates over each event from the OpenAI stream.
   - **response.created**: Indicates the start of the response.
   - **response.output_text.delta**: Contains chunks of generated text to send to the client.
   - **response.completed**: Marks the completion of the response.
   - **response.output_text.done**: Indicates that the full text has been processed.
   - **error**: Handles any streaming errors.
   - **default**: Logs any unhandled event types.
   - Ends the response after streaming is complete.

7. **Error Handling**
   ```javascript
   } catch (error) {
     console.error("Error processing PDF stream:", error);
     if (!res.headersSent) {
       // Return JSON if no data was sent yet
       res.status(500).json({
         error: "Error processing PDF stream request",
         message: error.message
       });
     } else {
       // If already streaming, write an error chunk
       res.write(`\n[Error: ${error.message}]`);
       res.end();
     }
   }
   ```
   - Catches any errors during processing.
   - Sends a 500 error response if headers haven't been sent.
   - Writes an error message to the stream if headers have already been sent.

#### **5. Exporting the Router**

```javascript
export default router;
```

- Exports the configured router for use in the main Express application.

---

This breakdown covers each part of the `fileRealtimeProcessing.js` file, explaining how it handles file uploads, processes the files, interacts with OpenAI's API, and streams responses back to the client.