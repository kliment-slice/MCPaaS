'use client';

import React, { useState } from 'react';

export const ChatInput = () => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle message submission here
    setMessage('');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] p-4">
      <form onSubmit={handleSubmit} className="flex items-center gap-2 max-w-[1200px] mx-auto">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask anything, use @ to tag files and collections"
          className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none"
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-1 px-3 py-1 text-sm text-gray-300 hover:bg-gray-700 rounded-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add
          </button>
          <button
            type="button"
            className="flex items-center gap-1 px-3 py-1 text-sm bg-[#85e249] text-black rounded-full hover:bg-[#76c940]"
          >
            Web
          </button>
          <button
            type="button"
            className="flex items-center gap-1 px-3 py-1 text-sm text-gray-300 hover:bg-gray-700 rounded-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
            </svg>
            Filters
          </button>
        </div>
      </form>
    </div>
  );
}; 