/* eslint-disable react/prop-types */
//GPT/gptcore/client/src/pages/Audio&Voice/ChatWithVoice/components/WaveForm.jsx
import  { useEffect, useRef } from "react";

const Visualizer = ({ analyser }) => {
  const canvasRef = useRef(null);
  
  const drawWaveform = (canvas, ctx, data) => {
    const { width, height } = canvas;
    const centerY = height / 2;
    
    // Clear the canvas before redrawing
    ctx.clearRect(0, 0, width, height);
    
    // Set up styling for the waveform
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#000';
    
    // Calculate shadow based on overall amplitude
    const overallAmplitude = getAverageAmplitude(data, 0, data.length);
    const shadowIntensity = Math.min(0.4, 0.2 + (overallAmplitude / 255) * 0.2);
    
    ctx.shadowColor = `rgba(74, 222, 128, ${shadowIntensity})`;
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Number of bars to display - fewer bars for a cleaner look
    const numBars = 40;
    const barWidth = 6;
    const barSpacing = Math.floor((width - (numBars * barWidth)) / (numBars - 1));
    const totalWidth = (numBars * barWidth) + ((numBars - 1) * barSpacing);
    const startX = (width - totalWidth) / 2;
    
    // Sample frequency data to match our bar count
    const sampledData = sampleData(data, numBars);
    
    // Draw each bar of the waveform
    for (let i = 0; i < numBars; i++) {
      const amplitude = sampledData[i] / 255; // Normalize to 0-1
      
      // Calculate bar height based on amplitude (max height is height/2)
      const barHeight = Math.max(5, amplitude * (height * 0.8));
      
      // Position of this bar
      const x = startX + i * (barWidth + barSpacing);
      
      // Draw the bar (vertical line)
      ctx.beginPath();
      ctx.moveTo(x + barWidth/2, centerY - barHeight/2);
      ctx.lineTo(x + barWidth/2, centerY + barHeight/2);
      ctx.stroke();
    }
    
    // Reset shadow
    ctx.shadowBlur = 0;
  };
  
  // Helper function to get average amplitude in a frequency range
  const getAverageAmplitude = (data, start, end) => {
    let sum = 0;
    for (let i = start; i < end; i++) {
      sum += data[i];
    }
    return sum / (end - start);
  };
  
  // Helper function to sample data to match our bar count
  const sampleData = (data, sampleCount) => {
    const result = new Array(sampleCount);
    const step = Math.floor(data.length / sampleCount);
    
    for (let i = 0; i < sampleCount; i++) {
      const dataIndex = i * step;
      // Take the average of a small window around this point to smooth visualization
      const windowSize = 3;
      let sum = 0;
      let count = 0;
      
      for (let j = Math.max(0, dataIndex - windowSize); 
           j < Math.min(data.length, dataIndex + windowSize); j++) {
        sum += data[j];
        count++;
      }
      
      result[i] = sum / count;
    }
    
    return result;
  };
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    let animationFrameId;
    const renderFrame = () => {
      // Get frequency data
      const frequencyData = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(frequencyData);
      
      drawWaveform(canvas, ctx, frequencyData);
      animationFrameId = requestAnimationFrame(renderFrame);
    };
    
    renderFrame();
    
    return () => cancelAnimationFrame(animationFrameId); // Cleanup on unmount
  }, [analyser]);
  
  return (
    <canvas
      ref={canvasRef}
      width="600"
      height="300"
      style={{
        width: "100%",
        display: "block",
      }}
    ></canvas>
  );
};

export default Visualizer;

/**
 * WaveForm.jsx
 *
 * Este componente representa una visualización de forma de onda (waveform) en tiempo real
 * basada en datos de frecuencia obtenidos mediante un `AnalyserNode` de la Web Audio API.
 * Dibuja un conjunto de barras verticales que pulsan al ritmo del audio con un efecto de sombra
 * dinámico, ideal para asistentes de voz, grabaciones o reproductores de audio interactivos.
 *
 * 🔊 Propósito:
 * - Visualizar la actividad de audio en forma de barras tipo ecualizador.
 * - Proporcionar feedback visual atractivo durante la reproducción o grabación de audio.
 *
 * 🧩 Props:
 * @prop {AnalyserNode} analyser - Nodo del contexto de audio Web Audio que entrega los datos de frecuencia para visualización.
 *
 * 🎨 Diseño:
 * - Canvas de 600x300 (escalable a 100% de ancho).
 * - 40 barras espaciadas uniformemente, cada una representa una muestra de frecuencia.
 * - Sombras dinámicas que responden a la amplitud general del audio.
 * - Color base: negro (`#000`) con efecto de sombra verde inspirado en tonos iOS modernos.
 *
 * ⚙️ Lógica de visualización:
 * - Cada cuadro (`frame`) obtiene los datos de frecuencia mediante `getByteFrequencyData`.
 * - Se realiza una reducción/sampling del array de frecuencia a 40 barras usando `sampleData`.
 * - La altura de cada barra se calcula proporcionalmente a su amplitud (normalizada de 0 a 1).
 * - Se dibujan líneas verticales desde el centro del canvas.
 * - Se aplica desenfoque y color de sombra proporcional al volumen total detectado.
 *
 * 🔁 Ciclo de vida:
 * - Usa `useEffect` para iniciar la animación con `requestAnimationFrame`.
 * - Limpia el loop de animación al desmontar el componente.
 *
 * 🧠 Helpers:
 * - `getAverageAmplitude(data, start, end)`: Devuelve el promedio de amplitud en un rango.
 * - `sampleData(data, sampleCount)`: Reduce el array de datos a `sampleCount` valores promediados.
 *
 * 📦 Ubicación:
 * //GPT/gptcore/client/src/pages/Audio&Voice/ChatWithVoice/components/WaveForm.jsx
 *
 * 📌 Notas:
 * - Para performance en móviles, se puede reducir el número de barras.
 * - El estilo es minimalista, útil en grabaciones de voz o interfaces de asistentes inteligentes.
 */
