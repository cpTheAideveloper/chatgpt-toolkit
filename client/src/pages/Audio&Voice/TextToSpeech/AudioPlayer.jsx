//GPT/gptcore/client/src/pages/Audio&Voice/TextToSpeech/AudioPlayer.jsx
import { useRef, useState } from "react";
import { Play, Pause, RotateCcw, Download } from "lucide-react";

// eslint-disable-next-line react/prop-types
export function AudioPlayer({ audioUrl }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!audioUrl) return null;

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const resetAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = "generated-speech.mp3";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="border-t border-gray-200 p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={togglePlay}
            className="p-3 rounded-full bg-green-50 text-green-500 hover:bg-green-100 transition-colors"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          <button
            onClick={resetAudio}
            className="p-3 rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <RotateCcw size={24} />
          </button>
        </div>

        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 rounded-lg
            bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <Download size={20} />
          Download
        </button>
      </div>

      <audio
        ref={audioRef}
        src={audioUrl}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
    </div>
  );
}


/**
 * AudioPlayer.jsx
 *
 * This component renders a minimalistic audio player interface with controls to play, pause,
 * reset, and download a given audio URL. It uses a hidden HTML `<audio>` element to manage playback.
 *
 * 🎧 Features:
 * - Play and pause toggle
 * - Reset audio to the beginning
 * - Download the generated audio file
 * - Responsive and styled with Tailwind CSS
 *
 * 🔧 Props:
 * @param {string} audioUrl - The source URL for the audio playback. If not provided, the player will not render.
 *
 * 📦 Internal State:
 * - `isPlaying` (boolean): Tracks the play/pause state of the audio.
 *
 * 🧩 Usage Location:
 * - Used in the `TextToSpeech` page to play generated text-to-speech audio.
 *
 * 📁 Path:
 * //GPT/gptcore/client/src/pages/Audio&Voice/TextToSpeech/AudioPlayer.jsx
 */
