/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Code } from "lucide-react";
import { useChatContext } from "../context/ChatContext";

export const CodeModeButton = () => {
  // Get code mode state from context
  const { codeMode, toggleCodeMode  } = useChatContext();
  const [isAnimating, setIsAnimating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Animate code-mode toggle
  useEffect(() => {
    if (codeMode) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [codeMode]);
  
  return (
    <div className="flex justify-center pb-1 rounded-full">
      <button
        className={`
          p-2 rounded-full flex items-center gap-2 transition-colors relative
          ${
            codeMode
              ? "text-purple-500 bg-purple-100 dark:bg-purple-900"
              : "text-gray-500 hover:text-purple-600 bg-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
          }
          ${isAnimating ? "animate-pulse" : ""}
        `}
        onClick={toggleCodeMode}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label={codeMode ? "Disable code artifacts" : "Enable code artifacts"}
        data-code-active={codeMode}
      >
        <Code
          size={20}
          className={isAnimating ? "animate-spin duration-1000" : ""}
        />
        Code Mode
        {/* Tooltip that appears on hover */}
        {isHovered && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-10 shadow-lg">
            {codeMode ? "Disable code artifacts" : "Enable code artifacts"}
          </div>
        )}
      </button>
    </div>
  );
};

/**
 * CodeModeButton.jsx
 *
 * 🧠 Purpose:
 * - Toggles the "code mode" in the chat interface, allowing the assistant to return formatted code artifacts.
 * - Shows animated feedback when code mode is activated.
 * - Provides a hover tooltip with a brief description.
 *
 * 🧩 Props: None (uses context via `useChatContext`)
 *
 * 🔄 Context Dependencies (from ChatContext):
 * - `codeMode`: Boolean state indicating whether code mode is active.
 * - `toggleCodeMode`: Function to toggle the code mode state.
 *
 * 🎯 Behavior:
 * - When clicked, toggles the `codeMode` value in global context.
 * - Applies pulse and spin animations for 1 second when activated.
 * - Displays tooltip text on hover to describe the current state.
 *
 * 🎨 Design:
 * - Button is styled with color changes:
 *   - Active: Purple background and text.
 *   - Inactive: Gray tones with purple hover effect.
 * - Tooltip appears above the button on hover.
 *
 * 🧩 UX:
 * - Visual icon: `<Code />` from `lucide-react`.
 * - Smooth transitions and accessibility via `aria-label` and hover effects.
 *
 * 📦 Location:
 * //GPT/gptcore/client/src/components/CodeModeButton.jsx
 *
 * 📌 Notes:
 * - This button is meant to integrate with AI code generation workflows.
 * - Ideal for toggling assistant behavior in developer-focused environments.
 */
