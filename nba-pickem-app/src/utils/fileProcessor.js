/**
 * File Processing Utilities
 * Handles CSV parsing (RotoWire) and Excel parsing (BBM)
 */

import Papa from 'papaparse';
import * as XLSX from 'xlsx';

/**
 * Extract date from filename (expects YYYY-MM-DD format)
 */
export function extractDate(filename) {
  const match = filename.match(/(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
}

/**
 * Parse CSV file (RotoWire format)
 * Expected columns: Player, Market Name, Line
 */
export function parseCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`CSV parse error: ${results.errors[0].message}`));
          return;
        }

        const date = extractDate(file.name);

        // Validate required columns
        if (results.data.length > 0) {
          const firstRow = results.data[0];
          const hasPlayer = 'Player' in firstRow || 'player' in firstRow || 'NAME' in firstRow;
          const hasMarket = 'Market Name' in firstRow || 'market' in firstRow || 'MARKET' in firstRow;
          const hasLine = 'Line' in firstRow || 'line' in firstRow;

          if (!hasPlayer || !hasMarket || !hasLine) {
            reject(new Error(`Missing required columns in ${file.name}. Expected: Player, Market Name, Line`));
            return;
          }
        }

        resolve({
          data: results.data,
          filename: file.name,
          date
        });
      },
      error: (error) => {
        reject(new Error(`Failed to parse CSV ${file.name}: ${error.message}`));
      }
    });
  });
}

/**
 * Parse Excel file (BBM format)
 * Expected columns: Name, p, r, a, s, b, to, 3, 3a, fg, fga, ft, or, dr
 */
export function parseExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        if (workbook.SheetNames.length === 0) {
          reject(new Error('Excel file has no sheets'));
          return;
        }

        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        const date = extractDate(file.name);

        // Validate required columns
        if (jsonData.length > 0) {
          const firstRow = jsonData[0];
          const requiredCols = ['Name', 'p', 'r', 'a'];
          const missingCols = requiredCols.filter(col => !(col in firstRow) && !(col.toLowerCase() in firstRow));

          if (missingCols.length > 0) {
            reject(new Error(`Missing BBM columns in ${file.name}: ${missingCols.join(', ')}`));
            return;
          }
        }

        resolve({
          data: jsonData,
          filename: file.name,
          date
        });
      } catch (error) {
        reject(new Error(`Failed to parse Excel ${file.name}: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error(`Failed to read file ${file.name}`));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Process all 6 uploaded files
 * Returns parsed data and validates dates match
 */
export async function processAllFiles(files) {
  const { prizepicks, underdog, pick6, sleeper, fanduel, bbm } = files;

  // Check all files are present
  if (!prizepicks || !underdog || !pick6 || !sleeper || !fanduel || !bbm) {
    throw new Error('Please upload all 6 files');
  }

  // Parse all CSV files
  const [
    prizepicksData,
    underdogData,
    pick6Data,
    sleeperData,
    fanduelData
  ] = await Promise.all([
    parseCSV(prizepicks),
    parseCSV(underdog),
    parseCSV(pick6),
    parseCSV(sleeper),
    parseCSV(fanduel)
  ]);

  // Parse BBM file (could be .xls or .csv)
  let bbmData;
  if (bbm.name.endsWith('.csv')) {
    bbmData = await parseCSV(bbm);
  } else {
    bbmData = await parseExcel(bbm);
  }

  // Extract dates
  const dates = [
    prizepicksData.date,
    underdogData.date,
    pick6Data.date,
    sleeperData.date,
    fanduelData.date,
    bbmData.date
  ].filter(d => d !== null);

  // Validate all dates match
  const uniqueDates = [...new Set(dates)];
  if (uniqueDates.length > 1) {
    throw new Error(`Date mismatch detected. Files have different dates: ${uniqueDates.join(', ')}`);
  }

  const date = uniqueDates.length > 0 ? uniqueDates[0] : null;

  return {
    siteData: {
      'PrizePicks': prizepicksData.data,
      'Underdog': underdogData.data,
      'Pick6': pick6Data.data,
      'Sleeper': sleeperData.data,
      'FanDuel': fanduelData.data
    },
    bbmData: bbmData.data,
    date
  };
}
