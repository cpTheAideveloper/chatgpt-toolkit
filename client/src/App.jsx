import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Chat } from "./pages/TextGeneration&Chat/Chat";
import { ImageGen } from "./pages/Image&Vision/ImageGen";
import { Audio } from "./pages/Audio&Voice/Audio";
import { FileProc } from "./pages/FileHandlers/FileProc";
import { RealTimeChat} from "./pages/TextGeneration&Chat/RealTimeChat"
import { ImageAnalyze } from "./pages/Image&Vision/ImageAnalyze";
import { FileProcStream } from "./pages/FileHandlers/FileProcStream";
import { TextToSpeech } from "./pages/Audio&Voice/TextToSpeech";
import { CodeWithCanvas } from "./pages/TextGeneration&Chat/CodeWithCanvas";
import { ChatSearch } from "./pages/TextGeneration&Chat/ChatSearch";
import { RealtimeSearch } from "./pages/TextGeneration&Chat/RealtimeSearch";
import { DeepResearch } from "./pages/TextGeneration&Chat/DeepResearch"; // New Deep Research import
import { NewFileHandler } from "./pages/FileHandlers/NewFileHandler";
import { ChatWithVoice } from "./pages/Audio&Voice/ChatWithVoice";
import { AudioContextProvider } from "./pages/Audio&Voice/ChatWithVoice/context/audioContext";
import { MultiModal } from "./pages/MultiModal";
import {ChatProvider} from  "./pages/MultiModal/context/ChatContext";
import { DocBrowser } from "@/components/DocumentBrowser";
import { CodeDocumenter } from "./pages/DemoApps/CodeDocumenter";
import { GPTImageGen } from "./pages/Image&Vision/GPTImageGen";
import { GPTImageEdit } from "./pages/Image&Vision/GPTImageEdit";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/multiModal" element={
            <ChatProvider>
            <MultiModal />
            </ChatProvider>
            } />
          <Route path="/chat" element={<Chat />} />
          <Route path="/realtime-chat" element={<RealTimeChat />} />
          <Route path="/code" element={<CodeWithCanvas />} />
          <Route path="/search" element={<ChatSearch />} />
          <Route path="/realtime-search" element={<RealtimeSearch />} />
          <Route path="/deep-research" element={<DeepResearch />} /> {/* New Deep Research route */}
          <Route path="/image" element={<ImageGen />} />
          <Route path="/imageneration" element={<GPTImageGen />} />
          <Route path="/imageEdit" element={<GPTImageEdit />} />
          <Route path="/imageanalyze" element={<ImageAnalyze />} />
          <Route path="/audio" element={<Audio />} />
          <Route
            path="/voice"
            element={
              <AudioContextProvider>
                <ChatWithVoice />
              </AudioContextProvider>
            }
          />          
          <Route path="/demoApp/codeautodoc" element={<CodeDocumenter />} />          
          <Route path="/textotoaudio" element={<TextToSpeech />} />
          <Route path="/file" element={<FileProc />} />
          <Route path="/filestream" element={<FileProcStream />} />
          <Route path="/newfilehandler" element={<NewFileHandler />} />    
          <Route path="/docs" element={<DocBrowser />} />
          <Route path="/docs/*" element={<DocBrowser />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

/**
 * App.jsx
 *
 * Main application component that sets up routing for the GPTCore platform.
 * This component configures React Router to handle navigation between different
 * AI-powered features and tools available in the application.
 *
 * Updated to include the new Deep Research feature at `/deep-research` route.
 *
 * Routes Overview:
 * - `/`: Home page
 * - `/multiModal`: Multi-modal AI interactions
 * - `/chat`: Basic AI chat interface
 * - `/realtime-chat`: Real-time streaming chat
 * - `/code`: Code generation with canvas
 * - `/search`: AI-powered web search
 * - `/realtime-search`: Real-time web search
 * - `/deep-research`: NEW - Comprehensive AI research with multiple sources
 * - `/image*`: Various image generation and analysis tools
 * - `/audio` & `/voice`: Audio processing and voice chat
 * - `/file*`: File processing and analysis tools
 * - `/docs`: Documentation browser
 * - `/demoApp/*`: Demo applications
 *
 * Key Features:
 * - Centralized routing configuration
 * - Context providers for specific features (Chat, Audio)
 * - Lazy loading ready structure
 * - Modular component organization
 *
 * Path: //GPT/gptcore/client/src/App.jsx
 */