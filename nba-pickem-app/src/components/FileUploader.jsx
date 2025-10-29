/**
 * File Uploader Component
 * Handles 6 file inputs for RotoWire CSVs and BBM file
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

  const FileInput = ({ label, site, accept }) => (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="flex items-center space-x-3">
        <input
          type="file"
          accept={accept}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileChange(site, file);
          }}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100
            cursor-pointer"
        />
        {files[site] && (
          <span className="text-sm text-green-600 font-medium">
            ✓ {files[site].name}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Upload Files</h2>

      <div className="space-y-4">
        <FileInput label="PrizePicks CSV" site="prizepicks" accept=".csv" />
        <FileInput label="Underdog CSV" site="underdog" accept=".csv" />
        <FileInput label="Pick6 CSV" site="pick6" accept=".csv" />
        <FileInput label="Sleeper CSV" site="sleeper" accept=".csv" />
        <FileInput label="FanDuel CSV" site="fanduel" accept=".csv" />
        <FileInput label="BBM Daily File" site="bbm" accept=".xls,.xlsx,.csv" />
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {allFilesSelected ? (
            <span className="text-green-600 font-medium">
              ✓ All files uploaded - Ready to calculate!
            </span>
          ) : (
            <span>
              {Object.values(files).filter(f => f !== null).length} of 6 files uploaded
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
