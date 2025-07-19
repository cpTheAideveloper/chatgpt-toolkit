/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { Plus, X, ExternalLink } from "lucide-react";

export function DeepResearchSettingsModal({
  isOpen,
  onClose,
  title,
  model,
  setModel,
  maxToolCalls,
  setMaxToolCalls,
  includeCodeInterpreter,
  setIncludeCodeInterpreter,
  systemInstructions,
  setSystemInstructions,
  isBackgroundMode,
  setIsBackgroundMode,
  enableClarifications,
  setEnableClarifications,
  customSources,
  setCustomSources,
  onSave
}) {
  const [localModel, setLocalModel] = useState(model);
  const [localMaxToolCalls, setLocalMaxToolCalls] = useState(maxToolCalls);
  const [localIncludeCodeInterpreter, setLocalIncludeCodeInterpreter] = useState(includeCodeInterpreter);
  const [localSystemInstructions, setLocalSystemInstructions] = useState(systemInstructions);
  const [localIsBackgroundMode, setLocalIsBackgroundMode] = useState(isBackgroundMode);
  const [localEnableClarifications, setLocalEnableClarifications] = useState(enableClarifications);
  const [localCustomSources, setLocalCustomSources] = useState(customSources);
  const [newSourceUrl, setNewSourceUrl] = useState("");
  const [newSourceName, setNewSourceName] = useState("");

  // Sync local state with props when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalModel(model);
      setLocalMaxToolCalls(maxToolCalls);
      setLocalIncludeCodeInterpreter(includeCodeInterpreter);
      setLocalSystemInstructions(systemInstructions);
      setLocalIsBackgroundMode(isBackgroundMode);
      setLocalEnableClarifications(enableClarifications);
      setLocalCustomSources([...customSources]);
    }
  }, [isOpen, model, maxToolCalls, includeCodeInterpreter, systemInstructions, isBackgroundMode, enableClarifications, customSources]);

  const handleSave = () => {
    setModel(localModel);
    setMaxToolCalls(localMaxToolCalls);
    setIncludeCodeInterpreter(localIncludeCodeInterpreter);
    setSystemInstructions(localSystemInstructions);
    setIsBackgroundMode(localIsBackgroundMode);
    setEnableClarifications(localEnableClarifications);
    setCustomSources([...localCustomSources]);
    onSave();
  };

  const handleReset = () => {
    setLocalModel("o3-deep-research");
    setLocalMaxToolCalls(50);
    setLocalIncludeCodeInterpreter(true);
    setLocalIsBackgroundMode(false);
    setLocalEnableClarifications(false);
    setLocalCustomSources([]);
    setLocalSystemInstructions(
      "You are a research analyst AI with access to web search and code execution. Conduct thorough research using multiple sources, provide specific figures and statistics, prioritize reliable sources, and include inline citations. Be analytical and data-driven."
    );
  };

  const addCustomSource = () => {
    if (newSourceUrl.trim() && newSourceName.trim()) {
      const newSource = {
        id: Date.now(),
        name: newSourceName.trim(),
        url: newSourceUrl.trim()
      };
      setLocalCustomSources([...localCustomSources, newSource]);
      setNewSourceUrl("");
      setNewSourceName("");
    }
  };

  const removeCustomSource = (id) => {
    setLocalCustomSources(localCustomSources.filter(source => source.id !== id));
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    // eslint-disable-next-line no-unused-vars
    } catch (_) {
      return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Column */}
            <div className="space-y-6">
              {/* Model Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Research Model
                </label>
                <select
                  value={localModel}
                  onChange={(e) => setLocalModel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="o3-deep-research">o3-deep-research (Most Capable)</option>
                  <option value="o4-mini-deep-research">o4-mini-deep-research (Faster & Cost-Effective)</option>
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Choose the research model. o3 provides the most comprehensive analysis, while o4-mini is faster and more cost-effective.
                </p>
              </div>

              {/* Processing Mode */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Processing Mode
                </label>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="processingMode"
                      checked={!localIsBackgroundMode}
                      onChange={() => setLocalIsBackgroundMode(false)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Immediate Mode</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Wait for research to complete before showing results. May timeout on very long tasks.
                      </p>
                    </div>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="processingMode"
                      checked={localIsBackgroundMode}
                      onChange={() => setLocalIsBackgroundMode(true)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Background Mode</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Run research in background with real-time progress updates. Recommended for complex research tasks.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Research Features */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Research Features
                </label>
                
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={localEnableClarifications}
                      onChange={(e) => setLocalEnableClarifications(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Enable Clarifications</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Ask follow-up questions before starting research to better understand your needs.
                      </p>
                    </div>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={true}
                      disabled={true}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 opacity-50"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Web Search</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Always enabled. Allows the AI to search the web for current information.
                      </p>
                    </div>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={localIncludeCodeInterpreter}
                      onChange={(e) => setLocalIncludeCodeInterpreter(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Code Interpreter</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Enables data analysis, calculations, and visualization capabilities.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Max Tool Calls */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Maximum Tool Calls: {localMaxToolCalls}
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={localMaxToolCalls}
                  onChange={(e) => setLocalMaxToolCalls(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>10 (Quick)</span>
                  <span>50 (Balanced)</span>
                  <span>100 (Comprehensive)</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Controls how many web searches and code executions the AI can perform. Higher values enable more thorough research but increase cost and time.
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Custom Sources */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Custom Sources & Links
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Add specific websites or documents you want the AI to prioritize during research.
                </p>
                
                {/* Add New Source */}
                <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <input
                    type="text"
                    placeholder="Source name (e.g., 'Company Website')"
                    value={newSourceName}
                    onChange={(e) => setNewSourceName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="flex space-x-2">
                    <input
                      type="url"
                      placeholder="https://example.com"
                      value={newSourceUrl}
                      onChange={(e) => setNewSourceUrl(e.target.value)}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      onClick={addCustomSource}
                      disabled={!newSourceUrl.trim() || !newSourceName.trim() || !isValidUrl(newSourceUrl.trim())}
                      className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Sources List */}
                {localCustomSources.length > 0 && (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {localCustomSources.map((source) => (
                      <div key={source.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {source.name}
                            </h4>
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <ExternalLink size={14} />
                            </a>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {source.url}
                          </p>
                        </div>
                        <button
                          onClick={() => removeCustomSource(source.id)}
                          className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {localCustomSources.length === 0 && (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                    <p className="text-sm">No custom sources added yet.</p>
                    <p className="text-xs">Add specific websites you want the AI to prioritize.</p>
                  </div>
                )}
              </div>

              {/* Preset Templates */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Instruction Templates
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => setLocalSystemInstructions(
                      "You are a market research analyst. Focus on quantitative data, market trends, competitor analysis, and financial metrics. Prioritize recent industry reports, company financials, and regulatory filings. Include specific numbers, percentages, and growth rates."
                    )}
                    className="p-3 text-left text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="font-medium text-gray-900 dark:text-white">Market Research</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Financial data & trends</div>
                  </button>
                  
                  <button
                    onClick={() => setLocalSystemInstructions(
                      "You are a scientific research assistant. Focus on peer-reviewed papers, academic sources, and empirical data. Include methodology details, sample sizes, statistical significance, and cite all sources with DOI when available. Prioritize recent publications from reputable journals."
                    )}
                    className="p-3 text-left text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="font-medium text-gray-900 dark:text-white">Scientific Research</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Academic & peer-reviewed sources</div>
                  </button>
                  
                  <button
                    onClick={() => setLocalSystemInstructions(
                      "You are a legal research specialist. Focus on statutes, case law, regulations, and legal precedents. Cite specific legal cases, statute numbers, and regulatory codes. Include jurisdiction-specific information and recent legal developments."
                    )}
                    className="p-3 text-left text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="font-medium text-gray-900 dark:text-white">Legal Research</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Laws, cases & regulations</div>
                  </button>
                  
                  <button
                    onClick={() => setLocalSystemInstructions(
                      "You are a technology analyst. Focus on technical specifications, performance benchmarks, industry standards, and emerging technologies. Include version numbers, compatibility information, and quantitative comparisons. Prioritize official documentation and technical blogs."
                    )}
                    className="p-3 text-left text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="font-medium text-gray-900 dark:text-white">Technology Analysis</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Tech specs & benchmarks</div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* System Instructions - Full Width */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Research Instructions
            </label>
            <textarea
              value={localSystemInstructions}
              onChange={(e) => setLocalSystemInstructions(e.target.value)}
              placeholder="Enter custom instructions for the research AI..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Customize how the AI conducts research. Include specific requirements for sources, analysis depth, format, etc.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-700 px-6 py-4 rounded-b-xl">
          <div className="flex items-center justify-between">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Reset to Defaults
            </button>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Enhanced DeepResearchSettingsModal.jsx
 *
 * Advanced settings modal component for configuring deep research parameters including
 * model selection, processing mode, tool configuration, clarifications, custom sources,
 * and detailed instruction templates.
 *
 * New Features:
 * - Enable/disable clarifications toggle
 * - Custom sources management (add/remove specific URLs)
 * - Enhanced two-column layout for better organization
 * - URL validation for custom sources
 * - External link indicators
 * - Improved visual hierarchy
 *
 * Key Features:
 * - Model selection (o3-deep-research vs o4-mini-deep-research)
 * - Processing mode (immediate vs background with progress tracking)
 * - Maximum tool calls configuration with visual slider
 * - Research tools toggle (web search + code interpreter)
 * - Clarifications workflow toggle
 * - Custom sources/links management with validation
 * - Custom system instructions with preset templates
 * - Responsive two-column design
 * - Accessibility features and proper form validation
 *
 * Props:
 * - isOpen: Boolean to control modal visibility
 * - onClose: Function to close modal
 * - title: Modal title text
 * - model, setModel: Model selection state
 * - maxToolCalls, setMaxToolCalls: Tool calls limit state
 * - includeCodeInterpreter, setIncludeCodeInterpreter: Code interpreter toggle
 * - systemInstructions, setSystemInstructions: Custom instructions state
 * - isBackgroundMode, setIsBackgroundMode: Processing mode state
 * - enableClarifications, setEnableClarifications: NEW - Clarifications toggle
 * - customSources, setCustomSources: NEW - Custom sources array
 * - onSave: Function called when settings are saved
 *
 * Path: //GPT/gptcore/client/src/components/DeepResearchSettingsModal.jsx
 */