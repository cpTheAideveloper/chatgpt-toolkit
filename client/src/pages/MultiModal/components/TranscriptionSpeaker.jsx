/* eslint-disable react/prop-types */
import { useState, useRef, useEffect } from "react";
import { Volume2, Loader2, AlertCircle, Settings, X, Square } from "lucide-react"; // Added Square for stop button

// Define options within the component or pass as props if needed globally
const voices = [
    { id: "shimmer", name: "Shimmer" }, { id: "alloy", name: "Alloy" },
    { id: "echo", name: "Echo" }, { id: "fable", name: "Fable" },
    { id: "onyx", name: "Onyx" }, { id: "nova", name: "Nova" },
];
const models = [
    { id: "tts-1", name: "TTS-1" },
    { id: "tts-1-hd", name: "TTS-1 HD" },
    // Add gpt-4o-mini-tts if available and desired
    { id: "gpt-4o-mini-tts", name: "GPT-4o Mini TTS" },
];

export const TranscriptionSpeaker = ({ transcriptionText }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // --- Settings State ---
  const [selectedVoice, setSelectedVoice] = useState("alloy"); // Default voice
  const [selectedModel, setSelectedModel] = useState("tts-1"); // Default model
  const [speedValue, setSpeedValue] = useState(1.0);        // Default speed

  const audioRef = useRef(null); // Ref for the invisible audio element
  const settingsPanelRef = useRef(null); // Ref to detect clicks outside settings

  const handlePlayTranscription = async () => {
    // Prevent multiple clicks while loading or if already playing or if no text
    if (isLoading || isPlaying || !transcriptionText?.trim()) return;

    setIsLoading(true);
    setError(null); // Clear previous errors

    // Clean up previous audio source if any
    if (audioRef.current && audioRef.current.src) {
      URL.revokeObjectURL(audioRef.current.src);
      audioRef.current.src = null; // Clear the src explicitly
    }

    try {
      // --- API Call ---
      const res = await fetch("http://localhost:8000/audio/textToAudio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userInput: transcriptionText,
          voice: selectedVoice,
          model: selectedModel,
          speed: parseFloat(speedValue),
        }),
      });

      if (!res.ok) {
        // Try to get error message from response body
        let errorMsg = `Error: ${res.status} ${res.statusText}`;
        try {
           const errorData = await res.json();
           errorMsg = errorData.detail || errorMsg; // Assuming FastAPI-like error detail
        } catch { /* Ignore if response body isn't JSON */ }
        throw new Error(errorMsg);
      }

      // --- Audio Handling ---
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.playbackRate = parseFloat(speedValue); // Set playback rate
        audioRef.current.play().catch(playError => {
           console.error("Audio playback failed:", playError);
           setError("Audio playback failed.");
           URL.revokeObjectURL(url); // Clean up if playback fails immediately
           setIsPlaying(false);
        });
      }

    } catch (err) {
      console.error("Error generating or playing speech:", err);
      setError(err.message || "Failed to get audio.");
      // Ensure states are reset on error
      setIsLoading(false);
      setIsPlaying(false);
    }
    // Note: setIsLoading(false) will be handled by onplaying or onended listeners
  };

  const handleStopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0; // Reset time
    }
    
    // Clean up the object URL to free memory
    if (audioRef.current && audioRef.current.src) {
      URL.revokeObjectURL(audioRef.current.src);
      audioRef.current.src = null; // Clear the src explicitly
    }
    
    setIsPlaying(false);
  };

  const handleAudioEnd = () => {
    setIsLoading(false); // Reset loading state when audio finishes or fails to load
    setIsPlaying(false); // Also reset playing state
    
    // Clean up the object URL to free memory
    if (audioRef.current && audioRef.current.src) {
      URL.revokeObjectURL(audioRef.current.src);
    }
  };

  const handleAudioPlayStart = () => {
    // Ensure loading stops once playback *starts*
    setIsLoading(false);
    setIsPlaying(true); // Set playing state when audio starts
  }

  // --- Settings Panel Logic ---
  const toggleSettings = (e) => {
    e.stopPropagation(); // Prevent event bubbling if needed
    setSettingsOpen(!settingsOpen);
  };

  // Close settings if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsPanelRef.current && !settingsPanelRef.current.contains(event.target)) {
        // Check if the click target is NOT the settings button itself
        const settingsButton = event.target.closest('button[aria-label="Settings"]');
        if (!settingsButton) {
          setSettingsOpen(false);
        }
      }
    };

    if (settingsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [settingsOpen]);

  const canPlay = transcriptionText?.trim().length > 0;

  // Render the main button based on current state
  const renderMainButton = () => {
    if (isPlaying) {
      return (
        <button
          onClick={handleStopPlayback}
          className="p-1 rounded-full transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 text-red-500 hover:text-red-700"
          aria-label="Stop playback"
          title="Stop playback"
        >
          <Square size={16} />
        </button>
      );
    }

    return (
      <button
        onClick={handlePlayTranscription}
        disabled={isLoading || !canPlay}
        className={`p-1 rounded-full transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500
                    ${!canPlay ? 'text-gray-400 cursor-not-allowed' : ''}
                    ${isLoading ? 'text-gray-500 cursor-wait' : 'text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400'}
                 `}
        aria-label={isLoading ? "Loading audio..." : "Play transcription"}
        title={error || (isLoading ? "Loading audio..." : "Play transcription")} // Show error on hover
      >
        {isLoading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : error ? (
           <AlertCircle size={16} className="text-red-500" />
        ) : (
          <Volume2 size={16} />
        )}
      </button>
    );
  };

  return (
    <div className="relative flex items-center space-x-1"> {/* Wrapper for positioning settings */}
      {/* Main Play/Stop/Loading/Error Button */}
      {renderMainButton()}

      {/* Settings Toggle Button */}
      {canPlay && !isLoading && !isPlaying && (
        <button
          onClick={toggleSettings}
          className={`p-1 rounded-full transition-colors text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 ${settingsOpen ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
          aria-label="Settings"
          title="Settings"
          aria-expanded={settingsOpen}
        >
          <Settings size={16} />
        </button>
      )}

      {/* Settings Panel (Absolutely Positioned) */}
      {settingsOpen && (
        <div
          ref={settingsPanelRef}
          className="absolute bottom-full left-0 mb-2 z-10 w-64 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700"
          onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing panel immediately
        >
          <button onClick={() => setSettingsOpen(false)} className="absolute top-1 right-1 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={16}/>
          </button>
          <div className="space-y-3">
            {/* Voice Select */}
            <div>
              <label htmlFor="tts-voice" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Voice</label>
              <select
                id="tts-voice"
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                {voices.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>

            {/* Model Select */}
            <div>
              <label htmlFor="tts-model" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Model</label>
              <select
                id="tts-model"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>

            {/* Speed Slider */}
            <div>
              <label htmlFor="tts-speed" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Speed ({speedValue.toFixed(1)}x)
              </label>
              <input
                type="range"
                id="tts-speed"
                min="0.5" max="2.0" step="0.1"
                value={speedValue}
                onChange={(e) => setSpeedValue(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Invisible audio element */}
      <audio
        ref={audioRef}
        onEnded={handleAudioEnd}
        onError={handleAudioEnd} // Treat error same as ended for cleanup and state reset
        onPlaying={handleAudioPlayStart} // Reset loading when playback actually starts
      />
    </div>
  );
};

/**
 * TranscriptionSpeaker.jsx
 *
 * 🔈 Purpose:
 * - This component plays a transcribed text by sending a request to a TTS (Text-to-Speech) server.
 * - It provides playback control (play/stop), loading/error feedback, and options to configure voice, model, and speed.
 *
 * 🧩 Props:
 * @prop {string} transcriptionText - The text to be sent to the backend for conversion into audio and playback.
 *
 * 🧠 Internal State:
 * - `isLoading`: Indicates if the audio request is in progress.
 * - `isPlaying`: Indicates if the audio is currently playing.
 * - `error`: Displays network or playback errors.
 * - `settingsOpen`: Controls whether the settings panel is visible.
 * - `selectedVoice`: Selected TTS voice (default: "alloy").
 * - `selectedModel`: Selected TTS model (default: "tts-1").
 * - `speedValue`: Playback speed (0.5x to 2.0x, default: 1.0).
 *
 * 🎙️ Functionality:
 * - Clicking the main button sends a request to the `/audio/textToAudio` endpoint.
 * - Audio is played automatically if the request is successful.
 * - Any previous audio URL is cleaned up to free memory.
 * - Errors are handled and displayed visually.
 *
 * ⚙️ Settings:
 * - Dropdown panel allows selecting:
 *   1. Voice from several options (`Shimmer`, `Alloy`, `Echo`, etc.).
 *   2. TTS model (`tts-1`, `tts-1-hd`, `gpt-4o-mini-tts`).
 *   3. Playback speed using a slider.
 *
 * 📦 Dependencies:
 * - Uses `lucide-react` for visual icons.
 * - Requires the backend to be enabled at `http://localhost:8000/audio/textToAudio`.
 *
 * 🖥️ Interface:
 * - Main button with a dynamic icon: play, stop, loading, or error.
 * - Visual settings in a floating `dropdown` that closes when clicking outside.
 *
 * 🧪 Safety:
 * - Manually cleans up any generated blob URL after playback ends.
 * - Handles playback errors and network failures.
 *
 * 📌 File Location:
 * //GPT/gptcore/client/src/components/TranscriptionSpeaker.jsx
 *
 * 🚨 Notes:
 * - Make sure to configure CORS on the backend if served from a different domain.
 * - Useful in chat components or virtual assistants that include TTS functionality.
 */
