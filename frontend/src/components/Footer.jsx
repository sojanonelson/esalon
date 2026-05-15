import React from 'react';

const Footer = () => {
  return (
    <footer className="glass-panel mt-auto py-8 border-x-0 border-b-0 rounded-none text-center text-gray-400 text-sm">
      <div className="max-w-7xl mx-auto px-5">
      
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 mt-4 text-sm">
          <span className="text-white/70">Developed by:</span>
          <span className="font-semibold text-accentPrimary">P Redhin & Vachas V B</span>
          <span className="hidden sm:block w-1.5 h-1.5 rounded-full bg-white/20"></span>
          <span className="text-white/70">Department:</span>
          <span className="font-semibold text-accentPrimary">BCA</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
