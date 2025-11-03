/**
 * Web Worker for Background Processing
 * Keeps main thread responsive while processing large files
 */

import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import Fuse from 'fuse.js';

// ========== BBM STAT MAPPING ==========

const BBM_STAT_MAP = {
  'PTS': 'p', 'REB': 'r', 'AST': 'a', 'STL': 's', 'BLK': 'b', 'TO': 'to',
  '3PT': '3', '3PA': '3a', 'FG': 'fg', 'FGA': 'fga', 'FT': 'ft', 'FTA': 'fta',
  'OR': 'or', 'DR': 'dr', '2PT': '2', 'PF': 'pf'
};

const SKIP_MARKETS = ['Fantasy Score', 'Fantasy Points', 'Double-Double', 'Triple-Double', 'Fantasy Pts'];

// ========== MARKET PARSING ==========

function parseMarket(marketName) {
  const market = marketName.trim();

  if (SKIP_MARKETS.some(skip => market.includes(skip))) {
    return null;
  }

  // Special cases - ORDER MATTERS
  if (market === "Offensive Rebounds" || market === "Offensive Reb") return ['OR'];
  if (market === "Defensive Rebounds" || market === "Defensive Reb") return ['DR'];
  if (market === "Rebounds" || market === "Total Rebounds") return ['REB'];
  if (market === "3PT Attempts" || market === "3-PT Attempts") return ['3PA'];
  if (market === "3PT Made" || market === "3-PT Made" || market === "3-Pointers Made") return ['3PT'];
  if (market === "2PT Made" || market === "2-PT Made" || market === "2-Pointers Made") return ['2PT'];

  // Combo markets
  if (market === "PTS+REB+AST" || market === "Pts+Reb+Ast") return ['PTS', 'REB', 'AST'];
  if (market === "BLK+STL" || market === "Blk+Stl" || market === "Blocks+Steals") return ['BLK', 'STL'];
  if (market === "PTS+REB" || market === "Pts+Reb" || market === "Points+Rebounds") return ['PTS', 'REB'];
  if (market === "PTS+AST" || market === "Pts+Ast" || market === "Points+Assists") return ['PTS', 'AST'];
  if (market === "REB+AST" || market === "Reb+Ast" || market === "Rebounds+Assists") return ['REB', 'AST'];

  // Single stat markets
  const upperMarket = market.toUpperCase();

  // Check specific patterns first
  if (upperMarket.includes("FIELD GOAL ATTEMPTS") || upperMarket.includes("FG ATTEMPTED")) return ['FGA'];
  if (upperMarket.includes("FIELD GOALS MADE") || upperMarket === "FG") return ['FG'];
  if (upperMarket.includes("FREE THROW ATTEMPTS") || upperMarket.includes("FT ATTEMPTED")) return ['FTA'];
  if (upperMarket.includes("FREE THROWS MADE") || upperMarket === "FT") return ['FT'];
  if (upperMarket.includes("PERSONAL FOULS") || upperMarket.includes("FOULS") || upperMarket === "PF") return ['PF'];

  // General patterns
  if (upperMarket.includes("POINTS") || upperMarket === "PTS") return ['PTS'];
  if (upperMarket.includes("ASSISTS") || upperMarket === "AST") return ['AST'];
  if (upperMarket.includes("STEALS") || upperMarket === "STL") return ['STL'];
  if (upperMarket.includes("BLOCKS") || upperMarket === "BLK") return ['BLK'];
  if (upperMarket.includes("TURNOVERS") || upperMarket === "TO") return ['TO'];

  return null;
}

// ========== PROJECTION CALCULATION ==========

function calculateProjection(bbmPlayer, stats) {
  if (!stats || stats.length === 0) return null;

  let projection = 0;
  for (const stat of stats) {
    const bbmColumn = BBM_STAT_MAP[stat];
    if (!bbmColumn) return null;

    const value = parseFloat(bbmPlayer[bbmColumn]);
    if (isNaN(value)) return null;

    projection += value;
  }

  return projection;
}

// ========== EDGE CALCULATION ==========

function calculateEdge(siteLine, bbmProjection) {
  const edge = bbmProjection - siteLine;
  const direction = edge > 0 ? "Over" : "Under";
  const absoluteEdge = Math.abs(edge);

  return {
    edge: parseFloat(edge.toFixed(2)),
    direction,
    absoluteEdge: parseFloat(absoluteEdge.toFixed(2))
  };
}

// ========== FUZZY MATCHING ==========

const FUZZY_THRESHOLD = 0.15;
const exactMatchCache = new Map();

function findBBMPlayer(rotowireName, bbmPlayers, fuseIndex) {
  if (!rotowireName || !bbmPlayers || bbmPlayers.length === 0) return null;

  const nameLower = rotowireName.toLowerCase().trim();

  // Check cache
  if (exactMatchCache.has(nameLower)) {
    return exactMatchCache.get(nameLower);
  }

  // Exact match first
  for (const bbmPlayer of bbmPlayers) {
    const bbmName = (bbmPlayer.Name || bbmPlayer.name || '').toLowerCase().trim();
    if (nameLower === bbmName) {
      exactMatchCache.set(nameLower, bbmPlayer);
      return bbmPlayer;
    }
  }

  // Fuzzy match
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

// ========== RANKING ==========

function rankPicks(picks, siteName) {
  if (!picks || picks.length === 0) {
    return { top5: [], bestUnder: null };
  }

  // Add percentage edge to each pick
  picks.forEach(pick => {
    pick.edgePercentage = (pick.absoluteEdge / pick.line) * 100;
  });

  // ========== MARKET TYPE ANALYSIS ==========
  const marketTypes = {
    single: [],
    combo2: [],
    combo3: []
  };

  picks.forEach(pick => {
    const statCount = pick.market.split('+').length;

    if (statCount === 1) {
      marketTypes.single.push(pick);
    } else if (statCount === 2) {
      marketTypes.combo2.push(pick);
    } else if (statCount === 3) {
      marketTypes.combo3.push(pick);
    }
  });

  if (siteName) {
    console.log(`\n=== ${siteName} MARKET TYPE ANALYSIS ===`);
    console.log('Market type counts:');
    console.log('- Single stats:', marketTypes.single.length);
    console.log('- 2-stat combos:', marketTypes.combo2.length);
    console.log('- 3-stat combos:', marketTypes.combo3.length);

    // Show top edges by absolute value
    const allSortedByAbs = [...picks].sort((a, b) => b.absoluteEdge - a.absoluteEdge);
    console.log('\nTop 10 by ABSOLUTE edge:');
    allSortedByAbs.slice(0, 10).forEach((e, i) => {
      console.log(`${i+1}. ${e.player} - ${e.market} | Edge: ${e.edge > 0 ? '+' : ''}${e.edge} | Line: ${e.line} | ${e.edgePercentage.toFixed(1)}%`);
    });

    // Show top edges by percentage
    const allSortedByPct = [...picks].sort((a, b) => b.edgePercentage - a.edgePercentage);
    console.log('\nTop 10 by PERCENTAGE edge:');
    allSortedByPct.slice(0, 10).forEach((e, i) => {
      console.log(`${i+1}. ${e.player} - ${e.market} | Edge: ${e.edge > 0 ? '+' : ''}${e.edge} | Line: ${e.line} | ${e.edgePercentage.toFixed(1)}%`);
    });

    // Sample single-stat edges
    if (marketTypes.single.length > 0) {
      const singlesSorted = [...marketTypes.single].sort((a, b) => b.edgePercentage - a.edgePercentage);
      console.log('\nTop 5 SINGLE-STAT edges (by %):');
      singlesSorted.slice(0, 5).forEach((e, i) => {
        console.log(`${i+1}. ${e.player} - ${e.market} | Edge: ${e.edge > 0 ? '+' : ''}${e.edge} | Line: ${e.line} | ${e.edgePercentage.toFixed(1)}%`);
      });
    }
  }

  // ========== RANKING BY PERCENTAGE EDGE ==========
  const sorted = [...picks].sort((a, b) => b.edgePercentage - a.edgePercentage);

  const seenPlayers = new Set();
  const uniquePicks = [];

  for (const pick of sorted) {
    if (!seenPlayers.has(pick.player)) {
      seenPlayers.add(pick.player);
      uniquePicks.push(pick);
    }
  }

  const top5 = uniquePicks.slice(0, 5);
  const underPicks = uniquePicks.filter(p => p.direction === 'Under');
  const bestUnder = underPicks.length > 0 ? underPicks[0] : null;

  return { top5, bestUnder };
}

// ========== FILE PARSING ==========

function parseCSV(fileContent) {
  return new Promise((resolve, reject) => {
    Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`CSV parse error: ${results.errors[0].message}`));
          return;
        }
        resolve(results.data);
      },
      error: (error) => reject(error)
    });
  });
}

function parseExcel(fileBuffer) {
  const data = new Uint8Array(fileBuffer);
  const workbook = XLSX.read(data, { type: 'array' });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(firstSheet);
}

// ========== PROCESS SINGLE SITE ==========

function processSite(siteName, siteRows, bbmPlayers, fuseIndex) {
  const picks = [];
  let processed = 0;
  let matched = 0;
  let marketParseFailed = 0;
  let projectionFailed = 0;

  // Debug: Log first row to see column names
  if (siteName === 'PrizePicks' && siteRows.length > 0) {
    console.log(`[${siteName}] First row columns:`, Object.keys(siteRows[0]));
    console.log(`[${siteName}] First row data:`, siteRows[0]);
  }

  for (const row of siteRows) {
    processed++;

    const playerName = row.Player || row.player || row.NAME || row.name;
    const marketName = row['Market Name'] || row.market || row.MARKET;
    const line = parseFloat(row.Line || row.line);

    if (!playerName || !marketName || isNaN(line)) {
      if (siteName === 'PrizePicks' && processed <= 3) {
        console.log(`[${siteName}] Row ${processed} missing data:`, { playerName, marketName, line, raw: row });
      }
      continue;
    }

    const bbmPlayer = findBBMPlayer(playerName, bbmPlayers, fuseIndex);
    if (!bbmPlayer) continue;

    matched++;

    const stats = parseMarket(marketName);
    if (!stats) {
      marketParseFailed++;
      if (siteName === 'PrizePicks' && marketParseFailed <= 5) {
        console.log(`[${siteName}] Market parse failed:`, marketName);
      }
      continue;
    }

    const projection = calculateProjection(bbmPlayer, stats);
    if (projection === null) {
      projectionFailed++;
      continue;
    }

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

  if (siteName === 'PrizePicks') {
    console.log(`[${siteName}] Processing complete:`, {
      processed,
      matched,
      marketParseFailed,
      projectionFailed,
      totalPicks: picks.length
    });
  }

  const ranked = rankPicks(picks, siteName);

  return {
    siteName,
    results: ranked,
    stats: {
      processed,
      matched,
      totalEdges: picks.length
    }
  };
}

// ========== MESSAGE HANDLER ==========

self.onmessage = async function(e) {
  const { type, data } = e.data;

  try {
    if (type === 'PROCESS_FILES') {
      const { files } = data;

      // Progress: Starting
      self.postMessage({ type: 'PROGRESS', step: 'parsing', message: 'Parsing files...' });

      // Parse BBM file first
      let bbmData;
      if (files.bbm.name.endsWith('.csv')) {
        bbmData = await parseCSV(files.bbm.content);
      } else {
        bbmData = parseExcel(files.bbm.content);
      }

      self.postMessage({
        type: 'PROGRESS',
        step: 'parsed_bbm',
        message: `BBM file loaded (${bbmData.length} players)`
      });

      // Create Fuse index once
      const fuseOptions = {
        keys: ['Name', 'name'],
        threshold: FUZZY_THRESHOLD,
        distance: 100,
        includeScore: true,
        minMatchCharLength: 2
      };
      const fuseIndex = new Fuse(bbmData, fuseOptions);

      // Parse site CSVs
      const siteData = {};
      const siteNames = ['PrizePicks', 'Underdog', 'Pick6', 'Sleeper', 'FanDuel'];
      const fileKeys = ['prizepicks', 'underdog', 'pick6', 'sleeper', 'fanduel'];

      for (let i = 0; i < siteNames.length; i++) {
        const siteName = siteNames[i];
        const fileKey = fileKeys[i];
        const file = files[fileKey];

        const csvData = await parseCSV(file.content);
        siteData[siteName] = csvData;

        self.postMessage({
          type: 'PROGRESS',
          step: 'parsed_site',
          message: `${siteName} loaded (${csvData.length} rows)`
        });
      }

      // Process each site progressively
      const allResults = {};

      for (const siteName of siteNames) {
        self.postMessage({
          type: 'PROGRESS',
          step: 'processing_site',
          site: siteName,
          message: `Calculating ${siteName} edges...`
        });

        const result = processSite(siteName, siteData[siteName], bbmData, fuseIndex);
        allResults[siteName] = result.results;

        // Send this site's results immediately
        self.postMessage({
          type: 'SITE_COMPLETE',
          siteName,
          results: result.results,
          stats: result.stats
        });
      }

      // All done
      self.postMessage({
        type: 'COMPLETE',
        results: allResults
      });

    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      error: error.message
    });
  }
};
