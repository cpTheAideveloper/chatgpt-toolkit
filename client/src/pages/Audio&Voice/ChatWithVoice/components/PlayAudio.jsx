/* eslint-disable react/prop-types */
//GPT/gptcore/client/src/pages/Audio&Voice/ChatWithVoice/components/PlayAudio.jsx
import { useEffect, useRef, useState } from "react";


const AutoPlayAudio = ({ audio }) => {
  const audioRef = useRef(null);

  const [audioContext, setAudioContext] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [analyser, setAnalyser] = useState(null);

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
      const buffer = new Uint8Array(audio.data);
      const blob = new Blob([buffer], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      audioRef.current.src = url;
      audioRef.current.load();

      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [audio]);

  return (
    <>
      <div className="flex flex-col">
        <audio ref={audioRef} preload="auto" controls />
      </div>
    </>
  );
};

export default AutoPlayAudio;

/**
 * PlayAudio.jsx
 *
 * This component automatically plays an audio buffer in `Uint8Array` format
 * received from the backend, converting it into a `Blob` and assigning it
 * to an `<audio>` element. It also sets up an `AudioContext` to enable extensions
 * like audio visualization or frequency analysis using an `AnalyserNode`.
 *
 * 🔊 Features:
 * - Automatically plays audio from binary data (`Uint8Array`).
 * - Creates an `AudioContext` and connects it to an `AnalyserNode` for processing.
 * - Automatically cleans up the `URL.createObjectURL` and closes the context on unmount.
 *
 * ⚙️ Props:
 * @prop {Uint8Array} audio.data - Byte array of audio received from the backend.
 *
 * 🧠 Internal State:
 * @state {AudioContext|null} audioContext - Audio context for playback and analysis.
 * @state {AnalyserNode|null} analyser - Frequency analysis node (not visualized here).
 *
 * 📦 Subcomponents used: None. Uses native `<audio>` only.
 *
 * 📍 File path:
 * //GPT/gptcore/client/src/pages/Audio&Voice/ChatWithVoice/components/PlayAudio.jsx
 *
 * 🧩 External Dependencies:
 * - React (useEffect, useRef, useState)
 *
 * 💡 Notes:
 * - This component can be integrated with an audio visualizer if the `analyser` is exposed.
 * - Audio is user-controlled via `controls`, but can be modified for autoplay if needed.
 */
