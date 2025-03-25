import React from 'react';

const WelcomeMessage = () => {
  return (
    <div className="min-h-screen w-full bg-black">
      <div className="max-w-2xl mx-auto px-6 py-24 flex flex-col items-center text-center">
        <h1 className="text-5xl md:text-6xl font-extralight tracking-tight text-white mb-4">
        </h1>
        
        <p className="text-lg md:text-xl text-white/80 font-light leading-relaxed max-w-lg mt-8">
          Build in public. Publish your progress.
        </p>
        
        <p className="text-base text-white/60 mt-2 max-w-md">
          Share your story through your GitHub contributions
        </p>
        
        <div className="mt-16 w-12 h-[1px] bg-white/20"></div>
      </div>
    </div>
  );
};

export default WelcomeMessage; 