//GPT/gptcore/node/routes/videoHandler.js
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import { tmpdir } from "os";
import { openai } from "../utils/openAiHelpers.js";
import { generateChatResponse } from "../utils/openAiHelpers.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Utility function to create temporary file from buffer
const createTempFile = async (file) => {
  const tempDir = path.join(process.cwd(), "tmp");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  const tempPath = path.join(tempDir, `${Date.now()}-${file.originalname}`);
  fs.writeFileSync(tempPath, file.buffer);
  return tempPath;
};

// Utility function to delete temporary file
const deleteTempFile = async (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error("Error deleting temp file:", error);
  }
};

// Extract audio from video using FFmpeg
const extractAudioFromVideo = (videoPath, audioPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .noVideo() // Only extract audio
      .audioCodec("libmp3lame") // Use MP3 encoder
      .format("mp3")
      .save(audioPath)
      .on("end", () => {
        console.log("Audio extraction completed");
        resolve();
      })
      .on("error", (err) => {
        console.error("Error during audio extraction:", err);
        reject(err);
      });
  });
};

// Route for video transcription
router.post("/transcribe", upload.single("video"), async (req, res) => {
  try {
    const videoFile = req.file;

    if (!videoFile) {
      return res.status(400).json({ error: "No video file provided" });
    }

    console.log(`Processing video: ${videoFile.originalname}`);

    // Save the uploaded video file to a temporary location
    const videoPath = await createTempFile(videoFile);

    // Define a temporary file path for the extracted audio (MP3)
    const audioPath = path.join(
      tmpdir(),
      `${Date.now()}-${videoFile.originalname.replace(/\.[^/.]+$/, "")}.mp3`
    );

    // Extract audio from video using FFmpeg
    await extractAudioFromVideo(videoPath, audioPath);

    // Transcribe the extracted audio using OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioPath),
      model: "whisper-1",
      response_format: "text",
    });

    // Clean up temporary files
    await deleteTempFile(videoPath);
    await deleteTempFile(audioPath);

    console.log("Video transcription completed");

    res.status(200).json({ 
      transcription,
      filename: videoFile.originalname 
    });
  } catch (error) {
    console.error("Error processing video transcription:", error);
    res.status(500).json({ error: "Error processing video transcription" });
  }
});

// Route for video interaction - transcribe and chat
router.post("/interact", upload.single("video"), async (req, res) => {
  try {
    const videoFile = req.file;
    const { userQuestion, instructions } = req.body;

    if (!videoFile) {
      return res.status(400).json({ error: "No video file provided" });
    }

    if (!userQuestion || !userQuestion.trim()) {
      return res.status(400).json({ error: "User question is required" });
    }

    console.log(`Processing video interaction: ${videoFile.originalname}`);

    // Save the uploaded video file to a temporary location
    const videoPath = await createTempFile(videoFile);

    // Define a temporary file path for the extracted audio (MP3)
    const audioPath = path.join(
      tmpdir(),
      `${Date.now()}-${videoFile.originalname.replace(/\.[^/.]+$/, "")}.mp3`
    );

    // Extract audio from video using FFmpeg
    await extractAudioFromVideo(videoPath, audioPath);

    // Transcribe the extracted audio using OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioPath),
      model: "whisper-1",
      response_format: "text",
    });

    // Clean up temporary files
    await deleteTempFile(videoPath);
    await deleteTempFile(audioPath);

    // Create context for the AI with the transcription
    const systemInstructions = instructions || 
      "You are an AI assistant that analyzes video content based on transcriptions. " +
      "Use the provided video transcription to answer user questions accurately and helpfully.";

    const contextMessage = {
      role: "system",
      content: `${systemInstructions}\n\nVideo Transcription:\n"${transcription}"`
    };

    const userMessage = {
      role: "user",
      content: userQuestion
    };

    // Generate AI response based on transcription and user question
    const aiResponse = await generateChatResponse({
      messages: [contextMessage],
      userMessage: userMessage,
      model: "gpt-4o-mini",
      instructions: systemInstructions
    });

    console.log("Video interaction completed");

    res.status(200).json({
      role: "assistant",
      content: aiResponse,
      transcription: transcription,
      filename: videoFile.originalname,
      userQuestion: userQuestion
    });
  } catch (error) {
    console.error("Error processing video interaction:", error);
    res.status(500).json({ error: "Error processing video interaction" });
  }
});

// Route for chat with existing transcription
router.post("/chat", async (req, res) => {
  try {
    const { transcription, userInput, instructions, messages, model, temperature } = req.body;

    if (!transcription || !transcription.trim()) {
      return res.status(400).json({ error: "Video transcription is required" });
    }

    if (!userInput || !userInput.trim()) {
      return res.status(400).json({ error: "User input is required" });
    }

    // Create enhanced instructions that include the video transcription context
    const systemInstructions = (instructions || 
      "You are an AI assistant that analyzes video content based on transcriptions. " +
      "Use the provided video transcription to answer user questions accurately and helpfully.") +
      `\n\nVideo Transcription:\n"${transcription}"`;

    const userMessage = { role: "user", content: userInput };

    // Generate AI response using your existing helper with conversation history
    const result = await generateChatResponse({
      userMessage,
      messages: messages || [], // Pass conversation history just like in chatHandler
      model: model || "gpt-4o-mini",
      instructions: systemInstructions,
      temperature: temperature || 0.7,
    });

    console.log("Video chat completed");

    res.status(200).json({ role: "assistant", content: result });
  } catch (error) {
    console.error("Error processing video chat:", error);
    res.status(500).json({ error: "Error processing video chat" });
  }
});

export default router;

/**
 * videoHandler.js
 *
 * This Express router handles video-related operations including:
 * - Video upload and audio extraction using FFmpeg
 * - Audio transcription using OpenAI's Whisper model
 * - Interactive chat based on video transcriptions
 *
 * 📦 Endpoints:
 *
 * POST /video/transcribe
 * - Accepts an uploaded video file
 * - Extracts audio using FFmpeg, transcribes with OpenAI Whisper
 * - Returns transcription text and filename
 *
 * POST /video/interact
 * - Accepts video file and user question
 * - Extracts audio → transcribes → generates AI response based on content
 * - Returns complete interaction with transcription and AI response
 *
 * POST /video/chat
 * - Chat with existing transcription without re-uploading video
 * - Supports conversation history for continued interactions
 * - Returns AI response based on video context
 *
 * 🔧 Dependencies:
 * - `fluent-ffmpeg`: For video to audio extraction
 * - `multer`: For file upload handling
 * - `fs`, `path`, `os`: For temporary file management
 * - OpenAI SDK: For audio transcription and chat completion
 *
 * 🛡️ Features:
 * - Automatic temporary file cleanup
 * - Support for various video formats
 * - Error handling with descriptive messages
 * - Conversation history support for extended interactions
 *
 * 📁 Path:
 * //GPT/gptcore/node/routes/videoHandler.js
 */