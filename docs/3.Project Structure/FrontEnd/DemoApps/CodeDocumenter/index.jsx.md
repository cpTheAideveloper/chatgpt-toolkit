
## Imports

```jsx
import { useState, useRef } from "react";
import { Upload, Code, FileText, X } from "lucide-react";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { Banner } from "@/components/Banner";
import { CodePanel } from "./CodePanel";
import { DocumentationPanel } from "./DocumentationPanel";
import { Pagination } from "./Pagination";
```

**Explanation:**

- **React Hooks:**
  - `useState`: Allows you to add state to functional components.
  - `useRef`: Provides a way to reference DOM elements directly.

- **Icons:**
  - Imported from `lucide-react`, these provide visual icons:
    - `Upload`: Icon for uploading files.
    - `Code`: Icon representing code files.
    - `FileText`: Icon for file documentation.
    - `X`: Icon for clearing or removing items.

- **Components:**
  - `LoadingIndicator`: Shows a loading animation.
  - `Banner`: Displays informational messages or promotions.
  - `CodePanel`: Displays the original code.
  - `DocumentationPanel`: Shows the AI-generated documentation.
  - `Pagination`: Handles page navigation through multiple files.

---

## Component Definition

```jsx
export function CodeDocumenter() {
  // ... component logic
}
```

This line defines and exports a React functional component named `CodeDocumenter`. This means it can be imported and used in other parts of your application.

### State Variables

```jsx
// File State
const [selectedFiles, setSelectedFiles] = useState([]);
const [isDragging, setIsDragging] = useState(false);

// Results State
const [results, setResults] = useState([]);
const [currentIndex, setCurrentIndex] = useState(0);
const [loading, setLoading] = useState(false);

// UI State
const [showBanner, setShowBanner] = useState(true);
const [viewMode, setViewMode] = useState("split"); // split, code, docs
```

**Explanation:**

- **File State:**
  - `selectedFiles`: Stores the list of files the user has selected for upload.
  - `isDragging`: Indicates whether a file is being dragged over the upload area (for visual feedback).

- **Results State:**
  - `results`: Stores the results returned from the backend after processing the files. Each result typically contains the original code and its documentation.
  - `currentIndex`: Tracks which file/result is currently being viewed, useful for pagination.
  - `loading`: Indicates whether the application is currently processing the files (shows a loading indicator).

- **UI State:**
  - `showBanner`: Controls the visibility of the informational banner.
  - `viewMode`: Determines how to display the results. It can be:
    - `"split"`: Shows both code and documentation side by side.
    - `"code"`: Shows only the code.
    - `"docs"`: Shows only the documentation.

### References

```jsx
// Refs
const fileInputRef = useRef(null);
```

**Explanation:**

- `fileInputRef`: A reference to the hidden file input element. This allows the component to programmatically trigger a click on the file input when the user clicks on the upload area.

### Event Handlers

#### Handle File Selection Change

```jsx
const handleFileChange = (e) => {
  const files = Array.from(e.target?.files || []);
  if (files.length === 0) return;

  // Only accept up to 5 files
  if (files.length > 5) {
    alert("Please select a maximum of 5 files");
    return;
  }

  setSelectedFiles(files);
  setShowBanner(false);
};
```

**Explanation:**

- Triggered when the user selects files using the file input (either via clicking to browse or dragging and dropping).
- Converts the `FileList` from the input into an array.
- Checks if the user has selected more than 5 files:
  - If yes, alerts the user to select a maximum of 5 files.
- If valid, updates `selectedFiles` with the chosen files and hides the banner by setting `showBanner` to `false`.

#### Handle File Drop

```jsx
const handleFileDrop = (e) => {
  e.preventDefault();
  setIsDragging(false);

  const files = Array.from(e.dataTransfer.files || []);
  if (files.length === 0) return;

  // Only accept up to 5 files
  if (files.length > 5) {
    alert("Please select a maximum of 5 files");
    return;
  }

  setSelectedFiles(files);
  setShowBanner(false);
};
```

**Explanation:**

- Triggered when the user drops files into the designated drop area.
- Prevents the browser's default behavior (like opening the file).
- Converts the dropped files into an array.
- Validates the number of files (max 5), alerts if exceeded.
- Updates `selectedFiles` and hides the banner if valid.

#### Remove All Selected Files

```jsx
const removeFiles = () => {
  setSelectedFiles([]);
  setResults([]);
  if (fileInputRef.current) {
    fileInputRef.current.value = "";
  }
  setShowBanner(true);
};
```

**Explanation:**

- Clears all selected files and results.
- Resets the file input's value to allow re-uploading the same files if needed.
- Shows the informational banner again.

#### Process the Files

```jsx
const processFiles = async () => {
  if (selectedFiles.length === 0) return;

  setLoading(true);

  try {
    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append("files", file);
    });

    const response = await fetch("http://localhost:8000/code-documenter/analyze", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    setResults(data.results);
    setCurrentIndex(0);
  } catch (error) {
    console.error("Error processing files:", error);
    alert(`Error processing files: ${error.message}`);
  } finally {
    setLoading(false);
  }
};
```

**Explanation:**

- Initiates the processing of selected files.
- Sets `loading` to `true` to show the loading indicator.
- Creates a `FormData` object and appends all selected files to it.
- Sends a `POST` request to the backend server (`http://localhost:8000/code-documenter/analyze`) with the form data.
- Checks if the response is successful:
  - If not, throws an error.
- If successful, parses the JSON response and updates `results` with the returned data.
- Resets `currentIndex` to `0` to show the first result.
- Handles any errors by logging them and alerting the user.
- Finally, sets `loading` back to `false` to hide the loading indicator.

#### Change Current File Being Viewed

```jsx
const handlePageChange = (newIndex) => {
  if (newIndex >= 0 && newIndex < results.length) {
    setCurrentIndex(newIndex);
  }
};
```

**Explanation:**

- Changes the currently viewed file/documentation based on the new index.
- Ensures the new index is within the valid range.

#### Navigate to Next Page

```jsx
const nextPage = () => {
  if (currentIndex < results.length - 1) {
    setCurrentIndex(currentIndex + 1);
  }
};
```

**Explanation:**

- Moves to the next file/documentation if not already on the last one.

#### Navigate to Previous Page

```jsx
const prevPage = () => {
  if (currentIndex > 0) {
    setCurrentIndex(currentIndex - 1);
  }
};
```

**Explanation:**

- Moves to the previous file/documentation if not already on the first one.

#### Toggle View Mode

```jsx
const toggleViewMode = (mode) => {
  setViewMode(mode);
};
```

**Explanation:**

- Changes the `viewMode` state to one of `"split"`, `"code"`, or `"docs"`.
- This controls how the code and documentation are displayed.

---

## Rendering the UI

The `return` statement defines what the UI looks like based on the current state.

```jsx
return (
  <div className="flex flex-col h-screen bg-gray-50">
    {/* Header with controls */}
    <header className="bg-white border-b border-gray-200 py-4 px-6">
      {/* Header content */}
    </header>
    
    {/* Main content area */}
    <div className="flex-1 overflow-hidden">
      {/* Conditional rendering based on state */}
    </div>
  </div>
);
```

The main container is a full-height (`h-screen`) flex container with a light gray background (`bg-gray-50`). It contains two main sections:

1. **Header**: Contains the title and control buttons.
2. **Main Content Area**: Displays different content based on the application state (upload area, loading indicator, results, etc.).

### Header

```jsx
<header className="bg-white border-b border-gray-200 py-4 px-6">
  <div className="flex justify-between items-center">
    <h1 className="text-2xl font-bold text-gray-800">AI Code Documenter</h1>
    
    {selectedFiles.length > 0 && !loading && results.length === 0 && (
      <button
        onClick={processFiles}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
      >
        <FileText size={16} />
        Generate Documentation
      </button>
    )}
    
    {results.length > 0 && (
      <div className="flex gap-2">
        {/* View Mode Buttons */}
      </div>
    )}
  </div>
</header>
```

**Explanation:**

- **Title:** Displays "AI Code Documenter" prominently.
- **Generate Documentation Button:**
  - Visible only when there are selected files, not currently loading, and results haven't been fetched yet.
  - When clicked, it invokes the `processFiles` function to start processing.
- **View Mode Buttons:**
  - Visible only when there are results available.
  - Allows users to switch between different view modes (`split`, `code`, `docs`).

### View Mode Buttons

```jsx
<button
  onClick={() => toggleViewMode("split")}
  className={`px-3 py-1.5 rounded-md ${
    viewMode === "split" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
  }`}
>
  Split View
</button>
<button
  onClick={() => toggleViewMode("code")}
  className={`px-3 py-1.5 rounded-md ${
    viewMode === "code" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
  }`}
>
  Code Only
</button>
<button
  onClick={() => toggleViewMode("docs")}
  className={`px-3 py-1.5 rounded-md ${
    viewMode === "docs" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
  }`}
>
  Docs Only
</button>
```

**Explanation:**

- Three buttons allow the user to switch between different view modes.
- The active view mode button is highlighted with a blue background; others have a gray background.
- Clicking a button changes the `viewMode` state accordingly.

### Main Content Area

```jsx
<div className="flex-1 overflow-hidden">
  {selectedFiles.length === 0 ? (
    // File Upload UI
  ) : loading ? (
    // Loading UI
  ) : results.length > 0 ? (
    // Results UI with pagination
  ) : (
    // Selected files, but not yet processed
  )}
</div>
```

**Explanation:**

The main content area changes based on the application's state:

1. **No Files Selected (`selectedFiles.length === 0`):** Shows the file upload interface.
2. **Loading (`loading` is `true`):** Displays a loading indicator.
3. **Results Available (`results.length > 0`):** Shows the code and documentation with pagination controls.
4. **Files Selected but Not Processed:** Displays the list of selected files with options to cancel or process them.

Let's dive into each of these sections.

#### File Upload Section

```jsx
<div
  className={`
    relative flex flex-col items-center justify-center
    h-full rounded-xl m-6 border-2 border-dashed
    transition-all duration-200
    ${isDragging ? "border-blue-400 bg-blue-50" : "border-gray-300 bg-white hover:bg-gray-50"}
    p-8
  `}
  onDrop={handleFileDrop}
  onDragOver={(e) => {
    e.preventDefault();
    setIsDragging(true);
  }}
  onDragLeave={() => setIsDragging(false)}
  onClick={() => fileInputRef.current?.click()}
>
  <div className="text-center cursor-pointer">
    <Upload size={48} className="mx-auto mb-4 text-gray-400" />
    <h2 className="text-xl font-medium text-gray-700 mb-2">
      Upload your code files
    </h2>
    <p className="text-gray-600 mb-2">
      Drop up to 5 code files here, or click to browse
    </p>
    <p className="text-sm text-gray-400">
      Supports JavaScript, Python, Java, C#, Go, Rust, and more
    </p>
  </div>
  <input
    ref={fileInputRef}
    type="file"
    accept=".js,.jsx,.ts,.tsx,.py,.java,.c,.cpp,.cs,.go,.rs,.php,.rb"
    multiple
    className="hidden"
    onChange={handleFileChange}
  />
</div>
```

**Explanation:**

- **Container (`div`):**
  - Styled to look like a drop area with dashed borders.
  - Changes appearance when files are being dragged over it (`isDragging`).
  - Handles drag-and-drop events:
    - `onDrop`: Handles the drop action.
    - `onDragOver`: Prevents default behavior and sets `isDragging` to `true`.
    - `onDragLeave`: Resets `isDragging` when the drag leaves the area.
  - `onClick`: Simulates a click on the hidden file input, opening the file browser.

- **Content:**
  - **Upload Icon:** Visual representation for uploading.
  - **Heading:** "Upload your code files".
  - **Instructions:** Guides the user to drop files or click to browse.
  - **Supported File Types:** Lists the acceptable file extensions.

- **Hidden File Input:**
  - `type="file"`: Allows users to select files.
  - `accept`: Specifies allowed file extensions (JavaScript, Python, Java, etc.).
  - `multiple`: Enables selecting multiple files at once.
  - `className="hidden"`: Hides the input from the UI; it's triggered programmatically.
  - `onChange`: When files are selected, `handleFileChange` is called.

#### Loading Indicator

```jsx
<div className="flex flex-col items-center justify-center h-full">
  <LoadingIndicator size="large" />
  <p className="mt-4 text-gray-600">
    Analyzing your code files and generating documentation...
  </p>
</div>
```

**Explanation:**

- **Loading Indicator (`LoadingIndicator`):**
  - Shows an animation to indicate that processing is in progress.
  - `size="large"`: Specifies the size of the loading animation.

- **Status Message:**
  - Informs the user that their files are being analyzed and documentation is being generated.

#### Results Display with Pagination

```jsx
<div className="h-full flex flex-col">
  {/* Pagination controls */}
  <div className="flex justify-between items-center p-4 bg-white border-b border-gray-200">
    <button
      onClick={removeFiles}
      className="px-3 py-1.5 text-red-600 hover:text-red-800 flex items-center gap-1"
    >
      <X size={16} />
      Clear All
    </button>
    
    <Pagination
      current={currentIndex + 1}
      total={results.length}
      onPrevious={prevPage}
      onNext={nextPage}
      onSelect={handlePageChange}
      files={results.map(r => r.filename)}
    />
  </div>
  
  {/* Content panels */}
  <div className="flex-1 overflow-hidden flex">
    {/* Code panel - show if in split or code view */}
    {(viewMode === "split" || viewMode === "code") && (
      <div className={`${viewMode === "split" ? "w-1/2" : "w-full"} h-full overflow-hidden`}>
        <CodePanel 
          code={results[currentIndex]?.rawCode || ""}
          filename={results[currentIndex]?.filename || ""}
        />
      </div>
    )}
    
    {/* Documentation panel - show if in split or docs view */}
    {(viewMode === "split" || viewMode === "docs") && (
      <div className={`${viewMode === "split" ? "w-1/2" : "w-full"} h-full overflow-hidden border-l border-gray-200`}>
        <DocumentationPanel 
          documentation={results[currentIndex]?.documentation || ""}
          filename={results[currentIndex]?.filename || ""}
        />
      </div>
    )}
  </div>
</div>
```

**Explanation:**

- **Pagination Controls:**
  - **Clear All Button:**
    - Allows the user to remove all selected files and results.
    - Styled with a red color to indicate its importance.
    - Includes an `X` icon from `lucide-react`.

  - **Pagination Component:**
    - Displays current page, total pages, and navigation buttons (previous, next).
    - Receives props like `current`, `total`, `onPrevious`, `onNext`, and `onSelect`.
    - `files`: An array of filenames for each result, used in the pagination component.

- **Content Panels:**
  - **Code Panel (`CodePanel`):**
    - Displays the original code of the currently selected file.
    - Shown if the `viewMode` is `"split"` or `"code"`.
    - Width:
      - `w-1/2`: Half the width when in split view.
      - `w-full`: Full width when in code-only view.

  - **Documentation Panel (`DocumentationPanel`):**
    - Displays the AI-generated documentation for the currently selected file.
    - Shown if the `viewMode` is `"split"` or `"docs"`.
    - Width:
      - `w-1/2`: Half the width when in split view.
      - `w-full`: Full width when in docs-only view.
    - Includes a left border for separation when in split view.

#### Selected Files Display

```jsx
<div className="h-full flex flex-col p-6">
  <div className="bg-white rounded-lg shadow p-6 mb-4">
    <h2 className="text-lg font-medium mb-4">Selected Files</h2>
    <ul className="space-y-2">
      {selectedFiles.map((file, index) => (
        <li key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
          <Code size={16} className="text-gray-500" />
          <span className="text-gray-700">{file.name}</span>
          <span className="text-xs text-gray-500 ml-auto">
            {(file.size / 1024).toFixed(1)} KB
          </span>
        </li>
      ))}
    </ul>
    
    <div className="mt-6 flex justify-between">
      <button
        onClick={removeFiles}
        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
      >
        Cancel
      </button>
      <button
        onClick={processFiles}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Process Files
      </button>
    </div>
  </div>
  
  {showBanner && (
    <Banner
      title="AI-Powered Code Documentation"
      description="Upload your code files and our AI will generate comprehensive documentation for each file. The analysis happens in parallel for faster results."
    />
  )}
</div>
```

**Explanation:**

- **Selected Files List:**
  - Displays a list of files the user has selected.
  - Each file entry includes:
    - A `Code` icon.
    - The file name.
    - The file size in kilobytes (KB), rounded to one decimal place.

- **Action Buttons:**
  - **Cancel Button:**
    - Allows the user to clear all selected files and results.
    - Styled with a border and gray text.
  - **Process Files Button:**
    - Initiates the processing of selected files.
    - Styled with a blue background to indicate primary action.

- **Banner:**
  - Displays an informational message about the feature.
  - Visible only if `showBanner` is `true`.
  - Provides context and benefits of using the AI-powered documentation feature.

---

## Component Documentation

At the end of the file, there's a multi-line comment that provides an overview of the `CodeDocumenter.jsx` component.

```jsx
/**
 * CodeDocumenter.jsx
 *
 * Main component for the Code Documentation feature that allows users to upload
 * multiple code files and receive AI-generated documentation for each.
 *
 * Key Features:
 * - Drag-and-drop or file browser interface for uploading up to 5 code files
 * - Parallel processing of files for faster results
 * - Split-view display of original code and generated documentation
 * - Pagination to navigate between multiple files
 * - View modes to focus on code, documentation, or both
 * 
 * State Management:
 * - Tracks selected files, processing state, and results
 * - Maintains view preferences (split/code/docs)
 * - Handles pagination between multiple file results
 * 
 * UX Flow:
 * 1. User uploads up to 5 code files
 * 2. Files are sent to backend for parallel AI documentation
 * 3. Results are displayed in split view with pagination
 * 4. User can navigate between files and toggle view modes
 *
 * Dependencies:
 * - @/components/LoadingIndicator
 * - @/components/Banner
 * - ./components/CodePanel
 * - ./components/DocumentationPanel
 * - ./components/Pagination
 */ 
```

**Explanation:**

- **Purpose:** Summarizes what the component does.
- **Key Features:** Lists the main functionalities provided by the component.
- **State Management:** Describes how the component manages its internal state.
- **UX Flow:** Outlines the user experience from uploading files to viewing results.
- **Dependencies:** Notes other components that `CodeDocumenter.jsx` relies on.

This section is invaluable for developers to quickly understand the component's responsibilities and its interactions with other parts of the application.

---

## Key Concepts Explained

For beginners, some of the concepts used in this component might need further explanation. Here's a quick overview:

### 1. React Functional Components

React allows you to define components as functions. These components can maintain their own state and manage side effects.

```jsx
function MyComponent() {
  // Component logic
  return <div>Content</div>;
}
```

### 2. React Hooks

- **`useState`:** Allows you to add state to functional components.

  ```jsx
  const [count, setCount] = useState(0);
  ```

- **`useRef`:** Provides a way to reference a DOM element directly.

  ```jsx
  const inputRef = useRef(null);
  
  // Later in JSX
  <input ref={inputRef} />
  ```

### 3. Conditional Rendering

React lets you render different UI elements based on certain conditions.

```jsx
{isLoggedIn ? <Dashboard /> : <Login />}
```

In `CodeDocumenter.jsx`, conditional rendering is used extensively to display different sections based on the state, such as showing the upload area, loading indicator, or results.

### 4. Event Handling

Handling user interactions like clicks, drags, and drops is essential.

```jsx
<button onClick={handleClick}>Click Me</button>
```

In the component, various event handlers manage file uploads and view changes.

### 5. Fetch API

Used to communicate with backend servers.

```jsx
const response = await fetch("http://example.com/api", {
  method: "POST",
  body: formData,
});
```

In `CodeDocumenter.jsx`, the `fetch` API sends the uploaded files to a backend server for processing.

### 6. CSS Classes and Styling

CSS classes are used to style components. Here, utility-first CSS classes like those from Tailwind CSS are used for styling.

```jsx
<div className="bg-white p-4 rounded">
  Content
</div>
```

### 7. FormData

A way to construct key/value pairs for form submissions, especially useful for file uploads.

```jsx
const formData = new FormData();
formData.append("file", selectedFile);
```

In the component, `FormData` bundles the selected files to send them to the backend.

---

## Summary

The `CodeDocumenter.jsx` component is a comprehensive React component that manages file uploads, interacts with a backend server to process those files, and displays the results with a user-friendly interface. It leverages React's hooks for state management, conditional rendering for dynamic UI updates, and various other React features to provide a seamless user experience.

By breaking down each part of the code, you've seen how different pieces come together to create a functional and interactive application. Whether you're handling file uploads, managing multiple states, or rendering different components based on user actions, understanding these fundamentals will help you build more complex and efficient React applications.

If you have any specific questions or need further clarification on any part of the code, feel free to ask!