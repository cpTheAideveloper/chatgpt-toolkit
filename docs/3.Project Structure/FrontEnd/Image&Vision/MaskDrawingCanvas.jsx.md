This component allows users to draw on a canvas overlaying a source image, create masks, and perform actions like undoing changes, clearing the canvas, and saving the mask. We'll explore each part incrementally to ensure clarity for beginners.


## 1. Imports and Setup

```javascript
/* eslint-disable react/prop-types */
import { useState, useRef, useEffect } from "react";
import { Eraser, Paintbrush, Undo, Save, Trash2 } from "lucide-react";
```

### Explanation:

1. **ESLint Directive**:
   - `/* eslint-disable react/prop-types */`: This comment disables ESLint's `react/prop-types` rule for this file. ESLint is a tool for identifying and reporting on patterns in JavaScript. Here, it prevents warnings about missing `prop-types` definitions. This is commonly used when you manage prop validation through other means, like TypeScript.

2. **Imports**:
   - `useState`, `useRef`, `useEffect`:
     - These are React Hooks that allow you to use state, references, and side effects in functional components.
   - `{ Eraser, Paintbrush, Undo, Save, Trash2 }`:
     - These are icon components imported from the `lucide-react` library, used for the toolbar buttons.

---

## 2. Component Definition and Props

```javascript
export function MaskDrawingCanvas({ 
  sourceImage, 
  onSaveMask, 
  onCancelDrawing,
  brushSize = 30,
  defaultColor = "rgba(0, 0, 255, 1)"  // Changed to blue
}) {
  // Component body...
}
```

### Explanation:

- **Component Export**:
  - `export function MaskDrawingCanvas`: Defines and exports a React functional component named `MaskDrawingCanvas`.

- **Props**:
  - `{ sourceImage, onSaveMask, onCancelDrawing, brushSize = 30, defaultColor = "rgba(0, 0, 255, 1)" }`:
    - `sourceImage`: The image on which the mask will be drawn.
    - `onSaveMask`: Callback function triggered when the mask is saved.
    - `onCancelDrawing`: Callback function triggered when the drawing is canceled.
    - `brushSize`: Optional prop with a default value of `30`, determining the initial brush size.
    - `defaultColor`: Optional prop with a default blue color (`"rgba(0, 0, 255, 1)"`) used for the brush.

---

## 3. References and State Variables

```javascript
const canvasRef = useRef(null);
const sourceCanvasRef = useRef(null);
const [isDrawing, setIsDrawing] = useState(false);
const [drawingTool, setDrawingTool] = useState("brush"); // "brush" or "eraser"
const [brushWidth, setBrushWidth] = useState(brushSize);
const [drawingHistory, setDrawingHistory] = useState([]);
const [currentHistoryStep, setCurrentHistoryStep] = useState(-1);
```

### Explanation:

1. **References (`useRef`)**:
   - `canvasRef`: Reference to the drawing canvas where users will draw the mask.
   - `sourceCanvasRef`: Reference to the source image canvas displaying the original image.

2. **State Variables (`useState`)**:
   - `isDrawing`: Boolean indicating whether the user is currently drawing.
   - `drawingTool`: Current tool selected, either `"brush"` or `"eraser"`.
   - `brushWidth`: Current width of the brush, initialized with `brushSize` prop.
   - `drawingHistory`: Array storing the history of canvas states for undo functionality.
   - `currentHistoryStep`: Index pointing to the current step in `drawingHistory`. Initialized to `-1`, indicating no steps yet.

---

## 4. Effect Hook: Setting Up the Canvas

```javascript
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
```

### Explanation:

- **useEffect**:
  - Runs after the component mounts or when `sourceImage` changes.
  - Ensures that the canvas is properly set up when a new source image is provided.

- **Steps Inside useEffect**:
  1. **Check for Source Image**:
     - If `sourceImage` or `sourceImage.preview` is not available, exit early to prevent errors.

  2. **Create and Load Image**:
     - `const img = new Image();`: Creates a new Image object.
     - `img.onload = () => { ... }`: Defines a function to execute once the image is fully loaded.

  3. **Set Up Source Canvas**:
     - `sourceCanvasRef.current`: Accesses the source canvas DOM element.
     - `sourceCtx`: Gets the 2D rendering context for drawing.

  4. **Set Canvas Dimensions**:
     - Matches the canvas size to the loaded image's dimensions to ensure proper scaling.

  5. **Draw Image on Source Canvas**:
     - `sourceCtx.drawImage(img, 0, 0, originalWidth, originalHeight);`: Renders the source image onto the source canvas.

  6. **Clear Drawing History**:
     - Resets any previous drawing history to start fresh with the new image.

  7. **Initialize Drawing Canvas**:
     - Calls `initializeDrawingCanvas()` to set up the drawing canvas with a transparent background.

  8. **Set Image Source**:
     - `img.src = sourceImage.preview;`: Initiates loading of the image by setting its source.

---

## 5. Helper Functions

### Initializing the Drawing Canvas

```javascript
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
```

#### Explanation:

- **Purpose**:
  - Prepares the drawing canvas by clearing any existing drawings and initializing the history for undo functionality.

- **Steps**:
  1. **Access Canvas and Context**:
     - Retrieves the drawing canvas and its 2D context.

  2. **Clear Canvas**:
     - `ctx.clearRect(0, 0, canvas.width, canvas.height);`: Clears the entire canvas, ensuring it's transparent.

  3. **Initialize Drawing History**:
     - Captures the current (cleared) state of the canvas and saves it as the first entry in `drawingHistory`.
     - Sets `currentHistoryStep` to `0` indicating the initial state.

---

### Start Drawing

```javascript
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
```

#### Explanation:

- **Purpose**:
  - Initiates the drawing process when the user starts interacting with the canvas (e.g., mouse down or touch start).

- **Steps**:
  1. **Access Canvas and Context**:
     - Retrieves the drawing canvas and its 2D context.

  2. **Set Drawing State**:
     - `setIsDrawing(true);`: Indicates that the user has started drawing.

  3. **Calculate Correct Position**:
     - `getBoundingClientRect()`: Gets the position and size of the canvas relative to the viewport.
     - `scaleX` and `scaleY`: Calculate the scaling factors to translate mouse/touch coordinates to canvas coordinates.

  4. **Determine X and Y Coordinates**:
     - Depending on whether the event is a mouse or touch event, extracts the correct `x` and `y` positions.

  5. **Begin Drawing Path**:
     - `ctx.beginPath();`: Starts a new path for drawing.
     - `ctx.moveTo(x, y);`: Moves the drawing cursor to the starting point.

  6. **Set Drawing Styles**:
     - `ctx.lineCap` and `ctx.lineJoin`: Define how the end and joints of lines appear.
     - `ctx.lineWidth`: Sets the thickness of the brush or eraser.

  7. **Set Stroke Style and Composite Operation**:
     - If using the brush:
       - `ctx.strokeStyle = defaultColor;`: Sets the brush color (blue by default).
       - `ctx.globalCompositeOperation = 'source-over';`: Draws over existing content.
     - If using the eraser:
       - `ctx.strokeStyle = 'rgba(0, 0, 0, 1)';`: Sets a color, though it's overridden by the composite operation.
       - `ctx.globalCompositeOperation = 'destination-out';`: Erases content where drawn.

---

### Draw

```javascript
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
```

#### Explanation:

- **Purpose**:
  - Handles the actual drawing as the user moves the mouse or finger across the canvas.

- **Steps**:
  1. **Check if Drawing**:
     - If `isDrawing` is `false`, exit the function to prevent drawing when not initiated.

  2. **Access Canvas and Context**:
     - Retrieves the drawing canvas and its 2D context.

  3. **Calculate Correct Position**:
     - Similar to `startDrawing`, it calculates the scaled `x` and `y` positions based on the canvas size and viewport size.

  4. **Determine X and Y Coordinates**:
     - Depending on whether the event is a mouse move or touch move, extracts the correct `x` and `y` positions.
     - For touch events, `e.preventDefault();` is called to prevent the default behavior (like scrolling).

  5. **Draw Line to New Position**:
     - `ctx.lineTo(x, y);`: Extends the current path to the new coordinates.
     - `ctx.stroke();`: Strokes (draws) the current path with the current stroke style.

---

### Stop Drawing

```javascript
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
```

#### Explanation:

- **Purpose**:
  - Finalizes the drawing process when the user releases the mouse button or lifts their finger.

- **Steps**:
  1. **Check if Drawing**:
     - If `isDrawing` is `false`, exit the function to prevent unnecessary actions.

  2. **Access Canvas and Context**:
     - Retrieves the drawing canvas and its 2D context.

  3. **End Drawing Path**:
     - `ctx.closePath();`: Closes the current drawing path.
     - `setIsDrawing(false);`: Indicates that drawing has stopped.

  4. **Save Current State to History**:
     - `ctx.getImageData(...)`: Captures the current state of the canvas as image data.
     - Updates `drawingHistory` by:
       - Slicing any future states if the user had undone some steps and then drew again.
       - Adding the new `currentState` to the history.
     - Updates `currentHistoryStep` to point to the latest state.

---

### Undo Action

```javascript
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
```

#### Explanation:

- **Purpose**:
  - Allows the user to undo the last drawing action by reverting to the previous state in `drawingHistory`.

- **Steps**:
  1. **Check if Undo is Possible**:
     - Ensures that there is at least one previous state to revert to (`currentHistoryStep > 0`).

  2. **Access Canvas and Context**:
     - Retrieves the drawing canvas and its 2D context.

  3. **Update History Step**:
     - Decrements `currentHistoryStep` to move back one step in the history.

  4. **Apply Previous State**:
     - `ctx.putImageData(...)`: Renders the previous canvas state onto the canvas, effectively undoing the last action.

---

### Clear Canvas

```javascript
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
```

#### Explanation:

- **Purpose**:
  - Clears the entire drawing canvas, removing all drawings and resetting history.

- **Steps**:
  1. **Access Canvas and Context**:
     - Retrieves the drawing canvas and its 2D context.

  2. **Clear Canvas**:
     - `ctx.clearRect(...)`: Clears the entire canvas area.

  3. **Reset Composite Operation**:
     - `ctx.globalCompositeOperation = 'source-over';`: Ensures that subsequent drawings use the default composite mode.

  4. **Save Cleared State to History**:
     - Captures the cleared canvas state and resets `drawingHistory` to contain only this state.
     - Sets `currentHistoryStep` to `0`, indicating the initial (cleared) state.

---

### Save Mask

```javascript
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
```

#### Explanation:

- **Purpose**:
  - Processes the drawn mask and saves it as a black mask image compatible with the API.

- **Steps**:
  1. **Access Canvas and Context**:
     - Retrieves the drawing canvas and its 2D context.

  2. **Create Temporary Canvas**:
     - A new canvas is created to process the mask image separately.
     - This is necessary to convert the blue mask to a black mask as required by the API.

  3. **Retrieve Image Data**:
     - `ctx.getImageData(...)`: Gets the pixel data from the drawing canvas.

  4. **Convert Blue to Black**:
     - Iterates through each pixel's RGBA values.
     - If a pixel has any opacity (`alpha > 0`), it's converted to black by setting the red, green, and blue channels to `0`.
     - The alpha channel (`data[i+3]`) remains unchanged to preserve transparency.

  5. **Render to Temporary Canvas**:
     - `tempCtx.putImageData(...)`: Draws the modified image data onto the temporary canvas.

  6. **Convert to Blob**:
     - `tempCanvas.toBlob(...)`: Converts the canvas content to a binary blob in PNG format.

  7. **Create File Object**:
     - A `File` object is created from the blob for easier handling and uploading.

  8. **Create Preview URL**:
     - `URL.createObjectURL(blob)`: Generates a URL representing the blob, useful for previews.

  9. **Trigger Save Callback**:
     - `onSaveMask(...)`: Invokes the callback provided via props with the mask data, including the file, a preview image (using the original blue version), and the file name.

---

## 6. Rendering the Component

The component's `return` statement defines the UI. We'll break it down into sections.

### Toolbar: Drawing Tools and Actions

```jsx
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
```

#### Explanation:

- **Container**:
  - `div` with Flexbox utilities classes to arrange child elements horizontally with space between them.

- **Title**:
  - Displays a brief instruction: "Draw Mask - Blue areas will be edited".

- **Toolbar Buttons and Controls**:
  1. **Brush Size Selector (`select`)**:
     - Allows the user to choose the brush thickness: Thin (15), Medium (30), Thick (60).
     - `onChange`: Updates the `brushWidth` state when a different option is selected.

  2. **Brush Button**:
     - Toggles the drawing tool to `"brush"`.
     - **Styling**:
       - If the current `drawingTool` is `"brush"`, the button has a blue background and text.
       - Otherwise, it has a gray background and text.
     - **Icon**:
       - Displays a paintbrush icon from `lucide-react`.

  3. **Eraser Button**:
     - Toggles the drawing tool to `"eraser"`.
     - **Styling**:
       - Similar to the brush button, but for the eraser tool.
     - **Icon**:
       - Displays an eraser icon.

  4. **Undo Button**:
     - Triggers the `handleUndo` function to revert the last action.
     - **Styling**:
       - Gray background with hover effect.
     - **Disabled State**:
       - Disabled when there's no history to undo (`currentHistoryStep <= 0`).
     - **Icon**:
       - Displays an undo icon.

  5. **Clear All Button**:
     - Triggers the `handleClear` function to clear the canvas.
     - **Styling**:
       - Similar to the Undo button.
     - **Icon**:
       - Displays a trash can icon.

---

### Canvas Containers

```jsx
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
```

#### Explanation:

- **Container**:
  - `div` with relative positioning and flexible sizing to house both canvases.

- **Original Image Canvas**:
  - **Canvas Element**:
    - `ref={sourceCanvasRef}`: Links to the `sourceCanvasRef` for drawing the original image.
    - **Styling**:
      - `absolute`: Positioned absolutely within the container.
      - `top-0 left-0`: Positioned at the top-left corner.
      - `w-full h-full`: Occupies the full width and height of the container.
      - `object-contain`: Ensures the image scales properly without distortion.

- **Drawing Canvas**:
  - **Canvas Element**:
    - `ref={canvasRef}`: Links to the `canvasRef` for drawing the mask.
    - **Styling**:
      - Similar to the source canvas, but with `z-10` to layer it above the source image.

  - **Event Handlers**:
    - `onMouseDown`, `onMouseMove`, `onMouseUp`, `onMouseLeave`: Handle mouse interactions.
    - `onTouchStart`, `onTouchMove`, `onTouchEnd`: Handle touch interactions for mobile devices.
    - These event handlers connect user interactions to the corresponding drawing functions (`startDrawing`, `draw`, `stopDrawing`).

---

### Action Buttons: Cancel and Save

```jsx
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
```

#### Explanation:

- **Container**:
  - `div` with Flexbox utilities to align buttons to the right with spacing.

- **Cancel Button**:
  - **Functionality**:
    - Calls `onCancelDrawing` prop function when clicked.
  - **Styling**:
    - Gray background with hover effect.
    - Rounded corners and padding for better UX.
  - **Label**:
    - Displays the text "Cancel".

- **Save Mask Button**:
  - **Functionality**:
    - Calls `handleSaveMask` to process and save the mask.
  - **Styling**:
    - Blue background with hover effect.
    - White text for contrast.
    - Flex layout to align the icon and text.
  - **Icon and Label**:
    - Displays a save icon followed by the text "Save Mask".

---

## 7. Complete Code

For reference, here's the entire `MaskDrawingCanvas` component with all the explained parts combined:

```javascript
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
```

---

## Summary

We've dissected the `MaskDrawingCanvas` component into its fundamental parts, covering:

- **Imports and Setup**: Including necessary React Hooks and icon components.
- **Component Definition**: Understanding props and default values.
- **State and References**: Managing drawing state, tool selection, brush size, and history for undo functionality.
- **Effect Hooks**: Setting up the canvas when the source image loads.
- **Helper Functions**: Handling drawing actions, undoing, clearing, and saving the mask.
- **Rendering the UI**: Creating a user-friendly interface with toolbars, canvases, and action buttons.

This component provides a robust foundation for users to draw masks over images, offering features that enhance usability and functionality. By understanding each part, you can customize and extend this component to fit your specific needs.

If you have any further questions or need clarification on specific parts, feel free to ask!