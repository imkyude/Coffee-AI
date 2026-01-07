import React from 'react';

const WelcomeScreen = ({ onStartChat }) => {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Welcome to Chat</h2>
        <p className="text-gray-600 mb-6">
          Start a conversation with our AI assistant. Ask questions, get help, or just chat!
        </p>
        <button
          onClick={onStartChat}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Start Chatting
        </button>
        <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <p className="font-medium text-gray-900">Quick</p>
            <p className="text-gray-500">Responses</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <p className="font-medium text-gray-900">Smart</p>
            <p className="text-gray-500">AI Models</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <p className="font-medium text-gray-900">Secure</p>
            <p className="text-gray-500">Private</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
