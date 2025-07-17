# Implementing Audio Transcription with OpenAI Whisper

This guide explains how to add audio transcription capabilities to your application using OpenAI's Whisper model. With this feature, your application can convert spoken audio into accurate text transcriptions.

## Overview

OpenAI's Whisper is a powerful speech recognition model that can transcribe audio in multiple languages. Integrating this into your application allows users to:

- Convert audio recordings to text
- Transcribe meetings or interviews
- Create captions for videos
- Extract text content from audio files
- Process voice notes or memos

## Backend Implementation

### Step 1: Set Up the Transcription Endpoint

First, let's look at the necessary imports and setup:

```javascript
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { openai } from "../utils/openaiconfig.js";
import { generateChatResponse } from "../utils/openAiHelpers.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
```

Then, implement the transcription endpoint:

```javascript
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

    // Call the transcription API
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

export default router;
```

### Step 2: Understanding the Transcription Code

Let's break down the key aspects of this implementation:

1. **File Upload Handling**:
   - We use `multer` middleware to handle file uploads
   - The `multer.memoryStorage()` option stores the uploaded file in memory temporarily
   - We access the file via `req.file` which contains the file buffer and metadata

2. **Temporary File Management**:
   - We create a temporary directory if it doesn't exist
   - We write the in-memory audio buffer to a file
   - After transcription, we clean up by deleting the temporary file

3. **Transcription API Call**:
   - We use OpenAI's `audio.transcriptions.create` method
   - We provide a file stream of the audio file
   - We specify "whisper-1" as the model
   - We request the response in plain text format

4. **Response Handling**:
   - We return the transcription text in a JSON response
   - If any errors occur, we return a 500 status with an error message

## Frontend Implementation

Now, let's create a user interface for audio transcription:

```jsx
// pages/AudioTranscription.jsx
import { useState, useRef } from "react";

function AudioTranscription() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recordingTime, setRecordingTime] = useState(0);
  
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    const validTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/webm', 'audio/m4a'];
    if (!validTypes.includes(file.type)) {
      setError("Please select a valid audio file (WAV, MP3, WEBM, M4A)");
      return;
    }

    // Check file size (limit to 25MB)
    if (file.size > 25 * 1024 * 1024) {
      setError("Audio file should be less than 25MB");
      return;
    }

    setSelectedFile(file);
    setError("");
  };

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioFile = new File([audioBlob], "recording.wav", { type: 'audio/wav' });
        setSelectedFile(audioFile);
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Set up a timer to track recording duration
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Error accessing microphone. Please check your browser permissions.");
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop and clear the timer
      clearInterval(timerRef.current);
      
      // Stop all tracks on the stream
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  // Format seconds to mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle transcription submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select an audio file or record audio first");
      return;
    }

    setLoading(true);
    setError("");
    setTranscription("");

    try {
      const formData = new FormData();
      formData.append("audio", selectedFile);

      const response = await fetch("http://localhost:3001/api/audio/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to transcribe audio");
      }

      const data = await response.json();
      setTranscription(data.transcription);
    } catch (error) {
      console.error("Error:", error);
      setError("Error transcribing audio. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Clear selected file and transcription
  const handleClear = () => {
    setSelectedFile(null);
    setTranscription("");
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold text-center mb-6">Audio Transcription</h1>

      <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto w-full">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Upload Section */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="audio/*"
              className="hidden"
              id="audio-upload"
            />
            
            {selectedFile ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Selected file:</p>
                  <p className="text-sm text-gray-600">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="text-center">
                <label
                  htmlFor="audio-upload"
                  className="cursor-pointer block py-2 px-4 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition mb-3 mx-auto inline-block"
                >
                  Upload Audio File
                </label>
                <p className="text-sm text-gray-500 mb-3">or</p>
              </div>
            )}
            
            {/* Recording Controls */}
            <div className="flex justify-center space-x-3">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  disabled={loading}
                  className={`py-2 px-4 flex items-center ${selectedFile ? 'bg-gray-200 text-gray-600' : 'bg-red-500 text-white'} rounded-md hover:bg-red-600 transition`}
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                  </svg>
                  Record Audio
                </button>
              ) : (
                <div className="flex flex-col items-center">
                  <p className="text-red-500 animate-pulse mb-2">Recording... {formatTime(recordingTime)}</p>
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="py-2 px-4 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                    </svg>
                    Stop Recording
                  </button>
                </div>
              )}
            </div>
            
            <p className="text-xs text-gray-500 mt-3 text-center">
              Supported formats: WAV, MP3, M4A, WEBM (max 25MB)
            </p>
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={!selectedFile || loading || isRecording}
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              !selectedFile || loading || isRecording
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Transcribing..." : "Transcribe Audio"}
          </button>
        </form>

        {loading && (
          <div className="mt-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">
              Transcribing your audio... This may take a few moments.
            </p>
          </div>
        )}

        {transcription && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Transcription</h2>
            <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap border border-gray-200">
              {transcription}
            </div>
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(transcription);
                }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Copy to Clipboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AudioTranscription;
```

## Transcription Options and Customization

### Supported Audio Formats

OpenAI's Whisper model supports several audio formats:

- **WAV**: Uncompressed audio, high quality
- **MP3**: Compressed format, common for music and podcasts
- **M4A**: Apple's audio format, common on iOS devices
- **WEBM**: Open web format, often used for web recordings
- **MP4**: Video format (the audio track is extracted)
- **MPEG**: Another compressed audio format
- **MPGA**: MPEG audio layer format

### Response Formats

You can specify different output formats:

```javascript
const transcription = await openai.audio.transcriptions.create({
  file: fs.createReadStream(audioFilePath),
  model: "whisper-1",
  response_format: "text", // Options: "json", "text", "srt", "verbose_json", "vtt"
});
```

| Format | Description | Use Cases |
|--------|-------------|-----------|
| text | Plain text | Simple transcription needs |
| json | JSON with text field | Integration with applications |
| srt | SubRip subtitle format | Video subtitles |
| vtt | WebVTT subtitle format | Web video captions |
| verbose_json | Detailed JSON with timestamps | Advanced applications needing timing |

### Additional Parameters

You can also customize the transcription with these parameters:

```javascript
const transcription = await openai.audio.transcriptions.create({
  file: fs.createReadStream(audioFilePath),
  model: "whisper-1",
  language: "en", // Specify language code
  prompt: "This is a technical discussion about JavaScript.", // Provide context for better accuracy
  temperature: 0.2, // Lower values for higher accuracy, higher for more diverse outputs
});
```

## Advanced Features

### 1. Multilingual Support

Whisper can transcribe audio in many languages. You can specify the language:

```javascript
// Transcribe Spanish audio
const transcription = await openai.audio.transcriptions.create({
  file: fs.createReadStream(audioFilePath),
  model: "whisper-1",
  language: "es",
});
```

### 2. Translation

OpenAI also offers a translations endpoint that transcribes audio from any supported language and translates it to English:

```javascript
// Add this to your router
router.post("/translate", upload.single("audio"), async (req, res) => {
  try {
    const audioFile = req.file;
    if (!audioFile) {
      return res.status(400).json({ error: "No audio file received" });
    }

    // Similar file handling as in transcribe endpoint
    const tempDir = path.join(process.cwd(), "tmp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    const audioFilePath = path.join(tempDir, "input.wav");
    fs.writeFileSync(audioFilePath, audioFile.buffer);

    // Call the translation API
    const translation = await openai.audio.translations.create({
      file: fs.createReadStream(audioFilePath),
      model: "whisper-1",
    });

    fs.unlinkSync(audioFilePath);
    res.status(200).json({ translation });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Error processing request" });
  }
});
```

### 3. Chunking for Large Files

For longer audio files, consider processing them in chunks:

```javascript
// Helper function to split audio files
async function processLargeAudioFile(filePath, maxDurationInSeconds = 600) {
  // Implementation would involve using a library like ffmpeg to split audio
  // and then process each chunk separately
  // This is a simplified conceptual example
  
  // Split audio using ffmpeg (you'd need to add ffmpeg as a dependency)
  // Process each chunk
  // Combine the transcriptions
  
  return combinedTranscription;
}
```

## Best Practices

1. **Handle Large Files Appropriately**:
   - Whisper has a file size limit (currently 25MB)
   - For larger files, consider chunking or compression
   - Set appropriate timeouts for longer audio files

2. **Provide Context for Better Accuracy**:
   - Use the `prompt` parameter to provide domain-specific context
   - This can improve transcription accuracy for technical terms

3. **Optimize File Upload Flow**:
   - Implement progress indicators for large file uploads
   - Use client-side validation for file formats and sizes
   - Consider direct-to-cloud uploads for production applications

4. **Error Handling**:
   - Have fallbacks for when transcription fails
   - Provide clear error messages to users
   - Consider retry mechanisms for transient failures

5. **Privacy Considerations**:
   - Make users aware that audio is being sent to OpenAI
   - Delete temporary files after processing
   - Follow appropriate data handling policies

## Integration with Your Existing App

To add this functionality to your app:

1. **Add the Audio Routes**: Include the transcription endpoints
2. **Update Server.js**: Register the audio routes
3. **Create the Frontend Component**: Add the AudioTranscription component
4. **Update App.js**: Add a route for the transcription feature

```jsx
import AudioTranscription from './pages/AudioTranscription';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Chat />} />
        <Route path="/search" element={<SearchChat />} />
        <Route path="/image-analysis" element={<ImageAnalysis />} />
        <Route path="/image-generator" element={<ImageGenerator />} />
        <Route path="/text-to-speech" element={<TextToSpeech />} />
        <Route path="/transcription" element={<AudioTranscription />} />
      </Routes>
    </div>
  );
}
```

## Example Use Cases

1. **Meeting Transcription**:
   - Automatically generate text records of meetings
   - Create searchable archives of spoken discussions

2. **Content Creation**:
   - Transcribe podcasts or videos for SEO purposes
   - Create subtitles for multimedia content

3. **Accessibility Features**:
   - Make audio content accessible to deaf or hard-of-hearing users
   - Create text alternatives for audio-based information

4. **Research and Analysis**:
   - Transcribe interviews for qualitative research
   - Convert field recordings into analyzable text data

5. **Voice Notes**:
   - Convert voice memos into text notes
   - Create a voice-to-text note-taking application

## Conclusion

Implementing audio transcription with OpenAI's Whisper model provides a powerful way to convert spoken words into accurate text. This feature can enhance your application's accessibility, enable new content creation workflows, and open up possibilities for audio data analysis.

This implementation gives you a foundation for building transcription capabilities into your application, with options for customization to meet specific needs.