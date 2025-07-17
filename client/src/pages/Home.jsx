import { Link } from "react-router-dom";
import { MessageSquare, Pencil, ImageIcon, Eye, Mic, Speech, FileText, FilePenLine, ArrowRight, Clock,  } from "lucide-react";
import { Banner } from "../components/Banner";

export function Home() {
  const features = [
    {
      category: "Text",
      icon: <MessageSquare size={24} className="text-green-600" />,
      description: "Powerful text-based AI solutions for communication and content generation",
      features: [
        {
          path: "/sendText",
          label: "Chat",
          icon: <MessageSquare size={32} />,
          description: "Experience a ChatGPT-powered chat interface for your applications.",
          keyFeatures: ["Contextual responses", "Multiple conversation styles", "Message history"],
          eta: "1-2 seconds",
        },
        {
          path: "/stream",
          label: "Stream Text",
          icon: <Pencil size={32} />,
          description: "Stream text responses in real time for a more engaging user experience.",
          keyFeatures: ["Real-time generation", "Low latency", "Interactive responses"],
          eta: "<1 second",
        },
      ],
    },
    {
      category: "Image",
      icon: <ImageIcon size={24} className="text-green-600" />,
      description: "Create and analyze visual content with state-of-the-art AI technology",
      features: [
        {
          path: "/image",
          label: "Image Generation",
          icon: <ImageIcon size={32} />,
          description: "Generate stunning images with AI for various use cases and styles.",
          keyFeatures: ["Multiple styles", "Custom dimensions", "Prompt guidance"],
          eta: "5-10 seconds",
        },
        {
          path: "/imageanalyze",
          label: "Image Analyze",
          icon: <Eye size={32} />,
          description: "Analyze and extract detailed insights from images with high accuracy.",
          keyFeatures: ["Object detection", "Text extraction", "Scene understanding"],
          eta: "2-3 seconds",
        },
      ],
    },
    {
      category: "Audio",
      icon: <Mic size={24} className="text-green-600" />,
      description: "Convert between text and audio with natural-sounding results",
      features: [
        {
          path: "/audio",
          label: "Audio Transcription",
          icon: <Mic size={32} />,
          description: "Convert audio files to text with high accuracy and multiple language support.",
          keyFeatures: ["Multi-language support", "Speaker identification", "Timestamped output"],
          eta: "Processing time: ~1/4 of audio length",
        },
        {
          path: "/textotoaudio",
          label: "Text to Audio",
          icon: <Speech size={32} />,
          description: "Turn text into natural-sounding speech with customizable voices and styles.",
          keyFeatures: ["Multiple voices", "Adjustable speed", "Emotion control"],
          eta: "2-4 seconds",
        },
      ],
    },
    {
      category: "File",
      icon: <FileText size={24} className="text-green-600" />,
      description: "Process and extract information from various document formats",
      features: [
        {
          path: "/file",
          label: "File Processing",
          icon: <FileText size={32} />,
          description: "Process documents and extract key content with intelligent analysis.",
          keyFeatures: ["Multiple file formats", "Smart summarization", "Data extraction"],
          eta: "5-15 seconds depending on file size",
        },
        {
          path: "/filestream",
          label: "File Stream",
          icon: <FilePenLine size={32} />,
          description: "Stream file processing for large documents with progressive results.",
          keyFeatures: ["Handles large files", "Progressive output", "Continuous processing"],
          eta: "Starts in <3 seconds",
        },
      ],
    },
  ];

  return (
    <div className="h-full overflow-y-scroll bg-gradient-to-b  from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <Banner />
        </div>

        {/* Feature Cards */}
        <div className="space-y-20 overflow-y-scroll">
          {features.map((group) => (
            <div key={group.category} className="space-y-8">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {group.icon}
                  <h2 className="text-2xl font-bold text-gray-900">{group.category}</h2>
                </div>
                <p className="text-gray-600 pl-9">{group.description}</p>
                <div className="border-b border-gray-100 mt-2"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {group.features.map((feature) => (
                  <Link
                    key={feature.path}
                    to={feature.path}
                    className="group relative flex flex-col bg-white p-8 rounded-2xl border border-gray-100 hover:border-green-200 transition-all duration-300 hover:shadow-xl overflow-hidden"
                  >
                    {/* green accent corner */}
                    <div className="absolute -top-10 -right-10 w-20 h-20 bg-green-50 rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-500 ease-out"></div>
                    
                    <div className="flex items-start gap-4 mb-5">
                      <div className="p-3 rounded-xl bg-green-50 text-green-600 group-hover:bg-green-100 transition-colors duration-300 z-10">
                        {feature.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-green-600 transition-colors duration-300">
                          {feature.label}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Key Features */}
                    <div className="mt-auto space-y-4">
                      <div className="pt-4 border-t border-gray-50">
                        <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-2">Key Features</h4>
                        <ul className="space-y-1">
                          {feature.keyFeatures.map((keyFeature, index) => (
                            <li key={index} className="flex items-center text-sm text-gray-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-2"></span>
                              {keyFeature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Processing Time */}
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock size={14} className="mr-1" />
                        <span>Response time: {feature.eta}</span>
                      </div>
                    </div>
                    
                    {/* Hover action indicator */}
                    <div className="absolute bottom-6 right-6 opacity-0 transform translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                      <ArrowRight size={18} className="text-green-500" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}