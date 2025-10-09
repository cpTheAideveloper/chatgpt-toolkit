//GPT/gptcore/node/routes/videoGenHandler.js
import express from "express";
import { openai } from "../utils/openAiHelpers.js";

const router = express.Router();

// Helper function to poll video status
const pollVideoStatus = async (videoId, maxAttempts = 60, intervalMs = 5000) => {
  let attempts = 0;

  while (attempts < maxAttempts) {
    const video = await openai.videos.retrieve(videoId);

    if (video.status === 'completed') {
      return video;
    }

    if (video.status === 'failed') {
      throw new Error(`Video generation failed: ${video.error || 'Unknown error'}`);
    }

    // Wait before polling again
    await new Promise(resolve => setTimeout(resolve, intervalMs));
    attempts++;
  }

  throw new Error('Video generation timed out');
};

// Route for Sora video generation
router.post("/generate", async (req, res) => {
  try {
    const { prompt, model = "sora-2", size = "1280x720", seconds = 8 } = req.body;

    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({ error: "Prompt is required" });
    }

    console.log(`Starting video generation with ${model}. Prompt: "${prompt}"`);

    // Start the video generation job
    const video = await openai.videos.create({
      model: model,
      prompt: prompt,
      size: size,
      seconds: seconds.toString()
    });

    console.log('Video generation job started:', video.id);

    // Return the job ID and initial status
    res.status(200).json({
      id: video.id,
      status: video.status,
      model: video.model,
      progress: video.progress || 0,
      seconds: video.seconds,
      size: video.size,
      created_at: video.created_at
    });
  } catch (error) {
    console.error("Error starting video generation:", error);
    res.status(500).json({
      error: "Error starting video generation",
      message: error.message,
      details: error.toString()
    });
  }
});

// Route to check video generation status
router.get("/status/:videoId", async (req, res) => {
  try {
    const { videoId } = req.params;

    console.log(`Checking status for video: ${videoId}`);

    const video = await openai.videos.retrieve(videoId);

    res.status(200).json({
      id: video.id,
      status: video.status,
      progress: video.progress || 0,
      model: video.model,
      seconds: video.seconds,
      size: video.size,
      created_at: video.created_at
    });
  } catch (error) {
    console.error("Error checking video status:", error);
    res.status(500).json({
      error: "Error checking video status",
      message: error.message
    });
  }
});

// Route to download completed video
router.get("/download/:videoId", async (req, res) => {
  try {
    const { videoId } = req.params;

    console.log(`Downloading video: ${videoId}`);

    // First check if the video is completed
    const video = await openai.videos.retrieve(videoId);

    if (video.status !== 'completed') {
      return res.status(400).json({
        error: "Video not ready",
        status: video.status,
        progress: video.progress || 0
      });
    }

    // Download the video content
    const content = await openai.videos.downloadContent(videoId);
    const arrayBuffer = await content.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Set appropriate headers for video download
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="sora-video-${videoId}.mp4"`);
    res.setHeader('Content-Length', buffer.length);

    res.send(buffer);

    console.log(`Video ${videoId} downloaded successfully`);
  } catch (error) {
    console.error("Error downloading video:", error);
    res.status(500).json({
      error: "Error downloading video",
      message: error.message
    });
  }
});

// Route to list all videos (with pagination)
router.get("/list", async (req, res) => {
  try {
    const { limit = 20, after } = req.query;

    console.log('Listing videos');

    const params = { limit: parseInt(limit) };
    if (after) params.after = after;

    const videos = await openai.videos.list(params);

    res.status(200).json(videos);
  } catch (error) {
    console.error("Error listing videos:", error);
    res.status(500).json({
      error: "Error listing videos",
      message: error.message
    });
  }
});

// Route to delete a video
router.delete("/:videoId", async (req, res) => {
  try {
    const { videoId } = req.params;

    console.log(`Deleting video: ${videoId}`);

    await openai.videos.delete(videoId);

    res.status(200).json({
      success: true,
      message: "Video deleted successfully",
      videoId: videoId
    });
  } catch (error) {
    console.error("Error deleting video:", error);
    res.status(500).json({
      error: "Error deleting video",
      message: error.message
    });
  }
});

export default router;

/**
 * videoGenHandler.js
 *
 * This Express router handles AI video generation tasks using OpenAI's Sora models.
 * It provides endpoints for creating, monitoring, and managing AI-generated videos.
 *
 * 🔹 Endpoints:
 *
 * 1. POST `/videogen/generate`
 *    - Starts a new video generation job using Sora models (sora-2 or sora-2-pro).
 *    - Request Body:
 *      {
 *        prompt: "Wide shot of a child flying a red kite in a grassy park",
 *        model: "sora-2" | "sora-2-pro" (optional, defaults to "sora-2"),
 *        size: "1280x720" | "1920x1080" | "1080x1920" (optional, defaults to "1280x720"),
 *        seconds: 8 | 16 (optional, defaults to 8)
 *      }
 *    - Response:
 *      Object containing job id, status, and metadata.
 *
 * 2. GET `/videogen/status/:videoId`
 *    - Retrieves the current status of a video generation job.
 *    - Returns status (queued, in_progress, completed, failed) and progress percentage.
 *
 * 3. GET `/videogen/download/:videoId`
 *    - Downloads the completed video as an MP4 file.
 *    - Only works for videos with status "completed".
 *    - Returns binary video data with appropriate headers.
 *
 * 4. GET `/videogen/list`
 *    - Lists all videos with pagination support.
 *    - Query Parameters:
 *      - limit: number of videos to return (default: 20)
 *      - after: cursor for pagination
 *
 * 5. DELETE `/videogen/:videoId`
 *    - Deletes a video from OpenAI's storage.
 *    - Returns success confirmation.
 *
 * 🔹 Models:
 * - sora-2: Fast generation, good quality (ideal for prototyping and social media)
 * - sora-2-pro: Higher quality, slower generation (ideal for production content)
 *
 * 🔹 Video Sizes:
 * - 1280x720 (16:9 landscape)
 * - 1920x1080 (16:9 HD)
 * - 1080x1920 (9:16 portrait/vertical)
 *
 * 🔹 Duration:
 * - 8 seconds (faster, lower cost)
 * - 16 seconds (longer content)
 *
 * 🔹 Content Restrictions:
 * - Only content suitable for audiences under 18
 * - No copyrighted characters or music
 * - No real people (including public figures)
 * - No input images with human faces
 *
 * 🔹 Prompting Tips:
 * - Describe shot type (wide shot, close-up, etc.)
 * - Include subject and action
 * - Specify setting and lighting
 * - Be specific to avoid unwanted details
 *
 * 🔹 Dependencies:
 * - `express` (Router for endpoints)
 * - `openai` (OpenAI SDK for Sora video generation)
 *
 * 🔹 Path:
 * //GPT/gptcore/node/routes/videoGenHandler.js
 */
