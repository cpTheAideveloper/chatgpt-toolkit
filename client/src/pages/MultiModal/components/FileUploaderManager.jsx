// FileUploadManager.js
/* eslint-disable react/prop-types */

import { useState } from "react";
import { useChatContext } from "../context/ChatContext";
import { PaperclipIcon } from "lucide-react"; // Import an icon for file upload

export const FileUploadManager = () => {
  const { setSelectedFile } = useChatContext(); // Updated to match context
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setIsUploading(true);
      // Simulate file upload process
      // In a real app, replace this with actual upload logic
      setTimeout(() => {
        setSelectedFile(file); // Updated to match context
        setIsUploading(false);
      }, 1000); // Simulate a 1-second upload delay
    }
  };

  return (
    <div className="flex items-center">
      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.mp3,.md, .mdx, .txt"
        onChange={handleFileChange}
        className="hidden"
        id="file-upload"
      />
      <label
        htmlFor="file-upload"
        className={`
          p-2 rounded-full transition-colors cursor-pointer
          ${isUploading ? "text-gray-400 cursor-not-allowed" : "text-gray-500 hover:text-green-600 hover:bg-gray-100 dark:hover:bg-gray-700"}
        `}
        aria-label="Upload file"
      >
        {isUploading ? (
          <span>Uploading...</span>
        ) : (
          <PaperclipIcon size={20} /> // Using PaperclipIcon for file upload
        )}
      </label>
    </div>
  );
};

/**
 * FileUploadManager.jsx
 *
 * 📂 Purpose:
 * - Allows users to upload a file to be used in chat interactions.
 * - Integrates with the global chat context to set the selected file.
 *
 * 🧩 Props: None (uses context via `useChatContext`)
 *
 * 🔄 Context Dependencies (from ChatContext):
 * - `setSelectedFile`: Function to store the selected file globally.
 *
 * 🧠 Behavior:
 * - Opens a file picker for supported formats (.pdf, .jpg, .png, .mp3, .md, .txt, etc.).
 * - On file selection, shows an "Uploading..." state for 1 second (simulated).
 * - After delay, updates the global `selectedFile` with the uploaded file.
 *
 * 🎨 Design:
 * - Hidden input with styled label used as a clickable button.
 * - Displays a `PaperclipIcon` from `lucide-react`.
 * - Shows upload status visually (grayed out text while uploading).
 *
 * 💡 Accessibility:
 * - Uses `aria-label="Upload file"` on the label for screen readers.
 * - File input is visually hidden but still functional via label `htmlFor`.
 *
 * 📦 Location:
 * //GPT/gptcore/client/src/components/FileUploadManager.jsx
 *
 * 📌 Notes:
 * - Replace the `setTimeout` with real file upload logic if connecting to backend or cloud storage.
 * - Useful in chat apps where users can ask questions about documents or media.
 */
