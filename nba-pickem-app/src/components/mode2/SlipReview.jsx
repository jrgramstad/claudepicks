/**
 * SlipReview Component
 * Review and edit extracted slip data before saving
 */

import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function SlipReview({ photoUrl, extractedData, onSaved, onCancel }) {
  const [slipDate, setSlipDate] = useState(new Date().toISOString().split('T')[0]);
  const [entryType, setEntryType] = useState(extractedData.entry_type || '');
  const [stake, setStake] = useState(extractedData.stake || 0);
  const [potentialReturn, setPotentialReturn] = useState(extractedData.potential_return || 0);
  const [multiplier, setMultiplier] = useState(extractedData.multiplier || 0);
  const [promoType, setPromoType] = useState(extractedData.promo_type || '');
  const [promoValue, setPromoValue] = useState(extractedData.promo_value || '');
  const [legs, setLegs] = useState(extractedData.legs || []);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleAddLeg = () => {
    setLegs([...legs, {
      player: '',
      market: '',
      direction: 'over',
      line: 0
    }]);
  };

  const handleRemoveLeg = (index) => {
    setLegs(legs.filter((_, i) => i !== index));
  };

  const handleLegChange = (index, field, value) => {
    const newLegs = [...legs];
    newLegs[index][field] = value;
    setLegs(newLegs);
  };

  const handleSave = async () => {
    if (!supabase) {
      setError('Supabase is not configured. Please add your credentials to .env.local');
      return;
    }

    // Validate required fields
    if (!slipDate || !entryType || !stake || legs.length === 0) {
      setError('Please fill in all required fields (date, entry type, stake, and at least one leg)');
      return;
    }

    // Validate all legs have data
    const invalidLeg = legs.find(leg => !leg.player || !leg.market || !leg.line);
    if (invalidLeg) {
      setError('All legs must have player, market, and line filled in');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Insert slip
      const { data: slipData, error: slipError } = await supabase
        .from('slips')
        .insert({
          site: 'underdog',
          slip_date: slipDate,
          photo_url: photoUrl,
          entry_type: entryType,
          stake: parseFloat(stake),
          potential_return: potentialReturn ? parseFloat(potentialReturn) : null,
          multiplier: multiplier ? parseFloat(multiplier) : null,
          result: 'pending',
          source: 'ocr',
          promo_type: promoType || null,
          promo_value: promoValue || null,
          notes: notes || null
        })
        .select()
        .single();

      if (slipError) {
        console.error('Slip insert error:', slipError);
        throw new Error(`Failed to save slip: ${slipError.message}`);
      }

      console.log('Slip saved:', slipData);

      // Insert legs
      const legRecords = legs.map(leg => ({
        slip_id: slipData.id,
        player: leg.player,
        market: leg.market,
        direction: leg.direction.toLowerCase(),
        line: parseFloat(leg.line),
        result: 'pending'
      }));

      const { error: legsError } = await supabase
        .from('slip_legs')
        .insert(legRecords);

      if (legsError) {
        console.error('Legs insert error:', legsError);
        throw new Error(`Failed to save legs: ${legsError.message}`);
      }

      console.log('✅ Slip and legs saved successfully');

      // Success
      onSaved();
    } catch (err) {
      console.error('Save error:', err);
      setError(err.message || 'Failed to save slip');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          📝 Review & Edit Slip
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-600 hover:text-gray-800 font-semibold"
        >
          ✕ Cancel
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-600 p-4 rounded">
          <div className="flex items-start">
            <div className="text-2xl mr-3">❌</div>
            <div>
              <p className="text-red-800 font-semibold">Error</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Photo */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-3">Slip Photo</h3>
          <img
            src={photoUrl}
            alt="Slip"
            className="w-full rounded-lg border-2 border-gray-200"
          />
        </div>

        {/* Right: Form */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-3">Slip Details</h3>

          <div className="space-y-4">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={slipDate}
                onChange={(e) => setSlipDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Entry Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Entry Type *
              </label>
              <input
                type="text"
                value={entryType}
                onChange={(e) => setEntryType(e.target.value)}
                placeholder="e.g., 2-pick, 3-pick, flex"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Stake */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stake ($) *
              </label>
              <input
                type="number"
                step="0.01"
                value={stake}
                onChange={(e) => setStake(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Potential Return */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Potential Return ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={potentialReturn}
                onChange={(e) => setPotentialReturn(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Multiplier */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Multiplier
              </label>
              <input
                type="number"
                step="0.01"
                value={multiplier}
                onChange={(e) => setMultiplier(e.target.value)}
                placeholder="e.g., 3.0, 6.0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Promo Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Promo Type
              </label>
              <input
                type="text"
                value={promoType}
                onChange={(e) => setPromoType(e.target.value)}
                placeholder="e.g., profit_boost, free_entry"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Promo Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Promo Value
              </label>
              <input
                type="text"
                value={promoValue}
                onChange={(e) => setPromoValue(e.target.value)}
                placeholder="e.g., 50%, $10"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Legs Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-700">Legs ({legs.length})</h3>
          <button
            onClick={handleAddLeg}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            + Add Leg
          </button>
        </div>

        <div className="space-y-4">
          {legs.map((leg, index) => (
            <div key={index} className="border-2 border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-gray-700">Leg {index + 1}</span>
                {legs.length > 1 && (
                  <button
                    onClick={() => handleRemoveLeg(index)}
                    className="text-red-600 hover:text-red-800 font-medium text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Player *
                  </label>
                  <input
                    type="text"
                    value={leg.player}
                    onChange={(e) => handleLegChange(index, 'player', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Market *
                  </label>
                  <input
                    type="text"
                    value={leg.market}
                    onChange={(e) => handleLegChange(index, 'market', e.target.value)}
                    placeholder="e.g., Points, PTS+REB"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Direction *
                  </label>
                  <select
                    value={leg.direction}
                    onChange={(e) => handleLegChange(index, 'direction', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="over">Over</option>
                    <option value="under">Under</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Line *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={leg.line}
                    onChange={(e) => handleLegChange(index, 'line', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex gap-4 justify-end">
        <button
          onClick={onCancel}
          className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors"
          disabled={saving}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={saving}
        >
          {saving ? 'Saving...' : '💾 Save Slip'}
        </button>
      </div>
    </div>
  );
}
