/* eslint-disable react/prop-types */
// src/pages/CodeDocumenter/components/Pagination.jsx
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({ current, total, onPrevious, onNext, onSelect, files = [] }) {
    // Only show up to 3 files on either side of the current one
    const getVisibleFiles = () => {
      if (total <= 7) return files.map((file, i) => ({ index: i, name: file }));
      
      let visibleFiles = [];
      const currentIndex = current - 1;
      
      // Always show the first file
      visibleFiles.push({ index: 0, name: files[0] });
      
      // If there's a gap after the first file, add ellipsis
      if (currentIndex > 3) {
        visibleFiles.push({ index: -1, name: "..." });
      }
      
      // Files around the current one
      const start = Math.max(1, currentIndex - 1);
      const end = Math.min(total - 2, currentIndex + 1);
      
      for (let i = start; i <= end; i++) {
        visibleFiles.push({ index: i, name: files[i] });
      }
      
      // If there's a gap before the last file, add ellipsis
      if (currentIndex < total - 4) {
        visibleFiles.push({ index: -2, name: "..." });
      }
      
      // Always show the last file
      if (total > 1) {
        visibleFiles.push({ index: total - 1, name: files[total - 1] });
      }
      
      return visibleFiles;
    };
    
    return (
      <div className="flex items-center gap-1">
        {/* Previous button */}
        <button
          onClick={onPrevious}
          disabled={current === 1}
          className={`p-1.5 rounded-md ${
            current === 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <ChevronLeft size={18} />
        </button>
        
        {/* File indicators */}
        <div className="flex items-center gap-1 mx-2">
          {getVisibleFiles().map((file) => (
            file.index < 0 ? (
              // Ellipsis
              <span key={file.index} className="px-1 text-gray-500">
                {file.name}
              </span>
            ) : (
              // File button
              <button
                key={file.index}
                onClick={() => onSelect(file.index)}
                className={`px-3 py-1 rounded-md text-sm ${
                  current === file.index + 1
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                title={file.name}
              >
                {file.index + 1}
              </button>
            )
          ))}
        </div>
        
        {/* Next button */}
        <button
          onClick={onNext}
          disabled={current === total}
          className={`p-1.5 rounded-md ${
            current === total ? "text-gray-300 cursor-not-allowed" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    );
  }