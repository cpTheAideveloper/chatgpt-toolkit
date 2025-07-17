/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { User, Bot, Headphones } from "lucide-react";
import MarkdownViewerChat from '@/components/MarkDownViewerChat';
import { TranscriptionSpeaker } from "./TranscriptionSpeaker";
import AudioPlayer from "./AudioPlayer"; // Import your AudioPlayer component

// Helper to extract text content from message
const extractTextContent = (content) => {
  if (typeof content === 'string') {
    return content;
  } 
  if (Array.isArray(content)) {
    // Find the text item in the array
    const textItem = content.find(item => item.type === 'text');
    return textItem?.text || '';
  }
  return '';
};

// Helper to extract audio content from message
const extractAudioContent = (content) => {
  if (Array.isArray(content)) {
    // Find the audio item in the array
    const audioItem = content.find(item => item.type === 'audio');
    return audioItem?.text || null;
  }
  return null;
};

export const ChatMessage = ({ message, isStreaming = false, streamingText = '' }) => {
  const isUser = message?.role === "user";
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);

  // --- Timestamp Handling ---
  const messageTimestamp = message?.timestamp || new Date().toISOString();
  const formattedTime = new Date(messageTimestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  // --- Content Handling ---
  // Determine if the message has array content or string content
  const isArrayContent = Array.isArray(message?.content);
  
  // Extract text content based on message format
  const textContent = isArrayContent 
    ? extractTextContent(message?.content)
    : message?.content;
    
  // Extract audio content if available
  const audioContent = isArrayContent
    ? extractAudioContent(message?.content)
    : null;
  
  // Determine the content to display (streamed or final)
  const displayContent = isUser 
    ? textContent 
    : (isStreaming ? streamingText : textContent);
    
  const hasContent = displayContent && displayContent.trim().length > 0;
  const hasAudio = !!audioContent;

  // Toggle audio player visibility
  const toggleAudioPlayer = () => {
    setShowAudioPlayer(prev => !prev);
  };

  // Show audio player automatically if it's the most recent message from assistant
  useEffect(() => {
    if (hasAudio && !isUser && !isStreaming) {
      setShowAudioPlayer(true);
    }
  }, [hasAudio, isUser, isStreaming]);

  return (
    <div
      className={`flex w-full items-start gap-3 mb-5 ${
        isUser ? "flex-row-reverse justify-start" : "flex-row justify-start"
      }`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 mt-1">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
          isUser ? "bg-green-600" : "bg-gray-300 dark:bg-gray-600"
        }`}>
          {isUser ? (
            <User size={18} className="text-white" />
          ) : (
            <Bot size={18} className="text-gray-700 dark:text-gray-200" />
          )}
        </div>
      </div>

      {/* Message Bubble Container */}
      <div className={`chat-bubble ${isUser ? 'chat-bubble-user' : 'chat-bubble-bot'} flex flex-col relative`}>
        {/* Main Text Content Area */}
        <div className="w-full prose dark:prose-invert max-w-none break-words">
          {(isStreaming && !isUser && !streamingText && !displayContent) 
            ? <span className="italic text-gray-500 dark:text-gray-400">Generating...</span>
            : <MarkdownViewerChat markdownContent={displayContent || ''} />
          }
        </div>
        
        {/* Audio Player (if available) */}
        {hasAudio && showAudioPlayer && (
          <div className="mt-3 w-full">
            <AudioPlayer audioSrc={audioContent} />
          </div>
        )}

        {/* Footer: Timestamp and Actions */}
        {(hasContent || !isStreaming) && (
          <div className="flex items-end justify-between gap-2 mt-2 w-full pt-1 border-t border-gray-100 dark:border-gray-700">
            {/* Left side: Actions */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              {/* Text-to-speech button for assistant messages */}
              {!isUser && hasContent && (
                <TranscriptionSpeaker transcriptionText={displayContent} />
              )}
              
              {/* Audio toggle button if message has audio */}
              {hasAudio && (
                <button 
                  onClick={toggleAudioPlayer}
                  className={`p-1 rounded-full ${showAudioPlayer ? 'text-cyan-500 bg-cyan-50 dark:bg-cyan-900/30' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                  title={showAudioPlayer ? "Hide audio player" : "Show audio player"}
                >
                  <Headphones size={16} />
                </button>
              )}
            </div>

            {/* Right side: Timestamp */}
            <div className={`text-xs whitespace-nowrap ${
              isUser ? 'text-green-100 opacity-90' : 'text-gray-500 dark:text-gray-400 opacity-90'
            }`}>
              {formattedTime}
            </div>
          </div>
        )}

        {/* Streaming Indicator */}
        {isStreaming && !isUser && (
          <div className="absolute -bottom-1 -right-1 flex items-center text-xs text-gray-400 dark:text-gray-500" title="Streaming...">
            <div className="w-1 h-1 bg-current rounded-full animate-pulse"></div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * ChatMessage.jsx
 *
 * 💬 Purpose:
 * - Renders a single message bubble in the chat interface, supporting text, streaming text,
 *   and optional audio playback for assistant responses.
 * - Includes dynamic avatars, timestamps, transcription playback, and streaming indicators.
 *
 * 🧩 Props:
 * @prop {Object} message - Message object, can contain `role`, `content`, `timestamp`.
 * @prop {boolean} isStreaming - Whether this message is currently being streamed.
 * @prop {string} streamingText - Text currently being streamed (used in assistant messages).
 *
 * 🧠 Logic:
 * - Differentiates between user and assistant messages using the `role` field.
 * - Handles message content in multiple formats:
 *   - `string`
 *   - `Array<{type: "text" | "audio", text: string}>`
 * - Automatically enables the audio player if the assistant includes an audio response.
 * - Allows manual toggling of the audio player for assistant messages with audio.
 *
 * 🔊 Audio Features:
 * - Displays a visual `AudioPlayer` if the message contains `type: "audio"` content.
 * - Includes a `TranscriptionSpeaker` button for assistant messages with text.
 * - Optional `Headphones` icon toggles the player display.
 *
 * 🧩 Components Used:
 * - `MarkdownViewerChat`: Renders Markdown-formatted message content.
 * - `AudioPlayer`: Plays back assistant-generated audio responses.
 * - `TranscriptionSpeaker`: Triggers text-to-speech from assistant's response.
 *
 * 🖼️ UI Elements:
 * - Avatars: Green for user, gray for assistant.
 * - Bubbles: Left-aligned for assistant, right-aligned for user.
 * - Timestamp: Always visible, displayed in HH:MM format.
 * - Streaming animation: Dot animation shown during assistant response generation.
 *
 * ⚙️ Behavior:
 * - Uses `useEffect` to auto-enable the audio player if applicable.
 * - Responsive and styled using TailwindCSS.
 *
 * 📦 Location:
 * //GPT/gptcore/client/src/pages/Audio&Voice/ChatWithVoice/components/ChatMessage.jsx
 *
 * 📌 Notes:
 * - Supports hybrid assistant responses: Markdown + audio.
 * - Designed for extensible multimodal assistant chat UIs.
 */
