/**
 * File Uploader - Professional Card Design
 * Beautiful gradients, visible buttons, clear status
 * Supports flexible site selection
 */

import { useState, useEffect } from 'react';

export default function FileUploader({ onFilesSelected, selectedSites = [] }) {
  const [files, setFiles] = useState({
    prizepicks: null,
    underdog: null,
    pick6: null,
    sleeper: null,
    fanduel: null,
    bbm: null
  });

  const allSites = [
    { id: 'prizepicks', name: 'PrizePicks', color: 'bg-green-500', accept: '.csv' },
    { id: 'underdog', name: 'Underdog', color: 'bg-blue-500', accept: '.csv' },
    { id: 'pick6', name: 'Pick6', color: 'bg-purple-500', accept: '.csv' },
    { id: 'sleeper', name: 'Sleeper', color: 'bg-orange-500', accept: '.csv' },
    { id: 'fanduel', name: 'FanDuel', color: 'bg-red-500', accept: '.csv' }
  ];

  // Filter sites to show based on selection
  const sitesToShow = allSites.filter(site => selectedSites.includes(site.id));

  // Always include BBM
  const bbmSite = { id: 'bbm', name: 'BBM Daily', color: 'bg-indigo-500', accept: '.xls,.xlsx,.csv' };

  const handleFileChange = (siteId, file) => {
    const newFiles = { ...files, [siteId]: file };
    setFiles(newFiles);
    onFilesSelected(newFiles);
  };

  // Calculate counts based on selected sites
  const requiredCount = selectedSites.length + 1; // selected sites + BBM
  const uploadedCount = [
    ...selectedSites.map(site => files[site]),
    files.bbm
  ].filter(f => f !== null).length;
  const allFilesUploaded = uploadedCount === requiredCount;

  return (
    <div className="bg-white rounded-xl shadow-xl p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">📁 Upload Files</h2>
        <div className="text-lg font-semibold">
          <span className={uploadedCount === requiredCount ? 'text-green-600' : 'text-gray-600'}>
            {uploadedCount}/{requiredCount}
          </span>
        </div>
      </div>

      {/* File Upload Grid */}
      <div className="grid gap-4">
        {/* Selected Sites */}
        {sitesToShow.map(site => {
          const file = files[site.id];
          const hasFile = file !== null;

          return (
            <div
              key={site.id}
              className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all"
            >
              {/* Site Icon & Name */}
              <div className="flex items-center gap-3 w-40">
                <div className={`w-3 h-3 rounded-full ${site.color}`}></div>
                <span className="font-semibold text-gray-700">{site.name}</span>
              </div>

              {/* Upload Button & Status */}
              <label className="flex-1 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    Choose File
                  </div>
                  {hasFile ? (
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-green-600 text-xl font-bold">✓</span>
                      <span className="text-sm text-gray-600 truncate max-w-md">
                        {file.name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">No file selected</span>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept={site.accept}
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0];
                    if (selectedFile) handleFileChange(site.id, selectedFile);
                  }}
                />
              </label>
            </div>
          );
        })}

        {/* Separator */}
        {sitesToShow.length > 0 && (
          <div className="border-t border-gray-200 my-2"></div>
        )}

        {/* BBM File (Always shown) */}
        <div
          className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all"
        >
          {/* Site Icon & Name */}
          <div className="flex items-center gap-3 w-40">
            <div className={`w-3 h-3 rounded-full ${bbmSite.color}`}></div>
            <span className="font-semibold text-gray-700">{bbmSite.name}</span>
          </div>

          {/* Upload Button & Status */}
          <label className="flex-1 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                Choose File
              </div>
              {files.bbm ? (
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-green-600 text-xl font-bold">✓</span>
                  <span className="text-sm text-gray-600 truncate max-w-md">
                    {files.bbm.name}
                  </span>
                </div>
              ) : (
                <span className="text-gray-400 text-sm">No file selected</span>
              )}
            </div>
            <input
              type="file"
              className="hidden"
              accept={bbmSite.accept}
              onChange={(e) => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile) handleFileChange('bbm', selectedFile);
              }}
            />
          </label>
        </div>
      </div>

      {/* All Files Ready Message */}
      {allFilesUploaded && (
        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-green-600 font-semibold text-lg">
            <span className="text-2xl">✓</span>
            <span>All files ready!</span>
          </div>
        </div>
      )}

      {/* Upload Instructions */}
      {!allFilesUploaded && (
        <div className="mt-8 text-center">
          <div className="inline-block bg-gray-100 rounded-lg px-6 py-3">
            <span className="text-gray-600">
              Upload all {requiredCount} files to calculate edges
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
