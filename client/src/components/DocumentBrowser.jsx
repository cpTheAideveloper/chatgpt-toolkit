// src/components/DocBrowser.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronRight, ChevronDown, FileText, Folder } from 'lucide-react';
import MarkdownViewerChat from './MarkdownViewerChat';

// API base URL - update this to your Node.js server address
const API_BASE_URL = 'http://localhost:8000'; // Assuming 8000 is your Node server port

// Component that renders a tree view item (folder or file)
const TreeItem = ({ item, depth = 0, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isFolder = item.type === 'folder';
  const paddingLeft = `${depth * 1.5}rem`;

  const toggleOpen = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFolder) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div>
      <div 
        className={`
          flex items-center py-1 px-2 rounded-md cursor-pointer
          hover:bg-gray-100 transition-colors
        `}
        style={{ paddingLeft }}
        onClick={(e) => {
          if (isFolder) {
            toggleOpen(e);
          } else {
            onSelect(item.path);
          }
        }}
      >
        {isFolder ? (
          <span onClick={toggleOpen} className="mr-1 flex-shrink-0 text-gray-500">
            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </span>
        ) : (
          <span className="mr-1 flex-shrink-0 text-blue-500">
            <FileText size={16} />
          </span>
        )}
        <span className={`${isFolder ? 'font-medium' : ''} truncate`}>
          {item.name}
        </span>
      </div>
      
      {isFolder && isOpen && (
        <div>
          {item.children.map((child, index) => (
            <TreeItem 
              key={`${child.path}-${index}`} 
              item={child} 
              depth={depth + 1} 
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Main documentation browser component
export const DocBrowser = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [docTree, setDocTree] = useState(null);
  const [currentDoc, setCurrentDoc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [docTitle, setDocTitle] = useState('');
  const [selectedPath, setSelectedPath] = useState('');

  // Extract path from URL if present
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const path = searchParams.get('path');
    if (path) {
      setSelectedPath(path);
    }
  }, [location]);

  // Fetch the documentation tree structure
  useEffect(() => {
    const fetchDocTree = async () => {
      try {
        setIsLoading(true);
        // Use the full URL to your backend server
        const response = await fetch(`${API_BASE_URL}/docs/tree`);
        if (!response.ok) {
          throw new Error(`Failed to fetch documentation structure: ${response.statusText}`);
        }
        const data = await response.json();
        setDocTree(data);
      } catch (err) {
        console.error('Error fetching doc structure:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocTree();
  }, []);

  // Fetch the current markdown document when selectedPath changes
  useEffect(() => {
    const fetchDocument = async () => {
      if (!selectedPath) return;
      
      try {
        setIsLoading(true);
        // Use the full URL with proper query parameter
        const response = await fetch(`${API_BASE_URL}/docs/content?path=${encodeURIComponent(selectedPath)}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch document: ${response.statusText}`);
        }
        const text = await response.text();
        setCurrentDoc(text);
        
        // Extract title from path
        const pathParts = selectedPath.split('/');
        const fileName = pathParts[pathParts.length - 1];
        setDocTitle(fileName.charAt(0).toUpperCase() + fileName.slice(1).replace(/-/g, ' '));
      } catch (err) {
        console.error('Error fetching document:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocument();
  }, [selectedPath]);

  const handleDocSelect = (docPath) => {
    setSelectedPath(docPath);
    navigate(`/docs?path=${encodeURIComponent(docPath)}`);
  };

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="flex h-full bg-base-100">
      {/* Sidebar with tree view */}
      <div className="w-72 border-r border-base-200 h-full overflow-y-auto bg-base-50 p-4">
        <h2 className="text-xl font-bold mb-4 text-base-content">Documentation</h2>
        
        {isLoading && !docTree ? (
          <div className="p-4 text-base-content/70">Loading...</div>
        ) : (
          docTree && (
            <div className="space-y-1">
              {docTree.map((item, index) => (
                <TreeItem 
                  key={`${item.path}-${index}`} 
                  item={item} 
                  onSelect={handleDocSelect} 
                />
              ))}
            </div>
          )
        )}
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && !currentDoc ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : currentDoc ? (
          <div className="p-6">
            {/* Display document title */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-base-content">{docTitle}</h1>
              <div className="h-1 w-32 bg-primary mt-2"></div>
            </div>
            
            {/* Use the MarkdownViewerChat component for rendering */}
            <MarkdownViewerChat markdownContent={currentDoc} />
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center h-full text-base-content/70">
            <FileText size={64} className="text-primary/30 mb-4" />
            <p className="text-xl">Select a document from the sidebar to view</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocBrowser;