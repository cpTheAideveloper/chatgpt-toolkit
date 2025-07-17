/* eslint-disable react/prop-types */

import { Bot } from "lucide-react";
import MarkdownViewerChat from "./MarkDownViewerChat";

export function ChatBubble({ role, content }) {
  const isAssistant = role === "assistant";

  return (
    <div className={`
      flex w-full
      animate-in fade-in slide-in-from-bottom-4 duration-300 ease-out
      ${isAssistant ? "justify-start" : "justify-end"}
    `}>
      <div className={`
        flex group
        max-w-[80%] md:max-w-2xl
        ${isAssistant ? "flex-row" : "flex-row-reverse"}
      `}>
        {/* Avatar Container */}
        {isAssistant && (
          <div className="flex-shrink-0 mr-4">
            <div className="
              p-2 rounded-xl bg-blue-50 
              text-blue-500
              shadow-sm
              group-hover:scale-110 
              transition-transform duration-200
            ">
              <Bot size={20} />
            </div>
          </div>
        )}

        {/* Message Container */}
        <div className={`
          relative
          p-4 rounded-2xl
          shadow-sm
          transition-all duration-200
          ${isAssistant 
            ? "bg-white text-gray-800 rounded-tl-none hover:bg-gray-50" 
            : "bg-blue-500 text-white rounded-tr-none hover:bg-blue-600"
          }
        `}>
          {/* Message Content */}
          <div className={`
            whitespace-pre-wrap
            ${isAssistant ? "prose prose-gray max-w-none" : ""}
          `}>
            {isAssistant ? (
              <MarkdownViewerChat markdownContent={content} />
            ) : (
              <span className="text-[15px] leading-relaxed">{content}</span>
            )}
          </div>

          {/* Optional timestamp or status indicators */}
          <div className={`
            absolute bottom-1 ${isAssistant ? 'right-2' : 'left-2'}
            text-[10px] opacity-0 group-hover:opacity-50 transition-opacity
            ${isAssistant ? 'text-gray-400' : 'text-white'}
          `}>
            {new Date().toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>

        {/* Optional typing indicator for assistant */}
        {isAssistant && content.endsWith('...') && (
          <div className="flex items-center gap-1 absolute -bottom-6 left-14">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * ChatBubble.jsx
 * 
 * This component is responsible for rendering individual chat messages (bubbles)
 * in the conversation interface, differentiating between user and assistant roles.
 * It includes visual styling, Markdown rendering for assistant messages, and
 * contextual UI elements like avatars, timestamps, and typing indicators.
 * 
 * Key Features:
 * - Role-based layout (left for assistant, right for user)
 * - Markdown support for assistant replies via MarkdownViewerChat
 * - Responsive styling with hover effects and animation
 * - Avatars for assistant role using lucide-react icons
 * - Optional animated typing indicator for assistant (based on trailing `...`)
 * - Timestamps shown subtly on hover
 * 
 * Dependencies:
 * - `lucide-react` (Bot icon)
 * - `MarkdownViewerChat` (for parsing and rendering markdown replies)
 * - TailwindCSS classes for styling and responsiveness
 * 
 * Path: //GPT/gptcore/client/src/components/ChatBubble.jsx
 */
