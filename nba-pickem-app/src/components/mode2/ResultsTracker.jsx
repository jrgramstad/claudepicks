/**
 * Results Tracker - Mode 2 Main Container
 * Upload slips, track results, view analytics
 */

import { useState } from 'react';
import SlipUpload from './SlipUpload';
import SlipReview from './SlipReview';
import SlipHistory from './SlipHistory';
import Analytics from './Analytics';

export default function ResultsTracker() {
  const [extractedData, setExtractedData] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleExtracted = ({ photoUrl, extractedData }) => {
    setPhotoUrl(photoUrl);
    setExtractedData(extractedData);
  };

  const handleSaved = () => {
    setExtractedData(null);
    setPhotoUrl(null);
    setRefreshKey(prev => prev + 1); // Trigger refresh of history/analytics
  };

  const handleCancel = () => {
    setExtractedData(null);
    setPhotoUrl(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          📊 Results Tracker
        </h1>
        <p className="text-gray-600">
          Upload Underdog slip photos to track performance
        </p>
      </div>

      {/* Upload or Review */}
      {!extractedData ? (
        <SlipUpload onExtracted={handleExtracted} />
      ) : (
        <SlipReview
          photoUrl={photoUrl}
          extractedData={extractedData}
          onSaved={handleSaved}
          onCancel={handleCancel}
        />
      )}

      {/* Analytics Dashboard */}
      <Analytics key={`analytics-${refreshKey}`} />

      {/* Recent Slips */}
      <SlipHistory key={`history-${refreshKey}`} />
    </div>
  );
}
