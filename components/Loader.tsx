import React from 'react';

interface LoaderProps {
    message?: string;
}

export const Loader: React.FC<LoaderProps> = ({ message = "Loading..." }) => {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center animate-fade-in">
            <div className="w-12 h-12 border-2 border-neutral-600 border-t-neutral-300 rounded-full animate-spin"></div>
            <p className="mt-4 text-neutral-400 mono-font">{message}</p>
        </div>
    );
};