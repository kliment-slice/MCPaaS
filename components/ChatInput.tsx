'use client';

import React, { useState, FormEvent, ChangeEvent } from 'react';

export const ChatInput: React.FC = () => {
  const [message, setMessage] = useState<string>('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle message submission here
    setMessage('');
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white py-6">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-6">
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={message}
            onChange={handleChange}
            placeholder="Tell me what you want to post about..."
            className="flex-1 px-4 py-3 text-gray-900 placeholder-gray-500 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-transparent transition-all"
          />
          <button
            type="submit"
            className="px-6 py-3 text-sm font-medium text-gray-900 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Create
          </button>
        </div>
      </form>
    </div>
  );
}; 