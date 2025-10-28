# NBA Pick'em Edge Calculator

A web application that calculates daily pick'em edges for 5 NBA betting sites (PrizePicks, Underdog, Pick6, Sleeper, FanDuel) using BBM projections.

## Features

- **Upload 6 Files**: 5 site prediction CSVs + 1 BBM Daily file
- **Automatic NBA Filtering**: Filters for NBA games if Sport column exists
- **Fuzzy Name Matching**: 85% threshold matching between RotoWire and BBM player names
- **Market Parsing**: Handles combo markets (PTS+REB+AST, etc.)
- **Edge Calculation**: BBM projection - site line
- **Top 5 Per Site**: Ranked by absolute edge with player uniqueness
- **Best Under**: Highlights best under pick per site
- **CSV Export**: Download all picks as CSV
- **Screenshot-Ready Output**: Monospace formatted results

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the application:
```bash
python app.py
```

3. Open your browser to:
```
http://localhost:5000
```

## File Format Requirements

### Site CSV Files (PrizePicks, Underdog, Pick6, Sleeper, FanDuel)

Required columns:
- `Player`: Player name (will be fuzzy matched to BBM)
- `Market`: Stat type (e.g., "Points", "PTS+REB+AST", etc.)
- `Line`: Betting line (numeric)
- `Sport` (optional): If present, will filter for "NBA"

Filename format: `rw-{site}-predictions-YYYY-MM-DD.csv`

Example:
```csv
Player,Market,Line,Sport
LeBron James,PTS+REB+AST,45.5,NBA
Stephen Curry,Points,28.5,NBA
Nikola Jokic,PTS+REB,35.5,NBA
```

### BBM Daily File

Required columns:
- `Name`: Player name
- `p`: Points projection
- `r`: Rebounds projection
- `a`: Assists projection
- `s`: Steals projection (optional)
- `b`: Blocks projection (optional)
- `to`: Turnovers projection (optional)

Supported formats: CSV, XLS, XLSX

Example:
```csv
Name,p,r,a,s,b,to
LeBron James,25.3,7.8,8.2,1.2,0.8,3.5
Stephen Curry,29.8,5.1,6.4,1.5,0.3,2.9
Nikola Jokic,24.5,11.2,9.8,1.3,0.7,3.1
```

## Market Parsing

The app automatically parses market names to BBM columns:

| Market Name | BBM Columns | Calculation |
|-------------|-------------|-------------|
| Points, PTS | p | p |
| Rebounds, REB | r | r |
| Assists, AST | a | a |
| PTS+REB | p, r | p + r |
| PTS+AST | p, a | p + a |
| PTS+REB+AST | p, r, a | p + r + a |
| Steals, STL | s | s |
| Blocks, BLK | b | b |
| Turnovers, TO | to | to |

Case-insensitive and handles variations.

## Edge Calculation Logic

1. **Fuzzy Match**: Match site player name to BBM name (85% threshold)
2. **Parse Market**: Determine which BBM columns to sum
3. **Calculate Projection**: Sum BBM column values
4. **Calculate Edge**: `edge = bbm_projection - line`
5. **Determine Direction**: "Over" if edge > 0, else "Under"

## Ranking & Selection

Per site:
1. Calculate edges for all players/markets
2. Sort by absolute edge (highest first)
3. Enforce player uniqueness (each player max once per site)
4. Select Top 5 picks
5. Find Best Under (highest absolute edge where direction='Under')

## Output Format

Screenshot-ready terminal output:
```
===============================================
🎯 PRIZEPICKS - TOP 5
===============================================
1. Jonathan Kuminga    PTS+REB+AST    Over    Line: 23.5    BBM: 30.12    Edge: +6.62
2. Nikola Jokic        PTS+REB+AST    Under   Line: 50.5    BBM: 44.97    Edge: -5.53
...

🎯 BEST UNDER: Shai Gilgeous-Alexander (PTS+REB+AST, Edge: -2.53)
```

Plus CSV download: `top_picks_YYYY-MM-DD.csv`

## Error Handling

- **Missing files**: Clear error message listing missing file
- **Date mismatch**: Shows conflicting dates from filenames
- **Invalid columns**: Lists missing required columns
- **Unmatched players**: Continues processing (doesn't fail)
- **Invalid file format**: Reports unsupported format

## Tech Stack

- **Backend**: Flask (Python)
- **Frontend**: HTML + Tailwind CSS
- **Libraries**: pandas, rapidfuzz, xlrd, openpyxl
- **File Handling**: In-memory (no disk storage)

## Validation Checklist

- ✅ Upload all 6 files correctly
- ✅ Missing file detection
- ✅ Player name fuzzy matching
- ✅ Combo market calculation (PTS+REB+AST)
- ✅ Player uniqueness per site
- ✅ Best under logic
- ✅ CSV download
- ✅ Screenshot-ready output
- ✅ Clean, professional interface

## Phase 1 Scope

This is ONLY: Upload files → Calculate edges → Display Top 5 per site

**NOT INCLUDED:**
- Historical tracking
- Results recording
- ROI calculation
- Heater tracking
- Database storage
- User accounts
- API integrations
- Multi-day comparison

## License

MIT
