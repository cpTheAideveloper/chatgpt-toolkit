//GPT/gptcore/node/routes/audioHandler.js
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { openai } from "../utils/openaiconfig.js";
import { generateChatResponse } from "../utils/openAiHelpers.js";
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/textToAudio", async (req, res) => {
  try {
    const { userInput, voice, model, speed, instructions } = req.body;
    console.log("speed", speed);
    const mp3 = await openai.audio.speech.create({
      model: model || "gpt-4o-mini-tts",
      voice: voice || "shimmer",
      input: userInput,
      speed: speed || 1.0,
      instructions: instructions || "Generate a clear and natural-sounding audio response",
    });
    
    const buffer = Buffer.from(await mp3.arrayBuffer());
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Disposition", 'inline; filename="output.mp3"');
    
    res.send(buffer);
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Error processing request" });
  }
});


router.post("/transcribe", upload.single("audio"), async (req, res) => {
  try {
    const audioFile = req.file;

    if (!audioFile) {
      return res.status(400).json({ error: "No audio file received" });
    }

    // Create a temporary directory for storing the file if it doesn't exist
    const tempDir = path.join(process.cwd(), "tmp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    // Define the file path
    const audioFilePath = path.join(tempDir, "input.wav");

    // Save the audio file to the temporary directory
    fs.writeFileSync(audioFilePath, audioFile.buffer);

    // Call the transcribe helper function

     const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(audioFilePath),
        model: "whisper-1",
        response_format: "text",
      });
    
     

    // Delete the temporary file after transcription is done
    fs.unlinkSync(audioFilePath);

    res.status(200).json({ transcription });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Error processing request" });
  }
});


router.post("/talkToGpt", upload.single("audio"), async (req, res) => {
  try {
    const audioFile = req.file;

    if (!audioFile) {
      return res.status(400).json({ error: "No audio file received" });
    }

    // Create a temporary directory for storing the file if it doesn't exist
    const tempDir = path.join(process.cwd(), "tmp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    // Define the file path
    const audioFilePath = path.join(tempDir, "input.wav");

    // Save the audio file to the temporary directory
    fs.writeFileSync(audioFilePath, audioFile.buffer);

    // Call the transcribe helper function

     const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(audioFilePath),
        model: "whisper-1",
        response_format: "text",
      });
    
     

    // Delete the temporary file after transcription is done
    fs.unlinkSync(audioFilePath);

     const userMessage = { role: "user", content: transcription  };
       const result = await generateChatResponse({userMessage});

       const mp3 = await openai.audio.speech.create({
        model:  "gpt-4o-mini-tts",
        voice: "shimmer",
        input: result,
        speed:  1.0,
        instructions:  "Generate a clear and natural-sounding audio response",
      });
      
      const buffer = Buffer.from(await mp3.arrayBuffer());
      console.log("buffer", buffer);
      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Content-Disposition", 'inline; filename="output.mp3"');

      const assistantMessageFrontEnd = {
        role: "assistant",
        content: [{ type: "audio", text: buffer }, { type: "text", text: result }],
        userTransCription: transcription,
      };

    res.status(200).json( assistantMessageFrontEnd );
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Error processing request" });
  }
});

export default router;


/**
 * audioHandler.js
 *
 * This Express router handles audio-related operations including:
 * - Text-to-speech (TTS) using OpenAI's audio.speech API
 * - Audio transcription using OpenAI's Whisper model
 * - Full "Talk to GPT" pipeline: transcribe audio ➜ generate chat response ➜ return speech + text
 *
 * 📦 Endpoints:
 *
 * POST /audio/textToAudio
 * - Converts text input into MP3 audio using specified model and voice
 * - Returns: audio/mpeg stream with headers for inline playback
 *
 * POST /audio/transcribe
 * - Accepts an uploaded audio file
 * - Saves it temporarily, transcribes it with OpenAI Whisper
 * - Deletes temp file and returns transcription text in JSON
 *
 * POST /audio/talkToGpt
 * - Accepts an audio file (speech input)
 * - Transcribes it → sends transcription to chat → receives response → converts response to speech
 * - Returns: an object with assistant audio buffer and response text
 *
 * 🔧 Configuration & Dependencies:
 * - Uses `multer` for memory-based file uploads
 * - `fs` and `path` for temporary file handling
 * - Integrates with `openai` SDK
 * - Helper: `generateChatResponse` for structured OpenAI messaging
 *
 * 🛡️ Error Handling:
 * - Includes try-catch blocks for all routes
 * - Sends appropriate 500 or 400 HTTP status with descriptive error messages
 *
 * 📁 Path:
 * //GPT/gptcore/node/routes/audioHandler.js
 */
