import React from 'react';
import { LogoIcon } from './Icons';

interface HeaderProps {
    onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onReset }) => {
    return (
        <header className="border-b border-neutral-800">
            <div className="container mx-auto px-4 md:px-8 py-5 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <LogoIcon className="w-8 h-8 text-neutral-500" />
                    <div>
                        <h1 className="text-xl text-neutral-200 title-font">
                            WinTracer
                        </h1>
                        <p className="text-xs text-neutral-600 title-font tracking-widest">An instrument for system inquiry.</p>
                    </div>
                </div>
                <button
                    onClick={onReset}
                    className="px-4 py-2 border border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 focus:outline-none transition-colors text-sm title-font"
                >
                    Reset
                </button>
            </div>
        </header>
    );
};