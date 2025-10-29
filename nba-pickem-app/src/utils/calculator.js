/**
 * NBA Pick'em Edge Calculator
 * Ports Python calculation logic to JavaScript
 */

// BBM Column Mapping (BBM projections to stat abbreviations)
export const BBM_STAT_MAP = {
  'PTS': 'p',      // Points
  'REB': 'r',      // Total rebounds
  'AST': 'a',      // Assists
  'STL': 's',      // Steals
  'BLK': 'b',      // Blocks
  'TO': 'to',      // Turnovers
  '3PT': '3',      // 3-pointers made
  '3PA': '3a',     // 3-point attempts
  'FG': 'fg',      // Field goals made
  'FGA': 'fga',    // Field goal attempts
  'FT': 'ft',      // Free throws made
  'OR': 'or',      // Offensive rebounds
  'DR': 'dr',      // Defensive rebounds
};

// Markets to skip (cannot calculate)
const SKIP_MARKETS = ['Fantasy Score', 'Fantasy Points'];

/**
 * Parse market name to determine which BBM stats to use
 * CRITICAL: Order matters - check specific cases before general ones
 */
export function parseMarket(marketName) {
  const market = marketName.trim();

  // Skip markets we can't calculate
  if (SKIP_MARKETS.some(skip => market.includes(skip))) {
    return null;
  }

  // Special cases - ORDER MATTERS (check specific before general)
  if (market === "Offensive Rebounds" || market === "Offensive Reb") {
    return ['OR'];
  }
  if (market === "Defensive Rebounds" || market === "Defensive Reb") {
    return ['DR'];
  }
  if (market === "Rebounds" || market === "Total Rebounds") {
    return ['REB'];
  }
  if (market === "3PT Attempts" || market === "3-PT Attempts") {
    return ['3PA'];
  }
  if (market === "3PT Made" || market === "3-PT Made" || market === "3-Pointers Made") {
    return ['3PT'];
  }

  // Combo markets (sum multiple stats)
  if (market === "PTS+REB+AST" || market === "Pts+Reb+Ast") {
    return ['PTS', 'REB', 'AST'];
  }
  if (market === "BLK+STL" || market === "Blk+Stl" || market === "Blocks+Steals") {
    return ['BLK', 'STL'];
  }
  if (market === "PTS+REB" || market === "Pts+Reb" || market === "Points+Rebounds") {
    return ['PTS', 'REB'];
  }
  if (market === "PTS+AST" || market === "Pts+Ast" || market === "Points+Assists") {
    return ['PTS', 'AST'];
  }
  if (market === "REB+AST" || market === "Reb+Ast" || market === "Rebounds+Assists") {
    return ['REB', 'AST'];
  }

  // Single stat markets (try to match directly)
  const upperMarket = market.toUpperCase();

  if (upperMarket.includes("POINTS") || upperMarket === "PTS") return ['PTS'];
  if (upperMarket.includes("ASSISTS") || upperMarket === "AST") return ['AST'];
  if (upperMarket.includes("STEALS") || upperMarket === "STL") return ['STL'];
  if (upperMarket.includes("BLOCKS") || upperMarket === "BLK") return ['BLK'];
  if (upperMarket.includes("TURNOVERS") || upperMarket === "TO") return ['TO'];
  if (upperMarket.includes("FIELD GOALS MADE") || upperMarket === "FG") return ['FG'];
  if (upperMarket.includes("FIELD GOAL ATTEMPTS") || upperMarket === "FGA") return ['FGA'];
  if (upperMarket.includes("FREE THROWS MADE") || upperMarket === "FT") return ['FT'];

  // If we can't parse it, return null (will be skipped)
  console.warn(`Unknown market: ${market}`);
  return null;
}

/**
 * Calculate BBM projection for a market
 */
export function calculateProjection(bbmPlayer, stats) {
  if (!stats || stats.length === 0) return null;

  let projection = 0;
  for (const stat of stats) {
    const bbmColumn = BBM_STAT_MAP[stat];
    if (!bbmColumn) {
      console.warn(`Unknown stat: ${stat}`);
      return null;
    }

    const value = parseFloat(bbmPlayer[bbmColumn]);
    if (isNaN(value)) {
      console.warn(`Invalid BBM value for ${stat}: ${bbmPlayer[bbmColumn]}`);
      return null;
    }

    projection += value;
  }

  return projection;
}

/**
 * Calculate edge for a single pick
 */
export function calculateEdge(siteLine, bbmProjection) {
  const edge = bbmProjection - siteLine;
  const direction = edge > 0 ? "Over" : "Under";
  const absoluteEdge = Math.abs(edge);

  return {
    edge: parseFloat(edge.toFixed(2)),
    direction,
    absoluteEdge: parseFloat(absoluteEdge.toFixed(2))
  };
}

/**
 * Process all picks for a site and rank them
 * Returns top 5 picks + best under
 */
export function rankPicks(picks) {
  if (!picks || picks.length === 0) {
    return { top5: [], bestUnder: null };
  }

  // Sort by absolute edge (descending)
  const sorted = [...picks].sort((a, b) => b.absoluteEdge - a.absoluteEdge);

  // Enforce player uniqueness - keep first occurrence (highest absolute edge)
  const seenPlayers = new Set();
  const uniquePicks = [];

  for (const pick of sorted) {
    if (!seenPlayers.has(pick.player)) {
      seenPlayers.add(pick.player);
      uniquePicks.push(pick);
    }
  }

  // Get top 5
  const top5 = uniquePicks.slice(0, 5);

  // Find best under (highest absolute edge where direction='Under')
  const underPicks = uniquePicks.filter(p => p.direction === 'Under');
  const bestUnder = underPicks.length > 0 ? underPicks[0] : null;

  return { top5, bestUnder };
}

/**
 * Process all data and calculate edges for all sites
 */
export function processAllData(siteData, bbmData, matchPlayer) {
  const results = {};

  for (const [siteName, siteRows] of Object.entries(siteData)) {
    const picks = [];

    for (const row of siteRows) {
      const playerName = row.Player || row.player || row.NAME || row.name;
      const marketName = row['Market Name'] || row.market || row.MARKET;
      const line = parseFloat(row.Line || row.line);

      if (!playerName || !marketName || isNaN(line)) {
        console.warn(`Invalid row in ${siteName}:`, row);
        continue;
      }

      // Find matching BBM player
      const bbmPlayer = matchPlayer(playerName, bbmData);
      if (!bbmPlayer) {
        console.warn(`No BBM match for: ${playerName} (${siteName})`);
        continue;
      }

      // Parse market to get stats
      const stats = parseMarket(marketName);
      if (!stats) {
        continue; // Skip markets we can't calculate
      }

      // Calculate BBM projection
      const projection = calculateProjection(bbmPlayer, stats);
      if (projection === null) {
        continue;
      }

      // Calculate edge
      const { edge, direction, absoluteEdge } = calculateEdge(line, projection);

      picks.push({
        player: playerName,
        market: marketName,
        line,
        projection: parseFloat(projection.toFixed(2)),
        edge,
        direction,
        absoluteEdge
      });
    }

    // Rank picks for this site
    results[siteName] = rankPicks(picks);
  }

  return results;
}
