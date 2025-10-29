/**
 * File Uploader Component - Polished Version
 * Clear feedback with filenames and checkmarks
 */

import { useState } from 'react';

export default function FileUploader({ onFilesSelected }) {
  const [files, setFiles] = useState({
    prizepicks: null,
    underdog: null,
    pick6: null,
    sleeper: null,
    fanduel: null,
    bbm: null
  });

  const handleFileChange = (site, file) => {
    const newFiles = { ...files, [site]: file };
    setFiles(newFiles);
    onFilesSelected(newFiles);
  };

  const allFilesSelected = Object.values(files).every(f => f !== null);
  const filesCount = Object.values(files).filter(f => f !== null).length;

  const FileInput = ({ label, site, accept }) => {
    const hasFile = files[site] !== null;

    return (
      <div className="flex items-center justify-between py-3 px-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors">
        <div className="flex items-center space-x-3 flex-1">
          <span className={`text-2xl ${hasFile ? 'text-green-500' : 'text-gray-300'}`}>
            {hasFile ? '✓' : '○'}
          </span>
          <label className="text-sm font-medium text-gray-700 min-w-[120px]">
            {label}:
          </label>
          {hasFile ? (
            <span className="text-sm text-green-600 font-medium truncate flex-1">
              {files[site].name}
            </span>
          ) : (
            <span className="text-sm text-gray-400 italic">
              Not uploaded
            </span>
          )}
        </div>
        <label className={`px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all
          ${hasFile
            ? 'bg-green-100 text-green-700 hover:bg-green-200'
            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }`}>
          {hasFile ? 'Change' : 'Choose File'}
          <input
            type="file"
            accept={accept}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileChange(site, file);
            }}
            className="hidden"
          />
        </label>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          📁 Upload Files
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Upload 6 files to calculate edges (include YYYY-MM-DD in filenames)
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        <FileInput label="PrizePicks CSV" site="prizepicks" accept=".csv" />
        <FileInput label="Underdog CSV" site="underdog" accept=".csv" />
        <FileInput label="Pick6 CSV" site="pick6" accept=".csv" />
        <FileInput label="Sleeper CSV" site="sleeper" accept=".csv" />
        <FileInput label="FanDuel CSV" site="fanduel" accept=".csv" />
        <FileInput label="BBM Daily File" site="bbm" accept=".xls,.xlsx,.csv" />
      </div>

      <div className="p-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {allFilesSelected ? (
              <>
                <span className="text-2xl">🎉</span>
                <span className="text-sm font-semibold text-green-600">
                  All files uploaded! Ready to calculate.
                </span>
              </>
            ) : (
              <>
                <span className="text-2xl">📊</span>
                <span className="text-sm text-gray-600">
                  {filesCount} of 6 files uploaded
                </span>
              </>
            )}
          </div>

          {allFilesSelected && (
            <div className="flex space-x-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse delay-75"></div>
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse delay-150"></div>
            </div>
          )}
        </div>

        {!allFilesSelected && (
          <div className="mt-2 text-xs text-gray-500">
            Please upload all 6 files to enable edge calculation
          </div>
        )}
      </div>
    </div>
  );
}
