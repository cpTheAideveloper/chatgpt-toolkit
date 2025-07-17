//GPT/gptcore/client/src/pages/Audio&Voice/ChatWithVoice/components/AudioRecorder.jsx
import { useState, useEffect, useRef } from "react";
import { Mic, Pause } from "lucide-react";
import { useAudioContext } from "../context/audioContext";
import { AnimatePresence, motion } from "motion/react";

const AudioRecorder = () => {
  // eslint-disable-next-line no-unused-vars
  const { sendAudio, isLoading } = useAudioContext();
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
 * This component allows recording audio from the user's microphone and visualizing it in real time.
 * Once the recording is finished, the audio file is sent via the `useAudioContext` context.
 *
 * 🎤 Features:
 * - Audio capture using MediaRecorder
 * - Real-time volume visualization with animated bars using `motion`
 * - Pulsing ring animation while recording
 * - Record/pause button with dynamic icon (Mic / Pause)
 * - Automatic cleanup of audio resources on unmount
 *
 * ⚙️ Internal State:
 * - `isRecording` (boolean): Indicates whether the user is currently recording.
 * - `audioData` (number[]): Average frequency volumes for animated visualization.
 * - `mediaRecorderRef`: Reference to the active MediaRecorder instance.
 * - `analyserRef`: Analyser node to visually process the audio signal.
 * - `animationRef`: ID of the visualization loop, used to cancel it when stopped.
 *
 * 🧠 Context:
 * - Uses `useAudioContext()` to access `sendAudio` and `isLoading`, sending the recorded file.
 *
 * 🖼 Visualization:
 * - Animated audio bar based on FFT data from the microphone
 * - Ring animation around the button during recording
 *
 * 🧩 Dependencies:
 * - `lucide-react`: Icons (Mic, Pause)
 * - `motion/react`: Animations for bar height and presence
 * - `useAudioContext`: Custom context to handle audio sending
 *
 * 📁 File path:
 * //GPT/gptcore/client/src/pages/Audio&Voice/ChatWithVoice/components/AudioRecorder.jsx
 *
 * 📦 Browser requirements:
 * - Microphone access permissions
 * - Support for Web Audio API and MediaRecorder API
 */
