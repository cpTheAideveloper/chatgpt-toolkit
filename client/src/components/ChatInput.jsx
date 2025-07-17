/* eslint-disable react/prop-types */
//GPT/gptcore/client/src/components/ChatInput.jsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Send, X, Settings } from "lucide-react";

export const ChatInput = ({ 
  input, 
  setInput, 
  sendMessage, 
  isLoading,
  onOpenSettings = null,
  showSettingsButton = true
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  const handleChange = (e) => {
    setInput(e.target.value);
    adjustTextareaHeight();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleClear = () => {
    setInput("");
    inputRef.current?.focus();
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'; // Reset height
    }
  };
  
  const handleOpenSettings = () => {
    if (typeof onOpenSettings === 'function') {
      onOpenSettings();
    }
  };

  // Adjust textarea height to fit content
  const adjustTextareaHeight = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'; // Reset height
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`; // Set to scroll height
    }
  };

  // Focus input on initial load
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Adjust height whenever input changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);
  
  // Dynamic classes for send button
  const sendBtnClasses = `
    p-2 rounded-full transition-all flex items-center justify-center
    ${(input.trim() && !isLoading) 
      ? 'bg-green-600 text-white hover:brightness-110' 
      : 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'}
  `;

  return (
    <div className="flex flex-col max-w-4xl mx-auto w-full px-4 mb-4">
      {/* Input container with elevation */}
      <div
        className={`
          flex flex-col border rounded-2xl
          bg-white dark:bg-gray-800
          shadow-md transition-all duration-200 ease-in-out
          ${isFocused ? 'shadow-lg border-gray-400 dark:border-gray-600' : 'border-black/10 dark:border-gray-700'}
        `}
      >
        {/* Textarea Wrapper */}
        <div className="relative flex items-start w-full p-3">
          <textarea
            ref={inputRef}
            className="flex-1 px-1 py-0 bg-transparent border-none focus:outline-none dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none overflow-y-auto max-h-40"
            placeholder="Type a message..."
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={isLoading}
            rows="1"
            style={{ lineHeight: '1.5rem' }}
          />
          {input && !isLoading && (
            <button 
              className="absolute right-3 top-3 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" 
              onClick={handleClear} 
              aria-label="Clear input"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Button Row Container */}
        <div className="flex w-full justify-between items-center px-3 pb-3 pt-1">
          {/* Left side - empty for this simplified version */}
          <div className="flex items-center space-x-2">
            {/* Placeholder for future buttons if needed */}
          </div>
          
          {/* Right side - settings and send buttons */}
          <div className="flex items-center space-x-1">
            {showSettingsButton && (
              <button 
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full" 
                onClick={handleOpenSettings} 
                aria-label="Settings"
              >
                <Settings size={20} />
              </button>
            )}
            <button 
              className={sendBtnClasses} 
              onClick={sendMessage} 
              disabled={isLoading || !input.trim()} 
              aria-label="Send message"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * ChatInput.jsx
 * 
 * This component renders the input field for the chat interface, allowing users to:
 * - Type and send messages to the AI
 * - Clear the input field
 * - Open chat settings (if enabled)
 * 
 * Key Features:
 * - Expanding `textarea` that adjusts height based on content
 * - Auto-focus on mount for immediate usability
 * - Keyboard shortcut: press Enter to send, Shift+Enter for newline
 * - Send button only enabled when input is non-empty and not loading
 * - Optional settings button for model configuration
 * 
 * Dependencies:
 * - React (useState, useRef, useEffect)
 * - Icons from lucide-react (Send, X, Settings)
 * 
 * Path: //GPT/gptcore/client/src/components/ChatInput.jsx
 */
