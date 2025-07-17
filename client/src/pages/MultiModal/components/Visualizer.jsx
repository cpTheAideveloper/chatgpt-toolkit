import { useEffect, useRef } from "react";

const Visualizer = ({ analyser }) => {
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  
  useEffect(() => {
    if (!analyser || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    // Set canvas dimensions to match its display size
    const resizeCanvas = () => {
      const { width, height } = canvas.getBoundingClientRect();
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
    };
    
    resizeCanvas();
    
    // Handle window resizes
    window.addEventListener('resize', resizeCanvas);
    
    // Animation function
    const draw = () => {
      // Continue the animation loop
      requestRef.current = requestAnimationFrame(draw);
      
      // Get frequency data
      analyser.getByteFrequencyData(dataArray);
      
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = canvas.width / bufferLength * 2.5;
      let x = 0;
      
      // Set visualization style
      ctx.fillStyle = getComputedStyle(document.documentElement)
        .getPropertyValue('--cyan-500').trim() || '#06b6d4';
      
      // Draw frequency bars
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.8;
        
        // Use a smoother curve for the visualization
        const heightPercent = barHeight / canvas.height;
        const adjustedHeight = Math.pow(heightPercent, 1.3) * canvas.height;
        
        // Draw rounded bars
        const barX = x + barWidth / 2;
        const barY = canvas.height - adjustedHeight;
        
        // Draw a rounded rect
        if (adjustedHeight > 1) {
          ctx.beginPath();
          ctx.roundRect(
            x, 
            canvas.height - adjustedHeight, 
            barWidth - 1, 
            adjustedHeight,
            [2, 2, 0, 0] // rounded top corners
          );
          ctx.fill();
        }
        
        x += barWidth;
      }
    };
    
    // Start animation
    requestRef.current = requestAnimationFrame(draw);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [analyser]);
  
  return (
    <canvas 
      ref={canvasRef}
      className="w-full h-full rounded"
    />
  );
};

export default Visualizer;

/**
 * Visualizer.jsx
 *
 * 🎛️ Purpose:
 * - This component renders a real-time visualization of an audio frequency spectrum.
 * - It uses the Web Audio API and an `AnalyserNode` to obtain live audio data.
 *
 * 📡 Props:
 * @prop {AnalyserNode} analyser - Analysis node from the Web Audio context that provides real-time frequency data.
 *
 * 🎨 Visual Style:
 * - Animated vertical bars in an equalizer style.
 * - Main color derived from the CSS variable `--cyan-500`, with a fallback to `#06b6d4`.
 * - Rounded top edges for a modern aesthetic.
 *
 * 🧠 Logic:
 * - Retrieves frequency data with `getByteFrequencyData` on each animation frame.
 * - Calculates bar height proportional to normalized amplitude.
 * - Applies a smoothing curve (`Math.pow`) to visually adjust bar height.
 * - Draws each bar as a rectangle with rounded corners.
 *
 * 🖼️ Canvas:
 * - Automatically adjusts to the container size using `getBoundingClientRect`.
 * - Redraws visualization on window resize.
 * - Uses `requestAnimationFrame` for smooth animation loop.
 *
 * 🧹 Lifecycle:
 * - Starts the animation in `useEffect` when the `analyser` is available.
 * - Cleans up `requestAnimationFrame` and `resize` event listener on unmount.
 *
 * ⚠️ Requirements:
 * - The component expects the `AnalyserNode` to be properly connected to a `MediaStreamSource` or `MediaElementSource`.
 * - Requires support for `ctx.roundRect` (modern Canvas 2D API).
 *
 * 📦 File Location:
 * //GPT/gptcore/client/src/components/Visualizer.jsx
 *
 * 📝 Notes:
 * - Ideal for integration with voice assistants, recordings, audio players, and live audio effects.
 * - The canvas is responsive, but it is recommended to wrap it in a container with a defined height (e.g., `h-12` or `h-24`).
 */
