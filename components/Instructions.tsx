import React from 'react';

interface InstructionsProps {
    onStart: () => void;
}

export const Instructions: React.FC<InstructionsProps> = ({ onStart }) => {
    return (
        <div className="max-w-3xl mx-auto text-center animate-fade-in py-12">
            <h2 className="text-2xl text-neutral-200 title-font">
                A Framework for System Inquiry
            </h2>
            <p className="text-neutral-500 mt-4 leading-relaxed mono-font">
                WinTracer utilizes the Gemini model to analyze and compare two distinct snapshots of a Windows system. By examining file systems, registries, processes, and services, it provides a clear and concise report on all detected changes, identifying additions, removals, and modifications.
            </p>

            <div className="mt-12 border-t border-neutral-800 pt-12">
                 <h3 className="text-lg text-neutral-300 title-font">
                    Protocol
                </h3>
                <ol className="mt-6 space-y-8 text-neutral-500 mono-font">
                    <li>
                        <span className="text-neutral-400">1. Baseline Snapshot:</span> Generate a complete snapshot of the system in its initial, unaltered state.
                    </li>
                    <li>
                        <span className="text-neutral-400">2. System Modification:</span> Perform the intended action, such as a software installation, configuration change, or update.
                    </li>
                    <li>
                        <span className="text-neutral-400">3. Final Snapshot:</span> Generate a second complete snapshot of the system post-modification.
                    </li>
                     <li>
                        <span className="text-neutral-400">4. Analysis:</span> Upload both snapshots to receive a comprehensive analysis of the resulting changes.
                    </li>
                </ol>
            </div>

            <div className="text-center mt-16">
                <button
                    onClick={onStart}
                    className="border border-neutral-700 text-neutral-300 font-bold py-3 px-10 hover:bg-neutral-800 hover:border-neutral-600 transition-colors title-font"
                >
                    Initiate Comparison
                </button>
            </div>
        </div>
    );
};