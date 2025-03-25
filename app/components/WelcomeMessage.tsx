import React from 'react';

const WelcomeMessage = () => {
  return (
    <div className="max-w-2xl mx-auto px-6 py-24 flex flex-col items-center text-center">
      <h1 className="text-5xl md:text-6xl font-extralight tracking-tight text-gray-900 mb-4">
        Public
        <span className="font-normal">Builder</span>
      </h1>
      
      <p className="text-lg md:text-xl text-gray-500 font-light leading-relaxed max-w-lg mt-8">
        Let's create something meaningful.
      </p>
      
      <p className="text-base text-gray-400 mt-2 max-w-md">
        Share your story through your GitHub contributions
      </p>
      
      <div className="mt-16 w-12 h-[1px] bg-gray-200"></div>
    </div>
  );
};

export default WelcomeMessage; 