import React, { useState } from 'react';
import type { ComparisonResult, Snapshot, SnapshotFileCategory } from '../types';
import { SNAPSHOT_CATEGORIES } from '../types';
import { ArrowDownIcon, ArrowUpIcon, DocumentTextIcon } from './Icons';

interface ComparisonViewProps {
    result: ComparisonResult;
    snapshotA: Snapshot;
    snapshotB: Snapshot;
}

const CategoryResult: React.FC<{ category: SnapshotFileCategory, content: string }> = ({ category, content }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className="border border-neutral-800">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full text-left p-4 bg-neutral-900/50 hover:bg-neutral-900 flex justify-between items-center focus:outline-none"
            >
                <div className="flex items-center">
                    <DocumentTextIcon className="w-5 h-5 mr-3 text-neutral-500" />
                    <h3 className="title-font text-lg text-neutral-300">{SNAPSHOT_CATEGORIES[category]}</h3>
                </div>
                {isExpanded ? <ArrowUpIcon className="w-5 h-5 text-neutral-600" /> : <ArrowDownIcon className="w-5 h-5 text-neutral-600" />}
            </button>
            {isExpanded && (
                 <div className="p-6 text-neutral-400 mono-font text-sm leading-relaxed overflow-x-auto">
                    <pre className="whitespace-pre-wrap">{content}</pre>
                </div>
            )}
        </div>
    );
};

export const ComparisonView: React.FC<ComparisonViewProps> = ({ result, snapshotA, snapshotB }) => {
    return (
        <div className="animate-fade-in">
            <div className="text-center mb-10">
                <h2 className="text-2xl title-font mb-2">Comparison Analysis</h2>
                <p className="text-neutral-500 mono-font">
                    Analysis of changes between "{snapshotA.name}" and "{snapshotB.name}".
                </p>
            </div>

            <div className="space-y-6">
                {(Object.keys(result) as SnapshotFileCategory[]).map(category => (
                    result[category] ? (
                        <CategoryResult key={category} category={category} content={result[category]!} />
                    ) : null
                ))}
            </div>
        </div>
    );
};