/**
 * NBA Pick'em Edge Calculator - Compact Design
 * Uses Web Worker for background processing with tabbed results
 */

import { useState, useRef } from 'react';
import FileUploader from './components/FileUploader';
import TabbedResults from './components/TabbedResults';
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

  const workerRef = useRef(null);

  const allFilesSelected = Object.values(files).every(f => f !== null);

  const handleFilesSelected = (newFiles) => {
    setFiles(newFiles);
    setError(null);
    setResults({});
    setProgress([]);
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

    try {
      const firstFile = files.prizepicks || files.bbm;
      const extractedDate = extractDate(firstFile.name);
      setDate(extractedDate);

      addProgress('Starting processing...');

      // Read file contents
      const fileContents = {};
      for (const [key, file] of Object.entries(files)) {
        if (!file) continue;

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

      addProgress('Files loaded, starting calculations...');

      // Create and start Web Worker
      workerRef.current = new ProcessorWorker();

      workerRef.current.onmessage = (e) => {
        const { type, siteName, results: siteResults, message, stats, error: workerError } = e.data;

        if (type === 'PROGRESS') {
          addProgress(message);
        } else if (type === 'SITE_COMPLETE') {
          setResults(prev => ({
            ...prev,
            [siteName]: siteResults
          }));
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

  return (
    <div className="min-h-screen bg-gray-100 py-4 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Compact Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-4 mb-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                🏀 NBA Pick'em Edge Calculator
              </h1>
              <p className="text-blue-100 text-sm">
                High-performance edge calculation • Results in seconds
              </p>
            </div>
            {date && (
              <div className="bg-white/20 px-4 py-2 rounded-lg">
                <div className="text-xs text-blue-100">Date</div>
                <div className="font-mono font-bold">{date}</div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Upload & Calculate */}
          <div className="lg:col-span-1 space-y-4">
            <FileUploader onFilesSelected={handleFilesSelected} />

            {allFilesSelected && Object.keys(results).length === 0 && !isProcessing && (
              <button
                onClick={handleCalculate}
                className="w-full px-6 py-4 rounded-lg font-bold text-white text-lg
                  bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700
                  active:scale-95 transition-all shadow-lg"
              >
                ⚡ Calculate Edges
              </button>
            )}

            {isProcessing && <ProgressDisplay progress={progress} />}
            {error && <ErrorDisplay error={error} />}
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-2">
            {Object.keys(results).length > 0 && (
              <TabbedResults
                results={results}
                onDownloadCSV={handleDownloadCSV}
              />
            )}

            {Object.keys(results).length === 0 && !isProcessing && !error && (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Ready to Calculate
                </h3>
                <p className="text-gray-600">
                  Upload all 6 files and click "Calculate Edges" to see results
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center text-xs text-gray-600 bg-white rounded-lg p-3 shadow-sm">
          <p>
            All processing happens in your browser • No data uploaded • Fast & private
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
