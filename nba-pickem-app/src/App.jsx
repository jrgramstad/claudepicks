/**
 * NBA Pick'em Edge Calculator - Main App
 */

import { useState } from 'react';
import FileUploader from './components/FileUploader';
import SiteResults from './components/SiteResults';
import ErrorDisplay from './components/ErrorDisplay';
import { processAllFiles } from './utils/fileProcessor';
import { processAllData } from './utils/calculator';
import { createMatcher } from './utils/matcher';
import { exportToCSV } from './utils/csvExport';

function App() {
  const [files, setFiles] = useState({});
  const [results, setResults] = useState(null);
  const [date, setDate] = useState(null);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const allFilesSelected = Object.values(files).every(f => f !== null);

  const handleFilesSelected = (newFiles) => {
    setFiles(newFiles);
    setError(null);
    setResults(null);
  };

  const handleCalculate = async () => {
    setIsProcessing(true);
    setError(null);
    setResults(null);

    try {
      // Process all files
      const { siteData, bbmData, date } = await processAllFiles(files);

      // Create player matcher
      const matchPlayer = createMatcher(bbmData);

      // Calculate edges for all sites
      const calculatedResults = processAllData(siteData, bbmData, matchPlayer);

      setResults(calculatedResults);
      setDate(date);
    } catch (err) {
      setError(err.message);
      console.error('Error processing files:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadCSV = () => {
    if (results) {
      exportToCSV(results, date);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            NBA Pick'em Edge Calculator
          </h1>
          {date && (
            <p className="text-sm text-gray-600">
              Date: <span className="font-mono font-semibold">{date}</span>
            </p>
          )}
        </div>

        {/* File Uploader */}
        <FileUploader onFilesSelected={handleFilesSelected} />

        {/* Calculate Button */}
        {allFilesSelected && !results && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleCalculate}
              disabled={isProcessing}
              className={`px-8 py-3 rounded-lg font-semibold text-white text-lg
                ${isProcessing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                }
                transition-colors shadow-md`}
            >
              {isProcessing ? 'Calculating...' : 'Calculate Edges'}
            </button>
          </div>
        )}

        {/* Error Display */}
        {error && <ErrorDisplay error={error} />}

        {/* Results */}
        {results && (
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Results
                </h2>
                <button
                  onClick={handleDownloadCSV}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold shadow-md transition-colors"
                >
                  Download CSV
                </button>
              </div>
            </div>

            {/* Display results for each site */}
            <SiteResults siteName="PrizePicks" results={results.PrizePicks} />
            <SiteResults siteName="Underdog" results={results.Underdog} />
            <SiteResults siteName="Pick6" results={results.Pick6} />
            <SiteResults siteName="Sleeper" results={results.Sleeper} />
            <SiteResults siteName="FanDuel" results={results.FanDuel} />

            {/* Download Button at Bottom */}
            <div className="flex justify-center mt-6">
              <button
                onClick={handleDownloadCSV}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-lg shadow-md transition-colors"
              >
                Download CSV
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-600">
          <p>
            Upload 6 files (5 RotoWire CSVs + 1 BBM file) to calculate pick'em edges
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
