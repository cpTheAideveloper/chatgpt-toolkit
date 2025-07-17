import { useState, useRef, useEffect } from "react";
import { ChatInput } from "@/components/ChatInput";
import { 
  Download, 
  XCircle, 
  ImageIcon, 
  ImagePlus, 
  Trash2, 
  ArrowRight, 
  X, 
  Upload, 

  Edit,
  Paintbrush
} from "lucide-react";
import { MaskDrawingCanvas } from "./MaskDrawingCanvas";
import { VerificationModal } from "@/components/VerificationModal";

export function GPTImageEdit() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState([]); // Array of edited results
  const [uploadedImage, setUploadedImage] = useState(null);
  const [maskImage, setMaskImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [editMode, setEditMode] = useState("edit"); // "edit" or "inpaint"
  const [isDrawingMask, setIsDrawingMask] = useState(false);
  
  // Add refs for file uploads and scrolling
  const fileInputRef = useRef(null);
  const maskInputRef = useRef(null);
  const resultsEndRef = useRef(null);
  const contentContainerRef = useRef(null);

  // Handle scroll behavior
  useEffect(() => {
    const container = contentContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-scroll when new results are added
  useEffect(() => {
    if (!showScrollButton) {
      resultsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [results, showScrollButton]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const file = files[0]; 
    
    // Clear existing uploaded image and revoke URL if exists
    if (uploadedImage && uploadedImage.preview) {
      URL.revokeObjectURL(uploadedImage.preview);
    }
    
    setUploadedImage({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    });
  };

  const handleMaskChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const file = files[0];
    
    // Clear existing mask image and revoke URL if exists
    if (maskImage && maskImage.preview) {
      URL.revokeObjectURL(maskImage.preview);
    }
    
    setMaskImage({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    });
    
    // Switch to inpaint mode automatically
    setEditMode("inpaint");
  };

  const removeUploadedImage = (e) => {
    if (e) e.stopPropagation();
    
    if (uploadedImage && uploadedImage.preview) {
      URL.revokeObjectURL(uploadedImage.preview);
    }
    setUploadedImage(null);
    
    // If we remove the source image, also remove the mask
    if (maskImage) {
      removeMaskImage();
    }
  };

  const removeMaskImage = (e) => {
    if (e) e.stopPropagation();
    
    if (maskImage && maskImage.preview) {
      URL.revokeObjectURL(maskImage.preview);
    }
    setMaskImage(null);
    
    // If we remove the mask, switch back to edit mode
    setEditMode("edit");
  };

  const removeResult = (indexToRemove) => {
    setResults(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const triggerMaskInput = () => {
    maskInputRef.current.click();
  };

  const handleScrollToBottom = () => {
    resultsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollButton(false);
  };
  
  const toggleEditMode = () => {
    if (editMode === "edit") {
      setEditMode("inpaint");
    } else {
      setEditMode("edit");
    }
  };

  const handleSaveMask = (maskData) => {
    setMaskImage(maskData);
    setIsDrawingMask(false);
  };
  
  const handleCancelDrawing = () => {
    setIsDrawingMask(false);
  };
  
  const startDrawingMask = () => {
    if (!uploadedImage) {
      alert("Please upload an image first before drawing a mask.");
      return;
    }
    setIsDrawingMask(true);
    setEditMode("inpaint");
  };

  const handleSubmit = async () => {
    if (!uploadedImage) {
      alert("Please upload an image to edit.");
      return;
    }

    const trimmed = input.trim();
    if (!trimmed) {
      alert("Please enter a prompt describing the edit.");
      return;
    }

    setInput("");
    setLoading(true);
    
    // Create a new result entry 
    const newResultIndex = results.length;
    setResults(prev => [...prev, { 
      loading: true, 
      prompt: trimmed,
      sourceImage: uploadedImage,
      maskImage: maskImage,
      editMode: editMode,
      timestamp: new Date().toISOString()
    }]);

    try {
      // Create form data for the API request
      const formData = new FormData();
      formData.append("prompt", trimmed);
      formData.append("images", uploadedImage.file);
      
      // Add mask for inpainting mode
      if (editMode === "inpaint" && maskImage) {
        formData.append("mask", maskImage.file);
      }
      
      const res = await fetch("http://localhost:8000/image/edit", {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) {
        throw new Error(`Server responded with status: ${res.status}`);
      }
      
      const data = await res.json();

      // Update the result
      setResults(prev => {
        const newResults = [...prev];
        newResults[newResultIndex] = {
          ...newResults[newResultIndex],
          url: `data:image/png;base64,${data.b64_json}`,
          loading: false
        };
        return newResults;
      });

    } catch (error) {
      console.error("Error editing image:", error);
      // Update the result with the error
      setResults(prev => {
        const newResults = [...prev];
        newResults[newResultIndex] = {
          ...newResults[newResultIndex],
          error: error.toString(),
          loading: false
        };
        return newResults;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (imageData) => {
    try {
      if (imageData.startsWith('data:')) {
        const a = document.createElement("a");
        a.href = imageData;
        a.download = `gpt-edited-image-${new Date().getTime()}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } 
    } catch (e) {
      console.error("Error downloading image:", e);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 md:flex-row">
        <VerificationModal modelName="gpt-image-1" />
      {/* Left Column: Upload/Source Image and Mask */}
      <div className="w-full md:w-1/2 p-6">
        <div className="h-full flex flex-col gap-4">
          {/* Mode selector */}
          <div className="flex justify-center mb-2">
            <div className="bg-white border border-gray-200 rounded-full inline-flex">
              <button
                onClick={() => setEditMode("edit")}
                className={`px-4 py-2 text-sm rounded-full ${
                  editMode === "edit" 
                    ? "bg-blue-600 text-white" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Edit size={16} className="inline mr-1" />
                Edit Mode
              </button>
              <button
                onClick={toggleEditMode}
                className={`px-4 py-2 text-sm rounded-full ${
                  editMode === "inpaint" 
                    ? "bg-blue-600 text-white" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                disabled={!uploadedImage}
              >
                <Upload size={16} className="inline mr-1" />
                Inpaint Mode
              </button>
            </div>
          </div>
        
          {/* Source image upload */}
          {!isDrawingMask && (
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 mb-2 ml-1">Source Image</p>
              <div
                className={`
                  relative flex flex-col items-center justify-center
                  h-[calc(100%-2rem)] rounded-xl border-2 border-dashed
                  transition-all duration-200
                  border-gray-300 bg-white hover:bg-gray-50
                  ${uploadedImage ? 'p-4' : 'p-8'}
                `}
                onClick={!uploadedImage ? triggerFileInput : undefined}
              >
                {uploadedImage ? (
                  <div className="relative w-full h-full">
                    <img
                      src={uploadedImage.preview}
                      alt="Source"
                      className="w-full h-full object-contain rounded-lg"
                    />
                    <button
                      onClick={removeUploadedImage}
                      className="absolute top-2 right-2 p-2 bg-gray-900/50 rounded-full text-white hover:bg-gray-900/70 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <ImagePlus size={48} className="mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 mb-2">
                      Upload your image to edit
                    </p>
                    <p className="text-sm text-gray-400">
                      Click to browse or drop an image
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
          )}
          
          {/* Mask drawing canvas */}
          {isDrawingMask && (
            <div className="flex-1">
              <MaskDrawingCanvas 
                sourceImage={uploadedImage}
                onSaveMask={handleSaveMask}
                onCancelDrawing={handleCancelDrawing}
                brushSize={20}
              />
            </div>
          )}
          
          {/* Mask upload - only show in inpaint mode and not when drawing */}
          {editMode === "inpaint" && !isDrawingMask && (
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium text-gray-700 ml-1">Mask Image (Areas to Edit)</p>
                <button
                  onClick={startDrawingMask}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  disabled={!uploadedImage}
                >
                  <Paintbrush size={16} className="mr-1" />
                  Draw Mask
                </button>
              </div>
              <div
                className={`
                  relative flex flex-col items-center justify-center
                  h-[calc(100%-2rem)] rounded-xl border-2 border-dashed
                  transition-all duration-200
                  border-gray-300 bg-white hover:bg-gray-50
                  ${maskImage ? 'p-4' : 'p-8'}
                `}
                onClick={!maskImage ? triggerMaskInput : undefined}
              >
                {maskImage ? (
                  <div className="relative w-full h-full">
                    <img
                      src={maskImage.preview}
                      alt="Mask"
                      className="w-full h-full object-contain rounded-lg"
                    />
                    <button
                      onClick={removeMaskImage}
                      className="absolute top-2 right-2 p-2 bg-gray-900/50 rounded-full text-white hover:bg-gray-900/70 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload size={48} className="mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 mb-2">
                      Upload a mask image
                    </p>
                    <p className="text-sm text-gray-400">
                      Black areas will be edited
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  ref={maskInputRef}
                  onChange={handleMaskChange}
                  className="hidden"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Results and Input */}
      <div className="flex flex-col flex-1 bg-white border-l border-gray-200">
        {/* Results Area with Scrolling */}
        <div 
          ref={contentContainerRef}
          className="flex-1 overflow-auto px-4 py-6"
        >
          <div className="max-w-2xl mx-auto space-y-6">
            {results.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <ArrowRight size={48} className="mx-auto mb-4 rotate-90" />
                <p>Edit results will appear here</p>
              </div>
            ) : (
              results.map((result, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-xl shadow-sm border border-gray-200"
                >
                  <div className="p-4">
                    {/* Top info bar */}
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                        {result.editMode === "inpaint" ? "Inpainting" : "Image Edit"}
                      </span>
                      <span className="text-xs text-gray-400">
                        {result.timestamp
                          ? new Date(result.timestamp).toLocaleString()
                          : ""}
                      </span>
                    </div>
                  
                    {/* Result Image */}
                    <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden border border-gray-200 mb-4">
                      {result.loading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 animate-pulse">
                          <ImageIcon size={48} className="text-gray-300 mb-4" />
                          <div className="text-sm text-gray-400">
                            Editing your image...
                          </div>
                        </div>
                      ) : result.error ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50">
                          <XCircle size={48} className="text-red-400 mb-2" />
                          <div className="text-sm text-red-500">
                            Failed to edit image
                          </div>
                        </div>
                      ) : (
                        <div className="relative">
                          <img
                            src={result.url}
                            alt="Edited"
                            className="w-full h-full object-contain"
                          />
                          <div className="absolute top-2 right-2 flex space-x-2">
                            <button 
                              onClick={() => removeResult(index)}
                              className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDownload(result.url)}
                              className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                            >
                              <Download size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Result Info */}
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Prompt:</span> {result.prompt}
                    </p>
                  </div>
                </div>
              ))
            )}
            
            {/* Invisible element for auto-scrolling */}
            <div ref={resultsEndRef} />
          </div>
        </div>

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <button
            onClick={handleScrollToBottom}
            className="fixed bottom-20 right-6 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
            aria-label="Scroll to bottom"
          >
            <ArrowRight size={20} className="rotate-90" />
          </button>
        )}

        {/* Input Area */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
          <div className="max-w-2xl mx-auto">
            <ChatInput
              input={input}
              setInput={setInput}
              sendMessage={handleSubmit}
              isLoading={loading}
              placeholder={editMode === "inpaint" 
                ? "Describe what to add in the masked area..." 
                : "Describe how to edit this image..."
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}