// src/pages/CodeDocumenter/CodeDocumenter.jsx
import { useState, useRef,  } from "react";
import { Upload, Code, FileText, X, } from "lucide-react";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { Banner } from "@/components/Banner";
import { CodePanel } from "./CodePanel";
import { DocumentationPanel } from "./DocumentationPanel";
import { Pagination } from "./Pagination";

export function CodeDocumenter() {
  // File State
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  
  // Results State
  const [results, setResults] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // UI State
  const [showBanner, setShowBanner] = useState(true);
  const [viewMode, setViewMode] = useState("split"); // split, code, docs
  
  // Refs
  const fileInputRef = useRef(null);
  
  // Handle file selection change
  const handleFileChange = (e) => {
    const files = Array.from(e.target?.files || []);
    if (files.length === 0) return;
    
    // Only accept up to 5 files
    if (files.length > 5) {
      alert("Please select a maximum of 5 files");
      return;
    }
    
    setSelectedFiles(files);
    setShowBanner(false);
  };
  
  // Handle file drop
  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length === 0) return;
    
    // Only accept up to 5 files
    if (files.length > 5) {
      alert("Please select a maximum of 5 files");
      return;
    }
    
    setSelectedFiles(files);
    setShowBanner(false);
  };
  
  // Remove all selected files
  const removeFiles = () => {
    setSelectedFiles([]);
    setResults([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setShowBanner(true);
  };
  
  // Process the files
  const processFiles = async () => {
    if (selectedFiles.length === 0) return;
    
    setLoading(true);
    
    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append("files", file);
      });
      
      const response = await fetch("http://localhost:8000/code-documenter/analyze", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      
      const data = await response.json();
      setResults(data.results);
      setCurrentIndex(0);
    } catch (error) {
      console.error("Error processing files:", error);
      alert(`Error processing files: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Change current file being viewed
  const handlePageChange = (newIndex) => {
    if (newIndex >= 0 && newIndex < results.length) {
      setCurrentIndex(newIndex);
    }
  };
  
  // Go to next file
  const nextPage = () => {
    if (currentIndex < results.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };
  
  // Go to previous file
  const prevPage = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };
  
  // Toggle view mode
  const toggleViewMode = (mode) => {
    setViewMode(mode);
  };
  
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header with controls */}
      <header className="bg-white border-b border-gray-200 py-4 px-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">AI Code Documenter</h1>
          
          {selectedFiles.length > 0 && !loading && results.length === 0 && (
            <button
              onClick={processFiles}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <FileText size={16} />
              Generate Documentation
            </button>
          )}
          
          {results.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => toggleViewMode("split")}
                className={`px-3 py-1.5 rounded-md ${
                  viewMode === "split" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                }`}
              >
                Split View
              </button>
              <button
                onClick={() => toggleViewMode("code")}
                className={`px-3 py-1.5 rounded-md ${
                  viewMode === "code" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                }`}
              >
                Code Only
              </button>
              <button
                onClick={() => toggleViewMode("docs")}
                className={`px-3 py-1.5 rounded-md ${
                  viewMode === "docs" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                }`}
              >
                Docs Only
              </button>
            </div>
          )}
        </div>
      </header>
      
      {/* Main content area */}
      <div className="flex-1 overflow-hidden">
        {selectedFiles.length === 0 ? (
          // File Upload UI
          <div
            className={`
              relative flex flex-col items-center justify-center
              h-full rounded-xl m-6 border-2 border-dashed
              transition-all duration-200
              ${isDragging ? "border-blue-400 bg-blue-50" : "border-gray-300 bg-white hover:bg-gray-50"}
              p-8
            `}
            onDrop={handleFileDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="text-center cursor-pointer">
              <Upload size={48} className="mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-medium text-gray-700 mb-2">
                Upload your code files
              </h2>
              <p className="text-gray-600 mb-2">
                Drop up to 5 code files here, or click to browse
              </p>
              <p className="text-sm text-gray-400">
                Supports JavaScript, Python, Java, C#, Go, Rust, and more
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".js,.jsx,.ts,.tsx,.py,.java,.c,.cpp,.cs,.go,.rs,.php,.rb"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        ) : loading ? (
          // Loading UI
          <div className="flex flex-col items-center justify-center h-full">
            <LoadingIndicator size="large" />
            <p className="mt-4 text-gray-600">
              Analyzing your code files and generating documentation...
            </p>
          </div>
        ) : results.length > 0 ? (
          // Results UI with pagination
          <div className="h-full flex flex-col">
            {/* Pagination controls */}
            <div className="flex justify-between items-center p-4 bg-white border-b border-gray-200">
              <button
                onClick={removeFiles}
                className="px-3 py-1.5 text-red-600 hover:text-red-800 flex items-center gap-1"
              >
                <X size={16} />
                Clear All
              </button>
              
              <Pagination
                current={currentIndex + 1}
                total={results.length}
                onPrevious={prevPage}
                onNext={nextPage}
                onSelect={handlePageChange}
                files={results.map(r => r.filename)}
              />
            </div>
            
            {/* Content panels */}
            <div className="flex-1 overflow-hidden flex">
              {/* Code panel - show if in split or code view */}
              {(viewMode === "split" || viewMode === "code") && (
                <div className={`${viewMode === "split" ? "w-1/2" : "w-full"} h-full overflow-hidden`}>
                  <CodePanel 
                    code={results[currentIndex]?.rawCode || ""}
                    filename={results[currentIndex]?.filename || ""}
                  />
                </div>
              )}
              
              {/* Documentation panel - show if in split or docs view */}
              {(viewMode === "split" || viewMode === "docs") && (
                <div className={`${viewMode === "split" ? "w-1/2" : "w-full"} h-full overflow-hidden border-l border-gray-200`}>
                  <DocumentationPanel 
                    documentation={results[currentIndex]?.documentation || ""}
                    filename={results[currentIndex]?.filename || ""}
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          // Selected files, but not yet processed
          <div className="h-full flex flex-col p-6">
            <div className="bg-white rounded-lg shadow p-6 mb-4">
              <h2 className="text-lg font-medium mb-4">Selected Files</h2>
              <ul className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <li key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <Code size={16} className="text-gray-500" />
                    <span className="text-gray-700">{file.name}</span>
                    <span className="text-xs text-gray-500 ml-auto">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-6 flex justify-between">
                <button
                  onClick={removeFiles}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={processFiles}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Process Files
                </button>
              </div>
            </div>
            
            {showBanner && (
              <Banner
                title="AI-Powered Code Documentation"
                description="Upload your code files and our AI will generate comprehensive documentation for each file. The analysis happens in parallel for faster results."
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * CodeDocumenter.jsx
 *
 * Main component for the Code Documentation feature that allows users to upload
 * multiple code files and receive AI-generated documentation for each.
 *
 * Key Features:
 * - Drag-and-drop or file browser interface for uploading up to 5 code files
 * - Parallel processing of files for faster results
 * - Split-view display of original code and generated documentation
 * - Pagination to navigate between multiple files
 * - View modes to focus on code, documentation, or both
 * 
 * State Management:
 * - Tracks selected files, processing state, and results
 * - Maintains view preferences (split/code/docs)
 * - Handles pagination between multiple file results
 * 
 * UX Flow:
 * 1. User uploads up to 5 code files
 * 2. Files are sent to backend for parallel AI documentation
 * 3. Results are displayed in split view with pagination
 * 4. User can navigate between files and toggle view modes
 *
 * Dependencies:
 * - @/components/LoadingIndicator
 * - @/components/Banner
 * - ./components/CodePanel
 * - ./components/DocumentationPanel
 * - ./components/Pagination
 */