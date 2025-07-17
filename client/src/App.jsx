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