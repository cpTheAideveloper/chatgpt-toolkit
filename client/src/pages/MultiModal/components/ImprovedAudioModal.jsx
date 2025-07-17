import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useChatContext } from "../context/ChatContext";
import AudioRecorder from "./AudioRecorder";
import Visualizer from "./Visualizer";

// Enhanced AudioPlayer that auto-plays when audio source changes
const AutoPlayAudioPlayer = ({ audioSrc }) => {
  const audioRef = useRef(null);
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Track audio source changes for auto-play
  const audioSrcRef = useRef(null);

  useEffect(() => {
    if (!audioContext) {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      setAudioContext(audioCtx);
    }

    return () => {
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [audioContext]);

  useEffect(() => {
    if (audioRef.current && audioContext && audioSrc) {
      // Check if this is a new audio source
      const isNewSource = audioSrcRef.current !== audioSrc;
      audioSrcRef.current = audioSrc;
      
      const source = audioContext.createMediaElementSource(audioRef.current);
      const analyserNode = audioContext.createAnalyser();
      analyserNode.fftSize = 2048;

      source.connect(analyserNode);
      analyserNode.connect(audioContext.destination);
      setAnalyser(analyserNode);

      audioRef.current.onplay = () => setIsPlaying(true);
      audioRef.current.onpause = () => setIsPlaying(false);
      audioRef.current.onended = () => setIsPlaying(false);

      // Auto-play the audio with a slight delay only for new sources
      if (isNewSource) {
        // Resume audio context (important for Safari and mobile browsers)
        if (audioContext.state === 'suspended') {
          audioContext.resume().catch(err => 
            console.error("Failed to resume audio context:", err)
          );
        }
        
        setTimeout(async () => {
          try {
            console.log("Auto-playing new audio source");
            await audioRef.current.play();
          } catch (error) {
            console.error("Audio playback failed:", error);
            
            // For iOS and other browsers that require user interaction
            if (error.name === 'NotAllowedError') {
              console.warn("Auto-play prevented by browser. User interaction required.");
            }
          }
        }, 500); // Slightly longer delay to ensure audio is loaded
      }

      return () => {
        source.disconnect();
        analyserNode.disconnect();
        if (audioRef.current) {
          audioRef.current.onplay = null;
          audioRef.current.onpause = null;
          audioRef.current.onended = null;
        }
      };
    }
  }, [audioContext, audioSrc]);

  useEffect(() => {
    if (audioRef.current && audioSrc) {
      let url;
      
      // Handle different types of audio sources
      if (typeof audioSrc === "string") {
        url = audioSrc;
      } else if (audioSrc instanceof Blob) {
        url = URL.createObjectURL(audioSrc);
      } else if (audioSrc.data && Array.isArray(audioSrc.data)) {
        // Handle buffer data from API
        const buffer = new Uint8Array(audioSrc.data);
        const blob = new Blob([buffer], { type: "audio/mpeg" });
        url = URL.createObjectURL(blob);
      }
      
      if (url) {
        audioRef.current.src = url;
        audioRef.current.load();
        
        return () => {
          if (audioSrc instanceof Blob || (audioSrc.data && Array.isArray(audioSrc.data))) {
            URL.revokeObjectURL(url);
          }
        };
      }
    }
  }, [audioSrc]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        // Resume audio context if suspended (for iOS/Safari)
        if (audioContext && audioContext.state === 'suspended') {
          audioContext.resume();
        }
        audioRef.current.play().catch(err => console.error("Play failed:", err));
      }
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      {analyser && <Visualizer analyser={analyser} />}
      <div className="w-full flex items-center justify-center mt-4">
        <button 
          onClick={togglePlayPause}
          className={`w-12 h-12 rounded-full flex items-center justify-center ${isPlaying ? 'bg-cyan-600' : 'bg-cyan-500'} text-white shadow-md hover:brightness-105 transition-all`}
        >
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </button>
      </div>
      <audio ref={audioRef} preload="auto" className="hidden" />
    </div>
  );
};

const ImprovedAudioModal = ({ isOpen, setIsOpen }) => {
  const { 
    activeMode,
    toggleAudioMode,
    sendAudio,
    isAudioLoading,
    audioMode,
    messages,
    assistant
  } = useChatContext();
  
  const [lastAssistantAudio, setLastAssistantAudio] = useState(null);
  const previousAssistantRef = useRef(null);

  // Monitor for new responses from the assistant
  useEffect(() => {
    if (assistant && assistant !== previousAssistantRef.current) {
      previousAssistantRef.current = assistant;
      
      // Check if assistant response contains audio content
      if (assistant.content && Array.isArray(assistant.content)) {
        const audioContent = assistant.content.find(item => item.type === "audio");
        if (audioContent && audioContent.text) {
          setLastAssistantAudio(audioContent.text);
        }
      }
    }
  }, [assistant]);

  // Find the last assistant message with audio content from message history
  useEffect(() => {
    if (messages && messages.length > 0) {
      for (let i = messages.length - 1; i >= 0; i--) {
        const message = messages[i];
        if (message.role === 'assistant' && 
            message.content && 
            Array.isArray(message.content)) {
          const audioContent = message.content.find(item => item.type === 'audio');
          if (audioContent) {
            setLastAssistantAudio(audioContent.text);
            break;
          }
        }
      }
    }
  }, [messages]);

  // Close modal function
  const closeModal = () => {
    setIsOpen(false);
    // If we're in audio mode and closing the modal, toggle back to normal
    if (audioMode) {
      toggleAudioMode();
    }
  };

  return (
    <>
      {/* No trigger button needed anymore as it's controlled by ChatInput */}

      {/* Modal with Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 backdrop-blur-sm bg-black/40 z-50"
              onClick={closeModal}
            ></motion.div>
            
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 pointer-events-none sm:flex sm:items-end sm:justify-center"
            >
              <div className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-lg w-full mx-auto pointer-events-auto overflow-hidden">
                
                {/* Pill handle for mobile */}
                <div className="w-full flex justify-center pt-2 sm:hidden">
                  <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                </div>
                
                {/* Gradient header */}
                <div className="w-full h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 mt-2 sm:mt-0"></div>
                
                {/* Modal Header */}
                <div className="px-6 pt-4 pb-2 flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Voice Assistant</h2>
                  <button 
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    onClick={closeModal}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Content Area */}
                <div className="px-6 py-4">
                  <div className="h-40 w-full flex items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-700 shadow-inner">
                    {isAudioLoading ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="animate-pulse flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full bg-cyan-200 dark:bg-cyan-800"></div>
                          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">Processing audio...</div>
                        </div>
                      </div>
                    ) : lastAssistantAudio ? (
                      <div className="w-full h-full flex items-center justify-center p-4">
                        <AutoPlayAudioPlayer audioSrc={lastAssistantAudio} />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-16 h-16 rounded-full bg-cyan-100 dark:bg-cyan-900 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-600 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          </svg>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Start recording to ask something</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Audio Recorder Section */}
                <div className="p-6 flex justify-center bg-gray-50 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-600">
                  <AudioRecorder />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default ImprovedAudioModal;


/**
 * ImprovedAudioModal.jsx
 *
 * 🎤 Purpose:
 * - Floating modal that acts as a voice assistant.
 * - Allows users to record their voice and receive AI-generated audio responses.
 *
 * 🧩 Internal Components:
 * - `AutoPlayAudioPlayer`: Player that visualizes and automatically plays the audio response.
 * - `AudioRecorder`: Voice recording component that captures user input.
 *
 * 🧠 Core Logic:
 * - Detects new assistant responses with audio.
 * - Extracts and displays the latest response containing audio content.
 * - Allows the modal to be closed, exiting audio mode.
 *
 * 🎨 Design:
 * - Centered modal with a blurred background (`backdrop-blur-sm`).
 * - Smooth animated transitions using `AnimatePresence` and `motion`.
 * - Mobile-friendly: slide bar and responsive layout.
 *
 * 📦 File Location:
 * //GPT/gptcore/client/src/components/ImprovedAudioModal.jsx
 *
 * 📌 Notes:
 * - Uses global `ChatContext` to determine if audio mode is active, send audio, and access the assistant's latest response.
 * - The modal is controlled from the `ChatInput` component.
 */

/**
 * AutoPlayAudioPlayer.jsx (internal within ImprovedAudioModal)
 *
 * 🔊 Purpose:
 * - Automatically plays the assistant's provided audio.
 * - Displays the audio waveform in real time using `Visualizer`.
 *
 * 🧠 Logic:
 * - Detects changes in the audio source (`audioSrc`) and triggers auto-play.
 * - Supports `string`, `Blob`, or `Uint8Array` as audio input.
 * - Creates an `AnalyserNode` using the Web Audio API to visually render volume.
 * - Includes a central round button to pause/resume playback.
 *
 * 📌 Notes:
 * - Optimized for mobile/iOS restrictions (uses `audioContext.resume()`).
 * - Ideal for voice responses generated by AI.
 */
