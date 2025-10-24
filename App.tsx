
import React, { useState, useCallback, useMemo } from 'react';
import type { AppView, Snapshot, ComparisonResult, SnapshotFileCategory } from './types.ts';
import { SNAPSHOT_CATEGORIES } from './types.ts';
import { compareSnapshots } from './services/geminiService.ts';

import Header from './components/Header';
import SnapshotPanel from './components/SnapshotPanel';
import Instructions from './components/Instructions';
import SnapshotUploadForm from './components/SnapshotUploadForm';
import ComparisonView from './components/ComparisonView';
import Loader from './components/Loader';

export default function App() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [selectedSnapshotIds, setSelectedSnapshotIds] = useState<string[]>([]);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<AppView>('instructions');

  const handleAddSnapshot = (snapshot: Snapshot) => {
    setSnapshots(prev => [...prev, snapshot].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    setView('instructions');
  };

  const handleToggleSnapshotSelection = (id: string) => {
    setSelectedSnapshotIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(sid => sid !== id);
      }
      if (prev.length < 2) {
        return [...prev, id];
      }
      return [prev[1], id]; // Keep last selected and add new one
    });
  };
  
  const handleDeleteSnapshot = (id: string) => {
    setSnapshots(prev => prev.filter(s => s.id !== id));
    setSelectedSnapshotIds(prev => prev.filter(sid => sid !== id));
  };

  const handleCompare = useCallback(async () => {
    if (selectedSnapshotIds.length !== 2) {
      setError("Please select exactly two snapshots to compare.");
      return;
    }

    const snapshotA = snapshots.find(s => s.id === selectedSnapshotIds[0]);
    const snapshotB = snapshots.find(s => s.id === selectedSnapshotIds[1]);

    if (!snapshotA || !snapshotB) {
      setError("Could not find the selected snapshots.");
      return;
    }
    
    // Ensure B is always newer than A
    const [olderSnapshot, newerSnapshot] = [snapshotA, snapshotB].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    setIsLoading(true);
    setError(null);
    setComparisonResult(null);
    setView('comparison');

    try {
      const result = await compareSnapshots(olderSnapshot, newerSnapshot);
      setComparisonResult(result);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "An unknown error occurred during comparison.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedSnapshotIds, snapshots]);

  const selectedSnapshots = useMemo(() => {
    if (selectedSnapshotIds.length !== 2) return null;
    const s1 = snapshots.find(s => s.id === selectedSnapshotIds[0]);
    const s2 = snapshots.find(s => s.id === selectedSnapshotIds[1]);
    if (!s1 || !s2) return null;
    return [s1, s2].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }, [selectedSnapshotIds, snapshots]);

  const renderContent = () => {
    if (isLoading) {
      return <Loader message="AI is analyzing the snapshots... This may take a moment." />;
    }
    if (error) {
      return <div className="p-8 text-center text-red-400">{error}</div>;
    }
    switch (view) {
      case 'comparison':
        return comparisonResult && selectedSnapshots ? (
          <ComparisonView result={comparisonResult} snapshots={selectedSnapshots} />
        ) : (
          <Loader message="Preparing comparison..." />
        );
      case 'upload':
        return <SnapshotUploadForm onAddSnapshot={handleAddSnapshot} onCancel={() => setView('instructions')} />;
      case 'instructions':
      default:
        return <Instructions />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      <Header />
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        <SnapshotPanel
          snapshots={snapshots}
          selectedSnapshotIds={selectedSnapshotIds}
          onToggleSelect={handleToggleSnapshotSelection}
          onDelete={handleDeleteSnapshot}
          onCompare={handleCompare}
          onAddNew={() => {
            setView('upload');
            setComparisonResult(null);
            setError(null);
          }}
        />
        <main className="flex-1 min-h-0 overflow-y-auto bg-gray-800/50 md:rounded-tl-2xl">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
