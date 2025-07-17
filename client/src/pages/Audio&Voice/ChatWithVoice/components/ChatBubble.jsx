/* eslint-disable react/prop-types */
//GPT/gptcore/client/src/pages/Audio&Voice/ChatWithVoice/components/ChatBubble.jsx

import MarkdownViewerChat from "@/components/MarkDownViewerChat";
import PlayAudio from "./PlayAudio";

export default function ChatBubble({ role, content }) {
  const isUser = role === "user";
  const userMessageStyles = "chat chat-end text-primary-content/90 self-end";
  const botMessageStyles = "flex flex-col items-start gap-4 p-4 text-sm max-w-[700px] rounded-2xl";

  const renderContent = () => {
    return (
      <>
        <MarkdownViewerChat markdownContent={content[1].text} />
        <PlayAudio audio={content[0].text || ""} />
      </>
    );
  };

  return (
    <div className={isUser ? userMessageStyles : botMessageStyles}>
      {!isUser && (
        <>
          <img
            width={40}
            height={40}
            alt="bot"
            src="/logo.svg"
            className="w-9 bg-primary rounded-full p-1"
          />
          {renderContent()}
        </>
      )}

      {isUser && (
        <div className="chat-bubble flex flex-col max-w-[400px]">
          <p>{content[1].text}</p>
          <audio src={content[0].text} controls />
        </div>
      )}
    </div>
  );
}


/**
 * ChatBubble.jsx
 *
 * This component represents a "chat bubble" that displays messages from the user or assistant with both voice and text.
 * It renders markdown content and an audio player. The style changes based on the message role (`user` or `assistant`).
 *
 * 🧩 Composition:
 * - If the message is from the assistant (role not equal to "user"):
 *   - Displays an icon (bot logo).
 *   - Renders the text using `MarkdownViewerChat`.
 *   - Plays audio using `PlayAudio`.
 *
 * - If the message is from the user:
 *   - Displays plain text.
 *   - Includes a visible `<audio>` player with controls.
 *
 * ⚙️ Props:
 * @param {string} role - The sender’s role ("user" or "assistant").
 * @param {Array} content - Array of objects containing the message content.
 *   - content[0].text: Audio URL or blob.
 *   - content[1].text: Text or markdown to be displayed.
 *
 * 📦 Behavior:
 * - Uses different classes and layout for user and bot messages.
 * - Shows avatar only for bot messages.
 * - Allows playback of audio associated with each message.
 *
 * 🧩 Dependencies:
 * - `MarkdownViewerChat`: Component for rendering markdown content.
 * - `PlayAudio`: Component for playing bot message audio.
 *
 * 🧭 File path:
 * //GPT/gptcore/client/src/pages/Audio&Voice/ChatWithVoice/components/ChatBubble.jsx
 *
 * 🚫 Notes:
 * - The `content` must always have two elements in order: [audio, text].
 * - User audio is rendered with a standard `<audio>` element; bot audio uses a custom visual component.
 */
