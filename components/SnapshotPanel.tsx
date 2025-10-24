import React, { useState, useCallback, DragEvent, useRef } from 'react';
import { FileIcon, UploadIcon, CheckCircleIcon, XCircleIcon } from './Icons';
import type { Snapshot, SnapshotData, SnapshotFile, SnapshotFileCategory } from '../types';
import { SNAPSHOT_CATEGORIES } from '../types';

interface SnapshotPanelProps {
    title: string;
    onSnapshotReady: (snapshot: Snapshot) => void;
}

export const SnapshotPanel: React.FC<SnapshotPanelProps> = ({ title, onSnapshotReady }) => {
    const [snapshotData, setSnapshotData] = useState<SnapshotData>({});
    const [error, setError] = useState<string | null>(null);
    const [isDragActive, setIsDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const processFiles = (files: FileList | null) => {
        if (!files || files.length === 0) {
            return;
        }
        setError(null);
        const newSnapshotData: SnapshotData = {};
        let filesProcessed = 0;
        const acceptedFiles = Array.from(files).filter(file => file.type === 'text/plain' || file.name.endsWith('.txt'));

        if (acceptedFiles.length === 0) {
            setError("No valid .txt files were provided. Please provide text files named after system categories (e.g., 'files.txt', 'registry.txt').");
            return;
        }

        acceptedFiles.forEach(file => {
            const reader = new FileReader();
            reader.onabort = () => console.log('file reading was aborted');
            reader.onerror = () => setError(`Error reading file ${file.name}`);
            reader.onload = () => {
                const fileContent = reader.result as string;
                const fileName = file.name.split('.')[0].toLowerCase() as SnapshotFileCategory;

                if (Object.keys(SNAPSHOT_CATEGORIES).includes(fileName)) {
                    const snapshotFile: SnapshotFile = {
                        name: file.name,
                        content: fileContent,
                    };
                    newSnapshotData[fileName] = snapshotFile;
                }
                
                filesProcessed++;
                if(filesProcessed === acceptedFiles.length) {
                    const mergedData = {...snapshotData, ...newSnapshotData};
                    setSnapshotData(mergedData);
                    
                    const newSnapshot: Snapshot = {
                        id: title.replace(/\s+/g, '-').toLowerCase(),
                        name: title,
                        createdAt: new Date(),
                        data: mergedData
                    };
                    onSnapshotReady(newSnapshot);
                }
            };
            reader.readAsText(file);
        });
    };

    const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files);
        }
    }, [snapshotData, onSnapshotReady, title]);

    const handleDrag = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragActive(true);
        } else if (e.type === "dragleave") {
            setIsDragActive(false);
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        processFiles(e.target.files);
    };

    const onButtonClick = () => {
        inputRef.current?.click();
    };

    const uploadedCategories = Object.keys(snapshotData) as SnapshotFileCategory[];

    return (
        <div className="border border-neutral-800 p-6 w-full">
            <h3 className="text-lg font-semibold mb-4 text-center title-font text-neutral-300">{title}</h3>
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={onButtonClick}
                className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors
                    ${isDragActive ? 'border-neutral-500 bg-neutral-900' : 'border-neutral-700 hover:border-neutral-600'}`}
            >
                <input ref={inputRef} type="file" multiple className="hidden" onChange={handleFileChange} accept=".txt,text/plain" />
                <div className="flex flex-col items-center">
                    <UploadIcon className="w-10 h-10 text-neutral-600 mb-3" />
                    {isDragActive ? (
                        <p className="text-neutral-400 mono-font">Drop files here</p>
                    ) : (
                        <p className="text-neutral-500 mono-font text-sm">Drag & drop or click to select</p>
                    )}
                </div>
            </div>

            {error && <p className="text-red-400 mt-4 text-sm mono-font flex items-center"><XCircleIcon className="w-4 h-4 mr-2 shrink-0"/>{error}</p>}
            
            {uploadedCategories.length > 0 && (
                <div className="mt-6">
                    <h4 className="font-semibold text-neutral-400 mb-2 flex items-center title-font text-sm">
                        <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
                        Files Uploaded
                    </h4>
                    <ul className="space-y-1 text-sm text-neutral-500 mono-font">
                        {uploadedCategories.map(category => (
                            <li key={category} className="flex items-center">
                                <FileIcon className="w-4 h-4 mr-2 text-neutral-600" />
                                {snapshotData[category]?.name}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};