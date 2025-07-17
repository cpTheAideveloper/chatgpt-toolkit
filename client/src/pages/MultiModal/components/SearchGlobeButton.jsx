/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import { useChatContext } from "../context/ChatContext";

export const SearchGlobeButton = () => {
  // Get search mode state from context
  const { isSearchMode, toggleSearchMode } = useChatContext();
  const [isAnimating, setIsAnimating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  // Animate search-mode toggle
  useEffect(() => {
    if (isSearchMode) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isSearchMode]);
  return (
    <div className="flex justify-center pb-1   rounded-full ">
      <button
        className={`
          p-2 rounded-full flex items-center gap-2  transition-colors relative
          ${
            isSearchMode
              ? "text-blue-500 bg-blue-100 dark:bg-blue-900"
              : "text-gray-500 hover:text-blue-600 bg-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
          }
          ${isAnimating ? "animate-pulse" : ""}
        `}
        onClick={toggleSearchMode}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label={isSearchMode ? "Disable web search" : "Enable web search"}
        data-search-active={isSearchMode}
      >
        <Globe
          size={20}
          className={isAnimating ? "animate-spin duration-1000" : ""}
        />
        Web Search
        {/* Tooltip that appears on hover */}
        {isHovered && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-10 shadow-lg">
            {isSearchMode ? "Disable web search" : "Enable web search"}
          </div>
        )}
      </button>
    </div>
  );
};

/**
 * SearchGlobeButton.jsx
 *
 * 🌐 Purpose:
 * - Interactive button that toggles the web search mode in the application.
 * - Visually indicates whether search mode is active through color and animation.
 *
 * 🧩 Integration:
 * - Uses the global `ChatContext` to access `isSearchMode` and `toggleSearchMode`.
 * - The button changes color and triggers a "pulse" animation when activated.
 * - Displays a globe icon (`<Globe />`) and shows a tooltip on hover.
 *
 * 🔁 Animations:
 * - A `pulse` animation is triggered for 1 second when `isSearchMode` switches to `true`.
 * - The icon also spins (`animate-spin`) as a visual effect.
 *
 * 📌 Notes:
 * - Useful in applications where the user can switch between general chat and AI-powered web search.
 * - The tooltip only appears on hover, enhancing the user experience.
 *
 * 🎨 Design:
 * - Blue visual style for active mode (`bg-blue-100`, `text-blue-500`).
 * - Gray style for inactive mode with highlighted hover effects.
 *
 * 📦 File Location:
 * //GPT/gptcore/client/src/components/SearchGlobeButton.jsx
 */
