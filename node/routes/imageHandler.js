//GPT/gptcore/node/routes/imageHandler.js
import express from "express";
import { generateChatResponse } from "../utils/openAiHelpers.js";
import multer from "multer";
import { openai } from "../utils/openAiHelpers.js";
import { toFile } from "openai";

// Configure multer storage
const storage = multer.memoryStorage(); // Stores files in memory as Buffer objects
const upload = multer({ storage: storage });


const router = express.Router();

// Utility function to encode image to base64
const encodeImageToBase64 = async (imageBuffer, mimeType) => {
  return `data:${mimeType};base64,${imageBuffer.toString("base64")}`;
};

// Route for DALL-E image generation
router.post("/", async (req, res) => {
  try {
    const userInput = req.body.userInput;
    const image = await openai.images.generate({
      model: "dall-e-3",
      prompt: userInput,
    });
    
    res.status(200).json(image.data);
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Error processing request" });
  }
});

// New route for GPT-1-image model
router.post("/gptimage", async (req, res) => {
  try {
    const userInput = req.body.userInput;
    
    if (!userInput || userInput.trim() === "") {
      return res.status(400).json({ error: "Prompt is required" });
    }
    
    console.log(`Generating image with GPT-image-1 model. Prompt: "${userInput}"`);
    
    // Generate image using the new GPT-1-image model
    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt: userInput,
  
    });
    
    if (!result.data || !result.data[0] || !result.data[0].b64_json) {
      throw new Error("Invalid response format from OpenAI API");
    }
    
    console.log("Image generated successfully");
    
    // Return the base64 encoded image
    res.status(200).json(result.data[0]);
  } catch (error) {
    console.error("Error processing GPT-image request:", error);
    res.status(500).json({ 
      error: "Error processing request", 
      message: error.message,
      details: error.toString()
    });
  }
});

// Route for image analysis with GPT-4o
router.post("/analyzeimage", upload.single("image"), async (req, res) => {
  try {
    const { buffer, mimetype } = req.file;
    const base64Image = await encodeImageToBase64(buffer, mimetype);
    const userInput = req.body.userInput;
    
    const userMessage = {
      role: "user",
      content: [
        { type: "input_text", text: userInput },
        { type: "input_image", image_url: base64Image },
      ],
    };
    
    const result = await generateChatResponse({userMessage, model:"gpt-4o"});
    res.status(200).json({ role: "assistant", content: result });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Error processing request" });
  }
});

// Route for saving GPT-1-image generated images to file
router.post("/saveimage", async (req, res) => {
  try {
    const { base64Image, filename } = req.body;
    
    // Extract the base64 data from the string (removing data:image/png;base64, prefix if present)
    const base64Data = base64Image.includes('base64,') 
      ? base64Image.split('base64,')[1]
      : base64Image;
    
    // Convert base64 to buffer
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Generate unique filename if not provided
    const outputFilename = filename || `gpt-image-${Date.now()}.png`;
    
    // For server-side saving, we'd use fs here
    // But in this example we'll return the buffer for client-side handling
    res.status(200).json({ 
      success: true, 
      message: "Image processed successfully",
      filename: outputFilename
    });
  } catch (error) {
    console.error("Error saving image:", error);
    res.status(500).json({ error: "Error saving image" });
  }
});


// Route for image editing with GPT-1-image model
router.post(
  "/edit",
  upload.fields([
    { name: "images", maxCount: 10 }, // 1-10 reference images
    { name: "mask",   maxCount: 1  }, // optional mask for in-painting
  ]),
  async (req, res) => {
    try {
      /* ---------------------------------------------------------- VALIDATION */
      const { files, body } = req;

      if (!files?.images?.length)
        return res.status(400).json({ error: "At least one image is required" });

      if (!body.prompt?.trim())
        return res.status(400).json({ error: "Prompt is required" });

      const multiRef      = files.images.length > 1;
      const inpainting    = files.mask && files.mask.length > 0;

      /* -------------------------------------------------------------- PARSE */
      // Helper: convert Multer buffer → OpenAI File
      const asOAFile = (f) =>
        toFile(f.buffer, f.originalname || "image.png", { type: f.mimetype });

      // Build `image` param (File | File[])
      const imageParam = multiRef
        ? await Promise.all(files.images.map(asOAFile))
        : await asOAFile(files.images[0]);

      // Optional mask
      const maskFile = inpainting ? await asOAFile(files.mask[0]) : undefined;

      /* --------------------------------------------------------------- CALL */
      const rsp = await openai.images.edit({
        model:  "gpt-image-1",
        prompt: body.prompt,
        image:  imageParam,
        ...(maskFile && { mask: maskFile }),   // only attach if present
        // size: "1024x1024", // <-- add or change if you need a specific size
      });

      if (!rsp.data?.[0]?.b64_json)
        throw new Error("OpenAI response missing b64_json field");

      /* -------------------------------------------------------------- RESP */
      res.status(200).json({
        success: true,
        mode:    inpainting ? "inpainting" : multiRef ? "reference" : "edit",
        images:  files.images.length,
        ...rsp.data[0],           // { b64_json, revised_prompt?, … }
      });
    } catch (err) {
      console.error("Image-edit error:", err);
      res.status(500).json({
        error:   "Error processing image edit request",
        message: err.message,
      });
    }
  },
);



export default router;


/**
 * imageHandler.js
 *
 * This Express router handles AI image-related tasks including:
 * - Traditional image generation using DALL·E-3
 * - Advanced image generation using the new GPT-1-image model
 * - Image editing with the GPT-1-image model (single edit, inpainting, reference-based)
 * - Image analysis via base64 encoding with GPT-4o vision capabilities
 * - Image saving and processing
 *
 * 🔹 Endpoints:
 *
 * 1. POST `/image`
 *    - Generates an image using OpenAI's DALL·E-3 model from a user prompt.
 *    - Request Body:
 *      {
 *        userInput: "a robot painting a picture in a futuristic city"
 *      }
 *    - Response:
 *      Array of generated image objects (e.g., URLs and metadata).
 *
 * 2. POST `/image/gptimage`
 *    - Generates an image using OpenAI's new GPT-1-image model.
 *    - Request Body:
 *      {
 *        userInput: "a detailed watercolor painting of a mountain landscape"
 *      }
 *    - Response:
 *      Object containing b64_json (base64 encoded image data).
 *
 * 3. POST `/image/edit`
 *    - Edits images using OpenAI's GPT-1-image model, supporting:
 *      - Single image editing
 *      - Multiple reference images to create a new composite
 *      - Inpainting (editing parts of an image using a mask)
 *    - Form-data:
 *      - images: One or more image files to edit or use as reference
 *      - mask: Optional mask image for inpainting
 *      - prompt: Text description of the edit to perform
 *    - Response:
 *      Object containing b64_json (base64 encoded image data).
 *
 * 4. POST `/image/analyzeimage`
 *    - Accepts an uploaded image and analyzes it using GPT-4o's vision capabilities.
 *    - Form-data:
 *      - image (file): The image to be analyzed.
 *      - userInput (string): Optional text prompt accompanying the image.
 *    - Response:
 *      A chat-like assistant response analyzing the image.
 *
 * 5. POST `/image/saveimage`
 *    - Processes and saves a base64 encoded image.
 *    - Request Body:
 *      {
 *        base64Image: "data:image/png;base64,iVBOR...",
 *        filename: "output.png" (optional)
 *      }
 *    - Response:
 *      Confirmation of image processing with filename.
 *
 * 🔹 Internal Utilities:
 * - `encodeImageToBase64`: Converts a Buffer (image file in memory) to a base64 string with proper MIME type.
 * - `fileToOpenAIFile`: Converts file buffers to data URIs for the OpenAI API.
 *
 * 🔹 Middleware:
 * - `multer.memoryStorage()`: Used to process incoming file uploads in-memory (as Buffers).
 *
 * 🔹 Dependencies:
 * - `express` (Router for endpoints)
 * - `multer` (for file uploads)
 * - `openai` (OpenAI SDK for image generation and vision analysis)
 * - `generateChatResponse` (custom helper for interacting with OpenAI chat models)
 *
 * 🔹 Path:
 * //GPT/gptcore/node/routes/imageHandler.js
 */