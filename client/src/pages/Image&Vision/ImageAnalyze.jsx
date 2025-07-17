//GPT/gptcore/client/src/pages/Image&Vision/ImageAnalyze.jsx
import { useState, useRef, useEffect } from "react";
import { ChatInput } from "@/components/ChatInput";
import {ChatMessage} from "@/components/ChatMessage";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { Banner } from "@/components/Banner";
import { Upload, X,   } from "lucide-react";

export function ImageAnalyze() {
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [textInput, setTextInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const dropzoneRef = useRef(null);

  // Handle scroll behavior
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!showScrollButton) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, showScrollButton]);

  useEffect(() => {
    if (messages.length > 0) {
      setShowBanner(false);
    }
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
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      const preview = URL.createObjectURL(selectedFile);
      setFilePreview(preview);
      
      // Clean up old preview URL
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    }
  };

  const clearImage = (e) => {
    e.stopPropagation();
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
    }
    setFile(null);
    setFilePreview(null);
  };

  

  const handleSendMessage = async () => {
    const trimmed = textInput.trim();
    if (!trimmed) return;

    if (!file) {
      alert("Please upload an image first.");
      return;
    }

    const userMessage = { role: "user", content: trimmed };
    setMessages(prev => [...prev, userMessage]);
    setTextInput("");
    setLoading(true);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("userInput", trimmed);

    try {
      const res = await fetch("http://localhost:8000/image/analyzeimage", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setMessages(prev => [...prev, data]);
    } catch (error) {
      console.error("Error analyzing image:", error);
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "An error occurred while analyzing the image.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 md:flex-row">
     

      {/* Left Column: Dropzone and Image Preview */}
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
          onClick={() => document.getElementById("fileInput").click()}
        >
          {filePreview ? (
            <div className="relative w-full h-full">
              <img
                src={filePreview}
                alt="Preview"
                className="w-full h-full object-contain rounded-lg"
              />
              <button
                onClick={clearImage}
                className="absolute top-2 right-2 p-2 bg-gray-900/50 rounded-full text-white hover:bg-gray-900/70 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          ) : (
            <div className="text-center">
              <Upload size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-2">
                Drop your image here, or click to browse
              </p>
              <p className="text-sm text-gray-400">
                Support for JPG, PNG, WebP
              </p>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
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
                title="Image Analysis"
                description="Upload an image and ask questions about it. The AI will analyze and respond to your queries in real-time."
              />
            )}
            
          {messages.map((msg, index) => (
                     <ChatMessage key={index} message={msg} />
                   ))}
            
            {loading && <LoadingIndicator />}
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
                        placeholder="Describe the image you want to generate..."
                      />
           
          </div>
        </div>
      </div>
    </div>
  );
}


/**
 * ImageAnalyze.jsx
 *
 * This component provides an interactive two-column UI for image-based AI analysis using GPT-4o.
 * Users can upload or drag-and-drop an image on the left, and chat with an AI assistant 
 * on the right to receive contextual analysis or answers related to the image content.
 *
 * 🔹 Features:
 * - Drag-and-drop image upload with preview and removal
 * - File validation and preview using `URL.createObjectURL`
 * - Two-column responsive layout (image left, chat right)
 * - Chat input with message history and streaming capability
 * - Realtime scroll and auto-scroll to the latest message
 * - Banners shown initially for guidance
 *
 * 🧠 AI Integration:
 * - Uses `fetch("http://localhost:8000/image/analyzeimage")` endpoint
 * - Sends a multipart `FormData` request with `image` and `userInput` fields
 * - Displays assistant response alongside user input
 *
 * 📦 Dependencies:
 * - `ChatInput`, `ChatMessage`, `LoadingIndicator`, and `Banner` components
 * - `lucide-react` icons: `Upload`, `X`
 *
 * 💡 UX Enhancements:
 * - Shows scroll-to-bottom only if user scrolls away from bottom
 * - Handles invalid input or missing image before submission
 * - Allows clearing preview with a close icon
 *
 * 📁 Path:
 * //GPT/gptcore/client/src/pages/TextGeneration&Chat/ImageAnalyze.jsx
 */
