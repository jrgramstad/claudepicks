/**
 * Site Results Component
 * Displays Top 5 picks + Best Under for a single site
 */

export default function SiteResults({ siteName, results }) {
  const { top5, bestUnder } = results;

  if (!top5 || top5.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b-2 border-gray-200 pb-2">
          {siteName}
        </h3>
        <p className="text-gray-600 italic">No picks available for this site</p>
      </div>
    );
  }

  const PickRow = ({ pick, rank, isBestUnder = false }) => (
    <tr className={isBestUnder ? 'bg-yellow-50 font-semibold' : ''}>
      <td className="px-3 py-2 text-sm text-gray-700 border-b">
        {isBestUnder ? 'Best Under' : rank}
      </td>
      <td className="px-3 py-2 text-sm text-gray-900 border-b font-medium">
        {pick.player}
      </td>
      <td className="px-3 py-2 text-sm text-gray-700 border-b">
        {pick.market}
      </td>
      <td className={`px-3 py-2 text-sm font-semibold border-b ${
        pick.direction === 'Over' ? 'text-green-600' : 'text-red-600'
      }`}>
        {pick.direction}
      </td>
      <td className="px-3 py-2 text-sm text-gray-700 border-b font-mono">
        {pick.line}
      </td>
      <td className="px-3 py-2 text-sm text-gray-700 border-b font-mono">
        {pick.projection}
      </td>
      <td className="px-3 py-2 text-sm text-gray-900 border-b font-mono font-bold">
        {pick.edge > 0 ? '+' : ''}{pick.edge}
      </td>
    </tr>
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4 border-b-2 border-blue-500 pb-2">
        {siteName}
      </h3>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Player
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Market
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Direction
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Line
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                BBM Proj
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Edge
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {top5.map((pick, index) => (
              <PickRow key={index} pick={pick} rank={index + 1} />
            ))}

            {bestUnder && !top5.includes(bestUnder) && (
              <PickRow pick={bestUnder} rank={null} isBestUnder={true} />
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <span className="font-medium">Total Picks Analyzed:</span> {top5.length}
        {bestUnder && (
          <span className="ml-4">
            <span className="font-medium">Best Under Edge:</span>{' '}
            <span className="font-mono font-bold">{bestUnder.edge}</span>
          </span>
        )}
      </div>
    </div>
  );
}
