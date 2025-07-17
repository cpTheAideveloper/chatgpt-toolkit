# PDF Summarizer App: Simple Implementation Guide

This guide will show you how to build a simple PDF summarizer application that leverages OpenAI's API to automatically generate concise summaries of uploaded PDF documents.

## Project Overview

The PDF Summarizer App allows users to:
- Upload PDF documents
- Generate comprehensive summaries with a single click
- View and copy the generated summaries
- Customize the length and style of summaries

## Part 1: Backend Implementation

### Step 1: Set Up File Handler

We'll use the file handler function you've already implemented:

```javascript
// utils/openAiHelpers.js
async function fileHanler(
  model = "gpt-4o-mini",
  message,
  instructions = "you are a helpful assistant",
  file
) {
  try {
    // Create a temporary file from the buffer
    const tempFilePath = await createTempFile(file);

    // Use the file path with createReadStream
    const uploadFile = await openai.files.create({
      file: fs.createReadStream(tempFilePath),
      purpose: "user_data",
    });

    console.log(`File uploaded to OpenAI with ID: ${uploadFile.id}`);

    const response = await openai.responses.create({
      model: model,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_file",
              file_id: uploadFile.id,
            },
            {
              type: "input_text",
              text: message,
            },
          ],
        },
      ],
      instructions: instructions,
    });

    // Clean up the temporary file
    await fs.promises.unlink(tempFilePath);

    return response.output_text;
  } catch (error) {
    console.error("Error in fileHanler:", error);
    throw error;
  }
}
```

### Step 2: Create the Temporary File Helper

```javascript
// utils/fileUtils.js
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';

export async function createTempFile(file) {
  const tempDir = path.join(os.tmpdir(), 'pdf-uploads');
  
  // Ensure temp directory exists
  try {
    await fs.mkdir(tempDir, { recursive: true });
  } catch (error) {
    // Ignore if directory already exists
  }
  
  // Create a unique filename
  const filename = `${uuidv4()}-${file.originalname || 'upload.pdf'}`;
  const filePath = path.join(tempDir, filename);
  
  // Write the file buffer to disk
  await fs.writeFile(filePath, file.buffer);
  
  return filePath;
}
```

### Step 3: Create the PDF Summarizer Route

```javascript
// routes/pdfRoutes.js
import express from 'express';
import multer from 'multer';
import { fileHanler } from '../utils/openAiHelpers.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/summarize", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const summaryLength = req.body.summaryLength || "medium"; // short, medium, long
    const summaryStyle = req.body.summaryStyle || "standard"; // standard, bullet, detailed
    
    if (!file) {
      return res.status(400).json({ error: "No PDF file received" });
    }
    
    // Validate file type
    if (file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: "File must be a PDF" });
    }
    
    // Craft the specific prompt for summarization
    const prompt = createSummaryPrompt(summaryLength, summaryStyle);
    
    // Set the system instructions
    const instructions = "You are an expert document analyzer specializing in creating clear, accurate summaries of PDF documents. Extract the main ideas, key points, and important details while maintaining the document's core message. Organize information logically and present it concisely.";
    
    // Process the file with OpenAI
    const summary = await fileHanler(
      "gpt-4o", // Use a capable model for document processing
      prompt,
      instructions,
      file
    );
    
    // Return the summary
    res.status(200).json({ 
      summary,
      fileName: file.originalname,
      fileSize: file.size,
      summaryLength,
      summaryStyle
    });
  } catch (error) {
    console.error("Error processing PDF:", error);
    res.status(500).json({ 
      error: "Error summarizing the PDF file", 
      message: error.message 
    });
  }
});

// Helper function to create summary prompts
function createSummaryPrompt(length, style) {
  let prompt = "Please summarize this document";
  
  // Add length specification
  if (length === "short") {
    prompt += " in a concise way, focusing only on the most critical information. Keep it to 1-2 paragraphs.";
  } else if (length === "medium") {
    prompt += " with moderate detail, covering the main points and key supporting information. Aim for 3-4 paragraphs.";
  } else if (length === "long") {
    prompt += " thoroughly, including all important details, arguments, and conclusions. Provide a comprehensive summary that captures the full scope of the document.";
  }
  
  // Add style specification
  if (style === "bullet") {
    prompt += " Format the summary as a bulleted list with clear, concise points.";
  } else if (style === "detailed") {
    prompt += " Include section-by-section breakdown with headings that match the document's structure.";
  } else {
    prompt += " Use a standard paragraph format with clear organization.";
  }
  
  prompt += " Maintain the document's tone and highlight any key findings, recommendations, or conclusions.";
  
  return prompt;
}

export default router;
```

### Step 4: Update Server.js

```javascript
// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pdfRoutes from './routes/pdfRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Set higher limit for file uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/pdf', pdfRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Part 2: Frontend Implementation

### Step 1: Create PDF Summarizer Component

This simple React component provides a clean interface for summarizing PDFs:

```jsx
// src/pages/PdfSummarizer.jsx
import React, { useState } from 'react';

function PdfSummarizer() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summaryLength, setSummaryLength] = useState('medium');
  const [summaryStyle, setSummaryStyle] = useState('standard');
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Please select a PDF file');
        return;
      }
      
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setFileSize(selectedFile.size);
      setError('');
    }
  };
  
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a PDF file');
      return;
    }
    
    setLoading(true);
    setSummary('');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('summaryLength', summaryLength);
    formData.append('summaryStyle', summaryStyle);
    
    try {
      const response = await fetch('http://localhost:3001/api/pdf/summarize', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to summarize PDF');
      }
      
      const data = await response.json();
      setSummary(data.summary);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'Error summarizing PDF');
    } finally {
      setLoading(false);
    }
  };
  
  const clearAll = () => {
    setFile(null);
    setFileName('');
    setFileSize(0);
    setSummary('');
    setError('');
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary);
    alert('Summary copied to clipboard!');
  };
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h1 className="text-3xl font-bold text-center text-gray-800">PDF Summarizer</h1>
          <p className="text-center text-gray-600 mt-2">Upload a PDF and get an AI-generated summary</p>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                id="file-upload"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              
              {!fileName ? (
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <p className="mt-2 text-sm text-gray-600">Click to upload a PDF file</p>
                    <p className="text-xs text-gray-500 mt-1">Max size: 10MB</p>
                  </div>
                </label>
              ) : (
                <div>
                  <svg className="w-12 h-12 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <p className="font-medium mt-2">{fileName}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(fileSize)}</p>
                  <button
                    type="button"
                    onClick={clearAll}
                    className="mt-3 text-sm text-red-600 hover:text-red-800"
                  >
                    Remove file
                  </button>
                </div>
              )}
            </div>
            
            {/* Summary Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Summary Length</label>
                <select
                  value={summaryLength}
                  onChange={(e) => setSummaryLength(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                >
                  <option value="short">Short (1-2 paragraphs)</option>
                  <option value="medium">Medium (3-4 paragraphs)</option>
                  <option value="long">Long (Comprehensive)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Summary Style</label>
                <select
                  value={summaryStyle}
                  onChange={(e) => setSummaryStyle(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                >
                  <option value="standard">Standard (Paragraphs)</option>
                  <option value="bullet">Bullet Points</option>
                  <option value="detailed">Detailed (With Sections)</option>
                </select>
              </div>
            </div>
            
            {error && (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded">{error}</div>
            )}
            
            <button
              type="submit"
              disabled={!file || loading}
              className={`w-full py-3 px-4 rounded-md shadow-sm text-white font-medium text-center ${
                !file || loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Summary...
                </div>
              ) : (
                "Summarize PDF"
              )}
            </button>
          </form>
        </div>
        
        {/* Summary Results */}
        {summary && (
          <div className="border-t border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Summary</h2>
              <button
                onClick={copyToClipboard}
                className="text-sm bg-gray-100 hover:bg-gray-200 py-1 px-3 rounded flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"></path>
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"></path>
                </svg>
                Copy
              </button>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 prose max-w-none">
              <div className="whitespace-pre-wrap">
                {summary}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PdfSummarizer;
```

### Step 2: Update App.js

```jsx
// src/App.js
import PdfSummarizer from './pages/PdfSummarizer';

function App() {
  return (
    <div className="App bg-gray-100 min-h-screen py-8">
      <PdfSummarizer />
    </div>
  );
}

export default App;
```

## Part 3: Running the Application

### Step 1: Install Dependencies

Make sure you have all the necessary dependencies:

```bash
# Backend
npm install express cors dotenv multer fs-extra uuid openai

# Frontend
npm install react react-dom
```

### Step 2: Start the Backend

From the backend directory:

```bash
npm start
```

### Step 3: Start the Frontend

From the frontend directory:

```bash
npm start
```

## How to Use the PDF Summarizer

1. **Upload a PDF** by clicking on the upload area or dragging a file onto it
2. **Select Summary Options**:
   - **Length**: Short, Medium, or Long summary
   - **Style**: Standard (paragraphs), Bullet Points, or Detailed (with sections)
3. **Click "Summarize PDF"** to generate the summary
4. **View and Copy** the generated summary

## Key Features

- **Simple User Interface**: Clean, intuitive design for easy usage
- **Customizable Summaries**: Options for length and formatting style
- **Visual Feedback**: Clear loading states and file information
- **Error Handling**: Validation for file types and helpful error messages
- **Copy Functionality**: One-click copying of the generated summary

## Best Practices for PDF Summarization

1. **Use Appropriate PDF Types**: The system works best with text-based PDFs rather than scanned documents
2. **Choose the Right Length**: Select "Short" for quick overviews, "Medium" for general use, and "Long" for detailed summaries
3. **Consider File Size**: Large PDFs may take longer to process and might exceed token limits
4. **Check Accuracy**: Always verify critical information in the summary against the original document
5. **Try Different Styles**: The bullet point format works well for technical documents, while standard paragraphs work better for narrative content

## Extending the Application

To enhance this basic PDF summarizer, consider adding:

1. **Multiple File Support**: Allow users to upload and summarize multiple PDFs at once
2. **Advanced Options**: Add tone controls or focus areas for summaries
3. **Export Functionality**: Allow export to Word, Markdown, or other formats
4. **Summary History**: Save previously generated summaries
5. **Document Comparison**: Compare and summarize differences between documents

This simple PDF summarizer demonstrates how you can leverage AI to automate document processing and save time when reviewing lengthy documents.