import { useState } from "react";
import { MessageCircle, X } from "lucide-react";

const ChatbotButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Chatbot Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:scale-110 transition-all duration-300 animate-float"
        aria-label="Open chat support"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>

      {/* Chat Interface */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 h-96 bg-gray-900 rounded-xl shadow-2xl border border-gray-700 flex flex-col">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-xl">
            <h3 className="font-semibold">Career Assistant</h3>
            <p className="text-sm opacity-90">How can I help you today?</p>
          </div>

          {/* Chat Content */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="bg-gray-700 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-300 mb-2">
                Hello! I'm your AI career assistant. I can help you with:
              </p>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Career guidance questions</li>
                <li>• Roadmap recommendations</li>
                <li>• Learning resources</li>
                <li>• Skill assessments</li>
              </ul>
            </div>

            <div className="flex flex-wrap gap-2">
              <button className="btn btn-sm btn-outline text-xs">
                Career advice
              </button>
              <button className="btn btn-sm btn-outline text-xs">
                Find roadmap
              </button>
              <button className="btn btn-sm btn-outline text-xs">
                Skill test
              </button>
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-gray-800 text-white"
              />
              <button className="btn btn-primary btn-sm">
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotButton;