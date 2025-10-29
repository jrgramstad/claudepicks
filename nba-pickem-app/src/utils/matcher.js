/**
 * Fast Fuzzy Player Name Matching with Fuse.js
 * Optimized for speed with exact match first, then fuzzy
 */

import Fuse from 'fuse.js';

const FUZZY_THRESHOLD = 0.15; // 0.15 distance = ~85% similarity

// Cache for exact matches (much faster)
const exactMatchCache = new Map();

/**
 * Find matching BBM player - optimized for speed
 * 1. Check cache first
 * 2. Try exact match (instant)
 * 3. Fall back to fuzzy search
 */
export function findBBMPlayer(rotowireName, bbmPlayers, fuseIndex) {
  if (!rotowireName || !bbmPlayers || bbmPlayers.length === 0) {
    return null;
  }

  const nameLower = rotowireName.toLowerCase().trim();

  // 1. Check cache first
  if (exactMatchCache.has(nameLower)) {
    return exactMatchCache.get(nameLower);
  }

  // 2. Try exact match first (fastest)
  for (const bbmPlayer of bbmPlayers) {
    const bbmName = (bbmPlayer.Name || bbmPlayer.name || '').toLowerCase().trim();
    if (nameLower === bbmName) {
      exactMatchCache.set(nameLower, bbmPlayer);
      return bbmPlayer;
    }
  }

  // 3. Use Fuse.js for fuzzy matching (still fast)
  if (fuseIndex) {
    const results = fuseIndex.search(rotowireName);
    if (results.length > 0 && results[0].score <= FUZZY_THRESHOLD) {
      const match = results[0].item;
      exactMatchCache.set(nameLower, match);
      return match;
    }
  }

  return null;
}

/**
 * Create Fuse.js search index - do this once upfront
 */
export function createFuseIndex(bbmPlayers) {
  const options = {
    keys: ['Name', 'name'],
    threshold: FUZZY_THRESHOLD,
    distance: 100,
    includeScore: true,
    minMatchCharLength: 2
  };

  return new Fuse(bbmPlayers, options);
}

/**
 * Create a match function with pre-built Fuse index
 */
export function createMatcher(bbmPlayers) {
  const fuseIndex = createFuseIndex(bbmPlayers);

  return (playerName) => findBBMPlayer(playerName, bbmPlayers, fuseIndex);
}

/**
 * Clear the cache (useful for new data)
 */
export function clearCache() {
  exactMatchCache.clear();
}
