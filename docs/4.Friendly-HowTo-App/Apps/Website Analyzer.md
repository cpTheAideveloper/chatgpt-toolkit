# Website Analyzer: AI-Powered Business Website Improvement Tool

This guide will show you how to build a simple website analyzer application that uses OpenAI's API to analyze business websites and provide actionable improvement suggestions.

## Project Structure

The application consists of:
- A Node.js backend with Express
- A React frontend with Tailwind CSS
- OpenAI API integration for website analysis

## Part 1: Backend Implementation

### Step 1: Set Up Project Structure

Follow the same initial setup as in the chat app tutorial to create your project folders and initialize the project.

### Step 2: Create the Analysis Helpers

Create a file called `analysisHelpers.js` in the utils folder:

```javascript
// utils/analysisHelpers.js
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import { generateChatResponse } from './openAiHelpers.js';

// Function to fetch and extract content from a website
export async function fetchWebsiteContent(url) {
  try {
    // Make sure URL has proper protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    const response = await fetch(url);
    const html = await response.text();
    
    // Parse the HTML
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Extract key elements
    const title = document.querySelector('title')?.textContent || '';
    const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const headings = Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.textContent.trim()).slice(0, 10);
    
    // Extract main content (simplified approach)
    const mainContent = document.querySelector('main')?.textContent || 
                        document.querySelector('article')?.textContent || 
                        document.querySelector('body')?.textContent || '';
    
    // Extract text content, limiting length to avoid token limits
    const bodyText = mainContent.replace(/\s+/g, ' ').trim().slice(0, 10000);
    
    // Identify CTA elements
    const ctaButtons = Array.from(document.querySelectorAll('a.btn, button, a[href*="sign"], a[href*="register"], a[href*="contact"], a[href*="demo"]')).map(btn => ({
      text: btn.textContent.trim(),
      link: btn.getAttribute('href') || ''
    })).slice(0, 5);
    
    // Check for mobile responsiveness
    const hasMobileViewport = document.querySelector('meta[name="viewport"]') !== null;
    const hasMediaQueries = html.includes('@media') || html.includes('max-width') || html.includes('min-width');
    
    // Check for common social media links
    const socialLinks = {};
    ['facebook', 'twitter', 'linkedin', 'instagram', 'youtube'].forEach(platform => {
      socialLinks[platform] = html.includes(platform + '.com') || 
                             html.includes(platform + '.net') || 
                             html.includes(platform + '.org');
    });
    
    return {
      title,
      url,
      metaDescription,
      headings,
      bodyTextSample: bodyText.slice(0, 2000), // First 2000 chars only
      ctaButtons,
      hasMobileViewport,
      hasMediaQueries,
      socialLinks,
      wordCount: bodyText.split(/\s+/).length
    };
  } catch (error) {
    console.error("Error fetching website content:", error);
    throw new Error(`Failed to analyze website: ${error.message}`);
  }
}

// Function to analyze website with OpenAI
export async function analyzeWebsite(websiteData, focusAreas = []) {
  try {
    const focusAreasText = focusAreas.length > 0 
      ? `Focus especially on these areas: ${focusAreas.join(', ')}.` 
      : 'Provide a comprehensive analysis.';
    
    const userMessage = { 
      role: "user", 
      content: `Analyze this business website and provide specific, actionable improvement suggestions:
      
      URL: ${websiteData.url}
      Title: ${websiteData.title}
      Meta Description: ${websiteData.metaDescription}
      
      Main Headings:
      ${websiteData.headings.join('\n')}
      
      CTA Buttons:
      ${websiteData.ctaButtons.map(cta => `- ${cta.text} (${cta.link})`).join('\n')}
      
      Mobile Responsiveness:
      - Has Viewport Meta: ${websiteData.hasMobileViewport}
      - Has Media Queries: ${websiteData.hasMediaQueries}
      
      Social Media Links Present:
      ${Object.entries(websiteData.socialLinks).map(([platform, present]) => `- ${platform}: ${present}`).join('\n')}
      
      Content Sample:
      ${websiteData.bodyTextSample}
      
      ${focusAreasText}
      `
    };
    
    const instructions = `You are an expert website analyzer with deep knowledge of UX/UI design, SEO, conversion optimization, accessibility, and digital marketing.
    
    Provide a detailed analysis of the website with SPECIFIC, ACTIONABLE suggestions for improvement.
    
    Format your response in the following structure:
    1. Overview & First Impressions (brief)
    2. Strengths (2-3 points)
    3. Areas for Improvement (4-5 specific issues with actionable suggestions)
    4. Priority Recommendations (3 highest-impact changes)
    
    Focus on practical advice that would have the biggest impact on business results.`;
    
    const result = await generateChatResponse({
      userMessage,
      instructions,
      model: "gpt-4o",
      temperature: 0.7,
    });
    
    return result;
  } catch (error) {
    console.error("Error analyzing website with AI:", error);
    throw error;
  }
}
```

### Step 3: Create the Analysis Routes

Create a file called `analysisRoutes.js` in the routes folder:

```javascript
// routes/analysisRoutes.js
import express from 'express';
import { fetchWebsiteContent, analyzeWebsite } from '../utils/analysisHelpers.js';

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { websiteUrl, focusAreas } = req.body;
    
    if (!websiteUrl) {
      return res.status(400).json({ error: "Website URL is required" });
    }
    
    console.log(`Processing analysis request for website: ${websiteUrl}`);
    
    // Step 1: Fetch website content
    const websiteData = await fetchWebsiteContent(websiteUrl);
    
    // Step 2: Analyze with OpenAI
    const analysis = await analyzeWebsite(websiteData, focusAreas);
    
    // Step 3: Return analysis
    res.status(200).json({
      websiteUrl,
      data: websiteData,
      analysis
    });
  } catch (error) {
    console.error("Error processing analysis request:", error);
    res.status(500).json({ 
      error: "Error analyzing website", 
      message: error.message 
    });
  }
});

export default router;
```

### Step 4: Update Server.js to Include the New Route

```javascript
// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import analysisRoutes from './routes/analysisRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/analyze', analysisRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Step 5: Install Additional Dependencies

```bash
npm install node-fetch jsdom
```

## Part 2: Frontend Implementation

### Step 1: Create Website Analyzer Component

Create a file called `WebsiteAnalyzer.jsx` in your frontend's src/pages folder:

```jsx
// src/pages/WebsiteAnalyzer.jsx
import { useState } from "react";

function WebsiteAnalyzer() {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [focusAreas, setFocusAreas] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const availableFocusAreas = [
    { id: "seo", label: "SEO & Discoverability" },
    { id: "conversion", label: "Conversion Rate" },
    { id: "ux", label: "User Experience" },
    { id: "accessibility", label: "Accessibility" },
    { id: "performance", label: "Performance" },
    { id: "content", label: "Content Quality" },
    { id: "branding", label: "Branding & Messaging" },
    { id: "mobile", label: "Mobile Experience" }
  ];
  
  const handleFocusAreaToggle = (areaId) => {
    if (focusAreas.includes(areaId)) {
      setFocusAreas(focusAreas.filter(id => id !== areaId));
    } else {
      setFocusAreas([...focusAreas, areaId]);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!websiteUrl.trim()) {
      setError("Please enter a website URL");
      return;
    }
    
    setLoading(true);
    setError("");
    setAnalysisResult(null);
    
    try {
      const response = await fetch("http://localhost:3001/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          websiteUrl: websiteUrl.trim(),
          focusAreas: focusAreas.map(id => availableFocusAreas.find(area => area.id === id).label)
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to analyze website");
      }
      
      const data = await response.json();
      setAnalysisResult(data);
    } catch (error) {
      console.error("Error:", error);
      setError(error.message || "Error analyzing website. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-white shadow p-4">
        <h1 className="text-xl font-bold text-gray-800">Website Analyzer</h1>
        <p className="text-sm text-gray-600">Get AI-powered insights to improve your business website</p>
      </header>
      
      <div className="flex-1 p-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Form Section */}
          <div className="md:col-span-1">
            <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Website URL*</label>
                <input
                  type="text"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  placeholder="example.com"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">Enter the domain without http:// or https://</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Focus Areas (Optional)</label>
                <p className="text-xs text-gray-500 mb-2">Select areas you'd like to prioritize in the analysis</p>
                
                <div className="grid grid-cols-2 gap-2">
                  {availableFocusAreas.map(area => (
                    <div key={area.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={area.id}
                        checked={focusAreas.includes(area.id)}
                        onChange={() => handleFocusAreaToggle(area.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={area.id} className="ml-2 text-sm text-gray-700">
                        {area.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}
              
              <button
                type="submit"
                disabled={loading || !websiteUrl.trim()}
                className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  loading || !websiteUrl.trim() ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? "Analyzing..." : "Analyze Website"}
              </button>
            </form>
          </div>
          
          {/* Results Section */}
          <div className="md:col-span-2">
            {loading ? (
              <div className="h-full flex items-center justify-center bg-white p-4 rounded-lg shadow">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  <p className="mt-2 text-gray-600">Analyzing website...</p>
                  <p className="text-xs text-gray-500 mt-1">This may take up to a minute</p>
                </div>
              </div>
            ) : analysisResult ? (
              <div className="bg-white p-4 rounded-lg shadow space-y-4">
                <div className="border-b pb-2">
                  <h2 className="text-lg font-semibold">Analysis for {analysisResult.websiteUrl}</h2>
                  <p className="text-sm text-gray-600">
                    {analysisResult.data.title}
                  </p>
                </div>
                
                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ 
                    __html: analysisResult.analysis
                      .replace(/\n/g, '<br>')
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  }} />
                </div>
                
                <div className="pt-4 border-t text-right">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(analysisResult.analysis);
                      alert("Analysis copied to clipboard!");
                    }}
                    className="text-sm bg-gray-100 hover:bg-gray-200 py-1 px-3 rounded"
                  >
                    Copy Analysis
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center bg-white p-4 rounded-lg shadow">
                <div className="text-center max-w-md">
                  <h2 className="text-xl font-semibold mb-2">Get AI-Powered Website Insights</h2>
                  <p className="text-gray-600">
                    Enter your website URL to receive detailed analysis and improvement suggestions for:
                  </p>
                  <ul className="mt-4 text-left text-sm text-gray-600 grid grid-cols-2 gap-x-4 gap-y-2">
                    <li className="flex items-center">
                      <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      User Experience
                    </li>
                    <li className="flex items-center">
                      <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Conversion Rate
                    </li>
                    <li className="flex items-center">
                      <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      SEO Performance
                    </li>
                    <li className="flex items-center">
                      <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Content Quality
                    </li>
                    <li className="flex items-center">
                      <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Mobile Responsiveness
                    </li>
                    <li className="flex items-center">
                      <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Accessibility
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WebsiteAnalyzer;
```

### Step 2: Update App.js

```jsx
// src/App.js
import WebsiteAnalyzer from './pages/WebsiteAnalyzer';

function App() {
  return (
    <div className="App">
      <WebsiteAnalyzer />
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

## How to Use the Website Analyzer

1. Enter the URL of the business website you want to analyze (e.g., `example.com`)

2. Optionally select specific focus areas to prioritize in the analysis:
   - SEO & Discoverability
   - Conversion Rate
   - User Experience
   - Accessibility
   - Performance
   - Content Quality
   - Branding & Messaging
   - Mobile Experience

3. Click "Analyze Website" to start the process

4. Review the detailed analysis, which includes:
   - Overview & First Impressions
   - Website Strengths
   - Areas for Improvement (with specific, actionable suggestions)
   - Priority Recommendations

5. Use the "Copy Analysis" button to save the results

## How It Works Behind the Scenes

1. The application takes the URL and fetches the website's HTML content

2. It extracts key elements from the website:
   - Title and meta description
   - Main headings
   - CTA buttons and links
   - Body content sample
   - Mobile responsiveness indicators
   - Social media presence

3. This data is sent to the OpenAI API along with specific instructions

4. The AI analyzes the website data and generates tailored recommendations

5. The analysis is formatted and displayed to the user

## Extending the Application

Here are some ways you could enhance this tool:

1. **Competitor Analysis**: Add capability to compare against competitor websites

2. **Detailed SEO Analysis**: Integrate with SEO APIs to get more technical insights

3. **Performance Metrics**: Add actual performance testing (page speed, mobile responsiveness)

4. **PDF Reports**: Generate downloadable PDF reports with the analysis

5. **Historical Tracking**: Save analyses to track improvements over time

6. **Visual Analysis**: Add screenshot capabilities to analyze visual design

7. **Custom Checklists**: Create industry-specific analysis templates

## Troubleshooting

If you encounter issues:

- Make sure your OpenAI API key is properly set up in the `.env` file
- Check that both backend and frontend servers are running
- Verify that the URL you're analyzing is accessible and not blocking scraping
- For very large websites, you might need to increase timeout limits
- Some websites with complex JavaScript may not be fully analyzable with the basic scraping approach