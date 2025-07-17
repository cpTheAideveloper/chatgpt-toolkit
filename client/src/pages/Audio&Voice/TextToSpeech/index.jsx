//GPT/gptcore/client/src/pages/Audio&Voice/TextToSpeech/index.jsx
import { useState } from "react";
import { Banner } from "@/components/Banner"; // adjust if your Banner component is elsewhere
import { TextInputSection } from "./TextInputSection";
import { ConfigPanel } from "./ConfigPanel";
import { AudioPlayer } from "./AudioPlayer";

export function TextToSpeech() {
  const [userInput, setUserInput] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [configOpen, setConfigOpen] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);

  // Config state
  const [selectedVoice, setSelectedVoice] = useState("shimmer");
  const [selectedModel, setSelectedModel] = useState("gpt-4o-mini-tts");
  const [speedValue, setSpeedValue] = useState(1.0);
  const [instructions, setInstructions] = useState("");

  const voices = [
    { id: "shimmer", name: "Shimmer" },
    { id: "alloy", name: "Alloy" },
    { id: "echo", name: "Echo" },
    { id: "fable", name: "Fable" },
    { id: "onyx", name: "Onyx" },
    { id: "nova", name: "Nova" },
  ];

  const models = [
    { id: "gpt-4o-mini-tts", name: "GPT-4o Mini TTS" },
    { id: "tts-1", name: "TTS-1" },
    { id: "tts-1-hd", name: "TTS-1 HD" },
  ];

  const predefinedInstructions = [
    "Generate a clear and natural-sounding audio response",
    "Generate a clear and natural-sounding audio response but make faster and express emotions",
    "Speak with a friendly tone and clear pronunciation",
    "Read with a dramatic tone like a movie trailer narrator",
    "Speak with a professional tone for business content",
  ];

  const handleInputChange = (e) => {
    const text = e.target.value;
    setUserInput(text);
    setCharacterCount(text.length);
  };

  const handleGenerate = async () => {
    if (!userInput.trim()) return;
    if (showBanner) setShowBanner(false);

    setLoading(true);
    setAudioUrl("");

    try {
      const res = await fetch("http://localhost:8000/audio/textToAudio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userInput,
          voice: selectedVoice,
          model: selectedModel,
          speed: parseFloat(speedValue),
          instructions: instructions,
        }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      }
    } catch (error) {
      console.error("Error generating speech:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleConfig = () => {
    setConfigOpen(!configOpen);
  };

  return (
    <div className="h-full overflow-y-scroll bg-gray-50">
      <div className={`max-w-3xl mx-auto ${!showBanner && "py-20"}`}>
        {/* Header */}
        {showBanner && (
          <Banner
            title="Text to Speech"
            description="Transform your written words into natural-sounding speech. Perfect for creating voiceovers, accessibility features, or learning pronunciations."
          />
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6">
          <TextInputSection
            userInput={userInput}
            onInputChange={handleInputChange}
            characterCount={characterCount}
            loading={loading}
            onGenerate={handleGenerate}
            configOpen={configOpen}
            onToggleConfig={toggleConfig}
            isGenerateDisabled={!userInput.trim()}
          />

          <ConfigPanel
            configOpen={configOpen}
            voices={voices}
            models={models}
            selectedVoice={selectedVoice}
            setSelectedVoice={setSelectedVoice}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            speedValue={speedValue}
            setSpeedValue={setSpeedValue}
            instructions={instructions}
            setInstructions={setInstructions}
            predefinedInstructions={predefinedInstructions}
          />

          <AudioPlayer audioUrl={audioUrl} />
        </div>
      </div>
    </div>
  );
}


/**
 * TextToSpeech.jsx
 *
 * This React component allows users to convert typed text into speech
 * using OpenAI's text-to-audio generation endpoint.
 * 
 * 🧠 Features:
 * - Text input with character count tracking
 * - Configurable voice, model, speed, and style instructions
 * - Toggleable advanced settings panel (ConfigPanel)
 * - Banner introduction shown on first render
 * - Asynchronous request to the backend API for audio generation
 * - Audio playback via generated blob URL
 *
 * 🔧 Components Used:
 * - Banner: Display introductory content
 * - TextInputSection: Text box + generate button + config toggle
 * - ConfigPanel: Model and voice selection, speed control, style input
 * - AudioPlayer: Plays generated audio output
 *
 * 🧪 State Variables:
 * - `userInput` (string): Text to convert to speech
 * - `audioUrl` (string): Generated blob URL for playback
 * - `loading` (boolean): Tracks API request progress
 * - `showBanner` (boolean): Shows/hides the top banner
 * - `configOpen` (boolean): Toggles advanced configuration panel
 * - `characterCount` (number): Tracks number of typed characters
 * - `selectedVoice`, `selectedModel`, `speedValue`, `instructions`: Configuration for the TTS request
 *
 * 📦 API Endpoint:
 * POST `/audio/textToAudio`
 * - Request payload: { userInput, voice, model, speed, instructions }
 * - Response: MP3 audio blob
 *
 * 📁 Path:
 * //GPT/gptcore/client/src/pages/Audio&Voice/TextToSpeech/index.jsx
 */
