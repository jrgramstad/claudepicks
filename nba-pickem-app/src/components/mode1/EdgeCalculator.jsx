/**
 * NBA Pick'em Edge Calculator - Mode 1
 * Calculate edges from BBM projections and site lines
 * Features: Flexible site selection, Underdog Ladders mode
 */

import { useState, useRef, useEffect } from 'react';
import FileUploader from './FileUploader';
import TabbedResults from './TabbedResults';
import ErrorDisplay from './ErrorDisplay';
import { exportToCSV } from '../../utils/csvExport';
import { saveTop25ToCache } from '../../utils/matching';
import ProcessorWorker from '../../workers/processor.worker.js?worker';

// Site configuration
const SITES = [
  { id: 'underdog', name: 'Underdog', color: 'bg-blue-500' },
  { id: 'sleeper', name: 'Sleeper', color: 'bg-orange-500' },
  { id: 'prizepicks', name: 'PrizePicks', color: 'bg-green-500' },
  { id: 'pick6', name: 'Pick6', color: 'bg-purple-500' },
  { id: 'fanduel', name: 'FanDuel', color: 'bg-red-500' }
];

// localStorage helpers
const loadPreferences = () => {
  try {
    const saved = localStorage.getItem('pickem-selected-sites');
    if (saved) {
      const { sites } = JSON.parse(saved);
      return sites;
    }
  } catch (e) {
    console.error('Failed to load preferences:', e);
  }
  // Default: all sites selected
  return ['underdog', 'sleeper', 'prizepicks', 'pick6', 'fanduel'];
};

const savePreferences = (sites) => {
  try {
    localStorage.setItem('pickem-selected-sites', JSON.stringify({
      sites,
      lastUpdated: new Date().toISOString()
    }));
  } catch (e) {
    console.error('Failed to save preferences:', e);
  }
};

export default function EdgeCalculator() {
  const [selectedSites, setSelectedSites] = useState(() => loadPreferences());
  const [files, setFiles] = useState({});
  const [results, setResults] = useState({});
  const [date, setDate] = useState(null);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentSite, setCurrentSite] = useState('');

  const workerRef = useRef(null);

  // Check if all required files are uploaded
  const requiredFiles = selectedSites.length + 1; // selected sites + BBM
  const uploadedFiles = [
    ...selectedSites.map(site => files[site]),
    files.bbm
  ].filter(Boolean).length;
  const canCalculate = uploadedFiles === requiredFiles && selectedSites.length > 0;

  const handleSiteToggle = (siteId, checked) => {
    const updated = checked
      ? [...selectedSites, siteId]
      : selectedSites.filter(id => id !== siteId);

    setSelectedSites(updated);
    savePreferences(updated);

    // Clear file if site unchecked
    if (!checked && files[siteId]) {
      setFiles(prev => {
        const newFiles = { ...prev };
        delete newFiles[siteId];
        return newFiles;
      });
    }

    // Clear results when selection changes
    setResults({});
  };

  const handleFilesSelected = (newFiles) => {
    setFiles(newFiles);
    setError(null);
    setResults({});
  };

  const extractDate = (filename) => {
    const match = filename.match(/(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : null;
  };

  const handleCalculate = async () => {
    setIsProcessing(true);
    setError(null);
    setResults({});
    setProgress(0);
    setCurrentSite('');

    try {
      // Find first available file for date extraction
      const firstFile = files[selectedSites[0]] || files.bbm;
      const extractedDate = extractDate(firstFile.name);
      setDate(extractedDate);

      // Read file contents for selected sites only
      const fileContents = {};
      for (const [key, file] of Object.entries(files)) {
        if (!file) continue;

        // Skip sites that aren't selected
        if (key !== 'bbm' && !selectedSites.includes(key)) continue;

        if (key === 'bbm' && !file.name.endsWith('.csv')) {
          const buffer = await file.arrayBuffer();
          fileContents[key] = {
            name: file.name,
            content: buffer
          };
        } else {
          const text = await file.text();
          fileContents[key] = {
            name: file.name,
            content: text
          };
        }
      }

      // Create and start Web Worker
      workerRef.current = new ProcessorWorker();

      let completedSites = 0;
      const totalSites = selectedSites.length;

      workerRef.current.onmessage = async (e) => {
        const { type, siteName, results: siteResults, error: workerError, results: allResults } = e.data;

        if (type === 'SITE_COMPLETE') {
          completedSites++;
          setProgress(completedSites);
          setCurrentSite(siteName);
          setResults(prev => ({
            ...prev,
            [siteName]: siteResults
          }));
        } else if (type === 'COMPLETE') {
          // Save Top 25 to cache for Mode 2 results tracking
          if (allResults && extractedDate) {
            await saveTop25ToCache(allResults, extractedDate);
          }
          setIsProcessing(false);
          workerRef.current.terminate();
        } else if (type === 'ERROR') {
          setError(workerError);
          setIsProcessing(false);
          workerRef.current.terminate();
        }
      };

      workerRef.current.onerror = (error) => {
        setError(`Worker error: ${error.message}`);
        setIsProcessing(false);
        workerRef.current.terminate();
      };

      workerRef.current.postMessage({
        type: 'PROCESS_FILES',
        data: {
          files: fileContents,
          selectedSites: selectedSites
        }
      });

    } catch (err) {
      setError(err.message);
      setIsProcessing(false);
      console.error('Error processing files:', err);
    }
  };

  const handleDownloadCSV = () => {
    if (Object.keys(results).length > 0) {
      exportToCSV(results, date);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-2xl p-8 mb-8 text-white">
          <div className="flex items-center gap-4">
            <div className="text-6xl">🏀</div>
            <div>
              <h1 className="text-4xl font-bold">NBA Pick'em Edge Calculator</h1>
              <p className="text-blue-100 mt-2">High-performance edge calculation • Results in seconds</p>
              {date && (
                <p className="text-blue-200 text-sm mt-1 font-mono">Date: {date}</p>
              )}
            </div>
          </div>
        </div>

        {/* Site Selection */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            🎯 Select Sites to Analyze
          </h2>
          <p className="text-gray-600 mb-4 text-sm">
            Choose which sites you want to calculate edges for
          </p>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {SITES.map(site => (
              <label
                key={site.id}
                className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedSites.includes(site.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedSites.includes(site.id)}
                  onChange={(e) => handleSiteToggle(site.id, e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
                <div className={`w-3 h-3 rounded-full ${site.color}`}></div>
                <span className="font-medium text-sm">{site.name}</span>
              </label>
            ))}
          </div>

          <p className="text-xs text-gray-500 mt-3">
            💾 Your selection will be saved for next time
          </p>
        </div>

        {/* Upload Card */}
        {selectedSites.length > 0 && (
          <FileUploader
            onFilesSelected={handleFilesSelected}
            selectedSites={selectedSites}
          />
        )}

        {/* No sites selected message */}
        {selectedSites.length === 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mb-6">
            <p className="text-yellow-800">
              <strong>No sites selected.</strong> Please select at least one site above to start.
            </p>
          </div>
        )}

        {/* Calculate Button */}
        {selectedSites.length > 0 && !isProcessing && Object.keys(results).length === 0 && (
          <div className="my-8 text-center">
            <button
              onClick={handleCalculate}
              disabled={!canCalculate}
              className={`font-bold text-xl px-12 py-4 rounded-xl shadow-lg transition-all ${
                canCalculate
                  ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white hover:shadow-xl transform hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {canCalculate ? (
                <>⚡ Calculate Edges ({selectedSites.length} site{selectedSites.length > 1 ? 's' : ''})</>
              ) : (
                <>Upload {requiredFiles - uploadedFiles} more file{requiredFiles - uploadedFiles > 1 ? 's' : ''}</>
              )}
            </button>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="my-8">
            <ErrorDisplay error={error} />
          </div>
        )}

        {/* Results */}
        {Object.keys(results).length > 0 && !isProcessing && (
          <div className="my-8">
            <TabbedResults
              results={results}
              onDownloadCSV={handleDownloadCSV}
            />
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm mt-8">
          <p>🔒 All processing happens in your browser • No data uploaded • Fast & private</p>
        </div>

      </div>

      {/* Loading Modal */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md mx-4">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-bounce">⚡</div>
              <h3 className="text-2xl font-bold mb-2">Calculating Edges</h3>
              <p className="text-gray-600 mb-4">
                {currentSite ? `Processing ${currentSite}...` : 'Starting...'}
                <span className="block mt-1">({progress}/{selectedSites.length} sites)</span>
              </p>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(progress / selectedSites.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
