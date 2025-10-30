/**
 * NBA Pick'em Edge Calculator - Professional Design
 * Beautiful gradients, modern UI, loading modal
 */

import { useState, useRef } from 'react';
import FileUploader from './components/FileUploader';
import TabbedResults from './components/TabbedResults';
import ErrorDisplay from './components/ErrorDisplay';
import { exportToCSV } from './utils/csvExport';
import ProcessorWorker from './workers/processor.worker.js?worker';

function App() {
  const [files, setFiles] = useState({});
  const [results, setResults] = useState({});
  const [date, setDate] = useState(null);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentSite, setCurrentSite] = useState('');

  const workerRef = useRef(null);

  const allFilesSelected = Object.values(files).every(f => f !== null);

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
      const firstFile = files.prizepicks || files.bbm;
      const extractedDate = extractDate(firstFile.name);
      setDate(extractedDate);

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

      // Create and start Web Worker
      workerRef.current = new ProcessorWorker();

      let completedSites = 0;
      const totalSites = 5;

      workerRef.current.onmessage = (e) => {
        const { type, siteName, results: siteResults, error: workerError } = e.data;

        if (type === 'SITE_COMPLETE') {
          completedSites++;
          setProgress(completedSites);
          setCurrentSite(siteName);
          setResults(prev => ({
            ...prev,
            [siteName]: siteResults
          }));
        } else if (type === 'COMPLETE') {
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

        {/* Upload Card */}
        <FileUploader onFilesSelected={handleFilesSelected} />

        {/* Calculate Button */}
        {allFilesSelected && Object.keys(results).length === 0 && !isProcessing && (
          <div className="my-8 text-center">
            <button
              onClick={handleCalculate}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-xl px-12 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              ⚡ Calculate Edges
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
                <span className="block mt-1">({progress}/5 sites)</span>
              </p>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(progress / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
