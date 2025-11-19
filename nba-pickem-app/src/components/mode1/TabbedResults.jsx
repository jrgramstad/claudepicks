/**
 * Tabbed Results - Professional Design
 * Gradient headers, colored badges, beautiful tables
 * Includes Underdog Ladders mode
 */

import { useState, useEffect } from 'react';

export default function TabbedResults({ results, onDownloadCSV }) {
  // Get available sites from results
  const availableSites = Object.keys(results);
  const [activeTab, setActiveTab] = useState(availableSites[0] || 'Underdog');

  // Update active tab if current one is not available
  useEffect(() => {
    if (!availableSites.includes(activeTab) && availableSites.length > 0) {
      setActiveTab(availableSites[0]);
    }
  }, [availableSites, activeTab]);

  const activeSiteData = results[activeTab];

  if (!activeSiteData) return null;

  const { top5, bestUnder, ladders } = activeSiteData;
  const isUnderdog = activeTab === 'Underdog';

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

      {/* Site Tabs - Only show sites with results */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {availableSites.map(site => {
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

      {/* SECTION 1: Regular Top 5 */}
      <div className="mb-8">
        {isUnderdog && (
          <div className="bg-blue-600 text-white p-4 rounded-t-lg">
            <h3 className="font-bold text-xl">🎯 UNDERDOG - REGULAR PICKS</h3>
            <p className="text-sm text-blue-100">Top 5 edges (all markets)</p>
          </div>
        )}

        {top5 && top5.length > 0 ? (
          <div className={`overflow-x-auto ${isUnderdog ? 'rounded-b-lg' : 'rounded-lg'} shadow-md`}>
            <table className="w-full">
              <thead>
                <tr className={`${isUnderdog ? 'bg-blue-500' : 'bg-gradient-to-r from-blue-600 to-blue-700'} text-white`}>
                  <th className={`px-4 py-3 text-left ${!isUnderdog ? 'rounded-tl-lg' : ''} font-bold`}>#</th>
                  <th className="px-4 py-3 text-left font-bold">Player</th>
                  <th className="px-4 py-3 text-left font-bold">Market</th>
                  <th className="px-4 py-3 text-center font-bold">Direction</th>
                  <th className="px-4 py-3 text-center font-bold">Line</th>
                  <th className="px-4 py-3 text-center font-bold">BBM</th>
                  <th className="px-4 py-3 text-right font-bold">Edge</th>
                  <th className={`px-4 py-3 text-right ${!isUnderdog ? 'rounded-tr-lg' : ''} font-bold`}>Edge %</th>
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
      </div>

      {/* SECTION 2: Ladders by Absolute Edge (Underdog Only) */}
      {isUnderdog && ladders && ladders.byAbsolute && ladders.byAbsolute.length > 0 && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-t-lg">
            <h3 className="font-bold text-xl">🪜 UNDERDOG LADDERS - BY POINT EDGE</h3>
            <p className="text-sm text-green-100">Top 10 Points picks (highest point advantage)</p>
          </div>
          <div className="overflow-x-auto rounded-b-lg shadow-md">
            <table className="w-full text-sm">
              <thead className="bg-green-500 text-white">
                <tr>
                  <th className="px-3 py-3 text-left font-bold">#</th>
                  <th className="px-3 py-3 text-left font-bold">Player</th>
                  <th className="px-3 py-3 text-center font-bold">Line</th>
                  <th className="px-3 py-3 text-center font-bold">BBM Proj</th>
                  <th className="px-3 py-3 text-center font-bold">Edge (Pts)</th>
                  <th className="px-3 py-3 text-center font-bold">Edge (%)</th>
                </tr>
              </thead>
              <tbody>
                {ladders.byAbsolute.map((pick, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-3 py-3 font-bold text-green-600">{idx + 1}</td>
                    <td className="px-3 py-3 font-semibold">{pick.player}</td>
                    <td className="px-3 py-3 text-center font-mono">{pick.line}</td>
                    <td className="px-3 py-3 text-center font-mono">{pick.projection?.toFixed(1)}</td>
                    <td className="px-3 py-3 text-center font-bold text-green-600">
                      +{pick.absoluteEdge?.toFixed(1)}
                    </td>
                    <td className="px-3 py-3 text-center text-gray-600">
                      +{pick.edgePercent?.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 3: Ladders by Percentage Edge (Underdog Only) */}
      {isUnderdog && ladders && ladders.byPercent && ladders.byPercent.length > 0 && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 rounded-t-lg">
            <h3 className="font-bold text-xl">🪜 UNDERDOG LADDERS - BY PERCENTAGE EDGE</h3>
            <p className="text-sm text-purple-100">Top 10 Points picks (highest percentage advantage)</p>
          </div>
          <div className="overflow-x-auto rounded-b-lg shadow-md">
            <table className="w-full text-sm">
              <thead className="bg-purple-500 text-white">
                <tr>
                  <th className="px-3 py-3 text-left font-bold">#</th>
                  <th className="px-3 py-3 text-left font-bold">Player</th>
                  <th className="px-3 py-3 text-center font-bold">Line</th>
                  <th className="px-3 py-3 text-center font-bold">BBM Proj</th>
                  <th className="px-3 py-3 text-center font-bold">Edge (%)</th>
                  <th className="px-3 py-3 text-center font-bold">Edge (Pts)</th>
                </tr>
              </thead>
              <tbody>
                {ladders.byPercent.map((pick, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-3 py-3 font-bold text-purple-600">{idx + 1}</td>
                    <td className="px-3 py-3 font-semibold">{pick.player}</td>
                    <td className="px-3 py-3 text-center font-mono">{pick.line}</td>
                    <td className="px-3 py-3 text-center font-mono">{pick.projection?.toFixed(1)}</td>
                    <td className="px-3 py-3 text-center font-bold text-purple-600">
                      +{pick.edgePercent?.toFixed(1)}%
                    </td>
                    <td className="px-3 py-3 text-center text-gray-600">
                      +{pick.absoluteEdge?.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
