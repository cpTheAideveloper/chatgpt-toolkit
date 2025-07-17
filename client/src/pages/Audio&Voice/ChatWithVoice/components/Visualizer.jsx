/* eslint-disable react/prop-types */
//GPT/gptcore/client/src/pages/Audio&Voice/ChatWithVoice/components/Visualizer.jsx
import  { useEffect, useRef } from "react";

const Visualizer = ({ analyser }) => {
  const canvasRef = useRef(null);
  
  const drawCircles = (
    canvas,
    ctx,
    data,
    // eslint-disable-next-line no-unused-vars
    maxRadius = 100
  ) => {
    const { width, height } = canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Define modern iOS green colors (matching the modal example)
    const greenColors = {
      outer: '#4ADE80', // bg-green-400
      middle: '#86EFAC', // bg-green-300
      inner: '#BBF7D0'   // bg-green-200
    };
    
    // Group the frequency data into bass, mid and high ranges
    const dataLength = data.length;
    const bassEnd = Math.floor(dataLength * 0.1);  // Lower 10% - bass frequencies
    const midEnd = Math.floor(dataLength * 0.5);   // Next 40% - mid frequencies
    
    // Get average values for each frequency range
    const bassAvg = getAverageAmplitude(data, 0, bassEnd);
    const midAvg = getAverageAmplitude(data, bassEnd, midEnd);
    const highAvg = getAverageAmplitude(data, midEnd, dataLength);
    
    // Calculate different pulse factors based on different frequency ranges
    // Reduced intensity for smoother pulsing
    const bassPulseFactor = 1 + (bassAvg / 200);  // Bass affects outer ring
    const midPulseFactor = 1 + (midAvg / 225);    // Mid affects middle ring
    const highPulseFactor = 1 + (highAvg / 250);  // High affects inner ring
    
    // Get overall volume for additional effects
    const overallAmplitude = (bassAvg + midAvg + highAvg) / 3;
    
    // Clear the canvas before redrawing
    ctx.clearRect(0, 0, width, height);
    
    // Base radius of the largest circle
    const baseRadius = Math.min(width, height) * 0.25;
    
    // The sizes of each ring - matching the w-32, w-24, w-16 pattern
    const ringRatios = [1, 0.75, 0.5]; // 32/32, 24/32, 16/32
    const ringColors = [greenColors.outer, greenColors.middle, greenColors.inner];
    
    // Create dynamic shadow effect based on audio intensity
    const shadowIntensity = Math.min(0.6, 0.3 + (overallAmplitude / 255) * 0.3);
    ctx.shadowColor = `rgba(187, 247, 208, ${shadowIntensity})`;
    ctx.shadowBlur = 20 + (overallAmplitude / 64);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Different pulse factors for each ring
    const pulseFactors = [
      bassPulseFactor, 
      midPulseFactor, 
      highPulseFactor
    ];
    
    // Draw each ring with its corresponding frequency response
    for (let i = 0; i < 3; i++) {
      // Calculate radius with dynamic pulse based on frequency response
      const radius = baseRadius * ringRatios[i] * pulseFactors[i];
      
      // Adjust opacity based on audio intensity for more dynamic feel
      const baseOpacity = 0.9;
      const opacityBoost = (i === 0 ? bassAvg : i === 1 ? midAvg : highAvg) / 255;
      ctx.globalAlpha = Math.min(1, baseOpacity + opacityBoost * 0.1);
      
      // Fill with solid color
      ctx.fillStyle = ringColors[i];
      
      // Draw perfect circles (no wobble/movement)
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    // Reset canvas settings
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1.0;
  };
  
  // Helper function to get average amplitude in a frequency range
  const getAverageAmplitude = (data, start, end) => {
    let sum = 0;
    for (let i = start; i < end; i++) {
      sum += data[i];
    }
    return sum / (end - start);
  };
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    let animationFrameId;
    const renderFrame = () => {
      // Get frequency data with enough detail for analysis
      const frequencyData = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(frequencyData);
      
      drawCircles(canvas, ctx, frequencyData, 150);
      animationFrameId = requestAnimationFrame(renderFrame);
    };
    
    renderFrame();
    
    return () => cancelAnimationFrame(animationFrameId); // Cleanup on unmount
  }, [analyser]);
  
  return (
    <canvas
      ref={canvasRef}
      width="600"
      height="500"
      style={{
        width: "100%",
        display: "block",
      }}
    ></canvas>
  );
};

export default Visualizer;

/**
 * Visualizer.jsx
 *
 * This component represents an audio visualizer that displays dynamic circles
 * based on low (bass), mid, and high frequencies using an `AnalyserNode` from
 * the Web Audio API. It is designed with a modern aesthetic inspired by iOS
 * system colors and smooth pulsing animations.
 *
 * 🎯 Purpose:
 * - Visualize audio captured from a microphone or `<audio>` source in real time.
 * - React visually based on the energy of different frequency bands.
 * - Provide a visually pleasing experience for voice assistants, recorders, or players.
 *
 * 🔍 Props:
 * @prop {AnalyserNode} analyser - Audio context node providing frequency data for visualization.
 *
 * 🧠 Logic:
 * - Frequency data (`Uint8Array`) is retrieved using `analyser.getByteFrequencyData`.
 * - Three averages are calculated: bass, mid, high.
 * - Three concentric rings (`canvas.arc`) are drawn with different sizes and colors, pulsing with the respective averages.
 * - `requestAnimationFrame` is used to continuously redraw the canvas.
 * - Dynamic blur and shadow effects are added based on the overall audio amplitude.
 *
 * 🎨 Aesthetic:
 * - Colors: iOS Green (`#4ADE80`, `#86EFAC`, `#BBF7D0`)
 * - Soft shadow style
 * - Circle radius proportional to the canvas size
 * - Rings: outer (bass), middle (mid), inner (high)
 *
 * 🧩 Dependencies:
 * - React (useEffect, useRef)
 * - Web Audio API (`AnalyserNode`, `getByteFrequencyData`)
 *
 * 📦 File location:
 * //GPT/gptcore/client/src/pages/Audio&Voice/ChatWithVoice/components/Visualizer.jsx
 *
 * 📌 Notes:
 * - The canvas is 600x500 by default, but adapts to `width: 100%` using CSS.
 * - For mobile optimization, consider reducing the `maxRadius` or lowering the `fftSize` of the `AnalyserNode`.
 */
