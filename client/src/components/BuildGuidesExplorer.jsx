import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MarkdownViewer } from '../components/MarkdownViewer';
import {
  Globe,
  Folder,
  FileText,
  ChevronDown,
  ChevronRight,
  FileQuestion
} from 'lucide-react';

// Language configuration
const LANGUAGES = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  ja: '日本語',
};

const LANGUAGE_FILE_MAPPING = {
  en: 'en',
  es: 'esp',
  fr: 'fr',
  de: 'de',
  ja: 'ja',
};

export function BuildGuidesExplorer() {
  const { feature, component } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [selectedLang, setSelectedLang] = useState('');
  const [folderStructure, setFolderStructure] = useState({});
  const [expandedFolders, setExpandedFolders] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Initialize language preference
  useEffect(() => {
    // Try to get language from localStorage first
    const storedLang = localStorage.getItem('preferredLanguage');
    
    if (storedLang && LANGUAGE_FILE_MAPPING[storedLang]) {
      setSelectedLang(storedLang);
    } else {
      // Fall back to browser language or default to English
      const browserLang = (navigator.language || navigator.userLanguage || 'en').split('-')[0];
      const supportedLang = LANGUAGE_FILE_MAPPING[browserLang] ? browserLang : 'en';
      setSelectedLang(supportedLang);
      localStorage.setItem('preferredLanguage', supportedLang);
    }
  }, []);

  // Fetch folder structure
  useEffect(() => {
    const fetchFolderStructure = async () => {
      try {
        // In a real application, this would be an API call to get the folder structure
        // For example: const response = await fetch('/api/buildguides/structure');
        
        // Simulating API response based on the folder structure from the image
        const mockStructure = {
          English: {
            components: [
              'Banner.jsx.md',
              'ChatBubble.jsx.md',
              'ChatInput.jsx.md',
              'ChatMessage.jsx.md',
              'ChatSettings.jsx.md',
              'Layout.jsx.md',
              'LoadingIndicator.jsx.md',
              'MarkdownViewer.jsx.md',
              'MarkDownViewerChat.jsx.md',
              'SearchSettingsModal.jsx.md'
            ]
          },
          Español: {
            components: [
              'Banner.jsx.md',
              'ChatBubble.jsx.md',
              'ChatInput.jsx.md',
              'ChatMessage.jsx.md',
            ]
          },
          Français: {
            components: [
              'Banner.jsx.md',
              'ChatMessage.jsx.md',
            ]
          },
          Deutsch: {
            components: [
              'Banner.jsx.md',
              'MarkdownViewer.jsx.md',
            ]
          },
          '日本語': {
            components: [
              'Banner.jsx.md',
              'ChatBubble.jsx.md',
            ]
          }
        };
        
        setFolderStructure(mockStructure);
        
        // Initialize expanded state - expand all by default
        const initialExpandedState = {};
        Object.keys(mockStructure).forEach(lang => {
          initialExpandedState[lang] = true;
          initialExpandedState[`${lang}-components`] = true;
        });
        setExpandedFolders(initialExpandedState);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching folder structure:', error);
        setIsLoading(false);
      }
    };
    
    fetchFolderStructure();
  }, []);

  // Fetch content when language, feature, or component changes
  useEffect(() => {
    if (!selectedLang) return;
    
    const fetchContent = async () => {
      setIsLoading(true);
      
      try {
        let filePath;
        
        if (component) {
          // If a specific component is selected
          filePath = `/buildguides/${selectedLang}/components/${component}?t=${Date.now()}`;
        } else if (feature) {
          // If a feature page is selected
          filePath = `/buildguides/${feature}/${LANGUAGE_FILE_MAPPING[selectedLang]}.md?t=${Date.now()}`;
        } else {
          // Default to setup page if no feature specified
          filePath = `/buildguides/setup/${LANGUAGE_FILE_MAPPING[selectedLang]}.md?t=${Date.now()}`;
        }
        
        const response = await fetch(filePath, { cache: 'no-store' });
        
        if (!response.ok) {
          throw new Error(`Error fetching markdown file: ${response.status}`);
        }
        
        const text = await response.text();
        setContent(text);
      } catch (err) {
        console.error('Error fetching markdown:', err);
        // If selected language fails, try falling back to English
        if (selectedLang !== 'en') {
          setSelectedLang('en');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchContent();
  }, [feature, component, selectedLang]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLang(newLang);
    localStorage.setItem('preferredLanguage', newLang);
    
    // Navigate to the same feature but with new language
    if (component) {
      // If we're viewing a component, keep viewing the same component
      navigate(`/buildguides/${LANGUAGES[newLang]}/components/${component}`);
    } else if (feature) {
      // If we're viewing a feature page, keep viewing the same feature
      navigate(`/buildguides/${feature}`);
    }
  };

  const toggleFolder = (folderKey) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderKey]: !prev[folderKey]
    }));
  };

  const handleComponentClick = (language, componentName) => {
    navigate(`/buildguides/${language}/components/${componentName}`);
  };

  // Generate language options for the dropdown
  const languageOptions = Object.entries(LANGUAGES).map(([code, name]) => (
    <option key={code} value={code}>
      {name}
    </option>
  ));

  // Rendering the tree view
  const renderTree = () => {
    return Object.entries(folderStructure).map(([language, folders]) => {
      const languageKey = language;
      const isLanguageExpanded = expandedFolders[languageKey];
      const isActiveLanguage = LANGUAGES[selectedLang] === language;
      
      return (
        <div key={languageKey} className="mb-2">
          {/* Language folder */}
          <div 
            className={`flex items-center p-2 rounded cursor-pointer ${isActiveLanguage ? 'bg-green-50 text-green-600' : 'hover:bg-gray-100'}`}
            onClick={() => toggleFolder(languageKey)}
          >
            {isLanguageExpanded ? 
              <ChevronDown size={16} className="mr-1" /> : 
              <ChevronRight size={16} className="mr-1" />
            }
            <Folder size={16} className="mr-2" />
            <span>{language}</span>
          </div>
          
          {/* Components subfolder */}
          {isLanguageExpanded && (
            <div className="ml-6">
              <div 
                className="flex items-center p-2 rounded cursor-pointer hover:bg-gray-100"
                onClick={() => toggleFolder(`${languageKey}-components`)}
              >
                {expandedFolders[`${languageKey}-components`] ? 
                  <ChevronDown size={16} className="mr-1" /> : 
                  <ChevronRight size={16} className="mr-1" />
                }
                <Folder size={16} className="mr-2" />
                <span>components</span>
              </div>
              
              {/* Component files */}
              {expandedFolders[`${languageKey}-components`] && (
                <div className="ml-6">
                  {folders.components.map(comp => {
                    const isActive = component === comp;
                    
                    return (
                      <div 
                        key={comp}
                        className={`flex items-center p-2 rounded cursor-pointer ${isActive ? 'bg-green-50 text-green-600' : 'hover:bg-gray-100'}`}
                        onClick={() => handleComponentClick(language, comp)}
                      >
                        <FileText size={16} className="mr-2" />
                        <span>{comp}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      );
    });
  };

  // Navbar items
  const renderNavItems = () => {
    return (
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2 px-3">
          Project Setup
        </h3>
        <ul className="space-y-1">
          <li>
            <div className={`
              relative flex items-center px-3 py-2 rounded-lg transition-all duration-200
              ${!component && feature === 'setup' ? 'bg-green-50 text-green-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}
              cursor-pointer
            `}
            onClick={() => navigate('/buildguides/setup')}
            >
              <div className="flex items-center justify-center min-w-[20px]">
                <FileQuestion size={20} />
              </div>
              <span className="ml-3 whitespace-nowrap">Initial Setup</span>
            </div>
          </li>
        </ul>
      </div>
    );
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Build Guides</h2>
          
          {/* Language selector */}
          <div className="flex items-center mb-6 gap-2">
            <Globe className="w-5 h-5 text-gray-600" />
            <select
              value={selectedLang}
              onChange={handleLanguageChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              dir={selectedLang === 'ar' ? 'rtl' : 'ltr'}
            >
              {languageOptions}
            </select>
          </div>
          
          {/* Nav items */}
          {renderNavItems()}
          
          {/* Folder tree */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2 px-3">
              Component Documentation
            </h3>
            
            {isLoading && Object.keys(folderStructure).length === 0 ? (
              <div className="p-3 text-gray-500">Loading...</div>
            ) : (
              <div className="space-y-1">
                {renderTree()}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="w-full max-w-6xl mx-auto p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500">Loading content...</div>
            </div>
          ) : (
            <div dir={selectedLang === 'ar' ? 'rtl' : 'ltr'}>
              <MarkdownViewer markdownContent={content} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BuildGuidesExplorer;