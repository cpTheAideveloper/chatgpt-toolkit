// GPT/gptcore/client/src/pages/Image&Vision/VideoGen.jsx
import { useState, useEffect, useRef } from "react";
import { ChatInput } from "@/components/ChatInput";
import { Banner } from "@/components/Banner";
import { VerificationModal } from "@/components/VerificationModal";
import {
  Download,
  Play,
  XCircle,
  Video as VideoIcon,
  ShieldCheck,
  Settings,
  Loader2
} from "lucide-react";

export function VideoGen() {
  const [input, setInput] = useState("");
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  // Video generation settings
  const [model, setModel] = useState("sora-2");
  const [size, setSize] = useState("1280x720");
  const [duration, setDuration] = useState(8);

  // Model name constant
  const MODEL_NAME = "Sora 2";

  // Add refs for scrolling functionality
  const videosEndRef = useRef(null);
  const contentContainerRef = useRef(null);

  // Hide banner when we have videos
  useEffect(() => {
    if (videos.length > 0) {
      setShowBanner(false);
    }
  }, [videos]);

  // Auto-scroll when new videos are added
  useEffect(() => {
    videosEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [videos]);

  // Poll video status until completed or failed
  const pollVideoStatus = async (videoId, videoIndex) => {
    const maxAttempts = 120; // 10 minutes with 5-second intervals
    let attempts = 0;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:8000/videogen/status/${videoId}`);
        const data = await res.json();

        // Update the video status in state
        setVideos((prev) => {
          const newVideos = [...prev];
          newVideos[videoIndex] = {
            ...newVideos[videoIndex],
            status: data.status,
            progress: data.progress || 0
          };
          return newVideos;
        });

        if (data.status === "completed") {
          clearInterval(pollInterval);
          // Download the video
          await downloadVideo(videoId, videoIndex);
        } else if (data.status === "failed") {
          clearInterval(pollInterval);
          setVideos((prev) => {
            const newVideos = [...prev];
            newVideos[videoIndex] = {
              ...newVideos[videoIndex],
              error: "Video generation failed",
              loading: false
            };
            return newVideos;
          });
        }

        attempts++;
        if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          setVideos((prev) => {
            const newVideos = [...prev];
            newVideos[videoIndex] = {
              ...newVideos[videoIndex],
              error: "Video generation timed out",
              loading: false
            };
            return newVideos;
          });
        }
      } catch (error) {
        console.error("Error polling video status:", error);
        clearInterval(pollInterval);
        setVideos((prev) => {
          const newVideos = [...prev];
          newVideos[videoIndex] = {
            ...newVideos[videoIndex],
            error: "Error checking video status",
            loading: false
          };
          return newVideos;
        });
      }
    }, 5000); // Poll every 5 seconds
  };

  const downloadVideo = async (videoId, videoIndex) => {
    try {
      const res = await fetch(`http://localhost:8000/videogen/download/${videoId}`);
      if (!res.ok) {
        throw new Error(`Failed to download video: ${res.status}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      setVideos((prev) => {
        const newVideos = [...prev];
        newVideos[videoIndex] = {
          ...newVideos[videoIndex],
          url: url,
          loading: false,
          status: "completed"
        };
        return newVideos;
      });
    } catch (error) {
      console.error("Error downloading video:", error);
      setVideos((prev) => {
        const newVideos = [...prev];
        newVideos[videoIndex] = {
          ...newVideos[videoIndex],
          error: "Error downloading video",
          loading: false
        };
        return newVideos;
      });
    }
  };

  const handleSubmit = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setInput("");
    setLoading(true);

    // Add the loading video to the end of the array
    const videoIndex = videos.length;
    setVideos((prev) => [...prev, {
      loading: true,
      prompt: trimmed,
      status: "queued",
      progress: 0,
      model: model,
      size: size,
      duration: duration
    }]);

    try {
      const res = await fetch("http://localhost:8000/videogen/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: trimmed,
          model: model,
          size: size,
          seconds: duration
        }),
      });

      if (!res.ok) {
        throw new Error(`Server responded with status: ${res.status}`);
      }

      const data = await res.json();

      // Update the video with the job ID and start polling
      setVideos((prev) => {
        const newVideos = [...prev];
        newVideos[videoIndex] = {
          ...newVideos[videoIndex],
          videoId: data.id,
          status: data.status,
          progress: data.progress || 0,
          timestamp: new Date().toISOString()
        };
        return newVideos;
      });

      // Start polling for status
      pollVideoStatus(data.id, videoIndex);

    } catch (error) {
      console.error("Error generating video:", error);
      setVideos((prev) => {
        const newVideos = [...prev];
        newVideos[videoIndex] = {
          ...newVideos[videoIndex],
          error: error.toString(),
          loading: false
        };
        return newVideos;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (videoUrl, prompt) => {
    try {
      const a = document.createElement("a");
      a.href = videoUrl;
      a.download = `sora-video-${new Date().getTime()}.mp4`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.error("Error downloading video:", e);
    }
  };

  const getStatusText = (video) => {
    if (video.error) return "Failed";
    if (video.loading) {
      switch (video.status) {
        case "queued":
          return "Queued...";
        case "in_progress":
          return `Generating... ${video.progress}%`;
        case "completed":
          return "Processing...";
        default:
          return "Processing...";
      }
    }
    return "Completed";
  };

  return (
    <div className="relative flex flex-col w-full h-screen bg-gray-50">
      {/* Verification Modal */}
      <VerificationModal modelName={MODEL_NAME} />

      {/* Settings Modal */}
      {showSettings && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setShowSettings(false)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-4">Video Generation Settings</h3>

            {/* Model Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="sora-2">Sora 2 (Fast, Good Quality)</option>
                <option value="sora-2-pro">Sora 2 Pro (Slower, Higher Quality)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {model === "sora-2"
                  ? "Ideal for prototyping and social media content"
                  : "Best for production-quality output"}
              </p>
            </div>

            {/* Size Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video Size
              </label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1280x720">1280x720 (16:9 HD)</option>
                <option value="1920x1080">1920x1080 (Full HD)</option>
                <option value="1080x1920">1080x1920 (9:16 Portrait)</option>
              </select>
            </div>

            {/* Duration Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (seconds)
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="8">8 seconds</option>
                <option value="16">16 seconds</option>
              </select>
            </div>

            <button
              onClick={() => setShowSettings(false)}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Main Content with scrolling */}
      <div
        ref={contentContainerRef}
        className="flex-1 overflow-auto px-6 py-6"
      >
        {showBanner ? (
          <div className="max-w-4xl mx-auto mb-6">
            <Banner
              title="Sora Video Generation"
              description={`Experience cutting-edge AI video generation powered by OpenAI's ${MODEL_NAME}. Create stunning, dynamic videos with natural language prompts!`}
              icon={<ShieldCheck className="text-blue-600" size={24} />}
            />
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Prompting Tips:</h4>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Describe the shot type (wide shot, close-up, etc.)</li>
                <li>Include subject, action, and setting details</li>
                <li>Specify lighting and camera movement</li>
                <li>Example: "Wide shot of a child flying a red kite in a grassy park, golden hour sunlight, camera slowly pans upward"</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {videos.map((video, index) => (
              <div
                key={index}
                className="relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md"
              >
                {/* Video Container */}
                <div className="aspect-video relative bg-gray-900">
                  {video.loading || !video.url ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
                      <Loader2 size={48} className="text-blue-400 mb-4 animate-spin" />
                      <div className="text-sm text-gray-300">
                        {getStatusText(video)}
                      </div>
                      {video.progress > 0 && (
                        <div className="w-48 h-2 bg-gray-700 rounded-full mt-3 overflow-hidden">
                          <div
                            className="h-full bg-blue-500 transition-all duration-500"
                            style={{ width: `${video.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  ) : video.error ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50">
                      <XCircle size={48} className="text-red-400 mb-2" />
                      <div className="text-sm text-red-500 text-center px-4">
                        {video.error}
                      </div>
                    </div>
                  ) : (
                    <video
                      src={video.url}
                      controls
                      className="w-full h-full object-cover"
                      onClick={() => setActiveVideo(video)}
                    >
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>

                {/* Video Info */}
                <div className="p-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {video.prompt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>
                      {video.model || model} • {video.size || size} • {video.duration || duration}s
                    </span>
                    <div className="flex items-center gap-2">
                      {!video.loading && !video.error && video.url && (
                        <button
                          onClick={() => handleDownload(video.url, video.prompt)}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Download video"
                        >
                          <Download size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {/* Invisible element for auto-scrolling */}
            <div ref={videosEndRef} />
          </div>
        )}
      </div>

      {/* Video Modal */}
      {activeVideo && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              src={activeVideo.url}
              controls
              autoPlay
              className="w-full h-full object-contain"
            >
              Your browser does not support the video tag.
            </video>
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <XCircle size={24} />
            </button>
            <div className="absolute bottom-4 left-4 right-4 bg-black/50 text-white p-3 rounded-lg max-w-full break-words">
              <p className="text-sm">{activeVideo.prompt}</p>
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="sticky bottom-0 bg-gradient-to-t from-gray-50 pt-4 pb-4">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              title="Video settings"
            >
              <Settings size={20} />
            </button>
            <span className="text-xs text-gray-500">
              {model === "sora-2" ? "Fast" : "Pro"} • {size} • {duration}s
            </span>
          </div>
          <ChatInput
            input={input}
            setInput={setInput}
            sendMessage={handleSubmit}
            isLoading={loading}
            placeholder={`Describe the video you want to generate with ${MODEL_NAME}...`}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * VideoGen.jsx
 *
 * This component provides an AI-powered video generation interface using OpenAI's Sora models.
 * Users can input prompts to generate videos via backend API and interact
 * with the results through a responsive gallery.
 *
 * Key Features:
 * - Prompt-based AI video generation using Sora 2 and Sora 2 Pro models
 * - Configurable video settings (model, size, duration)
 * - Real-time video status updates with progress tracking
 * - Automatic polling for video generation completion
 * - Video preview and download capabilities
 * - Scroll-to-view experience with ref auto-scrolling
 * - Video player modal with zoom and description overlay
 * - Responsive grid layout with graceful error handling
 * - Banner introduction and sticky input area for better UX
 * - Settings modal for configuring generation parameters
 *
 * Internal State:
 * - `input`: user prompt text
 * - `videos`: history of generated videos with metadata
 * - `loading`: boolean for active generation status
 * - `activeVideo`: video object displayed in the modal
 * - `showBanner`: toggle for welcome banner display
 * - `showSettings`: toggle for settings modal
 * - `model`: selected Sora model (sora-2 or sora-2-pro)
 * - `size`: video resolution
 * - `duration`: video length in seconds
 *
 * Models:
 * - Sora 2: Fast generation, good quality (ideal for prototyping)
 * - Sora 2 Pro: Higher quality, slower generation (ideal for production)
 *
 * Video Sizes:
 * - 1280x720 (16:9 landscape)
 * - 1920x1080 (Full HD)
 * - 1080x1920 (9:16 portrait)
 *
 * Dependencies:
 * - `ChatInput` for the input field
 * - `Banner` for welcome content
 * - `VerificationModal` for handling identity verification
 * - `lucide-react` for icons
 * - Backend video generation API (`/videogen/*`)
 * - TailwindCSS for layout, responsiveness, and styling
 *
 * API Endpoints:
 * - POST to `/videogen/generate` to start video generation
 * - GET to `/videogen/status/:videoId` to check generation status
 * - GET to `/videogen/download/:videoId` to download completed video
 *
 * Path: //GPT/gptcore/client/src/pages/Image&Vision/VideoGen.jsx
 */
