import React, { useState } from 'react';
import { CopyIcon, CheckIcon, DownloadIcon, ChevronDownIcon, CameraIcon, SettingsIcon, CompareIcon } from './Icons';

const batScriptContent = `@echo off
setlocal

echo ========================================
echo == WinTracer AI - Snapshot Generator ==
echo ========================================
echo.

REM Create a timestamped folder for the snapshot files
echo [+] Creating a temporary snapshot folder...
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /format:list') do set datetime=%%I
set YEAR=%datetime:~0,4%
set MONTH=%datetime:~4,2%
set DAY=%datetime:~6,2%
set HOUR=%datetime:~8,2%
set MINUTE=%datetime:~10,2%
set SECOND=%datetime:~12,2%

set FOLDER_NAME=WinTracerTemp_%YEAR%-%MONTH%-%DAY%_%HOUR%-%MINUTE%-%SECOND%
set TRACER_FILENAME=snapshot_%YEAR%-%MONTH%-%DAY%_%HOUR%-%MINUTE%-%SECOND%.tracerfile
mkdir "%FOLDER_NAME%"
if errorlevel 1 (
    echo [!] Failed to create temporary directory. Aborting.
    goto :end
)
cd "%FOLDER_NAME%"
echo    ... Temp folder created: %FOLDER_NAME%
echo.

echo [+] Generating snapshot data. This may take a few minutes...
echo    [1/6] Capturing File System list...
dir C:\\ /s /b > files.txt 2>nul
echo    ... Done.

echo    [2/6] Exporting HKEY_LOCAL_MACHINE registry hive...
reg export HKEY_LOCAL_MACHINE hklm.reg >nul 2>nul
echo    ... Done.

echo    [3/6] Capturing running processes...
tasklist /v > processes.txt
echo    ... Done.

echo    [4/6] Capturing services list...
sc query type=service state=all > services.txt
echo    ... Done.

echo    [5/6] Capturing system drivers...
driverquery /v > drivers.txt
echo    ... Done.

echo    [6/6] Capturing network connections...
netstat -ano > netstat.txt
echo    ... Done.
echo.

echo [+] Consolidating data into a single .tracerfile...
(
    echo ---WINTRACER_AI_SEPARATOR:files---
    type files.txt
    echo.
    echo ---WINTRACER_AI_SEPARATOR:registry---
    type hklm.reg
    echo.
    echo ---WINTRACER_AI_SEPARATOR:processes---
    type processes.txt
    echo.
    echo ---WINTRACER_AI_SEPARATOR:services---
    type services.txt
    echo.
    echo ---WINTRACER_AI_SEPARATOR:drivers---
    type drivers.txt
    echo.
    echo ---WINTRACER_AI_SEPARATOR:netstat---
    type netstat.txt
) > "..\\%TRACER_FILENAME%"
echo    ... Done.
echo.

cd ..
rmdir /s /q "%FOLDER_NAME%"

echo ============================================
echo == Snapshot Generation Complete! ==
echo ============================================
echo.
echo Your snapshot file has been created:
echo %cd%\\%TRACER_FILENAME%
echo.
echo You can now upload this single file to WinTracer AI.
echo.

:end
pause
endlocal
`;

const ps1ScriptContent = `# ========================================
# == WinTracer AI - Snapshot Generator ==
# ========================================

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$tempFolderName = "WinTracerTemp_$timestamp"
$tracerFileName = "snapshot_$timestamp.tracerfile"

Write-Host "\n[+] Creating a temporary snapshot folder..."
try {
    New-Item -ItemType Directory -Path $tempFolderName -ErrorAction Stop | Out-Null
    Set-Location $tempFolderName
    Write-Host "   ... Temp folder created: $tempFolderName"
} catch {
    Write-Host "[!] Failed to create temporary directory. Aborting." -ForegroundColor Red
    Read-Host -Prompt "Press Enter to exit"
    exit
}

Write-Host "\n[+] Generating snapshot data. This may take a few minutes..."

Write-Host "   [1/6] Capturing File System list..."
cmd /c "dir C:\\ /s /b > files.txt"
Write-Host "   ... Done."

Write-Host "   [2/6] Exporting HKEY_LOCAL_MACHINE registry hive..."
cmd /c "reg export HKEY_LOCAL_MACHINE hklm.reg"
Write-Host "   ... Done."

Write-Host "   [3/6] Capturing running processes..."
cmd /c "tasklist /v > processes.txt"
Write-Host "   ... Done."

Write-Host "   [4/6] Capturing services list..."
cmd /c "sc query type=service state=all > services.txt"
Write-Host "   ... Done."

Write-Host "   [5/6] Capturing system drivers..."
cmd /c "driverquery /v > drivers.txt"
Write-Host "   ... Done."

Write-Host "   [6/6] Capturing network connections..."
cmd /c "netstat -ano > netstat.txt"
Write-Host "   ... Done."

Write-Host "\n[+] Consolidating data into a single .tracerfile..."
$outFile = "..\\$tracerFileName"
Set-Content -Path $outFile -Value "---WINTRACER_AI_SEPARATOR:files---\n"
Add-Content -Path $outFile -Value (Get-Content -Raw files.txt)
Add-Content -Path $outFile -Value "\n---WINTRACER_AI_SEPARATOR:registry---\n"
Add-Content -Path $outFile -Value (Get-Content -Raw hklm.reg)
Add-Content -Path $outFile -Value "\n---WINTRACER_AI_SEPARATOR:processes---\n"
Add-Content -Path $outFile -Value (Get-Content -Raw processes.txt)
Add-Content -Path $outFile -Value "\n---WINTRACER_AI_SEPARATOR:services---\n"
Add-Content -Path $outFile -Value (Get-Content -Raw services.txt)
Add-Content -Path $outFile -Value "\n---WINTRACER_AI_SEPARATOR:drivers---\n"
Add-Content -Path $outFile -Value (Get-Content -Raw drivers.txt)
Add-Content -Path $outFile -Value "\n---WINTRACER_AI_SEPARATOR:netstat---\n"
Add-Content -Path $outFile -Value (Get-Content -Raw netstat.txt)
Write-Host "   ... Done."

Set-Location ..
Remove-Item -Recurse -Force $tempFolderName

$currentDir = Get-Location

Write-Host "\n============================================" -ForegroundColor Green
Write-Host "== Snapshot Generation Complete! ==" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host "\nYour snapshot file has been created:"
Write-Host "$($currentDir.Path)\\$tracerFileName" -ForegroundColor Yellow
Write-Host "\nYou can now upload this single file to WinTracer AI."

Read-Host -Prompt "\nPress Enter to exit"
`;


const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content.replace(/\r\n/g, '\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

const CommandBlock: React.FC<{ command: string; description: string }> = ({ command, description }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(command).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy command!');
        });
    };

    return (
    <div className="bg-gray-800 p-4 rounded-lg">
        <p className="text-sm text-gray-400 mb-2">{description}</p>
        <div className="relative">
             <code className="block bg-gray-900 text-cyan-300 p-3 pr-12 rounded-md text-sm whitespace-pre-wrap break-all">
                {command}
            </code>
            <button
                onClick={handleCopy}
                aria-label="Copy command"
                className="absolute top-2 right-2 p-1.5 rounded-md bg-gray-800/50 text-gray-400 hover:bg-gray-700 hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
            >
                {copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
            </button>
        </div>
    </div>
    );
};

interface StepCardProps {
    icon: React.ReactNode;
    step: string;
    title: string;
    description: string;
    children?: React.ReactNode;
}

const StepCard: React.FC<StepCardProps> = ({ icon, step, title, description, children }) => {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 relative flex flex-col items-start min-h-[280px]">
        <div className="absolute top-0 right-0 p-4 text-8xl font-bold text-gray-700/40 -z-10">{step}</div>
        <div className="bg-gray-700/50 p-3 rounded-lg mb-4">{icon}</div>
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm mb-4 flex-grow">{description}</p>
        {children && <div className="w-full mt-auto">{children}</div>}
      </div>
    );
};

const Instructions: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-2">How It Works</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          A simple three-step process to analyze changes on your Windows system using AI.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
        <StepCard
          icon={<CameraIcon className="w-8 h-8 text-cyan-400" />}
          step="1"
          title="Generate Snapshot"
          description="Before making changes, run one of our scripts to capture your system's state. This creates a single .tracerfile for you to upload."
        >
          <div className="w-full mt-auto space-y-3">
              <button
                  onClick={() => handleDownload('take_snapshot.bat', batScriptContent)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors"
              >
                  <DownloadIcon className="w-5 h-5" />
                  <span>Download .bat Script</span>
              </button>
              <button
                  onClick={() => handleDownload('take_snapshot.ps1', ps1ScriptContent)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg transition-colors"
              >
                  <DownloadIcon className="w-5 h-5" />
                  <span>Download .ps1 Script</span>
              </button>
          </div>
        </StepCard>

        <StepCard
          icon={<SettingsIcon className="w-8 h-8 text-cyan-400" />}
          step="2"
          title="Make Changes"
          description="Install or uninstall software, change settings, or perform any other actions you want to track on your system."
        />

        <StepCard
          icon={<CompareIcon className="w-8 h-8 text-cyan-400" />}
          step="3"
          title="Upload & Compare"
          description="Run the script again after your changes. Upload both the 'before' and 'after' .tracerfiles, select them, and let the AI find the differences."
        />
      </div>
      
      <div className="mt-12">
        <details className="bg-gray-800/50 border border-gray-700 rounded-xl group transition-all duration-300 ease-in-out">
          <summary className="flex items-center justify-between cursor-pointer list-none p-6">
            <h3 className="text-xl font-semibold text-cyan-400">Curious About The Scripts?</h3>
            <ChevronDownIcon className="w-6 h-6 text-gray-400 transition-transform duration-200 group-open:rotate-180" />
          </summary>
          <div className="p-6 pt-0 text-gray-300 space-y-6">
            <p>
                The downloadable scripts are completely transparent and can be audited by opening them in any text editor. They automate a series of standard Windows command-line tools to capture different aspects of the system state.
            </p>
            <p>
                The script combines the output of these commands into a single <code>.tracerfile</code>, which is a plain text file with special separators. This allows you to upload one file instead of many. Here are the commands the script runs internally:
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CommandBlock description="List all files and directories." command="dir C:\\ /s /b > files.txt" />
                <CommandBlock description="Export the HKEY_LOCAL_MACHINE registry hive." command="reg export HKEY_LOCAL_MACHINE hklm.reg" />
                <CommandBlock description="List all running processes." command="tasklist /v > processes.txt" />
                <CommandBlock description="List all services." command="sc query type=service state=all > services.txt" />
                <CommandBlock description="List all system drivers." command="driverquery /v > drivers.txt" />
                <CommandBlock description="List active network connections." command="netstat -ano > netstat.txt" />
            </div>
             <p className="text-xs text-gray-500 mt-3">
              Note: For the PowerShell (.ps1) script, you may need to adjust your system's execution policy. You can do this by running PowerShell as an administrator and executing: <code>Set-ExecutionPolicy RemoteSigned -Scope Process</code>. This allows the current PowerShell session to run local scripts.
            </p>
          </div>
        </details>
      </div>
    </div>
  );
};

export default Instructions;