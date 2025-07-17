import { useState, useEffect, useRef } from "react";
import { Mic, Pause } from "lucide-react";
import { useChatContext } from "../context/ChatContext";
import { AnimatePresence, motion } from "motion/react";

const AudioRecorder = () => {
  const { sendAudio, isLoading } = useChatContext();
  const [isRecording, setIsRecording] = useState(false);
  const [audioData, setAudioData] = useState([]);
  const mediaRecorderRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);

  // Setup audio visualization
  useEffect(() => {
    if (isRecording) {
      console.log("Starting recording");

      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          console.log("Microphone access granted");
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;

          // Create audio context for visualization
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const analyser = audioContext.createAnalyser();
          analyserRef.current = analyser;
          
          // Connect stream to analyser
          const source = audioContext.createMediaStreamSource(stream);
          source.connect(analyser);
          
          // Configure analyser
          analyser.fftSize = 256;
          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          
          // Animation function to update visualization
          const updateVisualization = () => {
            if (!analyserRef.current) return;
            
            analyserRef.current.getByteFrequencyData(dataArray);
            
            // Calculate average volume level for simplicity
            const average = dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;
            
            // Update state with new data point (keep last 20 points)
            setAudioData(prev => {
              const newData = [...prev, average];
              return newData.slice(-20);
            });
            
            // Continue animation loop
            animationRef.current = requestAnimationFrame(updateVisualization);
          };
          
          // Start visualization
          animationRef.current = requestAnimationFrame(updateVisualization);

          const audioChunks = [];
          mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
            console.log("Data available:", event.data);
          };

          mediaRecorder.onstop = async () => {
            console.log("Recording stopped");
            const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
            await sendAudio(audioBlob);
          };

          mediaRecorder.start();
          console.log("Recording started");
        })
        .catch((error) => {
          console.error("Error accessing the microphone:", error);
          setIsRecording(false);
        });
    } else if (mediaRecorderRef.current) {
      console.log("Stopping recording");
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      
      // Stop visualization
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      
      // Reset audio data
      setAudioData([]);
      
      // Clean up analyser
      analyserRef.current = null;
    }

    return () => {
      console.log("Cleaning up");
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stream
          .getTracks()
          .forEach((track) => track.stop());
        mediaRecorderRef.current = null;
      }
      
      // Stop visualization
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      
      // Clean up analyser
      analyserRef.current = null;
    };
  }, [isRecording, sendAudio]);

  const toggleRecording = (event) => {
    event.preventDefault();
    event.stopPropagation();
    console.log("Toggling recording:", !isRecording);
    setIsRecording((prev) => !prev);
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Voice wave visualization */}
      {isRecording && audioData.length > 0 && (
        <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 w-32 h-10 flex items-end justify-center space-x-1">
          {audioData.map((value, index) => (
            <motion.div
              key={index}
              initial={{ height: 4 }}
              animate={{ height: Math.max(4, Math.min(40, value / 2)) }}
              className="w-1 bg-cyan-500 rounded-full"
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
            />
          ))}
        </div>
      )}

      {/* Recording button with ring animation */}
      <AnimatePresence>
        {isRecording && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1.2 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="absolute -inset-2 rounded-full bg-cyan-200 dark:bg-cyan-700 opacity-75 animate-pulse"
          />
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={toggleRecording}
        className={`relative flex flex-col items-center justify-center w-24 h-24 rounded-full shadow-md transition-all duration-300 border-2 ${
          isRecording
            ? "bg-cyan-100 ring-2 ring-cyan-400 border-cyan-300 scale-105"
            : "bg-white hover:bg-gray-50 border-cyan-100 hover:border-cyan-200"
        } focus:outline-none focus:ring-2 focus:ring-cyan-500`}
        aria-label={isRecording ? "Pause" : "Start"}
      >
        {isRecording ? (
          <Pause className="w-10 h-10 text-cyan-700" />
        ) : (
          <Mic className="w-10 h-10 text-cyan-600" />
        )}
        <p className="text-sm mt-1 font-medium text-gray-700">{isRecording ? "Pause" : "Start"}</p>
      </button>
    </div>
  );
};

export default AudioRecorder;

/**
 * AudioRecorder.jsx
 *
 * 🎙️ Purpose:
 * - Provides a voice input interface with a real-time animated waveform visualizer.
 * - Records microphone audio using the `MediaRecorder` API and sends it to a chat assistant via context.
 *
 * 🧩 Props:
 * - This component does not receive external props. It uses context (`useChatContext`) to interact with the app's audio assistant logic.
 *
 * 🔊 Features:
 * - Record audio with a single tap.
 * - Real-time waveform animation based on microphone input amplitude.
 * - Clean UI with ring animation when recording is active.
 * - Sends recorded audio as a `Blob` to the chat context (`sendAudio`).
 *
 * ⚙️ Core Logic:
 * - Uses `MediaRecorder` to capture audio chunks from the user's microphone.
 * - Uses `AnalyserNode` to calculate live amplitude data from the mic and render animated bars.
 * - Automatically stops and cleans up the media stream and visualizer when recording ends or unmounts.
 *
 * 🔁 Lifecycle:
 * - `useEffect` handles microphone setup and teardown based on `isRecording` state.
 * - Initializes media stream and audio context when recording starts.
 * - Cleans up `MediaRecorder`, `AudioContext`, `AnalyserNode`, and animation frames on stop or unmount.
 *
 * 💥 Error Handling:
 * - Gracefully handles permission errors or microphone access failures.
 * - Logs microphone and media stream errors to the console.
 *
 * 🎨 UI & Animations:
 * - Animated waveform bars using `framer-motion`'s `motion.div`.
 * - Ring pulse animation around the record button while recording.
 * - Toggle button for start/pause state with Mic/Pause icons.
 *
 * 📦 Location:
 * //GPT/gptcore/client/src/pages/Audio&Voice/ChatWithVoice/components/AudioRecorder.jsx
 *
 * 📌 Notes:
 * - Uses the `useChatContext` hook to access `sendAudio` and `isLoading`.
 * - The waveform visualization is simplified to 20 averaged bars, adjustable for performance.
 * - Ideal for voice-enabled assistants or chat interfaces.
 */
