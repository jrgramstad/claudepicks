/**
 * Progress Display Component
 * Shows real-time processing updates
 */

export default function ProgressDisplay({ progress }) {
  if (!progress || progress.length === 0) return null;

  return (
    <div className="mt-6 bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
        <h3 className="text-lg font-bold text-gray-900">Processing...</h3>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {progress.map((item, index) => (
          <div
            key={index}
            className="flex items-start text-sm border-l-2 border-blue-300 pl-3 py-1 animate-fadeIn"
          >
            <span className="text-gray-500 font-mono text-xs mr-2 min-w-[70px]">
              {item.time}
            </span>
            <span className="text-gray-700">{item.message}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Processing in background • UI stays responsive
      </div>
    </div>
  );
}
