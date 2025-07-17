/* eslint-disable react/prop-types */
//GPT/gptcore/client/src/pages/Audio&Voice/ChatWithVoice/components/AudioPlayer.jsx
import  { useEffect, useRef, useState } from "react";
import Visualizer from "./Visualizer";

const AutoPlayAudio = ({ audio }) => {
  const audioRef = useRef(null);
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  console.log(audio);

  useEffect(() => {
    if (!audioContext) {
      const audioCtx = new AudioContext();
      setAudioContext(audioCtx);
    }

    if (audioRef.current && audioContext) {
      const source = audioContext.createMediaElementSource(audioRef.current);
      const analyserNode = audioContext.createAnalyser();

      source.connect(analyserNode);
      analyserNode.connect(audioContext.destination);
      setAnalyser(analyserNode);

      audioRef.current.onended = () => {};

      // Cleanup function
      return () => {
        source.disconnect();
        analyserNode.disconnect();
        if (audioRef.current) {
          audioRef.current.onended = null;
        }
        audioContext.close();
      };
    }
  }, [audioContext]);

  useEffect(() => {
    if (audioRef.current) {
      const buffer = new Uint8Array(audio.data); // Convert number array to Uint8Array
      const blob = new Blob([buffer], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      audioRef.current.src = url;
      audioRef.current.load();

      const playAudio = async () => {
        try {
          await audioRef.current.play();
        } catch (error) {
          console.error("Audio playback failed:", error);
        }
      };

      // Add a slight delay before playing the audio to ensure the load has completed
      setTimeout(playAudio, 0);

      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [audio]);

  return (
    <>
      <div className="flex flex-col">
        {analyser && <Visualizer analyser={analyser} />}
        <audio ref={audioRef} preload="auto" controls className="hidden"/>
      </div>
    </>
  );
};

export default AutoPlayAudio;

/**
/**
 * AutoPlayAudio.jsx
 *
 * This component automatically plays an audio clip received as binary data
 * (such as an array of numbers) and displays a real-time visualization using a canvas.
 *
 * 🔊 Features:
 * - Automatically plays the audio when the component mounts
 * - Converts binary data into a playable `Blob`
 * - Real-time visualization using the `AnalyserNode` from the Web Audio API
 * - Proper cleanup of the audio context to avoid memory leaks
 *
 * 🧩 Props:
 * @param {{ data: number[] }} audio - Audio object containing a `data` property,
 *   which is a byte array (`Uint8Array`) representing an MP3 file.
 *
 * 🧠 Internals:
 * - `audioContext` (AudioContext): Web Audio context for handling audio processing.
 * - `analyser` (AnalyserNode): Node used to generate audio visualization data.
 * - `audioRef` (ref): Reference to the hidden `<audio>` HTML element.
 *
 * 🖼 Dependencies:
 * - `Visualizer`: Child component that renders the real-time audio visualization.
 *
 * 📁 File path:
 * //GPT/gptcore/client/src/pages/Audio&Voice/ChatWithVoice/components/AudioPlayer.jsx
 */

