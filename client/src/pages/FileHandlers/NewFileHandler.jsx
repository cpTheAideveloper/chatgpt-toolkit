//GPT/gptcore/client/src/pages/FileHandlers/NewFileHandler.jsx
import { useState, useRef, useEffect } from "react";
import {
   Upload, X, 
} from "lucide-react";

import { LoadingIndicator } from "@/components/LoadingIndicator";
import { Banner } from "@/components/Banner";
// 1) IMPORT CANVASVIEW
import CanvasView from "@/components/CanvasView";  // <-- Adjust path as needed
import { ChatInput } from "@/components/ChatInput";
import { ChatMessage } from "@/components/ChatMessage";


export function NewFileHandler() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState("");

  const [isDragging, setIsDragging] = useState(false);
  
  // Settings

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Scroll behavior
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const nearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      setShowScrollButton(!nearBottom);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    if (!showScrollButton) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, showScrollButton]);

  // Hide banner on first message
  useEffect(() => {
    if (messages.length > 0) {
      setShowBanner(false);
    }
  }, [messages]);



  // File handling
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setFileError("");
    if (!file) {
      setSelectedFile(null);
      return;
    }
    // Add validations if needed
    setSelectedFile(file);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    setFileError("");
    const file = e.dataTransfer.files[0];
    if (!file) return;
    setSelectedFile(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFileError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Sending message & file
  const sendMessageWithFile = async () => {
    const trimmed = input.trim();
    if (!trimmed || !selectedFile) return;

    if (showBanner) setShowBanner(false);

    const fileName = selectedFile.name;
    const fileSize = (selectedFile.size / (1024 * 1024)).toFixed(2); // MB

    const userMessage = {
      role: "user",
      content: `${trimmed} [File: ${fileName} (${fileSize} MB)]`,
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("userInput", trimmed);
   
    try {
      const res = await fetch("http://localhost:8000/file/newfilehandler", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Server returned ${res.status}`);
      }
      const data = await res.json();
      setMessages((prev) => [...prev, data]);
    } catch (error) {
      console.error("Error processing file:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error processing the file: ${error.message}`,
        },
      ]);
    } finally {
      setLoading(false);
      // removeFile(); // optionally clear file after sending
    }
  };


 
  return (
    <div className="flex flex-col h-screen bg-gray-50 md:flex-row">
      
      {/* Left Column: Drop/Upload or CanvasView */}
      <div className="w-full md:w-1/2 p-6">
        {/* If a file is selected, show CanvasView. Otherwise, show the drop zone. */}
        {selectedFile ? (
          <div className="relative h-full">
            {/* "Remove file" button at top/right */}
            <button
              onClick={removeFile}
              className="absolute top-2 right-2 z-10 p-2 text-gray-500 hover:text-gray-700 
                         bg-white rounded-full shadow hover:bg-gray-100"
            >
              <X size={18} />
            </button>

            {/* CanvasView for the selected file */}
            <CanvasView file={selectedFile} isOpen={!!selectedFile} />
          </div>
        ) : (
          <div
            className={`
              relative flex flex-col items-center justify-center
              h-full rounded-xl border-2 border-dashed
              transition-all duration-200
              ${isDragging ? "border-orange-400 bg-orange-50" : "border-gray-300 bg-white hover:bg-gray-50"}
              p-8
            `}
            onDrop={handleFileDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onClick={triggerFileInput}
          >
            <div className="text-center cursor-pointer">
              <Upload size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-2">
                Drop your file here, or click to browse
              </p>
              <p className="text-sm text-gray-400">
                Supports various file formats including documents, images, and more
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        )}
      </div>

      {/* Right Column: Chat Interface */}
      <div className="flex flex-col flex-1 bg-white border-l border-gray-200">

       

     
        {/* Chat Container */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-4 py-6"
        >
          <div className="max-w-3xl mx-auto space-y-6">
            {showBanner && (
              <Banner
                title="AI File Handler"
                description="Upload any file and interact with it using natural language. Ask questions, extract information, summarize, or analyze content with advanced AI models."
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
        <div className="sticky bottom-0 border-gray-200 p-4">
          <div className="max-w-3xl mx-auto">
            <ChatInput input={input} setInput={setInput} sendMessage={sendMessageWithFile} isLoading={!selectedFile}  />
           
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * NewFileHandler.jsx
 *
 * 📄 Component: AI File Analysis with Upload & Chat
 *
 * This React component allows users to upload files (documents, images, etc.) and interact with them
 * using natural language. It provides a chat interface backed by an AI assistant that processes
 * the uploaded file and responds with summaries, answers, or insights.
 *
 * 📦 Location:
 * //GPT/gptcore/client/src/pages/FileHandlers/NewFileHandler.jsx
 *
 * 🔍 Purpose:
 * - Let users upload any file (Word, PDF, image, etc.)
 * - Send natural language queries along with the file
 * - Display AI-generated responses in chat format
 *
 * 🧩 Props: (none directly passed)
 * - Uses internal state to manage file, input, chat messages, loading, and drag status
 *
 * ⚙️ Core Features:
 * - File upload (drag & drop or browse)
 * - Auto-detect file type and preview via CanvasView
 * - Scroll behavior for chat window
 * - Smooth message sending and loading states
 * - Integration with backend API route `/file/newfilehandler`
 *
 * 🎨 UI Structure:
 * - Left Panel: File upload/dropzone or preview via `CanvasView`
 * - Right Panel: Chat interface with messages and input
 * - Banner shown until first message is sent
 * - Clean and modern Tailwind-based layout
 *
 * 🔁 Lifecycle:
 * - `useEffect` hooks manage scroll behavior and banner visibility
 * - Auto-scrolls when new messages are added
 *
 * 🧠 Internal Functions:
 * - `handleFileChange(e)`: handles file selection from input
 * - `handleFileDrop(e)`: handles drag & drop file
 * - `sendMessageWithFile()`: prepares data and sends it to backend
 * - `removeFile()`: resets the file input and state
 *
 * 🛡️ Error Handling:
 * - Shows fallback assistant message if file processing fails
 * - Supports `.json()` decoding of error messages
 *
 * 🔗 Backend Integration:
 * - Expects a POST to `http://localhost:8000/file/newfilehandler`
 * - Sends: `FormData` with file, userInput
 * - Receives: JSON `{ role: "assistant", content: "..." }`
 *
 * 🧠 Suggested Extensions:
 * - Add settings modal for model and instructions
 * - Add streaming support for real-time feedback
 * - Support multiple files or file history
 */
