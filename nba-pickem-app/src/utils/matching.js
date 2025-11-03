/**
 * Matching Utility
 * Match slip legs to Top 25 picks from Mode 1
 */

import { supabase } from '../lib/supabase';

/**
 * Find Top 25 pick matching a slip leg
 * @param {Object} leg - The slip leg to match
 * @param {string} leg.player - Player name
 * @param {string} leg.market - Market name
 * @param {string} leg.direction - over/under
 * @param {number} leg.line - Line value
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} site - Site name (lowercase)
 * @returns {Object|null} - Matching Top 25 pick or null
 */
export async function matchLegToTop25(leg, date, site = 'underdog') {
  if (!supabase) {
    console.warn('Supabase not configured - cannot match to Top 25');
    return null;
  }

  try {
    const { data: picks, error } = await supabase
      .from('top25_cache')
      .select('*')
      .eq('calculation_date', date)
      .eq('site', site.toLowerCase());

    if (error) {
      console.error('Error fetching Top 25:', error);
      return null;
    }

    if (!picks || picks.length === 0) {
      console.warn(`No Top 25 picks found for ${site} on ${date}`);
      return null;
    }

    // Normalize player names for comparison
    const normalizePlayer = (name) => {
      return name.toLowerCase().trim().replace(/\s+/g, ' ');
    };

    const normalizeMarket = (market) => {
      return market.toLowerCase().trim();
    };

    const legPlayerNorm = normalizePlayer(leg.player);
    const legMarketNorm = normalizeMarket(leg.market);
    const legDir = leg.direction.toLowerCase();

    // Find exact match
    for (const pick of picks) {
      const pickPlayerNorm = normalizePlayer(pick.player);
      const pickMarketNorm = normalizeMarket(pick.market);
      const pickDir = pick.direction.toLowerCase();

      // Check player match
      const playerMatch = pickPlayerNorm === legPlayerNorm;

      // Check market match (allow some variations)
      const marketMatch =
        pickMarketNorm === legMarketNorm ||
        pickMarketNorm.replace(/\s/g, '') === legMarketNorm.replace(/\s/g, '') ||
        (legMarketNorm.includes(pickMarketNorm) || pickMarketNorm.includes(legMarketNorm));

      // Check direction match
      const dirMatch = pickDir === legDir;

      // Check line match (allow ±0.5 tolerance)
      const lineMatch = Math.abs(pick.line - leg.line) <= 0.5;

      if (playerMatch && marketMatch && dirMatch && lineMatch) {
        return {
          ...pick,
          matched: true
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Error matching leg to Top 25:', error);
    return null;
  }
}

/**
 * Match all legs in a slip to Top 25 picks
 * @param {Array} legs - Array of slip legs
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} site - Site name
 * @returns {Promise<Array>} - Array of legs with match info
 */
export async function matchSlipLegsToTop25(legs, date, site = 'underdog') {
  const matchedLegs = await Promise.all(
    legs.map(async (leg) => {
      const match = await matchLegToTop25(leg, date, site);
      return {
        ...leg,
        fromTop25: match !== null,
        top25Rank: match ? match.rank : null,
        bbmProjection: match ? match.bbm_projection : null,
        edge: match ? match.edge : null
      };
    })
  );

  return matchedLegs;
}

/**
 * Save Top 25 picks to cache from Mode 1 results
 * @param {Object} results - Results object from Mode 1
 * @param {string} date - Date in YYYY-MM-DD format
 */
export async function saveTop25ToCache(results, date) {
  if (!supabase) {
    console.warn('Supabase not configured - cannot save Top 25');
    return;
  }

  try {
    const cacheRecords = [];

    // Process each site
    for (const [siteName, siteResults] of Object.entries(results)) {
      if (!siteResults || !siteResults.top5) continue;

      // Add top 5 picks with ranks 1-5
      siteResults.top5.forEach((pick, index) => {
        cacheRecords.push({
          calculation_date: date,
          site: siteName.toLowerCase(),
          rank: index + 1,
          player: pick.player,
          market: pick.market,
          direction: pick.direction.toLowerCase(),
          line: parseFloat(pick.line),
          bbm_projection: parseFloat(pick.projection),
          edge: parseFloat(pick.edge)
        });
      });
    }

    if (cacheRecords.length === 0) {
      console.warn('No picks to cache');
      return;
    }

    const { error } = await supabase
      .from('top25_cache')
      .upsert(cacheRecords, {
        onConflict: 'calculation_date,site,rank',
        ignoreDuplicates: false
      });

    if (error) {
      console.error('Failed to cache Top 25:', error);
    } else {
      console.log(`✅ Top 25 cached successfully (${cacheRecords.length} picks)`);
    }
  } catch (error) {
    console.error('Error caching Top 25:', error);
    // Don't throw - Mode 1 should work even if cache fails
  }
}
