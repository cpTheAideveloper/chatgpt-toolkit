/* eslint-disable react/prop-types */
"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Mic, X } from "lucide-react";
import clsx from 'clsx'; // Optional: for cleaner classes. Install: npm i clsx
import { ChatSettings } from "./ChatSettings";
import { SearchGlobeButton } from "./SearchGlobeButton";
import { SearchSettingsModal } from "./SearchSettingsModal";
import { FileUploadManager } from "./FileUploaderManager";
import { useChatContext } from "../context/ChatContext";
import { CodeModeButton } from "./CodeModeButton";
import ImprovedAudioModal from "./ImprovedAudioModal";

// Helper to manage textarea height
const adjustTextareaHeight = (ref) => {
  if (ref.current) {
    ref.current.style.height = 'auto'; // Reset height
    ref.current.style.height = `${ref.current.scrollHeight}px`; // Set to scroll height
  }
};

export const ChatInput = () => {
  const { 
    input, 
    setInput, 
    sendMessageStream, 
    loading, 
    isSearchMode, 
    selectedFile,
    codeMode, // Added codeMode
    audioMode,   // Added audioMode check
    toggleAudioMode // Added toggle function
  } = useChatContext();
  
  const [isFocused, setIsFocused] = useState(false);

  const [showAudioModal, setShowAudioModal] = useState(false);
  const inputRef = useRef(null);

  // --- Event Handlers ---
  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSend = () => {
    if (!loading && input.trim()) {
      sendMessageStream();
      if (inputRef.current) inputRef.current.style.height = 'auto'; // Reset height inline
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setInput("");
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'; // Reset height inline
      inputRef.current.focus();
    }
  };
  
  // Handle microphone click to show audio modal
  const handleMicClick = () => {
    setShowAudioModal(true);
    toggleAudioMode(); // Switch to audio mode
  };

  // --- Effects ---
  useEffect(() => { inputRef.current?.focus() }, []);
  useEffect(() => { adjustTextareaHeight(inputRef) }, [input]); // Adjust height on input change

  // --- Dynamic Content/Classes (for brevity in JSX) ---
  const placeholder = selectedFile 
    ? `Ask about "${selectedFile.name}"...` 
    : isSearchMode 
      ? "Search the web..." 
      : codeMode 
        ? "Ask for code generation..." 
        : audioMode
          ? "Speak to the assistant..."
          : "Type a message...";
        
  const sendLabel = loading 
    ? "Sending..." 
    : selectedFile 
      ? "Send with file" 
      : isSearchMode 
        ? "Search" 
        : codeMode 
          ? "Generate code" 
          : "Send message";

  const containerClasses = clsx(
    'flex flex-col border rounded-2xl bg-white dark:bg-gray-800 shadow-md transition-all duration-200 ease-in-out',
    isFocused ? 'shadow-lg border-gray-400 dark:border-gray-600' : 'border-black/10 dark:border-gray-700',
    {
      '!border-blue-500': isSearchMode,
      '!border-green-500': selectedFile && !codeMode && !isSearchMode && !audioMode,
      '!border-purple-500': codeMode, // Purple border for code mode
      '!border-cyan-500': audioMode // Cyan border for audio mode
    }
  );

  const micBtnClasses = clsx('p-2 rounded-full transition-colors', 
    audioMode ? 'text-cyan-500 bg-cyan-100 dark:bg-cyan-900/50' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
  );
  
  const sendBtnClasses = clsx('p-2 rounded-full transition-all flex items-center justify-center', 
    (input.trim() && !loading) 
      ? (
          codeMode 
            ? 'bg-purple-600' // Purple for code mode
            : audioMode
              ? 'bg-cyan-600' // Cyan for audio mode
              : selectedFile 
                ? 'bg-green-600' 
                : isSearchMode 
                  ? 'bg-blue-600' 
                  : 'bg-green-600'
        ) + ' text-white hover:brightness-110' 
      : 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
  );

  return (
    // 1. Outermost container
    <div className="flex flex-col max-w-4xl mx-auto w-full px-4 mb-4"> {/* Added mb-4 for spacing */}
      {/* 2. Main Input area container */}
      <div className={containerClasses}>
        {/* 3. Textarea Wrapper */}
        <div className="relative flex items-start w-full p-3">
          <textarea
            ref={inputRef}
            className="flex-1 px-1 py-0 bg-transparent border-none focus:outline-none dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none overflow-y-auto max-h-40" // Added max-h
            placeholder={placeholder}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={loading}
            rows="1"
            style={{ lineHeight: '1.5rem' }}
          />
          {input && !loading && (
            <button className="absolute right-3 top-3 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" onClick={handleClear} aria-label="Clear input">
              <X size={18} />
            </button>
          )}
        </div>

        {/* 4. Button Row Container */}
        <div className="flex w-full justify-between items-center px-3 pb-3 pt-1">
          {/* 5. Left Button Group */}
          <div className="flex items-center space-x-2">
            <FileUploadManager />
            <SearchGlobeButton />
            <CodeModeButton />
          </div>
          {/* 6. Right Button Group */}
          <div className="flex items-center space-x-1">
            <button 
              className={micBtnClasses} 
              onClick={handleMicClick} 
              aria-label={audioMode ? "Audio mode active" : "Voice input"}
            >
              <Mic size={20} />
            </button>
            {isSearchMode ? <SearchSettingsModal /> : <ChatSettings />}
            <button className={sendBtnClasses} onClick={handleSend} disabled={loading || !input.trim()} aria-label={sendLabel}>
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Audio Modal */}
      {showAudioModal && (
        <ImprovedAudioModal 
          isOpen={showAudioModal}
          setIsOpen={setShowAudioModal}
        />
      )}
    </div>
  );
};

/**
 * ChatInput.jsx
 *
 * 💬 Purpose:
 * - Provides a dynamic and adaptive input field for user interactions in a multimodal chat interface.
 * - Supports text, voice, file uploads, code generation, and web search modes with contextual controls.
 *
 * 🧩 Context Integration:
 * Uses `useChatContext` to access shared state and actions:
 * - `input`, `setInput`: Controls for text input state.
 * - `sendMessageStream`: Sends message to the assistant with streaming.
 * - `loading`: Indicates if a response is in progress.
 * - `isSearchMode`, `codeMode`, `audioMode`: UI mode flags.
 * - `selectedFile`: File uploaded and attached to current message.
 * - `toggleAudioMode`: Toggles audio input interface.
 *
 * 🔄 Dynamic Modes:
 * - **Search Mode**: Updates placeholder and send button label.
 * - **Code Mode**: Styles the input and send button for coding context.
 * - **Audio Mode**: Activates mic input and cyan highlights.
 * - **File Upload**: Adds file metadata to messages and UI styling.
 *
 * 🧠 Logic:
 * - Triggers `sendMessageStream` on Enter (unless Shift is pressed).
 * - Updates height of textarea automatically on input changes.
 * - Resets UI state (input, height, focus) after sending or clearing.
 * - Conditionally renders audio modal and dynamic button components.
 *
 * 🧩 UI Components Used:
 * - `FileUploadManager`: Handles file uploads and drag-drop.
 * - `SearchGlobeButton`: Enables search mode.
 * - `CodeModeButton`: Enables code mode.
 * - `ChatSettings` / `SearchSettingsModal`: Settings modals for each mode.
 * - `ImprovedAudioModal`: Voice recording assistant interface.
 *
 * 🎨 Styling:
 * - TailwindCSS with `clsx` for conditional classes.
 * - Color-coded borders and buttons based on current mode.
 * - Adaptive placeholder and button label text.
 *
 * 🔁 Lifecycle:
 * - `useEffect`: Focuses input and adjusts height on mount/update.
 *
 * 📦 Location:
 * //GPT/gptcore/client/src/pages/Audio&Voice/ChatWithVoice/components/ChatInput.jsx
 *
 * 📌 Notes:
 * - This is the most central and complex UI element in the multimodal assistant interface.
 * - Designed for extensibility and future enhancements (e.g., translation, sentiment, etc).
 */
