//GPT/gptcore/client/src/pages/Image&Vision/VideoAnalyze.jsx
import { useState, useRef, useEffect } from "react";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessage } from "@/components/ChatMessage";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { Banner } from "@/components/Banner";
import { Upload, X, Play, Pause } from "lucide-react";

export function VideoAnalyze() {
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [transcription, setTranscription] = useState("");
  const [textInput, setTextInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const dropzoneRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    if (messages.length > 0) {
      setShowBanner(false);
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      handleFileSelection(droppedFiles[0]);
    }
  };

  const handleFileSelection = (selectedFile) => {
    if (selectedFile && selectedFile.type.startsWith('video/')) {
      setFile(selectedFile);
      const preview = URL.createObjectURL(selectedFile);
      setFilePreview(preview);
      
      // Reset transcription when new file is selected
      setTranscription("");
      setMessages([]);
      
      // Clean up old preview URL
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    } else {
      alert("Please select a valid video file.");
    }
  };

  const clearVideo = (e) => {
    e.stopPropagation();
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
    }
    setFile(null);
    setFilePreview(null);
    setTranscription("");
    setMessages([]);
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTranscribeVideo = async () => {
    if (!file) {
      alert("Please upload a video first.");
      return;
    }

    setTranscribing(true);
    const formData = new FormData();
    formData.append("video", file);

    try {
      const res = await fetch("http://localhost:8000/video/transcribe", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (data.transcription) {
        setTranscription(data.transcription);
        // Add transcription as first message
        setMessages([{
          role: "system",
          content: `Video transcribed successfully! You can now ask questions about the video content.`,
          transcription: data.transcription
        }]);
      }
    } catch (error) {
      console.error("Error transcribing video:", error);
      alert("An error occurred while transcribing the video.");
    } finally {
      setTranscribing(false);
    }
  };

  const handleSendMessage = async () => {
    const trimmed = textInput.trim();
    if (!trimmed) return;

    if (!transcription) {
      alert("Please transcribe the video first.");
      return;
    }

    const userMessage = { role: "user", content: trimmed };
    setMessages(prev => [...prev, userMessage]);
    setTextInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/video/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcription: transcription,
          userInput: trimmed, // Changed from userQuestion to userInput to match chatHandler
          messages: messages.filter(msg => msg.role !== "system"), // Pass conversation history like chatHandler
          model: "gpt-4o-mini",
          temperature: 0.7,
          instructions: "You are a helpful AI assistant that analyzes video content based on transcriptions."
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, data]);
    } catch (error) {
      console.error("Error chatting with video:", error);
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "An error occurred while processing your question.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 md:flex-row">
      {/* Left Column: Video Upload and Preview */}
      <div className="w-full md:w-1/2 p-6">
        <div
          ref={dropzoneRef}
          className={`
            relative flex flex-col items-center justify-center
            h-full rounded-xl border-2 border-dashed
            transition-all duration-200
            ${isDragging 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 bg-white hover:bg-gray-50'
            }
            ${filePreview ? 'p-4' : 'p-8'}
          `}
          onDrop={handleFileDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => !filePreview && document.getElementById("fileInput").click()}
        >
          {filePreview ? (
            <div className="relative w-full h-full flex flex-col">
              {/* Video Player */}
              <div className="relative flex-1 bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  src={filePreview}
                  className="w-full h-full object-contain"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  controls
                />
                
                {/* Clear button */}
                <button
                  onClick={clearVideo}
                  className="absolute top-2 right-2 p-2 bg-gray-900/50 rounded-full text-white hover:bg-gray-900/70 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 space-y-3">
                <button
                  onClick={handleTranscribeVideo}
                  disabled={transcribing}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {transcribing ? "Transcribing..." : "Transcribe Video"}
                </button>

                {transcription && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700 font-medium mb-2">
                      Transcription Complete ✓
                    </p>
                    <div className="text-xs text-green-600 max-h-20 overflow-y-auto">
                      {transcription.substring(0, 200)}
                      {transcription.length > 200 && "..."}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <Upload size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-2">
                Drop your video here, or click to browse
              </p>
              <p className="text-sm text-gray-400">
                Support for MP4, MOV, AVI, and more
              </p>
            </div>
          )}
          <input
            type="file"
            accept="video/*"
            id="fileInput"
            onChange={(e) => handleFileSelection(e.target.files[0])}
            className="hidden"
          />
        </div>
      </div>

      {/* Right Column: Chat Interface */}
      <div className="flex flex-col flex-1 bg-white border-l border-gray-200">
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-auto px-4 py-6"
        >
          <div className="max-w-2xl mx-auto space-y-6">
            {showBanner && (
              <Banner 
                title="Video Analysis"
                description="Upload a video, transcribe it, and ask questions about the content. The AI will analyze and respond based on the video's audio transcription."
              />
            )}
            
            {messages.map((msg, index) => (
              <ChatMessage key={index} message={msg} />
            ))}
            
            {(loading || transcribing) && <LoadingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="sticky bottom-0 bg-white p-4">
          <div className="max-w-2xl mx-auto">
            <ChatInput
              input={textInput}
              setInput={setTextInput}
              sendMessage={handleSendMessage}
              isLoading={loading}
              placeholder={transcription ? "Ask a question about the video..." : "Please transcribe the video first"}
              disabled={!transcription}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * VideoAnalyze.jsx
 *
 * This component provides an interactive two-column UI for video-based AI analysis.
 * Users can upload or drag-and-drop a video on the left, transcribe it, and chat with an AI assistant 
 * on the right to receive analysis or answers related to the video content.
 *
 * 🔹 Features:
 * - Drag-and-drop video upload with preview and removal
 * - Built-in video player with controls
 * - Video transcription using Whisper API
 * - Chat interface for questioning video content
 * - Conversation history support
 * - Real-time transcription status and preview
 *
 * 🧠 AI Integration:
 * - Uses `/video/transcribe` endpoint for video-to-text conversion
 * - Uses `/video/chat` endpoint for contextual Q&A
 * - Maintains conversation history for follow-up questions
 *
 * 📦 Dependencies:
 * - `ChatInput`, `ChatMessage`, `LoadingIndicator`, and `Banner` components
 * - `lucide-react` icons: `Upload`, `X`, `Play`, `Pause`
 *
 * 💡 UX Enhancements:
 * - Video player with native controls
 * - Transcription preview with truncation
 * - Disabled input until transcription is complete
 * - Visual feedback for transcription status
 * - Auto-scroll to latest messages
 *
 * 📁 Path:
 * //GPT/gptcore/client/src/pages/Image&Vision/VideoAnalyze.jsx
 */