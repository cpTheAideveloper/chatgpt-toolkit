/* eslint-disable react/prop-types */
// components/ArtifactDisplay.jsx
import { SyntaxHighlighter } from "@/components/SyntaxHighlighter";

export const ArtifactDisplay = ({ artifact }) => {
  if (!artifact) return null;

  // Try to determine the language from the artifact or default to 'javascript'
  const language = artifact.language || "javascript";

  return (
    <div className=" overflow-hidden h-full">
      <div
        className="overflow-scroll "
        style={{ maxHeight: "calc(100% - 40px)" }}
      >
        <SyntaxHighlighter
          code={artifact.content}
          language={language}
          style={{ maxHeight: "calc(100% - 40px)" }}
        />
      </div>
    </div>
  );
};

export default ArtifactDisplay;


/**
 * ArtifactDisplay.jsx
 *
 * 📂 Location:
 * //components/ArtifactDisplay.jsx
 *
 * 🧩 Component Purpose:
 * Renders a code artifact (typically a file or snippet) with proper syntax highlighting using the `SyntaxHighlighter` component.
 * Useful for previewing generated or stored code outputs in a scrollable, responsive container.
 *
 * 📦 Props:
 * @prop {Object} artifact - The artifact object to display.
 * @prop {string} artifact.content - The raw source code or text to be highlighted.
 * @prop {string} [artifact.language="javascript"] - The language used for syntax highlighting (e.g., 'python', 'json').
 *
 * 🎨 Layout & Styling:
 * - Uses Tailwind for scrollable container styling.
 * - Sets a `maxHeight` of `calc(100% - 40px)` to adapt within parent containers.
 * - Applies overflow scroll to allow users to navigate large code blocks vertically.
 *
 * ⚙️ Behavior:
 * - If no artifact is provided, the component renders `null`.
 * - If artifact is valid, delegates rendering to the `SyntaxHighlighter` component.
 *
 * 🧠 Internals:
 * - Relies on a custom `SyntaxHighlighter` wrapper around Prism or similar renderer.
 * - Falls back to `"javascript"` if `artifact.language` is not defined.
 *
 * 📌 Notes:
 * - Ideal for side-by-side comparisons, artifact previews, and model-generated output visualization.
 * - For enhanced support, integrate language detection or metadata normalization upstream.
 */
