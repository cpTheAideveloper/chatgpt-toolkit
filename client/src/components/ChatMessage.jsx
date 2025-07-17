/* eslint-disable react/prop-types */
//GPT/gptcore/client/src/components/ChatMessage.jsx

import { User, Bot } from "lucide-react";
import MarkdownViewerChat from './MarkDownViewerChat';

export const ChatMessage = ({ message, isStreaming = false, streamingText = '' }) => {
  const isUser = message?.role === "user";

  // Always use current time for timestamp
  const timestamp = new Date();

  // For assistant messages that are streaming, use streaming text
  const displayContent = isStreaming && !isUser ? streamingText : message?.content;

  return (
    <div
      className={`flex mb-15 mx-auto items-start gap-2 mb-4 ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 ${isUser ? "ml-2" : "mr-2"}`}>
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
          isUser ? "bg-green-500" : "bg-gray-300"
        }`}>
          {isUser ? (
            <User size={16} className="text-white" />
          ) : (
            <Bot size={16} className="text-gray-700" />
          )}
        </div>
      </div>

      {/* Message bubble with Markdown support */}
      <div
        className={`relative rounded-lg flex items-center ${
          isUser
            ? "bg-green-500 text-white rounded-tr-none max-w-xs sm:max-w-md md:max-w-lg px-4 py-2"
            : "bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200 max-w-[85%] px-4 py-3"
        }`}
      >
        <div className={`${isUser ? "text-white text-sm" : "text-gray-800 text-sm"}`}>
          <MarkdownViewerChat markdownContent={displayContent || ''} />
        </div>

        {/* Streaming indicator for assistant messages */}
        {isStreaming && !isUser && (
          <div className="flex items-center mt-2">
            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-1 animate-pulse"></div>
            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-1 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        )}

        {/* Timestamp */}
        <div className={`mt-1 text-xs ${isUser ? "text-green-100" : "text-gray-500"}`}>
          {timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    </div>
  );
};

/**
 * ChatMessage.jsx
 * 
 * This component is responsible for rendering an individual message bubble in the chat interface.
 * It dynamically adapts the layout and appearance based on whether the message is from the user
 * or the assistant, and supports live-streaming updates for assistant responses.
 * 
 * Key Features:
 * - Conditional layout (left/right) based on message role
 * - Avatars for both user and assistant (with color-coding)
 * - Markdown rendering via `MarkdownViewerChat` for assistant content
 * - Typing animation (three-dot pulse) for streaming assistant messages
 * - Timestamps shown below each message bubble
 * 
 * Props:
 * - `message` (object): The message object, including `role` and `content`
 * - `isStreaming` (boolean): Indicates if assistant is currently streaming content
 * - `streamingText` (string): The partial content being streamed (for live typing effect)
 * 
 * Dependencies:
 * - `lucide-react` for icons (User, Bot)
 * - `MarkdownViewerChat` for markdown rendering
 * 
 * Path: //GPT/gptcore/client/src/components/ChatMessage.jsx
 */
