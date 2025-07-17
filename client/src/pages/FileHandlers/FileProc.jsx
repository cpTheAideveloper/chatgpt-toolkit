/* eslint-disable react/prop-types */
import { useState, useRef, useEffect } from "react";
import {
  Upload,
  X
} from "lucide-react";

import { ChatInput } from "@/components/ChatInput";
import { ChatMessage } from "@/components/ChatMessage";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { Banner } from "@/components/Banner";
import CanvasView from "@/components/CanvasView"; // optional if you want to preview images, PDFs, etc.


export function FileProc() {
  // File State
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState("word");
  const [isDragging, setIsDragging] = useState(false);

  // Chat / Input
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Banner & Scroll
  const [showBanner, setShowBanner] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Settings Modal



  // Refs
  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  //-----------------------------------
  // AUTO-SCROLL & BANNER
  //-----------------------------------
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const nearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      setShowScrollButton(!nearBottom);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Auto-scroll if user is near bottom
    if (!showScrollButton) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, showScrollButton]);

  useEffect(() => {
    // Hide banner after first user message
    if (messages.length > 0) {
      setShowBanner(false);
    }
  }, [messages]);



  //-----------------------------------
  // FILE HANDLING
  //-----------------------------------
  const handleFileChange = (e) => {
    const file = e.target?.files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }
    detectFileType(file);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) detectFileType(file);
  };

  const detectFileType = (file) => {
    // Simple detection
    const isWordFile = file.name.match(/\.(docx?|doc)$/i);
    const isPdfFile = file.name.match(/\.pdf$/i);

    if (isWordFile) setFileType("word");
    if (isPdfFile) setFileType("pdf");

    setSelectedFile(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  //-----------------------------------
  // CHAT SUBMIT LOGIC
  //-----------------------------------
  const sendMessageWithFile = async () => {
    const trimmed = input.trim();
    if (!trimmed || !selectedFile) return;

    // Hide banner if it was still showing
    if (showBanner) setShowBanner(false);

    // Create user message
    const fileName = selectedFile.name;
    const fileSize = (selectedFile.size / (1024 * 1024)).toFixed(2);
    const userMessage = {
      role: "user",
      content: `${trimmed} [File: ${fileName} (${fileSize} MB)]`,
    };

    // Add user message to chat
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Prepare form data
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("userInput", trimmed);

  

    // Choose the server endpoint based on fileType
    const endpoint = fileType === "pdf" ? "readPdf" : "readWordDocuments";

    try {
      const res = await fetch(`http://localhost:8000/file/${endpoint}`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Server returned ${res.status}`);
      }
      const data = await res.json();

      // Add assistant message
      setMessages((prev) => [...prev, data]);
    } catch (error) {
      console.error("Error processing file:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error processing the file: ${error.message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };



  //-----------------------------------
  // RENDER
  //-----------------------------------
  return (
    <div className="flex flex-col h-screen bg-gray-50 md:flex-row">
      
      {/* LEFT: File Drop or CanvasView */}
      <div className="w-full md:w-1/2 p-6">
        {selectedFile ? (
          <div className="relative h-full">
            {/* Remove file button */}
            <button
              onClick={removeFile}
              className="absolute top-2 right-2 z-10 p-2 text-gray-500 hover:text-gray-700 
                         bg-white rounded-full shadow hover:bg-gray-100"
            >
              <X size={18} />
            </button>

            {/* For images or text-based files, you can show a preview with CanvasView */}
            <CanvasView file={selectedFile} isOpen={!!selectedFile} />
          </div>
        ) : (
          <div
            className={`
              relative flex flex-col items-center justify-center
              h-full rounded-xl border-2 border-dashed
              transition-all duration-200
              ${isDragging ? "border-orange-400 bg-orange-50" : "border-gray-300 bg-white hover:bg-gray-50"}
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
              <p className="text-gray-600 mb-2">
                Drop your file here, or click to browse
              </p>
              <p className="text-sm text-gray-400">
                Supports Word (.doc, .docx) and PDF; also images, etc.
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".doc,.docx,.pdf,image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        )}
      </div>

      {/* RIGHT: Chat + Settings */}
      <div className="flex flex-col flex-1 bg-white border-l border-gray-200">
        
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-4 py-6"
        >
          <div className="max-w-3xl mx-auto space-y-6">
            {showBanner && (
              <Banner
                title="Welcome to Document Processing"
                description="Upload Word/PDF files and ask questions or request summaries. The AI will analyze the file and respond below."
              />
            )}

            {/* Messages */}
            {messages.map((msg, index) => (
              <ChatMessage key={index} message={msg} />
            ))}

            {loading && <LoadingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="sticky bottom-0 border-t border-gray-200 bg-white p-4">
          <div className="max-w-3xl mx-auto">
            <ChatInput
              input={input}
              setInput={setInput}
              sendMessage={sendMessageWithFile}
              isLoading={!selectedFile}
              // or `isLoading={!selectedFile || loading}` if you want to disable until file is chosen
            />
          </div>
        </div>
      </div>
    </div>
  );
}


/**
 * FileProc.jsx
 *
 * 📄 Componente principal para carga, análisis e interacción con archivos como Word, PDF o imágenes.
 * Permite subir un documento, visualizarlo y conversar con una IA que lo analiza en tiempo real.
 *
 * 🧩 Ubicación:
 * //GPT/gptcore/client/src/pages/FileProcessing/FileProc.jsx
 *
 * 🧠 Estado Interno:
 * @state {File|null} selectedFile - Archivo subido por el usuario.
 * @state {string} fileType - Tipo de archivo detectado ("pdf" o "word").
 * @state {boolean} isDragging - Estado de arrastre para efecto visual.
 * @state {string} input - Texto ingresado por el usuario.
 * @state {Array} messages - Historial de mensajes entre el usuario y la IA.
 * @state {boolean} loading - Estado de carga durante el análisis del archivo.
 * @state {boolean} showBanner - Muestra un banner introductorio.
 * @state {boolean} showScrollButton - Indicador si el usuario está lejos del final del chat.
 * @state {boolean} showSettings - Controla la visibilidad del modal de configuración.
 * @state {string} model - Modelo de IA seleccionado.
 * @state {string} systemInstructions - Instrucciones del sistema para controlar el análisis.
 *
 * 📥 Refs:
 * @ref fileInputRef - Input HTML oculto para seleccionar archivo manualmente.
 * @ref chatContainerRef - Contenedor del historial de mensajes para scroll automático.
 * @ref messagesEndRef - Referencia al final del historial de mensajes.
 *
 * 📌 Funcionalidades:
 * 1. 📤 Upload: Soporte para Word (.doc, .docx), PDF y otros formatos (como imagen).
 * 2. 📑 Preview: Usa `CanvasView` para previsualizar el archivo cargado.
 * 3. 💬 Chat: Permite preguntar a la IA sobre el archivo (con historial de mensajes).
 * 4. ⚙️ Settings: Modal para cambiar modelo o instrucciones del sistema.
 * 5. 🔁 Auto-scroll: Mantiene la vista enfocada en el último mensaje.
 *
 * 🔁 Lógica de envío:
 * - Se crea un `FormData` que incluye archivo, input, modelo e instrucciones.
 * - Se envía vía `POST` a `/file/readPdf` o `/file/readWordDocuments`.
 * - Se actualiza el historial con la respuesta del asistente.
 *
 * ⚙️ Endpoints:
 * - `readPdf`: análisis de archivos .pdf
 * - `readWordDocuments`: análisis de archivos .doc y .docx
 *
 * 🧪 Dependencias clave:
 * - `ChatInput`: Entrada de texto.
 * - `ChatMessage`: Representación de cada mensaje.
 * - `CanvasView`: Vista previa del archivo.
 * - `AnalysisSettingsModal`: Modal de configuración avanzada.
 * - `Banner` y `LoadingIndicator`: UI decorativa y de carga.
 *
 * 🖼️ UI:
 * - Diseño dividido en dos columnas (izquierda archivo, derecha chat).
 * - Diseño responsive con transición visual durante drag & drop.
 *
 * 📝 Ejemplo de entrada esperada:
 * ```
 * {
 *   role: "user",
 *   content: "¿Cuáles son los puntos clave del documento? [File: contrato.pdf (0.8 MB)]"
 * }
 * ```
 *
 * @returns {JSX.Element}
 */
