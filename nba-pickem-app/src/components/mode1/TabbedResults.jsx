/**
 * Tabbed Results - Professional Design
 * Gradient headers, colored badges, beautiful tables
 */

import { useState } from 'react';

export default function TabbedResults({ results, onDownloadCSV }) {
  const [activeTab, setActiveTab] = useState('PrizePicks');

  const sites = ['PrizePicks', 'Underdog', 'Pick6', 'Sleeper', 'FanDuel'];
  const activeSiteData = results[activeTab];

  if (!activeSiteData) return null;

  const { top5, bestUnder } = activeSiteData;

  return (
    <div className="bg-white rounded-xl shadow-xl p-8">
      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">📊 Your Top Picks</h2>
        <div className="flex gap-3">
          <button
            onClick={onDownloadCSV}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
          >
            📥 Download CSV
          </button>
        </div>
      </div>

      {/* Site Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {sites.map(site => {
          const siteResults = results[site];
          const pickCount = siteResults?.top5?.length || 0;
          const isActive = activeTab === site;

          return (
            <button
              key={site}
              className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setActiveTab(site)}
            >
              {site}
              <span className="ml-2 text-xs opacity-75">({pickCount})</span>
            </button>
          );
        })}
      </div>

      {/* Results Table */}
      {top5 && top5.length > 0 ? (
        <div className="overflow-x-auto rounded-lg shadow-md">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <th className="px-4 py-3 text-left rounded-tl-lg font-bold">#</th>
                <th className="px-4 py-3 text-left font-bold">Player</th>
                <th className="px-4 py-3 text-left font-bold">Market</th>
                <th className="px-4 py-3 text-center font-bold">Direction</th>
                <th className="px-4 py-3 text-center font-bold">Line</th>
                <th className="px-4 py-3 text-center font-bold">BBM</th>
                <th className="px-4 py-3 text-right font-bold">Edge</th>
                <th className="px-4 py-3 text-right rounded-tr-lg font-bold">Edge %</th>
              </tr>
            </thead>
            <tbody>
              {top5.map((pick, idx) => (
                <tr
                  key={idx}
                  className={`border-b hover:bg-blue-50 transition-colors ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm">
                      {idx + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{pick.player}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{pick.market}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                        pick.direction === 'Over'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {pick.direction.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-gray-700">{pick.line}</td>
                  <td className="px-4 py-3 text-center font-mono text-gray-700">{pick.projection}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-bold text-lg text-green-600">
                      {pick.edge > 0 ? '+' : ''}{pick.edge}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-bold text-purple-600">
                      {pick.edgePercentage?.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-600 italic text-center py-8">No picks available for this site</p>
      )}

      {/* Best Under */}
      {bestUnder && (
        <div className="mt-6 bg-gradient-to-r from-purple-100 to-purple-200 border-l-4 border-purple-600 rounded-lg p-4 shadow-md">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <p className="font-bold text-purple-900 text-lg">Best Under</p>
              <p className="text-purple-800">
                <span className="font-semibold">{bestUnder.player}</span> •{' '}
                {bestUnder.market} UNDER {bestUnder.line}
                <span className="ml-2 font-bold text-purple-900">
                  ({bestUnder.edge > 0 ? '+' : ''}{bestUnder.edge})
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
