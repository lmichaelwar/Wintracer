import React, { useState } from 'react';
import { DownloadIcon, ChevronDownIcon } from './Icons';

interface InstructionsProps {
    onStart: () => void;
}

const batScriptContent = `@echo off
setlocal

:: Create a timestamped folder on the desktop
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /format:list') do set datetime=%%I
set "stamp=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2%_%datetime:~8,2%-%datetime:~10,2%-%datetime:~12,2%"
set "snapshot_dir=%USERPROFILE%\\Desktop\\WinTracer_Snapshot_%stamp%"
mkdir "%snapshot_dir%"
cd /d "%snapshot_dir%"

echo Generating snapshot in %snapshot_dir%...

set "tracerfile=snapshot-%stamp%.tracerfile"

:: Run commands and save output into a single tracerfile with separators
(
    echo --- WINTRACER_SECTION: files ---
    echo Listing C:\\Windows\\System32 files...
    dir C:\\Windows\\System32
    echo.
    echo --- WINTRACER_SECTION: registry ---
    echo Querying registry keys...
    reg query HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run
    echo.
    echo --- WINTRACER_SECTION: processes ---
    echo Listing running processes...
    tasklist /v
    echo.
    echo --- WINTRACER_SECTION: services ---
    echo Listing services...
    sc query state= all
    echo.
    echo --- WINTRACER_SECTION: drivers ---
    echo Listing drivers...
    driverquery /v
    echo.
    echo --- WINTRACER_SECTION: netstat ---
    echo Listing network connections...
    netstat -ano
) > "%tracerfile%"


echo.
echo Snapshot complete.
echo File created at: %snapshot_dir%\\%tracerfile%
echo You can now upload this file to WinTracer.

endlocal
pause
`;

const ps1ScriptContent = `# Get timestamp for folder name
$stamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$snapshotDir = "$HOME\\Desktop\\WinTracer_Snapshot_$stamp"

# Create directory
New-Item -ItemType Directory -Path $snapshotDir -Force
Set-Location -Path $snapshotDir

Write-Host "Generating snapshot in $snapshotDir..."

$tracerfile = "snapshot-$stamp.tracerfile"

# Run commands and append to the tracerfile with separators
"--- WINTRACER_SECTION: files ---" | Out-File -FilePath $tracerfile -Encoding utf8
Write-Host "Listing C:\\Windows\\System32 files..."
Get-ChildItem C:\\Windows\\System32 | Format-List | Out-File -FilePath $tracerfile -Encoding utf8 -Append

"
--- WINTRACER_SECTION: registry ---" | Out-File -FilePath $tracerfile -Encoding utf8 -Append
Write-Host "Querying registry keys..."
Get-ItemProperty -Path "HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" | Format-List | Out-File -FilePath $tracerfile -Encoding utf8 -Append

"
--- WINTRACER_SECTION: processes ---" | Out-File -FilePath $tracerfile -Encoding utf8 -Append
Write-Host "Listing running processes..."
Get-Process | Select-Object -Property * | Out-File -FilePath $tracerfile -Encoding utf8 -Append

"
--- WINTRACER_SECTION: services ---" | Out-File -FilePath $tracerfile -Encoding utf8 -Append
Write-Host "Listing services..."
Get-Service | Format-List | Out-File -FilePath $tracerfile -Encoding utf8 -Append

"
--- WINTRACER_SECTION: drivers ---" | Out-File -FilePath $tracerfile -Encoding utf8 -Append
Write-Host "Listing drivers..."
Get-CimInstance Win32_SystemDriver | Select-Object -Property * | Out-File -FilePath $tracerfile -Encoding utf8 -Append

"
--- WINTRACER_SECTION: netstat ---" | Out-File -FilePath $tracerfile -Encoding utf8 -Append
Write-Host "Listing network connections..."
Get-NetTCPConnection | Format-List | Out-File -FilePath $tracerfile -Encoding utf8 -Append

Write-Host "\`nSnapshot complete."
Write-Host "File created at: $snapshotDir\\$tracerfile"
Write-Host "You can now upload this file to WinTracer."

Read-Host -Prompt "Press Enter to exit"
`;


const HowItWorks = () => {
    const [isOpen, setIsOpen] = useState(false);

    const CommandBlock: React.FC<{ command: string }> = ({ command }) => (
        <pre className="bg-black p-4 mt-2 border border-neutral-800 mono-font text-sm text-neutral-400 overflow-x-auto">
            <code>{command}</code>
        </pre>
    );

    return (
        <div className="text-left max-w-2xl mx-auto mt-12 border-t border-neutral-800 pt-8">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-neutral-500 hover:text-neutral-300 transition-colors"
            >
                <span className="title-font text-lg">How It Works & Manual Commands</span>
                <ChevronDownIcon className={`w-6 h-6 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="mt-6 text-neutral-500 space-y-6 animate-fade-in">
                    <p>The downloadable scripts automate the process of collecting system information into a single <code className="text-neutral-400 mono-font">.tracerfile</code>. This file is a plain text document containing several sections, each corresponding to a different system category.</p>
                    <p>You can also generate these files manually by running the commands below in your terminal and saving the output. Ensure the section headers (e.g., <code className="text-neutral-400 mono-font">--- WINTRACER_SECTION: files ---</code>) are included so the application can parse the file correctly.</p>
                    
                    <div>
                        <h4 className="title-font text-neutral-300">File System</h4>
                        <CommandBlock command="dir C:\Windows\System32" />
                    </div>
                    <div>
                        <h4 className="title-font text-neutral-300">Registry</h4>
                        <CommandBlock command="reg query HKLM\Software\Microsoft\Windows\CurrentVersion\Run" />
                    </div>
                    <div>
                        <h4 className="title-font text-neutral-300">Processes</h4>
                        <CommandBlock command="tasklist /v" />
                    </div>
                    <div>
                        <h4 className="title-font text-neutral-300">Services</h4>
                        <CommandBlock command="sc query state= all" />
                    </div>
                    <div>
                        <h4 className="title-font text-neutral-300">Drivers</h4>
                        <CommandBlock command="driverquery /v" />
                    </div>
                     <div>
                        <h4 className="title-font text-neutral-300">Network Connections</h4>
                        <CommandBlock command="netstat -ano" />
                    </div>
                </div>
            )}
        </div>
    );
};

const ScriptButton: React.FC<{ content: string, filename: string, children: React.ReactNode }> = ({ content, filename, children }) => {
    const download = () => {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <button
            onClick={download}
            className="flex items-center justify-center gap-3 w-60 px-4 py-3 border border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 focus:outline-none transition-colors text-sm title-font"
        >
            <DownloadIcon className="w-5 h-5" />
            {children}
        </button>
    );
};

export const Instructions: React.FC<InstructionsProps> = ({ onStart }) => {
    return (
        <div className="max-w-3xl mx-auto animate-fade-in text-center">
            <h2 className="text-3xl title-font mb-4">Trace System Changes</h2>
            <p className="text-neutral-400 mb-12 leading-relaxed">
                Generate a snapshot before and after a system modification to analyze the exact changes made.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12 items-start">
                <div className="text-center md:text-right">
                    <h3 className="text-xl title-font mb-4 text-neutral-200">1. Generate Snapshot</h3>
                    <p className="text-neutral-500 mb-6 mono-font text-sm">
                        Run the script on your system. It will create a <code className="text-neutral-400">.tracerfile</code> on your desktop. Run it once before a change, and once after.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-end">
                         <ScriptButton content={batScriptContent} filename="take_snapshot.bat">
                            Download for CMD (.bat)
                        </ScriptButton>
                        <ScriptButton content={ps1ScriptContent} filename="take_snapshot.ps1">
                            Download for PowerShell (.ps1)
                        </ScriptButton>
                    </div>
                </div>

                <div className="text-center md:text-left">
                     <h3 className="text-xl title-font mb-4 text-neutral-200">2. Upload & Compare</h3>
                     <p className="text-neutral-500 mb-6 mono-font text-sm">
                        Upload your two snapshot files—the baseline and the post-modification file—to begin the analysis.
                    </p>
                    <button
                        onClick={onStart}
                        className="border border-neutral-700 text-neutral-300 font-bold py-3 px-12 transition-all title-font hover:bg-neutral-800 hover:border-neutral-600"
                    >
                        Upload Snapshots
                    </button>
                </div>
            </div>

            <HowItWorks />
        </div>
    );
};
