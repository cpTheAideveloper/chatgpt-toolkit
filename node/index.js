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
import DeepResearchHandler from "./routes/deepResearchHandler.js"; // New Deep Research handler
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
app.use('/deep-research', DeepResearchHandler); // New Deep Research route mounting
app.use('/code', CodeHandler);
app.use("/docs", docsRouter);
app.use("/code-documenter", CodeDocumenter)

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Available routes:`);
  console.log(`  - /chat: AI chat and streaming conversations`);
  console.log(`  - /image: AI image generation and processing`);
  console.log(`  - /audio: Audio transcription and TTS`);
  console.log(`  - /file: AI file analysis and responses`);
  console.log(`  - /realtime-file: Real-time streaming file responses`);
  console.log(`  - /filestream: File-based stream interactions`);
  console.log(`  - /search: AI-assisted web search`);
  console.log(`  - /deep-research: NEW - Comprehensive AI research with multiple sources`);
  console.log(`  - /code: AI-assisted code generation`);
  console.log(`  - /docs: Documentation browser`);
  console.log(`  - /code-documenter: AI code documentation`);
});

/**
 * index.js
 *
 * This is the main entry point for the GPTCore Node.js backend server.
 * It sets up the Express application, loads environment configurations,
 * applies middleware, and mounts all API route modules responsible for handling
 * different AI-powered features like chat, audio, image generation, file analysis, etc.
 *
 * UPDATED: Added Deep Research functionality with comprehensive AI research capabilities
 * using OpenAI's o3-deep-research and o4-mini-deep-research models.
 *
 * Key Responsibilities:
 * - Initializes Express server with JSON and CORS middleware
 * - Loads environment variables using dotenv
 * - Registers route handlers by feature category (chat, image, audio, file, etc.)
 * - Starts the server on a configurable port
 * - Provides startup logging for available routes
 *
 * Routes:
 * - `/chat`: Handles AI chat and streaming conversations
 * - `/image`: Handles AI image generation or processing
 * - `/audio`: Handles audio transcription or TTS
 * - `/file`: Handles AI file analysis and responses
 * - `/realtime-file`: Handles real-time streaming responses from files
 * - `/filestream`: Manages file-based stream interactions
 * - `/search`: AI-assisted web search
 * - `/deep-research`: NEW - Comprehensive AI research with web search and code execution
 * - `/code`: AI-assisted code generation or interpretation
 * - `/code-documenter`: AI documentation of code files
 * - `/docs`: Documentation browser
 *
 * Deep Research Features:
 * - Multi-source research with hundreds of web searches
 * - Code execution for data analysis and calculations
 * - Background processing for long-running research tasks
 * - Citation tracking and source management
 * - Configurable research depth and focus areas
 *
 * Dependencies:
 * - `express`: HTTP server and routing
 * - `cors`: Enables CORS for cross-origin requests
 * - `dotenv`: Loads `.env` for secure API keys and configs
 *
 * Path: //GPT/gptcore/node/index.js
 */