/**
 * Tabbed Results Component - Compact View
 * Shows one site at a time with color-coded tabs
 */

import { useState } from 'react';

export default function TabbedResults({ results, onDownloadCSV }) {
  const [activeTab, setActiveTab] = useState('PrizePicks');

  const siteConfig = {
    'PrizePicks': { color: 'bg-green-600', hoverColor: 'hover:bg-green-700', lightBg: 'bg-green-50' },
    'Underdog': { color: 'bg-blue-600', hoverColor: 'hover:bg-blue-700', lightBg: 'bg-blue-50' },
    'Pick6': { color: 'bg-purple-600', hoverColor: 'hover:bg-purple-700', lightBg: 'bg-purple-50' },
    'Sleeper': { color: 'bg-orange-600', hoverColor: 'hover:bg-orange-700', lightBg: 'bg-orange-50' },
    'FanDuel': { color: 'bg-red-600', hoverColor: 'hover:bg-red-700', lightBg: 'bg-red-50' }
  };

  const sites = Object.keys(siteConfig);
  const activeSiteData = results[activeTab];

  if (!activeSiteData) return null;

  const { top5, bestUnder } = activeSiteData;

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        {sites.map(site => {
          const config = siteConfig[site];
          const isActive = activeTab === site;
          const siteResults = results[site];
          const pickCount = siteResults?.top5?.length || 0;

          return (
            <button
              key={site}
              onClick={() => setActiveTab(site)}
              className={`flex-1 px-3 py-3 text-sm font-bold transition-colors border-b-2 ${
                isActive
                  ? `${config.color} text-white border-gray-900`
                  : `bg-gray-50 text-gray-600 border-transparent ${config.hoverColor} hover:text-white`
              }`}
            >
              <div>{site}</div>
              <div className="text-xs font-normal opacity-90">
                {pickCount} picks
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Site Content */}
      <div className="p-4">
        {/* Header */}
        <div className={`${siteConfig[activeTab].color} text-white p-3 rounded-lg mb-3 flex items-center justify-between`}>
          <div>
            <h3 className="text-xl font-bold">🎯 {activeTab.toUpperCase()}</h3>
            <p className="text-sm opacity-90">{top5?.length || 0} top picks ranked by edge</p>
          </div>
          <button
            onClick={onDownloadCSV}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded font-semibold text-sm transition-colors"
          >
            📥 Download CSV
          </button>
        </div>

        {/* Compact Table */}
        {top5 && top5.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b-2 border-gray-300">
                <tr>
                  <th className="px-2 py-2 text-left font-bold text-gray-700 w-8">#</th>
                  <th className="px-2 py-2 text-left font-bold text-gray-700">Player</th>
                  <th className="px-2 py-2 text-left font-bold text-gray-700">Market</th>
                  <th className="px-2 py-2 text-center font-bold text-gray-700 w-16">Dir</th>
                  <th className="px-2 py-2 text-right font-bold text-gray-700 w-16">Line</th>
                  <th className="px-2 py-2 text-right font-bold text-gray-700 w-16">BBM</th>
                  <th className="px-2 py-2 text-right font-bold text-gray-700 w-20">Edge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {top5.map((pick, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-2 py-2">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${siteConfig[activeTab].color} text-white font-bold text-xs`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-2 py-2 font-bold text-gray-900">{pick.player}</td>
                    <td className="px-2 py-2 text-gray-700 text-xs">{pick.market}</td>
                    <td className="px-2 py-2 text-center">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                        pick.direction === 'Over'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {pick.direction === 'Over' ? 'O' : 'U'}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-right font-mono text-gray-700">{pick.line}</td>
                    <td className="px-2 py-2 text-right font-mono text-gray-700">{pick.projection}</td>
                    <td className="px-2 py-2 text-right font-mono font-bold text-gray-900">
                      {pick.edge > 0 ? '+' : ''}{pick.edge}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600 italic text-center py-4">No picks available for this site</p>
        )}

        {/* Best Under */}
        {bestUnder && (
          <div className="mt-3 bg-purple-100 border-l-4 border-purple-600 p-3 rounded">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-purple-900 text-sm">⭐ Best Under:</span>
                <span className="ml-2 text-purple-900 font-bold">{bestUnder.player}</span>
                <span className="ml-2 text-purple-700 text-sm">
                  ({bestUnder.market}, Line: {bestUnder.line}, Edge: {bestUnder.edge})
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
