/**
 * Fuzzy Player Name Matching
 * Uses fuzzball.js for 85% similarity threshold
 */

import * as fuzzball from 'fuzzball';

const MATCH_THRESHOLD = 85; // 85% similarity required

/**
 * Find matching BBM player for a RotoWire player name
 * @param {string} rotowireName - Player name from RotoWire CSV
 * @param {Array} bbmPlayers - Array of BBM player objects
 * @returns {Object|null} Matching BBM player or null if not found
 */
export function findBBMPlayer(rotowireName, bbmPlayers) {
  if (!rotowireName || !bbmPlayers || bbmPlayers.length === 0) {
    return null;
  }

  const nameLower = rotowireName.toLowerCase().trim();

  for (const bbmPlayer of bbmPlayers) {
    const bbmName = (bbmPlayer.Name || bbmPlayer.name || '').toLowerCase().trim();

    if (!bbmName) continue;

    // Calculate similarity ratio
    const ratio = fuzzball.ratio(nameLower, bbmName);

    if (ratio >= MATCH_THRESHOLD) {
      return bbmPlayer;
    }
  }

  return null;
}

/**
 * Create a match function with BBM players pre-loaded
 * This allows us to pass a simple function to the calculator
 */
export function createMatcher(bbmPlayers) {
  return (playerName) => findBBMPlayer(playerName, bbmPlayers);
}
