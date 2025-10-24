import React, { useState } from 'react';
import { SnapshotPanel } from './SnapshotPanel';
import type { Snapshot } from '../types';

interface SnapshotUploadFormProps {
    onSnapshotsUploaded: (snapshotA: Snapshot, snapshotB: Snapshot) => void;
}

export const SnapshotUploadForm: React.FC<SnapshotUploadFormProps> = ({ onSnapshotsUploaded }) => {
    const [snapshotA, setSnapshotA] = useState<Snapshot | null>(null);
    const [snapshotB, setSnapshotB] = useState<Snapshot | null>(null);

    const handleCompareClick = () => {
        if (snapshotA && snapshotB) {
            onSnapshotsUploaded(snapshotA, snapshotB);
        }
    };

    return (
        <div className="animate-fade-in">
            <h2 className="text-2xl title-font text-center mb-2">Upload Snapshots</h2>
            <p className="text-center text-neutral-500 mb-8 mono-font">Provide the baseline and post-modification system snapshots.</p>

            <div className="flex flex-col md:flex-row gap-8 justify-center">
                <SnapshotPanel title="Snapshot A (Baseline)" onSnapshotReady={setSnapshotA} />
                <SnapshotPanel title="Snapshot B (Post-Modification)" onSnapshotReady={setSnapshotB} />
            </div>
            
            <div className="text-center mt-10">
                <button
                    onClick={handleCompareClick}
                    disabled={!snapshotA || !snapshotB}
                    className="border border-neutral-700 text-neutral-300 font-bold py-3 px-12 transition-all title-font
                               disabled:border-neutral-800 disabled:text-neutral-600 disabled:cursor-not-allowed
                               hover:enabled:bg-neutral-800 hover:enabled:border-neutral-600"
                >
                    Compare Snapshots
                </button>
            </div>
        </div>
    );
};