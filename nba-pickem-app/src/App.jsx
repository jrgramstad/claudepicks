/**
 * NBA Pick'em Edge Calculator - High Performance Version
 * Uses Web Worker for background processing
 */

import { useState, useRef } from 'react';
import FileUploader from './components/FileUploader';
import SiteResults from './components/SiteResults';
import ErrorDisplay from './components/ErrorDisplay';
import ProgressDisplay from './components/ProgressDisplay';
import { exportToCSV } from './utils/csvExport';
import ProcessorWorker from './workers/processor.worker.js?worker';

function App() {
  const [files, setFiles] = useState({});
  const [results, setResults] = useState({});
  const [date, setDate] = useState(null);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState([]);
  const [completedSites, setCompletedSites] = useState(new Set());

  const workerRef = useRef(null);

  const allFilesSelected = Object.values(files).every(f => f !== null);

  const handleFilesSelected = (newFiles) => {
    setFiles(newFiles);
    setError(null);
    setResults({});
    setProgress([]);
    setCompletedSites(new Set());
  };

  const extractDate = (filename) => {
    const match = filename.match(/(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : null;
  };

  const handleCalculate = async () => {
    setIsProcessing(true);
    setError(null);
    setResults({});
    setProgress([]);
    setCompletedSites(new Set());

    try {
      // Extract date from first file
      const firstFile = files.prizepicks || files.bbm;
      const extractedDate = extractDate(firstFile.name);
      setDate(extractedDate);

      addProgress('Starting processing...');

      // Read file contents
      const fileContents = {};
      for (const [key, file] of Object.entries(files)) {
        if (!file) continue;

        if (key === 'bbm' && !file.name.endsWith('.csv')) {
          // Excel file - read as ArrayBuffer
          const buffer = await file.arrayBuffer();
          fileContents[key] = {
            name: file.name,
            content: buffer
          };
        } else {
          // CSV file - read as text
          const text = await file.text();
          fileContents[key] = {
            name: file.name,
            content: text
          };
        }
      }

      addProgress('Files loaded, starting calculations...');

      // Create and start Web Worker
      workerRef.current = new ProcessorWorker();

      workerRef.current.onmessage = (e) => {
        const { type, siteName, results: siteResults, message, stats, error: workerError } = e.data;

        if (type === 'PROGRESS') {
          addProgress(message);
        } else if (type === 'SITE_COMPLETE') {
          // Progressive display - show results as they come in
          setResults(prev => ({
            ...prev,
            [siteName]: siteResults
          }));
          setCompletedSites(prev => new Set([...prev, siteName]));
          addProgress(`✓ ${siteName} complete (${stats.totalEdges} edges from ${stats.matched} players)`);
        } else if (type === 'COMPLETE') {
          addProgress('🎉 All calculations complete!');
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

      // Send data to worker
      workerRef.current.postMessage({
        type: 'PROCESS_FILES',
        data: { files: fileContents }
      });

    } catch (err) {
      setError(err.message);
      setIsProcessing(false);
      console.error('Error processing files:', err);
    }
  };

  const addProgress = (message) => {
    setProgress(prev => [...prev, { message, time: new Date().toLocaleTimeString() }]);
  };

  const handleDownloadCSV = () => {
    if (Object.keys(results).length > 0) {
      exportToCSV(results, date);
    }
  };

  const siteOrder = ['PrizePicks', 'Underdog', 'Pick6', 'Sleeper', 'FanDuel'];

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 mb-6 text-white">
          <h1 className="text-4xl font-bold mb-2">
            ⚡ NBA Pick'em Edge Calculator
          </h1>
          <p className="text-blue-100">
            High-performance edge calculation • Web Worker powered • Results in seconds
          </p>
          {date && (
            <p className="text-sm mt-2 font-mono bg-blue-800 inline-block px-3 py-1 rounded">
              {date}
            </p>
          )}
        </div>

        {/* File Uploader */}
        <FileUploader onFilesSelected={handleFilesSelected} />

        {/* Calculate Button */}
        {allFilesSelected && Object.keys(results).length === 0 && !isProcessing && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleCalculate}
              className="px-10 py-4 rounded-lg font-bold text-white text-xl
                bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700
                active:scale-95 transition-all shadow-lg transform hover:shadow-xl"
            >
              ⚡ Calculate Edges (Fast!)
            </button>
          </div>
        )}

        {/* Progress Display */}
        {isProcessing && <ProgressDisplay progress={progress} />}

        {/* Error Display */}
        {error && <ErrorDisplay error={error} />}

        {/* Results - Progressive Display */}
        {Object.keys(results).length > 0 && (
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Results ({completedSites.size}/5 sites)
                  </h2>
                  {!isProcessing && (
                    <p className="text-sm text-green-600 font-semibold mt-1">
                      ✓ Complete - Ready to use!
                    </p>
                  )}
                </div>
                <button
                  onClick={handleDownloadCSV}
                  disabled={isProcessing}
                  className={`px-6 py-3 rounded-lg font-semibold shadow-md transition-colors ${
                    isProcessing
                      ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  📥 Download CSV
                </button>
              </div>
            </div>

            {/* Display results in order, showing as they complete */}
            {siteOrder.map(siteName => {
              if (results[siteName]) {
                return (
                  <SiteResults
                    key={siteName}
                    siteName={siteName}
                    results={results[siteName]}
                  />
                );
              }
              return null;
            })}

            {/* Download Button at Bottom */}
            {!isProcessing && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleDownloadCSV}
                  className="px-10 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-lg shadow-lg transition-colors"
                >
                  📥 Download All Results as CSV
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-600 bg-white rounded-lg p-4 shadow-sm">
          <p className="font-semibold text-gray-800 mb-1">
            How it works
          </p>
          <p>
            Upload 6 files → Web Worker processes in background → See results as they calculate →
            Download CSV
          </p>
          <p className="text-xs mt-2 text-gray-500">
            All processing happens in your browser • No data uploaded to servers • Fast & private
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
