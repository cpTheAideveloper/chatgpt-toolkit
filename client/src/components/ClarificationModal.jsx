/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { HelpCircle, SkipForward, ArrowRight } from "lucide-react";

export function ClarificationModal({
  isOpen,
  questions,
  onComplete,
  onSkip,
  onClose
}) {
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setAnswers({});
      setCurrentQuestionIndex(0);
    }
  }, [isOpen]);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleComplete = () => {
    onComplete(answers);
  };

  const handleSkip = () => {
    onSkip();
  };

  const getAnsweredCount = () => {
    return Object.values(answers).filter(answer => {
      if (Array.isArray(answer)) {
        return answer.length > 0; // For multiselect answers
      }
      return answer && typeof answer === 'string' && answer.trim().length > 0;
    }).length;
  };



  if (!isOpen || !questions || questions.length === 0) return null;

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <HelpCircle className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Research Clarifications
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Help me understand your research needs better
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span>{getAnsweredCount()} answered</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Current Question */}
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {currentQuestion.question}
              </h3>
              {currentQuestion.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {currentQuestion.description}
                </p>
              )}
            </div>

            {/* Answer Input */}
            <div className="space-y-2">
              {currentQuestion.type === "text" && (
                <textarea
                  value={answers[currentQuestion.id] || ""}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  placeholder={currentQuestion.placeholder || "Enter your answer..."}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              )}

              {currentQuestion.type === "select" && (
                <select
                  value={answers[currentQuestion.id] || ""}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select an option...</option>
                  {currentQuestion.options?.map((option, index) => (
                    <option key={index} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}

              {currentQuestion.type === "multiselect" && (
                <div className="space-y-2">
                  {currentQuestion.options?.map((option, index) => (
                    <label key={index} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={(answers[currentQuestion.id] || []).includes(option.value)}
                        onChange={(e) => {
                          const currentAnswers = answers[currentQuestion.id] || [];
                          if (e.target.checked) {
                            handleAnswerChange(currentQuestion.id, [...currentAnswers, option.value]);
                          } else {
                            handleAnswerChange(currentQuestion.id, currentAnswers.filter(v => v !== option.value));
                          }
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-900 dark:text-white">{option.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Examples or hints */}
            {currentQuestion.examples && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <p className="font-medium mb-1">Examples:</p>
                <ul className="list-disc list-inside space-y-1">
                  {currentQuestion.examples.map((example, index) => (
                    <li key={index}>{example}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Question Navigation */}
          <div className="mt-6 flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            <div className="flex space-x-2">
              {!isLastQuestion && (
                <button
                  onClick={handleNext}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ArrowRight size={16} />
                </button>
              )}

              {isLastQuestion && (
                <button
                  onClick={handleComplete}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Start Research
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-700 px-6 py-4 rounded-b-xl">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              You can skip questions or come back to them later
            </p>
            
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center space-x-2"
            >
              <SkipForward size={16} />
              <span>Skip Clarifications</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ClarificationModal.jsx
 *
 * Interactive modal component for collecting clarification answers before starting
 * deep research. Provides a step-by-step interface for answering follow-up questions
 * that help improve research targeting and outcomes.
 *
 * Key Features:
 * - Step-by-step question navigation with progress tracking
 * - Multiple input types (text, select, multiselect)
 * - Progress bar and completion status
 * - Optional question skipping
 * - Responsive design with accessibility features
 * - Examples and hints for better user guidance
 *
 * Props:
 * - isOpen: Boolean to control modal visibility
 * - questions: Array of clarification question objects
 * - onComplete: Function called with answers when user completes
 * - onSkip: Function called when user skips clarifications
 * - onClose: Function to close modal
 *
 * Question Object Structure:
 * {
 *   id: string,
 *   question: string,
 *   description?: string,
 *   type: "text" | "select" | "multiselect",
 *   placeholder?: string,
 *   options?: [{ label: string, value: string }],
 *   examples?: string[]
 * }
 *
 * Dependencies:
 * - lucide-react icons (HelpCircle, SkipForward, ArrowRight)
 * - Tailwind CSS for styling
 *
 * Path: //GPT/gptcore/client/src/components/ClarificationModal.jsx
 */