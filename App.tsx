import React, { useState } from 'react';
import { Header } from './components/Header';
import { Instructions } from './components/Instructions';
import { SnapshotUploadForm } from './components/SnapshotUploadForm';
import { ComparisonView } from './components/ComparisonView';
import { Loader } from './components/Loader';
import { compareSnapshots } from './services/geminiService';
import type { Snapshot, ComparisonResult, AppView } from './types';

function App() {
  const [view, setView] = useState<AppView>('instructions');
  const [snapshots, setSnapshots] = useState<[Snapshot | null, Snapshot | null]>([null, null]);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = () => {
    setView('upload');
  };

  const handleReset = () => {
    setView('instructions');
    setSnapshots([null, null]);
    setComparisonResult(null);
    setIsLoading(false);
    setError(null);
  };
  
  const handleSnapshotsUploaded = (snapshotA: Snapshot, snapshotB: Snapshot) => {
    setSnapshots([snapshotA, snapshotB]);
    handleCompare(snapshotA, snapshotB);
  };

  const handleCompare = async (snapshotA: Snapshot, snapshotB: Snapshot) => {
    if (!snapshotA || !snapshotB) {
      setError("Both snapshots must be provided for comparison.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setComparisonResult(null);

    try {
      const result = await compareSnapshots(snapshotA, snapshotB);
      setComparisonResult(result);
      setView('comparison');
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred during comparison.");
      setView('upload'); // Go back to upload view on error
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <Loader message="Analyzing snapshots..." />;
    }

    if (error) {
        return (
            <div className="text-red-400 border border-red-400/30 bg-red-400/10 p-4 my-4 animate-fade-in">
                <p className="title-font">Error</p>
                <p className="mono-font mt-2">{error}</p>
                <button onClick={handleReset} className="mt-4 px-4 py-2 border border-red-400/50 text-red-300 hover:bg-red-400/20 transition-colors text-sm title-font">Try Again</button>
            </div>
        );
    }

    switch (view) {
      case 'instructions':
        return <Instructions onStart={handleStart} />;
      case 'upload':
        return <SnapshotUploadForm onSnapshotsUploaded={handleSnapshotsUploaded} />;
      case 'comparison':
        if (comparisonResult && snapshots[0] && snapshots[1]) {
          return <ComparisonView 
            result={comparisonResult} 
            snapshotA={snapshots[0]} 
            snapshotB={snapshots[1]} 
          />;
        }
        // Fallback if state is inconsistent
        handleReset();
        return null;
      default:
        return <Instructions onStart={handleStart} />;
    }
  };

  return (
    <div className="bg-black text-neutral-300 min-h-screen">
      <Header onReset={handleReset} />
      <main className="container mx-auto p-4 md:p-8">
        {renderContent()}
      </main>
      <footer className="text-center p-4 text-neutral-700 text-xs title-font">
        Powered by Google Gemini
      </footer>
    </div>
  );
}

export default App;