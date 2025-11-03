/**
 * Site Results Component - Polished Version
 * Professional table display with Best Under highlighting
 */

export default function SiteResults({ siteName, results }) {
  const { top5, bestUnder } = results;

  if (!top5 || top5.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b-2 border-gray-200 pb-2">
          {siteName}
        </h3>
        <p className="text-gray-600 italic">No picks available for this site</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6 overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600">
        <h3 className="text-xl font-bold text-white flex items-center">
          🎯 {siteName.toUpperCase()} - TOP 5
        </h3>
        <p className="text-blue-100 text-sm mt-1">
          {top5.length} picks ranked by edge
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-300">
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Player
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Market
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Direction
              </th>
              <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                Line
              </th>
              <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                BBM Proj
              </th>
              <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                Edge
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {top5.map((pick, index) => (
              <tr
                key={index}
                className="hover:bg-blue-50 transition-colors"
              >
                <td className="px-4 py-3 text-sm">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold">
                    {index + 1}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-bold text-gray-900">
                  {pick.player}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {pick.market}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                    pick.direction === 'Over'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {pick.direction.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-right font-mono text-gray-700">
                  {pick.line}
                </td>
                <td className="px-4 py-3 text-sm text-right font-mono text-gray-700">
                  {pick.projection}
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <span className="font-mono font-bold text-gray-900">
                    {pick.edge > 0 ? '+' : ''}{pick.edge}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Best Under Highlight */}
      {bestUnder && (
        <div className="m-4 p-4 bg-gradient-to-r from-purple-100 to-pink-100 border-l-4 border-purple-600 rounded-lg shadow-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-3xl">⭐</span>
            </div>
            <div className="ml-3 flex-1">
              <h4 className="text-lg font-bold text-purple-900 mb-1">
                Best Under Pick
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-purple-700 font-semibold">Player:</span>
                  <span className="ml-2 text-purple-900 font-bold">{bestUnder.player}</span>
                </div>
                <div>
                  <span className="text-purple-700 font-semibold">Market:</span>
                  <span className="ml-2 text-purple-900">{bestUnder.market}</span>
                </div>
                <div>
                  <span className="text-purple-700 font-semibold">Line:</span>
                  <span className="ml-2 text-purple-900 font-mono">{bestUnder.line}</span>
                </div>
                <div>
                  <span className="text-purple-700 font-semibold">Edge:</span>
                  <span className="ml-2 text-purple-900 font-mono font-bold">{bestUnder.edge}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Stats */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
        <span className="font-semibold">Total Picks:</span> {top5.length}
        {bestUnder && (
          <span className="ml-4">
            <span className="font-semibold">Best Under Edge:</span>{' '}
            <span className="font-mono font-bold text-purple-700">{bestUnder.edge}</span>
          </span>
        )}
      </div>
    </div>
  );
}
