//GPT/gptcore/client/src/pages/Audio&Voice/Audio.jsx
import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { FileVolume, Upload, X, Volume2, Clock, CheckCircle } from "lucide-react";
import { Banner } from "@/components/Banner";

export function Audio() {
  const [audioFile, setAudioFile] = useState(null);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const clearFile = () => {
    setAudioFile(null);
    setResponse(null);
    setProgress(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!audioFile) return;
    
    setLoading(true);
    setResponse(null);
    setShowBanner(false);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("audio", audioFile);

      const res = await fetch("http://localhost:8000/audio/transcribe", {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      setResponse(data);
      setProgress(100);
    } catch (error) {
      setResponse({ error: error.toString() });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
      

          {showBanner && (
            <Banner
              title="Audio Transcription"
              description="Upload your audio file to convert speech into text quickly and accurately using AI. Supports MP3, WAV, and M4A formats."
            />
          )}
    

        {/* Main Content */}
        <div className="bg-white  rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6">
            {/* Audio Dropzone */}
            <div
              className={`
                relative rounded-xl border-2 border-dashed transition-all duration-200
                ${isDragging 
                  ? 'border-green-400 bg-green-50' 
                  : 'border-gray-300 hover:border-gray-400'
                }
              `}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => audioRef.current?.click()}
            >
              <input
                ref={audioRef}
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="p-8">
                {audioFile ? (
                  <div className="relative flex items-center justify-between bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Volume2 size={20} className="text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">{audioFile.name}</p>
                        <p className="text-sm text-gray-500">
                          {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearFile();
                      }}
                      className="p-1.5 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload size={48} className="mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 mb-2">
                      Drop your audio file here, or click to browse
                    </p>
                    <p className="text-sm text-gray-400">
                      Supports MP3, WAV, M4A (max 25MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-6">
              <button
                type="submit"
                disabled={!audioFile || loading}
                className={`
                  w-full py-3 px-4 rounded-lg font-medium transition-all duration-200
                  flex items-center justify-center gap-2
                  ${!audioFile || loading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-green-500 text-white hover:bg-green-600'
                  }
                `}
              >
                {loading ? (
                  <>
                    <Clock size={20} className="animate-spin" />
                    Transcribing...
                  </>
                ) : (
                  <>
                    <FileVolume size={20} />
                    Transcribe Audio
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Progress Bar */}
          {loading && (
            <div className="px-6 pb-6">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Results */}
          {response && (
            <div className="border-t border-gray-200">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle size={20} className="text-green-500" />
                  <h2 className="text-lg font-medium text-gray-900">Transcription Result</h2>
                </div>
                {response.error ? (
                  <div className="p-4 bg-red-50 text-red-500 rounded-lg">
                    {response.error}
                  </div>
                ) : (
                  <div className="prose prose-gray max-w-none">
                    <ReactMarkdown>{response.transcription}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Audio;

/**
 * Audio.jsx
 *
 * This component provides a UI for uploading audio files and converting them into text using AI transcription.
 * It includes a drag-and-drop file uploader, live progress indicator, and displays the transcription result using ReactMarkdown.
 *
 * 🔊 Features:
 * - Audio upload via drag & drop or file picker
 * - File preview with name and size
 * - Transcription using backend API at `/audio/transcribe`
 * - Markdown rendering of results
 * - Loading spinner and progress bar during processing
 * - Banner description shown initially
 *
 * 🧠 AI Integration:
 * - Submits audio files (MP3, WAV, M4A) to the server
 * - Receives text transcription and displays it in readable Markdown format
 *
 * 💡 UX Improvements:
 * - Drag state highlights dropzone
 * - Clear file and reset transcription
 * - Progress bar reflects backend processing
 * - Button states dynamically adjust based on loading and file selection
 *
 * 📦 Dependencies:
 * - `react-markdown` for rendering transcription
 * - `lucide-react` icons: FileVolume, Upload, X, Volume2, Clock, CheckCircle
 * - `Banner` component for onboarding/help message
 *
 * 📁 File Path:
 * //GPT/gptcore/client/src/pages/Audio&Voice/Audio.jsx
 */
