# How to Use the PDF File Handler with OpenAI

This guide explains how to use the PDF file handler feature to analyze documents with OpenAI's models.

## Overview

The PDF file handler allows you to upload PDF documents and ask questions about their content. The AI will analyze the document and provide responses based on the information contained within it.

## Backend Setup

The file handler is already implemented in the backend. Here's a simplified explanation of how it works:

1. It receives a PDF file and user input
2. Uploads the file to OpenAI
3. Sends the file and your question to an AI model
4. Returns the AI's response about the document

## How to Use It

### 1. Send a File for Analysis

#### Frontend Example

```jsx
import React, { useState } from 'react';

function PDFAnalyzer() {
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file || !question) {
      alert('Please select a file and enter a question');
      return;
    }

    setLoading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userInput', question);
    
    try {
      const response = await fetch('http://localhost:3001/api/newfilehandler', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Server error');
      }
      
      const data = await response.json();
      setResult(data.content);
    } catch (error) {
      console.error('Error:', error);
      alert('Error analyzing the PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">PDF Analyzer</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2 font-medium">Upload PDF</label>
          <input 
            type="file" 
            accept=".pdf"
            onChange={handleFileChange}
            className="border p-2 w-full"
          />
        </div>
        
        <div>
          <label className="block mb-2 font-medium">What would you like to know about this document?</label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="border p-2 w-full h-24"
            placeholder="Summarize this document"
            required
          />
        </div>
        
        <button 
          type="submit" 
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? 'Analyzing...' : 'Analyze PDF'}
        </button>
      </form>
      
      {result && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Result</h2>
          <div className="border p-4 bg-gray-50 rounded whitespace-pre-wrap">
            {result}
          </div>
        </div>
      )}
    </div>
  );
}

export default PDFAnalyzer;
```

### 2. Example Questions to Ask

You can ask a variety of questions about your PDF documents, such as:

- "Summarize this document"
- "What are the key points in this report?"
- "Extract all the dates mentioned in this document"
- "What are the main conclusions of this research paper?"
- "Find all mentions of [specific term] in this document"
- "Extract the tables from this document"
- "What action items are mentioned in this meeting minutes?"

### 3. Implementation Notes

The system works best with:

- Clearly formatted PDFs
- Documents under 50 pages (due to token limitations)
- Specific, clear questions

## Complete Example: Document Analyzer App

Here's a complete example of a Document Analyzer app that you can implement:

```jsx
import React, { useState } from 'react';

function DocumentAnalyzer() {
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');

  const commonQuestions = [
    "Summarize this document",
    "What are the key points in this document?",
    "Extract all tables and numerical data",
    "What are the main conclusions?",
    "List all defined terms and their definitions",
    "Identify any action items or next steps"
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleQuestionSelect = (q) => {
    setQuestion(q);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file || !question) {
      alert('Please select a file and enter a question');
      return;
    }

    setLoading(true);
    setResult('');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userInput', question);
    
    try {
      const response = await fetch('http://localhost:3001/api/newfilehandler', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Server error');
      }
      
      const data = await response.json();
      setResult(data.content);
    } catch (error) {
      console.error('Error:', error);
      setResult(`Error analyzing the document: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Document Analyzer</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Input */}
          <div className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <input
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.docx,.doc,.txt"
              />
              
              {!fileName ? (
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="mt-2 text-sm text-gray-600">Click to upload a document</span>
                  </div>
                </label>
              ) : (
                <div>
                  <p className="text-sm font-medium">{fileName}</p>
                  <div className="flex justify-center mt-2">
                    <button
                      onClick={() => {
                        setFile(null);
                        setFileName('');
                      }}
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium">Ask a question about this document</label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2 h-20"
                placeholder="What would you like to know about this document?"
              />
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium">Common questions</label>
              <div className="grid grid-cols-1 gap-2">
                {commonQuestions.map((q, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleQuestionSelect(q)}
                    className="text-left text-sm px-3 py-1.5 border border-gray-200 rounded hover:bg-gray-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={loading || !file || !question}
              className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                loading || !file || !question
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Analyzing..." : "Analyze Document"}
            </button>
          </div>
          
          {/* Right Column - Results */}
          <div className="bg-gray-50 border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-3">Results</h2>
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : result ? (
              <div className="prose max-w-none overflow-auto max-h-96">
                <div className="whitespace-pre-wrap">{result}</div>
              </div>
            ) : (
              <div className="text-center py-16 text-gray-500">
                <p>Upload a document and ask a question to see results</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentAnalyzer;
```

## How to Integrate with Your Existing App

### 1. Install the necessary dependencies

```bash
npm install fs-extra
```

### 2. Create a utility function for handling temporary files

```javascript
// utils/fileUtils.js
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';

export async function createTempFile(file) {
  const tempDir = path.join(os.tmpdir(), 'app-uploads');
  
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

### 3. Add the route to your server.js file

```javascript
import express from 'express';
import multer from 'multer';
import { fileHanler } from './utils/openAiHelpers.js';

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// ...other setup code...

app.post("/api/newfilehandler", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const userInput = req.body.userInput;
    const systemInstructions =
      req.body.systemInstructions ||
      "You are a helpful assistant with access to web search. Provide accurate and up-to-date information based on search results.";
    const model = req.body.model || "gpt-4o";

    if (!file) {
      return res.status(400).json({ error: "No file received" });
    }

    const result = await fileHanler(model, userInput, systemInstructions, file);

    // Respond with the result
    res.status(200).json({ role: "assistant", content: result });
  } catch (error) {
    console.error("Error processing PDF:", error);
    res.status(500).json({ error: "Error processing the PDF file" });
  }
});

// ...rest of your server code...
```

### 4. Add the Document Analyzer component to your React application

```jsx
import DocumentAnalyzer from './pages/DocumentAnalyzer';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Chat />} />
        <Route path="/search" element={<SearchChat />} />
        <Route path="/analyze-document" element={<DocumentAnalyzer />} />
      </Routes>
    </div>
  );
}
```

## Tips for Best Results

1. **Be specific with your questions.** Instead of "What does this say?", ask "What are the three main conclusions in this research report?"

2. **Upload clear, well-formatted documents.** OCR works best on clean, clearly formatted text.

3. **Process appropriate file sizes.** Extremely large documents may exceed token limits or take a long time to process.

4. **Consider breaking down complex tasks.** For very detailed analysis, consider asking a series of focused questions rather than one extremely broad question.

5. **Verify important information.** While the AI is very capable, always verify critical information extracted from documents.