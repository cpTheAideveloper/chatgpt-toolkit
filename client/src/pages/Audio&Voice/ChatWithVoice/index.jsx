//GPT/gptcore/client/src/pages/Audio&Voice/ChatWithVoice/index.jsx
import { useAudioContext } from "./context/audioContext";
import ChatBubble from "./components/ChatBubble";
import { useEffect, useRef } from "react";
import Modal from "./components/Modal";

export const ChatWithVoice = () => {
  // eslint-disable-next-line no-unused-vars
  const { messages, isLoading } = useAudioContext();
  const messagesEndRef = useRef(null);

  // Scroll to the bottom of the chat every time messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
<>
      <Modal />
      <div className="flex w-full h-screen justify-between pb-20">
        <div className="flex flex-col flex-1 gap-10 py-10 h-full lg:px-10 overflow-y-scroll">
          {messages.map((message, index) => (
            <ChatBubble
              key={index}
              role={message.role}
              content={message.content}
            />
          ))}
          <p ref={messagesEndRef} />
        </div>
      </div>
  </>
  );
}

/**
 * ChatWithVoice.jsx
 *
 * 🎤 Main voice chat interface. Displays the conversation history
 * with chat bubbles (text + audio), and a floating modal for recording
 * the user's voice and interacting with the assistant.
 *
 * 📦 Location:
 * //GPT/gptcore/client/src/pages/Audio&Voice/ChatWithVoice/index.jsx
 *
 * 🧩 Imports:
 * - `useAudioContext`: Hook providing messages, loading state, and global methods.
 * - `ChatBubble`: Component that represents each chat message (user or assistant).
 * - `Modal`: Component that enables microphone access and records voice messages.
 *
 * 🧠 Main Hook:
 * @function useAudioContext
 * - Provides access to `messages` (array of interactions), `isLoading`, `sendAudio`, etc.
 *
 * 📥 Internal State:
 * @ref messagesEndRef - Reference to the end of the message container for auto-scrolling.
 *
 * 🎯 Effects:
 * @useEffect Automatically scrolls to the latest message when new ones are added.
 *
 * 💬 Render:
 * - `<Modal />`: Floating button that opens the voice assistant in an iOS-style modal.
 * - `<ChatBubble />`: Renders each message as a bubble (with audio and/or text).
 * - Automatic scroll ensured by `<p ref={messagesEndRef} />`.
 *
 * 🔁 Context Props Used Internally:
 * @context messages: Array<{ role: "user" | "assistant", content: Array<{ type: "audio" | "text", text: string }> }>
 * @context isLoading: boolean
 *
 * 🛠️ Styling:
 * - Full-width flex layout with vertical scroll and adaptive padding.
 * - Bottom padding (`pb-20`) to reserve space for the recording button.
 *
 * 📌 Expected Behavior:
 * - When audio is recorded in the `Modal`, it gets transcribed, the text is displayed, and the assistant's response is played.
 * - Each interaction appears as a bubble, aligned left (assistant) or right (user).
 *
 * 🔁 Dynamic Rendering:
 * @example
 * {
 *   role: "user",
 *   content: [
 *     { type: "audio", text: "<audio_url>" },
 *     { type: "text", text: "Hi, how are you?" }
 *   ]
 * }
 *
 * 🔗 Connection:
 * - Audio is generated and played from the backend `/audio/talkToGpt`.
 * - Communicates with `audioContext.jsx` and `ChatBubble.jsx` for input/output.
 */
