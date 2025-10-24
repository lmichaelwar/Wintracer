
import React, { useState } from 'react';
import type { ComparisonResult, Snapshot, SnapshotFileCategory } from '../types';
import { SNAPSHOT_CATEGORIES } from '../types';

interface ComparisonViewProps {
  result: ComparisonResult;
  snapshots: [Snapshot, Snapshot];
}

const ComparisonView: React.FC<ComparisonViewProps> = ({ result, snapshots }) => {
  const categories = Object.keys(result) as SnapshotFileCategory[];
  const [activeTab, setActiveTab] = useState<SnapshotFileCategory>(categories[0] || 'files');
  const [olderSnapshot, newerSnapshot] = snapshots;

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col">
        <div className="flex-shrink-0 mb-4 pb-4 border-b border-gray-700">
            <h2 className="text-2xl font-bold text-white">Comparison Result</h2>
            <p className="text-sm text-gray-400">
                Comparing "{olderSnapshot.name}" with "{newerSnapshot.name}"
            </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0">
            <div className="w-full md:w-48 flex-shrink-0">
                <nav className="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveTab(cat)}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 text-left whitespace-nowrap ${
                                activeTab === cat
                                    ? 'bg-cyan-600 text-white'
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`}
                        >
                            {SNAPSHOT_CATEGORIES[cat]}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="flex-1 bg-gray-900 rounded-lg p-6 min-h-0 overflow-y-auto">
                 <div className="prose prose-invert prose-sm max-w-none prose-pre:bg-gray-800 prose-pre:p-4 prose-pre:rounded-md">
                    <pre className="whitespace-pre-wrap break-words font-mono text-sm leading-relaxed">
                        {result[activeTab]}
                    </pre>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ComparisonView;
