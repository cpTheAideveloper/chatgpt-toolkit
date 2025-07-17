/* eslint-disable react/prop-types */
import { useState, useRef, useEffect } from "react";
import { Eraser, Paintbrush, Undo, Save, Trash2 } from "lucide-react";

export function MaskDrawingCanvas({ 
  sourceImage, 
  onSaveMask, 
  onCancelDrawing,
  brushSize = 30,
  defaultColor = "rgba(0, 0, 255, 1)"  // Changed to blue
}) {
  const canvasRef = useRef(null);
  const sourceCanvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingTool, setDrawingTool] = useState("brush"); // "brush" or "eraser"
  const [brushWidth, setBrushWidth] = useState(brushSize);
  const [drawingHistory, setDrawingHistory] = useState([]);
  const [currentHistoryStep, setCurrentHistoryStep] = useState(-1);
  
  // Set up canvas when source image loads
  useEffect(() => {
    if (!sourceImage || !sourceImage.preview) return;
    
    const img = new Image();
    img.onload = () => {
      // Set up source canvas (for displaying the original image)
      const sourceCanvas = sourceCanvasRef.current;
      const sourceCtx = sourceCanvas.getContext('2d');
      
      // Get original image dimensions
      const originalWidth = img.width;
      const originalHeight = img.height;
      
      // Set canvas dimensions to match the image
      sourceCanvas.width = originalWidth;
      sourceCanvas.height = originalHeight;
      
      // Set drawing canvas to same dimensions
      const drawingCanvas = canvasRef.current;
      drawingCanvas.width = originalWidth;
      drawingCanvas.height = originalHeight;
      
      // Draw image on source canvas
      sourceCtx.drawImage(img, 0, 0, originalWidth, originalHeight);
      
      // Clear any existing history
      setDrawingHistory([]);
      setCurrentHistoryStep(-1);
      
      // Initialize drawing canvas with transparent background
      initializeDrawingCanvas();
    };
    
    img.src = sourceImage.preview;
  }, [sourceImage]);
  
  // Initialize a transparent drawing canvas
  const initializeDrawingCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Save initial state to history
    const initialState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setDrawingHistory([initialState]);
    setCurrentHistoryStep(0);
  };
  
  // Handle drawing on the canvas
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    setIsDrawing(true);
    
    // Get the correct position based on canvas scaling and offset
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let x, y;
    
    // Handle both mouse and touch events
    if (e.type === 'mousedown') {
      x = (e.clientX - rect.left) * scaleX;
      y = (e.clientY - rect.top) * scaleY;
    } else if (e.type === 'touchstart') {
      x = (e.touches[0].clientX - rect.left) * scaleX;
      y = (e.touches[0].clientY - rect.top) * scaleY;
    }
    
    // Start a new path
    ctx.beginPath();
    ctx.moveTo(x, y);
    
    // Set drawing styles based on tool
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushWidth;
    
    if (drawingTool === 'brush') {
      ctx.strokeStyle = defaultColor;
      ctx.globalCompositeOperation = 'source-over';
    } else { // eraser
      ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
      ctx.globalCompositeOperation = 'destination-out';
    }
  };
  
  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Get the correct position
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let x, y;
    
    // Handle both mouse and touch events
    if (e.type === 'mousemove') {
      x = (e.clientX - rect.left) * scaleX;
      y = (e.clientY - rect.top) * scaleY;
    } else if (e.type === 'touchmove') {
      e.preventDefault(); // Prevent scrolling on touch devices
      x = (e.touches[0].clientX - rect.left) * scaleX;
      y = (e.touches[0].clientY - rect.top) * scaleY;
    }
    
    // Draw line to the new position
    ctx.lineTo(x, y);
    ctx.stroke();
  };
  
  const stopDrawing = () => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // End the path
    ctx.closePath();
    setIsDrawing(false);
    
    // Save this state to history, removing any future states if we've gone back in history
    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // If we went back in history and then drew something new, truncate the history
    const newHistory = drawingHistory.slice(0, currentHistoryStep + 1);
    setDrawingHistory([...newHistory, currentState]);
    setCurrentHistoryStep(newHistory.length);
  };
  
  // Undo last drawing action
  const handleUndo = () => {
    if (currentHistoryStep > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Go back one step in history
      const newStep = currentHistoryStep - 1;
      setCurrentHistoryStep(newStep);
      
      // Apply the previous state
      ctx.putImageData(drawingHistory[newStep], 0, 0);
    }
  };
  
  // Clear the entire mask
  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Reset composite operation just in case
    ctx.globalCompositeOperation = 'source-over';
    
    // Save this cleared state
    const clearedState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setDrawingHistory([clearedState]);
    setCurrentHistoryStep(0);
  };
  
  // Save the mask image - Convert to black for compatibility with API
  const handleSaveMask = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Create a temporary canvas to convert blue to black 
    // (since the API expects black masks)
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Get the image data from our blue drawing
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Convert blue pixels to black 
    // RGBA format: data[i] = red, data[i+1] = green, data[i+2] = blue, data[i+3] = alpha
    for (let i = 0; i < data.length; i += 4) {
      // If there's any blue (or any color with alpha > 0)
      if (data[i+3] > 0) {
        // Set to black
        data[i] = 0;      // Red = 0
        data[i+1] = 0;    // Green = 0
        data[i+2] = 0;    // Blue = 0
        // Keep the alpha channel as is
      }
    }
    
    // Put the black version onto the temp canvas
    tempCtx.putImageData(imageData, 0, 0);
    
    // Convert temp canvas to blob (PNG with transparency)
    tempCanvas.toBlob((blob) => {
      // Create a File object from the blob
      const file = new File([blob], "mask.png", {
        type: "image/png",
        lastModified: new Date().getTime()
      });
      
      // Create an object URL for preview - this will still show blue in the UI
      const preview = URL.createObjectURL(blob);
      
      // Call the onSaveMask callback with the mask data
      onSaveMask({
        file,
        preview: canvas.toDataURL('image/png'), // Use the original blue version for preview
        name: "mask.png"
      });
    }, "image/png");
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-3 px-2">
        <div className="text-sm font-medium text-blue-600">
          Draw Mask - Blue areas will be edited
        </div>
        <div className="flex items-center space-x-2">
          <select 
            className="text-sm border rounded px-2 py-1"
            value={brushWidth}
            onChange={(e) => setBrushWidth(parseInt(e.target.value))}
          >
            <option value="15">Thin</option>
            <option value="30">Medium</option>
            <option value="60">Thick</option>
          </select>
          
          <button
            onClick={() => setDrawingTool("brush")}
            className={`p-2 rounded-full ${
              drawingTool === "brush" 
                ? "bg-blue-100 text-blue-600" 
                : "bg-gray-100 text-gray-600"
            }`}
            title="Brush"
          >
            <Paintbrush size={16} />
          </button>
          
          <button
            onClick={() => setDrawingTool("eraser")}
            className={`p-2 rounded-full ${
              drawingTool === "eraser" 
                ? "bg-blue-100 text-blue-600" 
                : "bg-gray-100 text-gray-600"
            }`}
            title="Eraser"
          >
            <Eraser size={16} />
          </button>
          
          <button
            onClick={handleUndo}
            className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
            disabled={currentHistoryStep <= 0}
            title="Undo"
          >
            <Undo size={16} />
          </button>
          
          <button
            onClick={handleClear}
            className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
            title="Clear All"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      <div className="relative flex-1 overflow-hidden border rounded-lg">
        {/* Original image canvas (background) */}
        <canvas
          ref={sourceCanvasRef}
          className="absolute top-0 left-0 w-full h-full object-contain"
        />
        
        {/* Drawing canvas (foreground) */}
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full object-contain z-10"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      
      <div className="flex justify-end space-x-2 mt-4">
        <button
          onClick={onCancelDrawing}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveMask}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center"
        >
          <Save size={16} className="mr-1" />
          Save Mask
        </button>
      </div>
    </div>
  );
}