/* eslint-disable react/prop-types */
// VerificationModal.jsx
import { useState } from "react";
import { ShieldCheck } from "lucide-react";

export function VerificationModal({ modelName = "gpt-image-1" }) {
  const [showModal, setShowModal] = useState(true);


  const handleVerify = () => {
    // Open the correct OpenAI organization settings page in a new tab
    window.open("https://platform.openai.com/settings/organization/general", "_blank");
    

    
    // For demonstration purposes, we'll simulate a successful verification
    // In a real implementation, you would check if the user has completed the verification process
    setTimeout(() => {
   
      setShowModal(false);
    }, 1000);
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center justify-center mb-4 text-blue-600">
          <ShieldCheck size={48} />
        </div>
        <h2 className="text-xl font-semibold text-center mb-2">ID Verification Required</h2>
        <p className="text-gray-600 mb-4 text-center">
          This feature uses the new {modelName} model and requires identity verification before use.
        </p>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Please complete verification on the <a href="https://platform.openai.com/settings/organization/general" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI organization settings page</a> before proceeding.
        </p>
        <div className="space-y-4">
          <button
            onClick={handleVerify}
    
            className={`w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors`}
          >
         OK
          </button>
          <button
            onClick={() => setShowModal(false)}
            className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}