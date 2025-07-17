/* eslint-disable react/prop-types */

import { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  File as FileIconDefault,
  FileText,
  FileAudio,
  FileArchive,
  Download,
  Maximize2,
  Minimize2
} from "lucide-react";
import MarkdownViewerChat from "./MarkDownViewerChat";

function CanvasView({ file, isOpen }) {
  console.log("the uploaded file", file);
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileUrl, setFileUrl] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Generate a blob URL and load text/code content if applicable
  useEffect(() => {
    if (!file) return;

    const url = URL.createObjectURL(file);
    setFileUrl(url);

    const isTextFile = file.type.startsWith("text/");
    const isCodeFile = file.name.match(/\.(js|ts|jsx|tsx|py|java|cpp|cs|html|css|json|md)$/);

    if (isTextFile || isCodeFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        if (isCodeFile) {
          const language = file.name.split(".").pop() || "text";
          setFileContent(`\`\`\`${language}\n${content}\n\`\`\``);
        } else {
          setFileContent(content);
        }
      };
      reader.readAsText(file);
    }

    return () => URL.revokeObjectURL(url);
  }, [file]);

  const toggleFullscreen = () => {
    const element = document.documentElement;
    if (!isFullscreen) {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const MediaControls = ({ mediaRef, type }) => (
    <div
      className={`absolute bottom-0 left-0 right-0 p-4 ${
        type === "video"
          ? "bg-gradient-to-t from-black/80 to-transparent"
          : "bg-zinc-800/90"
      }`}
    >
      {/* Progress Slider */}
      <input
        type="range"
        value={progress}
        onChange={(e) => {
          if (!mediaRef.current) return;
          const val = parseFloat(e.target.value);
          const time = (val / 100) * mediaRef.current.duration;
          mediaRef.current.currentTime = time;
          setProgress(val);
        }}
        className="w-full h-1 mb-4 bg-zinc-600 rounded-full appearance-none cursor-pointer"
        style={{
          backgroundImage: `linear-gradient(to right, violet ${progress}%, rgb(82 82 91) ${progress}%)`
        }}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (!mediaRef.current) return;
              if (isPlaying) {
                mediaRef.current.pause();
              } else {
                mediaRef.current.play();
              }
            }}
            className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>

          <button
            onClick={() => {
              if (!mediaRef.current) return;
              mediaRef.current.muted = !isMuted;
              setIsMuted(!isMuted);
            }}
            className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>

        {type === "video" && (
          <button
            onClick={toggleFullscreen}
            className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        )}
      </div>
    </div>
  );

  if (!file) return null;

  const getFileComponent = () => {
    const fileType = file.type;

    if (fileType.startsWith("video/")) {
      return (
        <div className="relative h-full w-full flex flex-col">
          <div className="relative flex-1 flex items-center justify-center p-4">
            <video
              ref={videoRef}
              src={fileUrl}
              className="w-full h-[900px] object-fit rounded-lg"
              onTimeUpdate={() => {
                if (videoRef.current) {
                  const pct =
                    (videoRef.current.currentTime / videoRef.current.duration) * 100;
                  setProgress(pct);
                }
              }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          </div>
          <MediaControls mediaRef={videoRef} type="video" />
        </div>
      );
    }

    if (fileType.startsWith("audio/")) {
      return (
        <div className="relative h-full w-full flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <FileAudio className="w-24 h-24 text-violet-400 mb-4" />
            <h3 className="text-lg font-medium text-zinc-200 mb-2">{file.name}</h3>
            <audio
              ref={audioRef}
              src={fileUrl}
              className="hidden"
              onTimeUpdate={() => {
                if (audioRef.current) {
                  const pct =
                    (audioRef.current.currentTime / audioRef.current.duration) * 100;
                  setProgress(pct);
                }
              }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          </div>
          <MediaControls mediaRef={audioRef} type="audio" />
        </div>
      );
    }

    if (fileType.startsWith("image/")) {
      return (
        <div className="h-full w-full flex items-center justify-center p-4">
          <div className="relative group">
            <img
              src={fileUrl}
              alt={file.name}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button
              onClick={toggleFullscreen}
              className="absolute top-2 right-2 p-2 text-white bg-black/50 hover:bg-black/70 rounded-full
                         transition-opacity opacity-0 group-hover:opacity-100"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
      );
    }

    if (fileType === "application/pdf") {
      return (
        <div className="h-full w-full">
          <iframe src={`${fileUrl}#view=FitH`} className="w-full h-full rounded-lg" />
        </div>
      );
    }

    const isCodeFile = file.name.match(
      /\.(js|ts|jsx|tsx|py|java|cpp|cs|html|css|json|md)$/
    );
    if (fileType.startsWith("text/") || isCodeFile) {
      return (
        <div className="h-full w-full overflow-auto bg-gray-100">
          <div className="p-4">
            <MarkdownViewerChat markdownContent={fileContent} />
          </div>
        </div>
      );
    }

    let CustomFileIcon = FileIconDefault;
    if (fileType.includes("zip") || fileType.includes("rar")) {
      CustomFileIcon = FileArchive;
    } else if (fileType.includes("pdf")) {
      CustomFileIcon = FileText;
    }

    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center">
        <CustomFileIcon className="w-24 h-24 text-zinc-400 mb-4" />
        <h3 className="text-lg font-medium text-zinc-200 mb-2 line-clamp-2">{file.name}</h3>
        <p className="text-sm text-zinc-400 mb-4">
          {(file.size / (1024 * 1024)).toFixed(2)} MB
        </p>
        <a
          href={fileUrl}
          download={file.name}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white
                     rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          Download
        </a>
      </div>
    );
  };

  return (
    <div
      className={`relative h-full w-full bg-zinc-900 transition-all duration-300 ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
    >
      {getFileComponent()}
    </div>
  );
}

export default CanvasView;

/**
 * CanvasView.jsx
 *
 * This component is a dynamic file viewer that renders content based on the file type.
 * It handles various formats including video, audio, image, PDF, text/code, and other documents.
 * The component includes custom UI and media controls, supporting fullscreen and download features.
 *
 * Key Features:
 * - File type detection and conditional rendering
 * - Media controls for video and audio with play/pause, mute, progress, and fullscreen toggle
 * - Markdown rendering for text/code files via `MarkdownViewerChat`
 * - Preview support for images and PDFs
 * - File download functionality for unrenderable types
 * - Animated transitions, dark-mode styling, and accessibility enhancements
 *
 * Props:
 * - `file` (File): The uploaded file object to display
 * - `isOpen` (boolean): Controls visibility and opacity transitions
 *
 * Dependencies:
 * - lucide-react (icons)
 * - MarkdownViewerChat (custom markdown parser)
 * - TailwindCSS (for styling and animations)
 *
 * Path: //src/components/CanvasView.jsx
 */
