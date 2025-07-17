/* eslint-disable react/prop-types */
//GPT/gptcore/client/src/pages/TextGeneration&Chat/CodeWithCanvas/components/ArtifactDisplay.jsx

import { SyntaxHighlighter } from "@/components/SyntaxHighlighter";

export const ArtifactDisplay = ({ artifact }) => {
  if (!artifact) return null;

  // Try to determine the language from the artifact or default to 'javascript'
  const language = artifact.language || "javascript";

  return (
    <div className="overflow-hidden h-full">
      <div
        className="overflow-scroll"
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
 * This component renders the code content of a selected artifact using a syntax highlighter.
 * It supports dynamic language detection from the artifact metadata and ensures scrollable,
 * responsive display within the artifact panel.
 * 
 * Key Features:
 * - Uses `SyntaxHighlighter` component for styled code output
 * - Scrollable code block with height constraints for layout consistency
 * - Defaults to JavaScript if language is not specified
 * 
 * Props:
 * - `artifact` (object): Code artifact to render; must contain `content` and optionally `language`
 * 
 * Dependencies:
 * - `SyntaxHighlighter` (custom component) for code rendering
 * - TailwindCSS for layout styling
 * 
 * Path: //GPT/gptcore/client/src/pages/TextGeneration&Chat/CodeWithCanvas/components/ArtifactDisplay.jsx
 */
