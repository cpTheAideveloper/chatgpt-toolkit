import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2 } from "lucide-react";
import Visualizer from "./Visualizer"; // Assuming you have this component

const AudioPlayer = ({ audioSrc }) => {
  const audioRef = useRef(null);
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  // Initialize audio context
  useEffect(() => {
    if (!audioContext) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        setAudioContext(new AudioContext());
      }
    }
    
    return () => {
      if (audioContext) {
        audioContext.close().catch(err => console.error("Error closing audio context:", err));
      }
    };
  }, [audioContext]);

  // Set up audio element and connect to analyzer
  useEffect(() => {
    if (audioRef.current && audioContext && audioSrc) {
      try {
        // Connect audio element to analyser
        const source = audioContext.createMediaElementSource(audioRef.current);
        const analyserNode = audioContext.createAnalyser();
        analyserNode.fftSize = 256; // Smaller value for simpler visualization
        
        source.connect(analyserNode);
        analyserNode.connect(audioContext.destination);
        setAnalyser(analyserNode);
        
        // Set up audio element event listeners
        audioRef.current.onloadedmetadata = () => {
          setDuration(audioRef.current.duration);
          setIsReady(true);
        };
        
        audioRef.current.onplay = () => setIsPlaying(true);
        audioRef.current.onpause = () => setIsPlaying(false);
        audioRef.current.onended = () => {
          setIsPlaying(false);
          setCurrentTime(0);
        };
        
        audioRef.current.ontimeupdate = () => {
          setCurrentTime(audioRef.current.currentTime);
        };
        
        audioRef.current.onerror = (e) => {
          console.error("Audio error:", e);
          setError("Failed to load audio");
        };
        
        return () => {
          // Clean up
          if (audioRef.current) {
            audioRef.current.onplay = null;
            audioRef.current.onpause = null;
            audioRef.current.onended = null;
            audioRef.current.ontimeupdate = null;
            audioRef.current.onloadedmetadata = null;
            audioRef.current.onerror = null;
          }
          source.disconnect();
          analyserNode.disconnect();
        };
      } catch (err) {
        console.error("Error setting up audio:", err);
        setError("Failed to initialize audio player");
      }
    }
  }, [audioContext, audioSrc]);

  // Handle audio source
  useEffect(() => {
    if (!audioRef.current || !audioSrc) return;
    
    let url;
    setIsReady(false);
    
    try {
      // Handle different types of audio sources
      if (typeof audioSrc === "string") {
        // URL string
        url = audioSrc;
      } else if (audioSrc instanceof Blob) {
        // Blob object
        url = URL.createObjectURL(audioSrc);
      } else if (audioSrc.data && (audioSrc.data instanceof Uint8Array || Array.isArray(audioSrc.data))) {
        // Buffer data
        const buffer = audioSrc.data instanceof Uint8Array 
          ? audioSrc.data 
          : new Uint8Array(audioSrc.data);
        const blob = new Blob([buffer], { type: "audio/mpeg" });
        url = URL.createObjectURL(blob);
      }
      
      if (url) {
        audioRef.current.src = url;
        audioRef.current.load();
      } else {
        throw new Error("Invalid audio source format");
      }
      
      return () => {
        if (url && (audioSrc instanceof Blob || audioSrc.data)) {
          URL.revokeObjectURL(url);
        }
      };
    } catch (err) {
      console.error("Error loading audio source:", err);
      setError("Failed to load audio source");
    }
  }, [audioSrc]);

  // Toggle play/pause
  const togglePlayPause = async () => {
    if (!audioRef.current) return;
    
    try {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        // Resume/start audio context if needed (important for iOS)
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }
        await audioRef.current.play();
      }
    } catch (err) {
      console.error("Playback error:", err);
      setError("Playback failed. Try again.");
    }
  };

  // Format time for display (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Handle seeking
  const handleSeek = (e) => {
    const seekPosition = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = seekPosition;
      setCurrentTime(seekPosition);
    }
  };

  if (error) {
    return (
      <div className="text-red-500 text-sm py-2">
        {error}
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3">
      {/* Visualizer */}
      <div className="h-10 mb-2">
        {analyser ? (
          <Visualizer analyser={analyser} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Volume2 size={18} className="text-gray-400" />
          </div>
        )}
      </div>
      
      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlayPause}
          disabled={!isReady}
          className={`w-8 h-8 rounded-full flex items-center justify-center 
            ${isReady 
              ? 'bg-cyan-500 text-white hover:bg-cyan-600' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'} transition-colors`}
        >
          {isPlaying ? (
            <Pause size={16} />
          ) : (
            <Play size={16} className="ml-0.5" />
          )}
        </button>
        
        {/* Progress Bar */}
        <div className="flex-1 flex items-center">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            disabled={!isReady}
            className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        
        {/* Time Display */}
        <div className="text-xs text-gray-500 dark:text-gray-400 w-16 text-right">
          {isReady ? `${formatTime(currentTime)} / ${formatTime(duration)}` : "--:--"}
        </div>
      </div>
      
      {/* Hidden audio element */}
      <audio ref={audioRef} preload="metadata" className="hidden" />
    </div>
  );
};

export default AudioPlayer;


/**
 * AudioPlayer.jsx
 *
 * 🎧 Purpose:
 * - Provides a custom audio player with play/pause controls, a waveform visualizer,
 *   time indicators, and a seekable progress bar.
 * - Designed for both static and streaming audio playback, including support for Blob or buffer inputs.
 *
 * 🧩 Props:
 * @prop {string | Blob | { data: Uint8Array | number[] }} audioSrc - The source of the audio. Can be a URL, a Blob, or a buffer object.
 *
 * 🔊 Features:
 * - Responsive audio controls with play, pause, and seek capabilities.
 * - Real-time audio visualization via a connected `Visualizer` component using the Web Audio API.
 * - Custom styling for light/dark themes using Tailwind CSS.
 * - Displays total duration and current playback time.
 * - Automatically initializes `AudioContext`, handles iOS resume suspension, and cleans up on unmount.
 *
 * ⚙️ Core Logic:
 * - Uses `useRef` to control a hidden `<audio>` element.
 * - Uses `AnalyserNode` from Web Audio API to stream frequency data to the `Visualizer`.
 * - Tracks play state, time updates, and handles both direct URLs and Blob sources.
 * - Manages full cleanup of `AudioContext`, media connections, and object URLs.
 *
 * 🔁 Lifecycle:
 * - `useEffect` to:
 *   - Initialize and clean up the `AudioContext`.
 *   - Load audio source based on type.
 *   - Connect audio to `AnalyserNode` for visualization.
 *   - Manage event listeners (`onplay`, `onpause`, `ontimeupdate`, etc.)
 *
 * 💥 Error Handling:
 * - Displays messages on audio load or playback errors.
 * - Gracefully degrades if the Web Audio API is not supported.
 *
 * 📦 Location:
 * //GPT/gptcore/client/src/pages/Audio&Voice/ChatWithVoice/components/AudioPlayer.jsx
 *
 * 📌 Notes:
 * - Works well with any external `Visualizer` component that accepts an `AnalyserNode` prop.
 * - You can easily theme this component or replace the icon buttons for accessibility or platform-specific styles.
 */
