/**
 * SlipUpload Component
 * Upload slip photo and extract data with GPT-4 Vision
 */

import { useState } from 'react';
import { extractSlipData } from '../../lib/ocr';

export default function SlipUpload({ onExtracted }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const result = await extractSlipData(file);
      onExtracted(result);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to process slip. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        📸 Upload Slip Photo
      </h2>
      <p className="text-gray-600 mb-6">
        Upload an Underdog Fantasy slip to track results
      </p>

      <label className="block">
        <div className={`border-4 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer ${
          uploading
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}>
          {uploading ? (
            <div>
              <div className="text-6xl mb-4 animate-pulse">⏳</div>
              <p className="text-xl font-semibold text-blue-600">
                Processing with GPT-4 Vision...
              </p>
              <p className="text-sm text-gray-500 mt-2">
                This may take 10-20 seconds
              </p>
            </div>
          ) : (
            <div>
              <div className="text-6xl mb-4">📸</div>
              <p className="text-xl font-semibold mb-2 text-gray-800">
                Click to upload slip photo
              </p>
              <p className="text-sm text-gray-500">
                or drag and drop
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Supports JPG, PNG, HEIC
              </p>
            </div>
          )}
        </div>
        <input
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploading}
        />
      </label>

      {error && (
        <div className="mt-6 bg-red-50 border-l-4 border-red-600 p-4 rounded">
          <div className="flex items-start">
            <div className="text-2xl mr-3">❌</div>
            <div>
              <p className="text-red-800 font-semibold">Error</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
