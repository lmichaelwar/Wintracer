
import React from 'react';
import type { Snapshot } from '../types';
import { PlusIcon, TrashIcon, CompareIcon } from './Icons';

interface SnapshotPanelProps {
  snapshots: Snapshot[];
  selectedSnapshotIds: string[];
  onToggleSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onCompare: () => void;
  onAddNew: () => void;
}

const SnapshotPanel: React.FC<SnapshotPanelProps> = ({
  snapshots,
  selectedSnapshotIds,
  onToggleSelect,
  onDelete,
  onCompare,
  onAddNew,
}) => {
  const canCompare = selectedSnapshotIds.length === 2;

  return (
    <aside className="w-full md:w-80 lg:w-96 flex-shrink-0 bg-gray-900 p-4 border-b md:border-b-0 md:border-r border-gray-700 flex flex-col">
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-lg font-semibold">Snapshots</h2>
        <button
          onClick={onAddNew}
          className="flex items-center space-x-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2 px-3 rounded-lg transition-colors duration-200 text-sm"
        >
          <PlusIcon className="w-5 h-5" />
          <span>New</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 -mr-2">
        {snapshots.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">
            <p>No snapshots yet.</p>
            <p className="text-sm">Click "New" to create one.</p>
          </div>
        ) : (
          snapshots.map(snapshot => (
            <div
              key={snapshot.id}
              onClick={() => onToggleSelect(snapshot.id)}
              className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border-2 ${
                selectedSnapshotIds.includes(snapshot.id)
                  ? 'bg-cyan-900/50 border-cyan-500 shadow-lg'
                  : 'bg-gray-800 border-transparent hover:border-gray-600'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-gray-100">{snapshot.name}</p>
                  <p className="text-xs text-gray-400">
                    {snapshot.createdAt.toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(snapshot.id);
                  }}
                  className="p-1 rounded-full text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700">
        <button
          onClick={onCompare}
          disabled={!canCompare}
          className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:text-gray-400"
        >
          <CompareIcon className="w-6 h-6" />
          <span>Compare Snapshots</span>
        </button>
        {!canCompare && (
          <p className="text-center text-xs text-gray-500 mt-2">
            Select two snapshots to compare
          </p>
        )}
      </div>
    </aside>
  );
};

export default SnapshotPanel;
