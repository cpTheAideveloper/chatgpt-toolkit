# Minimal Social Media Content Planner App

This guide will show you how to build a simple social media content planner app that leverages OpenAI's API to generate platform-specific content.

## Project Structure

Similar to the chat app tutorial, we'll have:
- A Node.js backend with Express
- A React frontend with Tailwind CSS
- OpenAI integration to generate content

## Part 1: Backend Implementation

### Step 1: Set Up Project Structure

Follow the same initial setup as in the chat app tutorial to create your project folders and initialize the project.

### Step 2: Create the OpenAI Helper

Use the same OpenAI helper from the tutorial, but let's modify the `generateChatResponse` function to provide better social media content instructions:

```javascript
// utils/openAiHelpers.js
import OpenAI from "openai/index.mjs";
import { config } from "dotenv";
config();

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const NO_TEMPERATURE_MODELS = ['o1', 'o1-mini', 'o3-mini', 'o1-pro'];

export async function generateChatResponse({
  model = "gpt-4o-mini",
  instructions = "You are a helpful assistant.",
  messages = [],
  userMessage,
  temperature = 1,
  stream = false,
}) {
  try {
    if (!openai?.responses?.create) {
      throw new Error("OpenAI client or responses.create method is missing");
    }

    const input = userMessage ? [...messages, userMessage] : messages;

    const payload = {
      model,
      instructions,
      input,
    };

    if (stream) payload.stream = true;
    if (!NO_TEMPERATURE_MODELS.includes(model)) {
      payload.temperature = temperature;
    } else {
      console.log(`Model ${model} doesn't support temperature — omitting it.`);
    }

    const response = await openai.responses.create(payload);

    return stream ? response : response.output_text;
  } catch (error) {
    console.error("Error in generateChatResponse:", error);
    throw error;
  }
}
```

### Step 3: Create Content Planner Route

Create a file called `contentRoutes.js` in the routes folder:

```javascript
// routes/contentRoutes.js
import express from 'express';
import { generateChatResponse } from "../utils/openAiHelpers.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { topic, platform, tone, targetAudience, keyPoints, contentLength } = req.body;
    
    // Craft a detailed prompt for the AI
    const platformInstructions = getPlatformInstructions(platform);
    
    const instructions = `You are an expert social media content creator. 
    Create engaging, platform-optimized content that follows best practices for the specified platform.
    Make content that stands out and drives engagement.`;
    
    const userMessage = { 
      role: "user", 
      content: `Create a ${platform} post about ${topic}.
      
      Platform: ${platform}
      Tone: ${tone || 'Professional'}
      Target Audience: ${targetAudience || 'General'}
      Key Points to Include: ${keyPoints || 'Use your best judgment'}
      Content Length: ${contentLength || 'Standard for the platform'}
      
      ${platformInstructions}
      
      Format the content exactly as it should appear on ${platform}, including any hashtags, emojis, or special formatting that works well on this platform.`
    };
    
    const result = await generateChatResponse({
      userMessage,
      instructions,
      model: "gpt-4o-mini",
      temperature: 0.7,
    });
    
    res.status(200).json({ 
      role: "assistant", 
      content: result,
      platform: platform
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Error processing request" });
  }
});

// Helper function to get platform-specific instructions
function getPlatformInstructions(platform) {
  const instructions = {
    'Twitter': 'Keep it under 280 characters. Include relevant hashtags. Consider ending with a question or call to action for engagement.',
    
    'Instagram': 'Create a visually descriptive post. Include a compelling first line to hook readers before the "See more" cutoff. End with relevant hashtags (up to 30 max).',
    
    'LinkedIn': 'Write in a professional tone. Use paragraph breaks for readability. Include industry insights and professional value. Minimal hashtags (3-5) are appropriate.',
    
    'Facebook': 'Write in a conversational tone. Encourage engagement with questions or calls to action. Aim for 1-3 paragraphs for optimal engagement.',
    
    'TikTok': 'Create a short, catchy script that hooks the audience in the first 3 seconds. Include trendy language and consider suggesting audio/trends that could accompany the content.',
    
    'Pinterest': 'Craft a headline-style description focusing on inspiration, DIY, or actionable value. Use keywords prominently for discoverability.',
  };
  
  return instructions[platform] || 'Optimize content for the platform following current best practices.';
}

export default router;
```

### Step 4: Update Server.js to Include the New Route

```javascript
// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import contentRoutes from './routes/contentRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/content', contentRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Part 2: Frontend Implementation

### Step 1: Create Content Planner Component

Create a file called `ContentPlanner.jsx` in your frontend's src/pages folder:

```jsx
// src/pages/ContentPlanner.jsx
import { useState } from "react";

function ContentPlanner() {
  const [formData, setFormData] = useState({
    topic: "",
    platform: "Twitter",
    tone: "Professional",
    targetAudience: "",
    keyPoints: "",
    contentLength: "Standard"
  });
  
  const [generatedContent, setGeneratedContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const platforms = [
    "Twitter", "Instagram", "LinkedIn", "Facebook", "TikTok", "Pinterest"
  ];
  
  const tones = [
    "Professional", "Casual", "Humorous", "Inspirational", "Educational", "Promotional"
  ];
  
  const contentLengths = [
    "Short", "Standard", "Detailed"
  ];
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.topic.trim()) {
      setError("Please enter a topic");
      return;
    }
    
    setLoading(true);
    setError("");
    setGeneratedContent(null);
    
    try {
      const response = await fetch("http://localhost:3001/api/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error("Failed to generate content");
      }
      
      const data = await response.json();
      setGeneratedContent(data);
    } catch (error) {
      console.error("Error:", error);
      setError("Error generating content. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const copyToClipboard = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(generatedContent.content);
      alert("Content copied to clipboard!");
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-white shadow p-4">
        <h1 className="text-xl font-bold text-gray-800">Social Media Content Planner</h1>
      </header>
      
      <div className="flex-1 p-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Form Section */}
          <div className="md:col-span-1">
            <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Topic/Product*</label>
                <input
                  type="text"
                  name="topic"
                  value={formData.topic}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  placeholder="What to post about?"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Platform*</label>
                <select
                  name="platform"
                  value={formData.platform}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  required
                >
                  {platforms.map(platform => (
                    <option key={platform} value={platform}>{platform}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Tone</label>
                <select
                  name="tone"
                  value={formData.tone}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                >
                  {tones.map(tone => (
                    <option key={tone} value={tone}>{tone}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Target Audience</label>
                <input
                  type="text"
                  name="targetAudience"
                  value={formData.targetAudience}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  placeholder="Who is this content for?"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Key Points</label>
                <textarea
                  name="keyPoints"
                  value={formData.keyPoints}
                  onChange={handleChange}
                  rows="3"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  placeholder="Important points to include (optional)"
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Content Length</label>
                <select
                  name="contentLength"
                  value={formData.contentLength}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                >
                  {contentLengths.map(length => (
                    <option key={length} value={length}>{length}</option>
                  ))}
                </select>
              </div>
              
              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? "Generating..." : "Generate Content"}
              </button>
            </form>
          </div>
          
          {/* Content Display Section */}
          <div className="md:col-span-2">
            {loading ? (
              <div className="h-full flex items-center justify-center bg-white p-4 rounded-lg shadow">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  <p className="mt-2 text-gray-600">Creating your content...</p>
                </div>
              </div>
            ) : generatedContent ? (
              <div className="bg-white p-4 rounded-lg shadow h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">
                    {generatedContent.platform} Content
                  </h2>
                  <button
                    onClick={copyToClipboard}
                    className="text-sm bg-gray-100 hover:bg-gray-200 py-1 px-3 rounded"
                  >
                    Copy
                  </button>
                </div>
                <div className="flex-1 overflow-auto">
                  <div className={`p-4 rounded-lg ${getPlatformClass(generatedContent.platform)}`}>
                    <pre className="whitespace-pre-wrap font-sans text-sm">
                      {generatedContent.content}
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center bg-white p-4 rounded-lg shadow">
                <p className="text-gray-500">
                  Fill out the form and click "Generate Content" to create platform-optimized content.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to get platform-specific styling
function getPlatformClass(platform) {
  const classes = {
    'Twitter': 'bg-blue-50 border border-blue-100',
    'Instagram': 'bg-purple-50 border border-purple-100',
    'LinkedIn': 'bg-blue-50 border border-blue-100',
    'Facebook': 'bg-indigo-50 border border-indigo-100',
    'TikTok': 'bg-gray-50 border border-gray-100',
    'Pinterest': 'bg-red-50 border border-red-100',
  };
  
  return classes[platform] || 'bg-gray-50 border border-gray-100';
}

export default ContentPlanner;
```

### Step 2: Update App.js

```jsx
// src/App.js
import ContentPlanner from './pages/ContentPlanner';

function App() {
  return (
    <div className="App">
      <ContentPlanner />
    </div>
  );
}

export default App;
```

## Part 3: Running Your Application

### Step 1: Start the Backend

From the backend directory:

```bash
npm start
```

### Step 2: Start the Frontend

From the frontend directory:

```bash
npm start
```

## How to Use the Content Planner

1. Fill out the form with your content details:
   - **Topic/Product**: What you want to create content about
   - **Platform**: Select the social media platform
   - **Tone**: Choose the writing style
   - **Target Audience**: Specify who the content is for
   - **Key Points**: Include specific points you want mentioned
   - **Content Length**: Choose how detailed the content should be

2. Click "Generate Content" to create your platform-specific post

3. Use the "Copy" button to copy the content to your clipboard

4. Paste directly to your chosen social media platform

## Customization Opportunities

The basic app is minimal but functional. Here are some ways you could extend it:

1. **Multiple Platform Generation**: Add option to generate content for multiple platforms at once

2. **Content Calendar**: Add scheduling and calendar features

3. **Image Suggestions**: Integrate DALL-E to generate accompanying images

4. **Content History**: Save generated content for future reference

5. **Content Analytics**: Add basic analytics predictions

6. **Hashtag Research**: Integrate with a hashtag research tool

## Troubleshooting

If you encounter issues:

- Ensure your OpenAI API key is correct
- Check that both backend and frontend servers are running
- Verify the API endpoints match in both frontend and backend code
- Check browser console for any JavaScript errors
- Make sure all dependencies are installed