/* eslint-disable react/prop-types */
//GPT/gptcore/client/src/pages/Audio&Voice/ChatWithVoice/components/AudioViewer.jsx
import  { useEffect, useRef, useState } from "react";
import Visualizer from "./Visualizer";

const AudioViewer = ({ audioSrc }) => {
  const audioRef = useRef(null);
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);

  useEffect(() => {
    if (!audioContext) {
      const audioCtx = new AudioContext();
      setAudioContext(audioCtx);
    }

    return () => {
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [audioContext]);

  useEffect(() => {
    if (audioRef.current && audioContext) {
      const source = audioContext.createMediaElementSource(audioRef.current);
      const analyserNode = audioContext.createAnalyser();
      analyserNode.fftSize = 2048;

      source.connect(analyserNode);
      analyserNode.connect(audioContext.destination);
      setAnalyser(analyserNode);

      audioRef.current.onended = () => {
        // Handle audio end if needed
      };

      const playAudio = async () => {
        try {
          await audioRef.current.play();
        } catch (error) {
          console.error("Audio playback failed:", error);
        }
      };

      playAudio();

      return () => {
        source.disconnect();
        analyserNode.disconnect();
        if (audioRef.current) {
          audioRef.current.onended = null;
        }
      };
    }
  }, [audioContext, audioSrc]);

  useEffect(() => {
    if (audioRef.current) {
      let url;

      if (typeof audioSrc === "string") {
        url = audioSrc;
      } else if (audioSrc instanceof File) {
        url = URL.createObjectURL(audioSrc);
      }

      if (url) {
        audioRef.current.src = url;
        audioRef.current.load();

        if (audioSrc instanceof File) {
          return () => {
            URL.revokeObjectURL(url);
          };
        }
      }
    }
  }, [audioSrc]);

  return (
    <div className="flex flex-col">
      {analyser && <Visualizer analyser={analyser} />}
      <audio ref={audioRef} preload="auto" controls className="hidden" />
    </div>
  );
};

export default AudioViewer;

/**
 * AudioViewer.jsx
 *
 * This component plays an audio source (`audioSrc`) and visualizes the audio signal 
 * in real time using a `Visualizer` component based on an `AnalyserNode`.
 *
 * 📦 Functionality:
 * - Automatically plays the received audio (file or URL).
 * - Visualizes audio frequency using the Web Audio API.
 * - Supports both `File` objects and URL paths.
 * - Manages creation and cleanup of the `AudioContext`.
 *
 * ⚙️ Props:
 * @param {string|File} audioSrc - Audio source, can be a URL or a `File` type object.
 *
 * 🧠 Internal State:
 * - `audioContext`: Instance of `AudioContext` for audio processing.
 * - `analyser`: FFT analysis node for visualizing the signal.
 *
 * 🔧 Effects:
 * - Creates an `AudioContext` if one doesn't exist.
 * - Connects the audio to the `AnalyserNode` for real-time data.
 * - Automatically generates a `Blob URL` if a file is received.
 * - Cleans up resources (`disconnect`, `revokeObjectURL`, `close()`) on unmount or when the audio changes.
 *
 * 📁 File path:
 * //GPT/gptcore/client/src/pages/Audio&Voice/ChatWithVoice/components/AudioViewer.jsx
 *
 * 🧩 Dependencies:
 * - `Visualizer`: Visual component that renders the audio analysis.
 *
 * 🚫 Notes:
 * - The `<audio>` element is hidden (`className="hidden"`), as the visual control replaces it.
 */
