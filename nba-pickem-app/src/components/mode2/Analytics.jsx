/**
 * Analytics Component
 * Display performance metrics and statistics
 */

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    calculateStats();
  }, []);

  const calculateStats = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      // Fetch all slips with results
      const { data: slips, error: slipsError } = await supabase
        .from('slips')
        .select('*')
        .eq('site', 'underdog');

      if (slipsError) throw slipsError;

      // Calculate overall stats
      const totalSlips = slips.length;
      const completedSlips = slips.filter(s => s.result === 'win' || s.result === 'loss');
      const wins = slips.filter(s => s.result === 'win').length;
      const losses = slips.filter(s => s.result === 'loss').length;
      const winRate = completedSlips.length > 0 ? (wins / completedSlips.length) * 100 : 0;

      // Calculate P&L
      const totalStaked = slips.reduce((sum, s) => sum + (s.stake || 0), 0);
      const totalReturns = slips.reduce((sum, s) => sum + (s.actual_return || 0), 0);
      const totalPL = totalReturns - totalStaked;
      const roi = totalStaked > 0 ? (totalPL / totalStaked) * 100 : 0;

      // Group by entry type
      const byEntryType = {};
      slips.forEach(slip => {
        if (!byEntryType[slip.entry_type]) {
          byEntryType[slip.entry_type] = {
            count: 0,
            wins: 0,
            losses: 0,
            staked: 0,
            returns: 0
          };
        }
        byEntryType[slip.entry_type].count++;
        if (slip.result === 'win') byEntryType[slip.entry_type].wins++;
        if (slip.result === 'loss') byEntryType[slip.entry_type].losses++;
        byEntryType[slip.entry_type].staked += slip.stake || 0;
        byEntryType[slip.entry_type].returns += slip.actual_return || 0;
      });

      setStats({
        totalSlips,
        completedSlips: completedSlips.length,
        wins,
        losses,
        winRate,
        totalStaked,
        totalReturns,
        totalPL,
        roi,
        byEntryType
      });
    } catch (err) {
      console.error('Error calculating stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!supabase) {
    return null; // Don't show anything if Supabase not configured
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
        <div className="text-center py-12">
          <div className="text-4xl mb-4 animate-pulse">📊</div>
          <p className="text-gray-600">Calculating analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded mt-8">
        <p className="text-red-800">
          <strong>Error loading analytics:</strong> {error}
        </p>
      </div>
    );
  }

  if (!stats || stats.totalSlips === 0) {
    return null; // Don't show analytics if no slips yet
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        📊 Performance Analytics
      </h2>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm text-blue-600 font-semibold mb-1">Total Slips</div>
          <div className="text-3xl font-bold text-blue-900">{stats.totalSlips}</div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-sm text-green-600 font-semibold mb-1">Win Rate</div>
          <div className="text-3xl font-bold text-green-900">
            {stats.completedSlips > 0 ? `${stats.winRate.toFixed(1)}%` : '-'}
          </div>
          <div className="text-xs text-green-700 mt-1">
            {stats.wins}W / {stats.losses}L
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-sm text-purple-600 font-semibold mb-1">ROI</div>
          <div className={`text-3xl font-bold ${
            stats.roi >= 0 ? 'text-green-900' : 'text-red-900'
          }`}>
            {stats.roi >= 0 ? '+' : ''}{stats.roi.toFixed(1)}%
          </div>
        </div>

        <div className={`${stats.totalPL >= 0 ? 'bg-green-50' : 'bg-red-50'} rounded-lg p-4`}>
          <div className={`text-sm font-semibold mb-1 ${
            stats.totalPL >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            Total P&L
          </div>
          <div className={`text-3xl font-bold ${
            stats.totalPL >= 0 ? 'text-green-900' : 'text-red-900'
          }`}>
            {stats.totalPL >= 0 ? '+' : ''}${stats.totalPL.toFixed(2)}
          </div>
          <div className={`text-xs mt-1 ${
            stats.totalPL >= 0 ? 'text-green-700' : 'text-red-700'
          }`}>
            ${stats.totalStaked.toFixed(0)} staked
          </div>
        </div>
      </div>

      {/* By Entry Type */}
      {Object.keys(stats.byEntryType).length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance by Entry Type</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Count</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Record</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Win Rate</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Staked</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Returns</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">P&L</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(stats.byEntryType).map(([type, data]) => {
                  const pl = data.returns - data.staked;
                  const winRate = (data.wins + data.losses) > 0
                    ? (data.wins / (data.wins + data.losses)) * 100
                    : 0;
                  return (
                    <tr key={type} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700 font-semibold">{type}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 text-center">{data.count}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 text-center">
                        {data.wins}W / {data.losses}L
                      </td>
                      <td className="px-4 py-3 text-sm text-center">
                        {(data.wins + data.losses) > 0 ? (
                          <span className="font-semibold">{winRate.toFixed(1)}%</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 text-right font-mono">
                        ${data.staked.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 text-right font-mono">
                        ${data.returns.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-mono">
                        <span className={pl >= 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                          {pl >= 0 ? '+' : ''}${pl.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
