// GPT/gptcore/node/index.js
import express from "express";
import { config } from "dotenv";
import cors from "cors";

// Route handlers
import chatHandler from './routes/chatHandler.js';
import imageHandler from './routes/imageHandler.js';
import AudioHandler from './routes/audioHandler.js';
import FileProccesing from './routes/fileProcesing.js';
import FileHandler from "./routes/fileHandler.js";
import SearchHandler from "./routes/searchHandler.js";
import CodeHandler from "./routes/codeHandler.js";
import FileRealtimeProcesing from "./routes/fileRealtimeProcesing.js";
import docsRouter from "./routes/docs.js";
import CodeDocumenter from "./demoapproutes/codeDocumenter.js"

// Load environment variables
config();

const app = express();
const port = process.env.PORT || 8000;

// Configure CORS to allow requests from your React app
// In your server/index.js
const corsOptions = {
  origin: 'http://localhost:5173', // Make sure this matches your React app's exact URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true, // Include this if you're using cookies/sessions
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Route Mounting
app.use('/chat', chatHandler);
app.use('/image', imageHandler);
app.use('/audio', AudioHandler);
app.use('/file', FileProccesing);
app.use('/realtime-file', FileRealtimeProcesing);
app.use('/filestream', FileHandler);
app.use('/search', SearchHandler);
app.use('/code', CodeHandler);
app.use("/docs", docsRouter);
app.use("/code-documenter", CodeDocumenter)


// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

/**
 * index.js
 *
 * This is the main entry point for the GPTCore Node.js backend server.
 * It sets up the Express application, loads environment configurations,
 * applies middleware, and mounts all API route modules responsible for handling
 * different AI-powered features like chat, audio, image generation, file analysis, etc.
 *
 * Key Responsibilities:
 * - Initializes Express server with JSON and CORS middleware
 * - Loads environment variables using dotenv
 * - Registers route handlers by feature category (chat, image, audio, file, etc.)
 * - Starts the server on a configurable port
 *
 * Routes:
 * - `/chat`: Handles AI chat and streaming conversations
 * - `/image`: Handles AI image generation or processing
 * - `/audio`: Handles audio transcription or TTS
 * - `/file`: Handles AI file analysis and responses
 * - `/realtime-file`: Handles real-time streaming responses from files
 * - `/filestream`: Manages file-based stream interactions
 * - `/search`: AI-assisted web search
 * - `/code`: AI-assisted code generation or interpretation
 * * - `/code-documenter`: NEW route for AI documentation of code files
 *
 * Dependencies:
 * - `express`: HTTP server and routing
 * - `cors`: Enables CORS for cross-origin requests
 * - `dotenv`: Loads `.env` for secure API keys and configs
 *
 * Path: //GPT/gptcore/node/index.js
 */
