// GPT/gptcore/client/src/pages/Image&Vision/GPTImageGen.jsx
import { useState, useEffect, useRef } from "react";
import { ChatInput } from "@/components/ChatInput";
import { Banner } from "@/components/Banner";
import { VerificationModal } from "@/components/VerificationModal";
import {
  Download,
  ExternalLink,
  XCircle,
  Image as ImageIcon,
  ShieldCheck
} from "lucide-react";

export function GPTImageGen() {
  const [input, setInput] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [activeImage, setActiveImage] = useState(null);
  
  // Model name constant - can be passed as a prop if needed
  const MODEL_NAME = "gpt-image-1";

  // Add refs for scrolling functionality
  const imagesEndRef = useRef(null);
  const contentContainerRef = useRef(null);

  // Hide banner when we have images
  useEffect(() => {
    if (images.length > 0) {
      setShowBanner(false);
    }
  }, [images]);

  // Auto-scroll when new images are added
  useEffect(() => {
    imagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [images]);

  const handleSubmit = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setInput("");
    setLoading(true);
    // Add the loading image to the end of the array
    setImages((prev) => [...prev, { loading: true, prompt: trimmed }]);

    try {
      const res = await fetch("http://localhost:8000/image/gptimage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput: trimmed }),
      });
      
      if (!res.ok) {
        throw new Error(`Server responded with status: ${res.status}`);
      }
      
      const data = await res.json();

      // Update the last image in the array
      setImages((prev) => {
        const newImages = [...prev];
        newImages[newImages.length - 1] = {
          url: `data:image/png;base64,${data.b64_json}`,
          loading: false,
          prompt: trimmed,
          timestamp: new Date().toISOString(),
        };
        return newImages;
      });
    } catch (error) {
      console.error("Error generating image:", error);
      // Update the last image in the array with the error
      setImages((prev) => {
        const newImages = [...prev];
        newImages[newImages.length - 1] = {
          error: error.toString(),
          loading: false,
          prompt: trimmed,
        };
        return newImages;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (imageData) => {
    try {
      // For base64 images
      if (imageData.startsWith('data:')) {
        const a = document.createElement("a");
        a.href = imageData;
        a.download = `gpt-image-${new Date().getTime()}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        // For URL-based images (fallback)
        const response = await fetch(imageData);
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `gpt-image-${new Date().getTime()}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
      }
    } catch (e) {
      console.error("Error downloading image:", e);
    }
  };

  return (
    <div className="relative flex flex-col w-full h-screen bg-gray-50">
      {/* Purely informational verification modal */}
      <VerificationModal modelName={MODEL_NAME} />

      {/* Main Content with scrolling */}
      <div
        ref={contentContainerRef}
        className="flex-1 overflow-auto px-6 py-6"
      >
        {showBanner ? (
          <div className="max-w-4xl mx-auto mb-6">
            <Banner
              title="GPT Image Generation"
              description={`Experience our most advanced AI image generation powered by ${MODEL_NAME}. Create stunning, detailed images with unprecedented quality and accuracy!`}
              icon={<ShieldCheck className="text-blue-600" size={24} />}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {/* Images are displayed in their natural order (oldest to newest) */}
            {images.map((img, index) => (
              <div
                key={index}
                className="relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md"
              >
                {/* Image Container */}
                <div className="aspect-square relative bg-gray-50">
                  {img.loading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 animate-pulse">
                      <ImageIcon size={48} className="text-gray-300 mb-4" />
                      <div className="text-sm text-gray-400">
                        Generating your image...
                      </div>
                    </div>
                  ) : img.error ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50">
                      <XCircle size={48} className="text-red-400 mb-2" />
                      <div className="text-sm text-red-500">
                        Failed to generate image
                      </div>
                    </div>
                  ) : (
                    <img
                      src={img.url}
                      alt="Generated"
                      className="w-full h-full object-cover cursor-zoom-in"
                      onClick={() => setActiveImage(img)}
                    />
                  )}
                </div>

                {/* Image Info */}
                <div className="p-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {img.prompt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {img.timestamp
                        ? new Date(img.timestamp).toLocaleString()
                        : ""}
                    </span>
                    <div className="flex items-center gap-2">
                      {!img.loading && !img.error && (
                        <>
                          <button
                            onClick={() => window.open(img.url, "_blank")}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            title="Open in new tab"
                          >
                            <ExternalLink size={16} />
                          </button>
                          <button
                            onClick={() => handleDownload(img.url)}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            title="Download image"
                          >
                            <Download size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {/* Invisible element for auto-scrolling */}
            <div ref={imagesEndRef} />
          </div>
        )}
      </div>

      {/* Image Modal */}
      {activeImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setActiveImage(null)}
        >
          <div 
            className="relative max-w-5xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeImage.url}
              alt={activeImage.prompt}
              className="w-full h-full object-contain"
            />
            <button
              onClick={() => setActiveImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <XCircle size={24} />
            </button>
            <div className="absolute bottom-4 left-4 right-4 bg-black/50 text-white p-3 rounded-lg max-w-full break-words">
              <p className="text-sm">{activeImage.prompt}</p>
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="sticky bottom-0 bg-gradient-to-t from-gray-50 pt-4 pb-4">
        <div className="max-w-4xl mx-auto px-4">
          <ChatInput
            input={input}
            setInput={setInput}
            sendMessage={handleSubmit}
            isLoading={loading}
            placeholder={`Describe the image you want to generate with ${MODEL_NAME}...`}
          />
        </div>
      </div>
    </div>
  );
}


/**
 * GPTImageGen.jsx
 * 
 * This component provides an AI-powered image generation interface using the new gpt-image-1 model.
 * Users can input prompts to generate images via backend API and interact
 * with the results through a responsive gallery. Includes ID verification requirement.
 * 
 * Key Features:
 * - Prompt-based AI image generation using OpenAI's gpt-image-1 model
 * - ID verification modal and status tracking (using VerificationModal component)
 * - Real-time image status updates (loading, error handling)
 * - Scroll-to-view experience with ref auto-scrolling
 * - Image preview modal with zoom and description overlay
 * - Image download and external view actions
 * - Responsive grid layout with graceful fallback on errors
 * - Dark overlay modal with controlled propagation
 * - Banner introduction and sticky input area for better UX
 * 
 * Internal State:
 * - `input`: user prompt text
 * - `images`: history of generated images with metadata
 * - `loading`: boolean for active generation status
 * - `activeImage`: image object displayed in the modal
 * - `showBanner`: toggle for welcome banner display
 * - `showVerificationModal`: controls display of the verification modal
 * - `isVerified`: tracks if the user has completed verification
 * 
 * Dependencies:
 * - `ChatInput` for the input field
 * - `Banner` for welcome content
 * - `VerificationModal` for handling identity verification
 * - `lucide-react` for icons (XCircle, ExternalLink, Download, ImageIcon, AlertCircle, ShieldCheck)
 * - Backend image generation API (`/gptimage`)
 * - TailwindCSS for layout, responsiveness, and styling
 * 
 * API Contract:
 * - POST to `/gptimage` with `{ userInput }`
 * - Expects response with b64_json for the image data
 * 
 * Path: //GPT/gptcore/client/src/pages/Image&Vision/GPTImageGen.jsx
 */