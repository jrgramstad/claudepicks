/**
 * SlipHistory Component
 * Display recent slips in a table
 */

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function SlipHistory() {
  const [slips, setSlips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSlips();
  }, []);

  const fetchSlips = async () => {
    if (!supabase) {
      setError('Supabase not configured');
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('slips')
        .select('*')
        .eq('site', 'underdog')
        .order('slip_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(20);

      if (fetchError) {
        throw fetchError;
      }

      setSlips(data || []);
    } catch (err) {
      console.error('Error fetching slips:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!supabase) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 rounded mt-8">
        <p className="text-yellow-800">
          <strong>Supabase not configured.</strong> Please add your credentials to .env.local to use slip tracking.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
        <div className="text-center py-12">
          <div className="text-4xl mb-4 animate-pulse">⏳</div>
          <p className="text-gray-600">Loading slips...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded mt-8">
        <p className="text-red-800">
          <strong>Error loading slips:</strong> {error}
        </p>
      </div>
    );
  }

  if (slips.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          📜 Recent Slips
        </h2>
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-gray-600">No slips yet. Upload your first slip above!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        📜 Recent Slips ({slips.length})
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-200">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Entry Type</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Stake</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Potential</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Multiplier</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Result</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">P&L</th>
            </tr>
          </thead>
          <tbody>
            {slips.map((slip) => {
              const pl = slip.actual_return ? slip.actual_return - slip.stake : null;
              return (
                <tr key={slip.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {new Date(slip.slip_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{slip.entry_type}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-right font-mono">
                    ${slip.stake.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-right font-mono">
                    {slip.potential_return ? `$${slip.potential_return.toFixed(2)}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-center font-mono">
                    {slip.multiplier ? `${slip.multiplier}x` : '-'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      slip.result === 'win'
                        ? 'bg-green-100 text-green-800'
                        : slip.result === 'loss'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {slip.result.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-mono">
                    {pl !== null ? (
                      <span className={pl >= 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                        {pl >= 0 ? '+' : ''}${pl.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
