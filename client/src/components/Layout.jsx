/* eslint-disable react/prop-types */
// src/components/Layout.js

import { Link, useLocation } from "react-router-dom";
import {
  MessageSquare, ImageIcon, Mic, FileText, Pencil, Eye, Speech,
  FilePenLine, ChevronLeft, ChevronRight, SquareMousePointer,
  Search, Globe, FileUp, Captions, Bot, BookOpen, AppWindow, Microscope
} from "lucide-react";
import { useState } from "react";

const navGroups = [
  {
    title: "Multi-Modal",
    items: [
      { path: "/multiModal", label: "Multimodal", icon: <Bot size={20} /> },
    ],
  },
  {
    title: "Text",
    items: [
      { path: "/chat", label: "Chat", icon: <MessageSquare size={20} /> },
      { path: "/realtime-chat", label: "Realtime Chat", icon: <Pencil size={20} /> },
    ],
  },
  {
    title: "Code",
    items: [
      { path: "/code", label: "Code with Canvas", icon: <SquareMousePointer size={20} /> },
    ],
  },
  {
    title: "Search",
    items: [
      { path: "/search", label: "Web Search", icon: <Search size={20} /> },
      { path: "/realtime-search", label: "Realtime Search", icon: <Globe size={20} /> },
      { path: "/deep-research", label: "Deep Research", icon: <Microscope size={20} /> },
    ],
  },
  {
    title: "Image",
    items: [
      { path: "/image", label: "Dalle", icon: <ImageIcon size={20} /> },
      { path: "/imageneration", label: "Image Generation", icon: <ImageIcon size={20} /> },
      { path: "/imageEdit", label: "Edit Image", icon: <ImageIcon size={20} /> },
      { path: "/imageanalyze", label: "Image Analyze", icon: <Eye size={20} /> },
    ],
  },
  {
    title: "Audio",
    items: [
      { path: "/audio", label: "Audio Transcriptions", icon: <Captions size={20} /> },
      { path: "/textotoaudio", label: "Text to Audio", icon: <Speech size={20} /> },
      { path: "/voice", label: "Talk GPT", icon: <Mic size={20} /> },
    ],
  },
  {
    title: "File",
    items: [
      { path: "/file", label: "File", icon: <FileText size={20} /> },
      { path: "/filestream", label: "File Stream", icon: <FilePenLine size={20} /> },
      { path: "/newfilehandler", label: "File Handler", icon: <FileUp size={20} /> },
    ],
  },
  {
    title:"DemoApp",
    items: [
      { path: "/demoApp/codeautodoc", label: "Code Auto-Doc", icon: <AppWindow size={20} /> },
    ],

  },
  {
    title: "Documentation",
    items: [
      { path: "/docs", label: "Documentation Browser", icon: <BookOpen size={20} /> },
    ],
  },
];

function NavItem({ item, isActive, isCollapsed }) {
  return (
    <div className="relative">
      <Link
        to={item.path}
        className={`
          relative flex items-center px-3 py-2 rounded-lg transition-all duration-200
          ${isActive
            ? "bg-green-50 text-green-600"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }
          group
        `}
      >
        <div className="flex items-center justify-center min-w-[20px]">
          {item.icon}
        </div>
        {!isCollapsed && (
          <span className="ml-3 whitespace-nowrap">{item.label}</span>
        )}
      </Link>

      {isCollapsed && (
        <div className="fixed ml-12 top-auto">
          <div className="
            invisible group-hover:visible
            absolute left-0 top-1/2 -translate-y-1/2
            px-3 py-2 ml-1
            bg-gray-800 text-white text-sm rounded-md
            whitespace-nowrap opacity-0 group-hover:opacity-100
            transition-all duration-150
            shadow-lg pointer-events-none
          ">
            {item.label}
            <div className="
              absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2
              w-2 h-2 bg-gray-800 rotate-45
            " />
          </div>
        </div>
      )}
    </div>
  );
}

function NavGroup({ group, isCollapsed }) {
  const location = useLocation();

  return (
    <div className="mb-6">
      {!isCollapsed && (
        <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2 px-3">
          {group.title}
        </h3>
      )}
      <ul className="space-y-1">
        {group.items.map((item) => (
          <li key={item.path}>
            <NavItem
              item={item}
              isActive={location.pathname === item.path}
              isCollapsed={isCollapsed}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Layout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <nav className={`
          bg-white border-r border-gray-200
          transition-all duration-300 ease-in-out
          ${isCollapsed ? "w-16" : "w-64"}
        `}>
          {/* Sidebar Header */}
          <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between h-16 px-3">
              {!isCollapsed && (
                <h2 className="text-xl font-bold text-gray-800">ChatGPT Dev Kit</h2>
              )}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700"
              >
                {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              </button>
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="p-3 space-y-4 overflow-y-auto h-[calc(100vh-4rem)]">
            {navGroups.map((group) => (
              <NavGroup key={group.title} group={group} isCollapsed={isCollapsed} />
            ))}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-hidden">
        <div className="container h-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

/**
 * Layout.jsx
 * 
 * This component provides the global layout for the application, including:
 * - A collapsible sidebar with categorized navigation
 * - Main content area that renders children components based on route
 * 
 * UPDATED: Added Deep Research navigation item in the Search section with Microscope icon
 * 
 * Key Features:
 * - Collapsible sidebar with tooltips when collapsed
 * - Navigation grouped by feature type (Text, Audio, Image, Search, etc.)
 * - Responsive layout using TailwindCSS
 * - Active route highlighting using `useLocation`
 * - Uses `react-router-dom` for client-side routing
 * - NEW: Deep Research functionality accessible via /deep-research route
 * 
 * Navigation Groups:
 * - Multi-Modal: Advanced AI interactions
 * - Text: Chat and real-time conversations
 * - Code: Code generation with canvas
 * - Search: Web search, real-time search, and NEW comprehensive deep research
 * - Image: Various image generation and analysis tools
 * - Audio: Voice and audio processing
 * - File: File handling and processing
 * - DemoApp: Demonstration applications
 * - Documentation: Documentation browser
 * 
 * Props:
 * - `children` (ReactNode): Content to render in the main view area
 * 
 * Dependencies:
 * - React Router (Link, useLocation)
 * - lucide-react (icons) - Added Microscope icon for Deep Research
 * - Tailwind CSS (for layout, spacing, and transitions)
 * 
 * Path: //src/components/Layout.jsx
 */