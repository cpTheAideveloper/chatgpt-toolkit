//GPT/gptcore/client/src/pages/Audio&Voice/ChatWithVoice/components/Modal.jsx
import { useEffect, useState } from "react";
import { useAudioContext } from "../context/audioContext";
import AutoPlayAudio from "./AudioPlayer";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import AudioRecorder from "./AudioRecorder";

export default function Modal() {
  const { assistant, isLoading } = useAudioContext();
  const [currentAssistant, setCurrentAssistant] = useState(assistant);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (assistant) {
      setCurrentAssistant(assistant);
    }
  }, [assistant]);

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Trigger Button - Fixed at bottom */}
      <div className="fixed bottom-0 w-full flex justify-center py-6 z-40">
        <button
          className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 shadow-lg flex items-center justify-center transition-all duration-200 ease-in-out text-sm font-medium"
          onClick={toggleModal}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          Speak
        </button>
      </div>

      {/* iOS-style Modal with Backdrop Blur */}
      {isOpen && (
        <>
          {/* Semi-transparent overlay that allows background to be visible */}
          <div className="fixed inset-0 backdrop-blur-md bg-black/30 z-50" onClick={toggleModal}></div>
          
          {/* Modal Content */}
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full mx-auto pointer-events-auto overflow-hidden">
              
              {/* Gradient header */}
              <div className="w-full h-2 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500"></div>
              
              {/* Close Button */}
              <button 
                className="absolute right-5 top-5 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={toggleModal}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Modal Header */}
              <div className="px-6 pt-6 pb-2">
                <h2 className="text-xl font-semibold text-gray-900">Voice Assistant</h2>
              </div>

              {/* Content Area */}
              <div className="px-6 py-4">
                <div className="h-52 w-full flex items-center justify-center rounded-xl bg-white shadow-inner">
                  {isLoading ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <LoadingIndicator />
                    </div>
                  ) : currentAssistant ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <AutoPlayAudio
                        audio={currentAssistant.content[0]?.text || ""}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-32 h-32 mx-auto rounded-full bg-green-400 shadow-lg shadow-green-200">
                      <div className="w-24 h-24 rounded-full bg-green-300 flex items-center justify-center animate-pulse">
                        <div className="w-16 h-16 rounded-full bg-green-200 animate-pulse"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Audio Recorder Section */}
              <div className="p-6 flex justify-center bg-gray-50 border-t border-gray-100">
                <AudioRecorder />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}


/**
 * Modal.jsx
 *
 * This component represents an iOS-style voice assistant modal that allows the user to record messages
 * and listen to the assistant’s response in audio format. It is connected to the global `audioContext`
 * through a custom React context.
 *
 * 🎤 Main Features:
 * - Floating "Speak" button to open/close the modal.
 * - Centered modal with semi-transparent background and blur effect.
 * - Displays a loading indicator while waiting for the assistant’s response.
 * - Automatically plays the assistant’s audio using `AutoPlayAudio`.
 * - Allows recording user audio via `AudioRecorder`.
 *
 * ⚙️ Props: This component does not receive props directly. It uses the global `audioContext`.
 *
 * 🧠 Internal State:
 * @state {boolean} isOpen - Determines whether the modal is visible.
 * @state {object|null} currentAssistant - Latest response from the assistant.
 *
 * 📡 Context:
 * - `assistant` (object): Latest response from the assistant via `audioContext`.
 * - `isLoading` (boolean): Indicates whether the assistant is processing audio or text.
 *
 * 📦 Subcomponents used:
 * - `AutoPlayAudio`: Plays assistant audio with visualization.
 * - `AudioRecorder`: Records user audio and sends it to the backend.
 * - `LoadingIndicator`: Animation shown while the audio is being generated.
 *
 * 🎨 Design:
 * - Background with `backdrop-blur-md` and `bg-black/30` for blur effect.
 * - Modal with rounded corners, shadow, and a gradient header.
 * - Bottom section dedicated to the recording button.
 *
 * 📍 File path:
 * //GPT/gptcore/client/src/pages/Audio&Voice/ChatWithVoice/components/Modal.jsx
 *
 * 🧩 External dependencies:
 * - `useAudioContext` from `../context/audioContext`.
 *
 * 🔔 Notes:
 * - Audio is played automatically when the assistant’s response is received.
 * - Uses `pointer-events-none` on the modal wrapper to prevent accidental interactions outside the content.
 */
