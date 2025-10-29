/**
 * CSV Export Utility
 * Exports results to downloadable CSV file
 */

/**
 * Convert results to CSV format and trigger download
 */
export function exportToCSV(results, date) {
  const rows = [];

  // Header row
  rows.push(['Site', 'Rank', 'Player', 'Market', 'Direction', 'Line', 'BBM Projection', 'Edge']);

  // Process each site
  for (const [siteName, siteResults] of Object.entries(results)) {
    const { top5, bestUnder } = siteResults;

    // Add top 5 picks
    top5.forEach((pick, index) => {
      rows.push([
        siteName,
        index + 1,
        pick.player,
        pick.market,
        pick.direction,
        pick.line,
        pick.projection,
        pick.edge
      ]);
    });

    // Add best under (if different from top 5)
    if (bestUnder && !top5.includes(bestUnder)) {
      rows.push([
        siteName,
        'Best Under',
        bestUnder.player,
        bestUnder.market,
        bestUnder.direction,
        bestUnder.line,
        bestUnder.projection,
        bestUnder.edge
      ]);
    }
  }

  // Convert to CSV string
  const csvContent = rows.map(row =>
    row.map(cell => {
      // Escape cells containing commas or quotes
      const cellStr = String(cell);
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    }).join(',')
  ).join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  const filename = date ? `nba-pickem-edges-${date}.csv` : 'nba-pickem-edges.csv';

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
