
import React from 'react';
import { TelescopeIcon } from './Icons';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 p-4 sticky top-0 z-10">
      <div className="max-w-screen-2xl mx-auto flex items-center space-x-3">
        <TelescopeIcon className="w-8 h-8 text-cyan-400" />
        <div>
          <h1 className="text-xl font-bold text-gray-50">WinTracer AI</h1>
          <p className="text-xs text-gray-400">AI-Powered System Change Analysis for Windows</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
