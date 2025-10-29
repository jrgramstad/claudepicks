/**
 * Compact File Uploader - Inline Layout
 * Fits everything tightly with clear visual feedback
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

  const fileInputs = [
    { label: 'PrizePicks', site: 'prizepicks', accept: '.csv', color: 'text-green-600' },
    { label: 'Underdog', site: 'underdog', accept: '.csv', color: 'text-blue-600' },
    { label: 'Pick6', site: 'pick6', accept: '.csv', color: 'text-purple-600' },
    { label: 'Sleeper', site: 'sleeper', accept: '.csv', color: 'text-orange-600' },
    { label: 'FanDuel', site: 'fanduel', accept: '.csv', color: 'text-red-600' },
    { label: 'BBM Daily', site: 'bbm', accept: '.xls,.xlsx,.csv', color: 'text-gray-700' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
      <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center justify-between">
        <span>📁 Upload Files</span>
        <span className="text-sm font-normal text-gray-600">
          {filesCount}/6 uploaded
        </span>
      </h2>

      <div className="space-y-1">
        {fileInputs.map(({ label, site, accept, color }) => {
          const hasFile = files[site] !== null;

          return (
            <div key={site} className="flex items-center gap-2 p-2 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
              <div className={`w-28 font-semibold text-sm ${color}`}>
                {label}
              </div>

              <div className="flex-1 text-sm truncate">
                {hasFile ? (
                  <span className="text-gray-700">{files[site].name}</span>
                ) : (
                  <span className="text-gray-400 italic">Not uploaded</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {hasFile && (
                  <span className="text-green-600 font-bold text-lg">✓</span>
                )}
                <label className={`px-3 py-1 rounded text-xs font-bold cursor-pointer transition-all ${
                  hasFile
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}>
                  {hasFile ? 'Change' : 'Upload'}
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
            </div>
          );
        })}
      </div>

      {allFilesSelected && (
        <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-green-600 font-bold text-lg">✓</span>
            <span className="text-green-700 font-semibold text-sm">
              All files ready to process
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
