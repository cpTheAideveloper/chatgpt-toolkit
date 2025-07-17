export function LoadingIndicator() {
  return (
    <div className="flex items-center text-gray-500 p-3">
      <div className="w-3 h-3 bg-gray-300 rounded-full mr-2 animate-pulse"></div>
      <div
        className="w-3 h-3 bg-gray-300 rounded-full mr-2 animate-pulse"
        style={{ animationDelay: '0.2s' }}
      />
      <div
        className="w-3 h-3 bg-gray-300 rounded-full animate-pulse"
        style={{ animationDelay: '0.4s' }}
      />
    </div>
  );
}

/**
 * LoadingIndicator.jsx
 *
 * This component renders a simple animated loading indicator using three pulsing dots.
 * It is typically used to indicate that the assistant is processing a request or loading content.
 *
 * Key Features:
 * - Smooth pulsing animation for a lightweight loading feedback
 * - Custom delay between each dot for a staggered effect
 * - Minimal and reusable, with Tailwind CSS styling
 *
 * Use Cases:
 * - Displayed during API responses or streaming output from assistant
 * - Can be placed inside chat messages or as standalone indicators
 *
 * Dependencies:
 * - Tailwind CSS (for spacing, color, and animation)
 *
 * Path: //GPT/gptcore/client/src/components/LoadingIndicator.jsx
 */
