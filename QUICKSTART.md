# Quick Start Guide

## Installation & Setup

1. **Install dependencies:**
```bash
pip install -r requirements.txt
```

2. **Run the application:**
```bash
python app.py
```

3. **Open in browser:**
```
http://localhost:5000
```

## Using the App

### Step 1: Prepare Your Files

You need 6 files:
- `rw-prizepicks-predictions-YYYY-MM-DD.csv`
- `rw-underdog-predictions-YYYY-MM-DD.csv`
- `rw-pick6-predictions-YYYY-MM-DD.csv`
- `rw-sleeper-predictions-YYYY-MM-DD.csv`
- `rw-fanduel-sb-predictions-YYYY-MM-DD.csv`
- `BBM_Daily.csv` (or `.xls` or `.xlsx`)

**Test Data Available**: Sample files are in the `test_data/` folder!

### Step 2: Upload Files

1. Click each "Choose File" button
2. Select the corresponding file for each site
3. Select your BBM Daily file
4. Click "Calculate Edges"

### Step 3: View Results

Results display in terminal-style format:
- **Top 5 picks per site** (ranked by edge)
- **Best Under pick** highlighted for each site
- **25 total picks** across all sites

### Step 4: Download CSV

Click "📥 Download CSV" to save results as:
```
top_picks_YYYY-MM-DD.csv
```

## Testing with Sample Data

Try it out with the included test files:

1. Upload all 6 files from `test_data/` folder
2. See results for all 5 sites
3. Download the CSV

## Expected Output Format

```
===============================================
🎯 PRIZEPICKS - TOP 5
===============================================
1. Player Name          Market              Over/Under  Line: XX.X   BBM: XX.XX  Edge: +X.XX
2. Player Name          Market              Over/Under  Line: XX.X   BBM: XX.XX  Edge: +X.XX
...

🎯 BEST UNDER: Player Name (Market, Edge: -X.XX)
```

## Troubleshooting

### Error: "Missing file: X"
- Make sure you selected a file for each of the 6 inputs

### Error: "Date mismatch detected"
- All site CSV files should have the same date in filename
- Example: all should be `2025-10-28` or all `2025-10-29`

### Error: "Missing required columns"
- Check that your CSV has these columns:
  - Site files: `Player`, `Market`, `Line`
  - BBM file: `Name`, `p`, `r`, `a`

### No picks shown for a site
- Check that the site CSV has NBA data
- Verify player names can be matched to BBM file
- Ensure markets are recognized (PTS, REB, AST, etc.)

## Market Types Supported

| Market Name | Calculation |
|-------------|-------------|
| Points, PTS | Points only |
| Rebounds, REB | Rebounds only |
| Assists, AST | Assists only |
| PTS+REB | Points + Rebounds |
| PTS+AST | Points + Assists |
| PTS+REB+AST | Points + Rebounds + Assists |
| Steals, STL | Steals only |
| Blocks, BLK | Blocks only |
| Turnovers, TO | Turnovers only |

All case-insensitive and handles variations.

## Tips

1. **File naming matters**: Date in filename helps track daily results
2. **Player uniqueness**: Each player appears max once per site
3. **Best Under**: Shows best under even if not in Top 5
4. **Screenshot-ready**: Copy output directly from browser for sharing

## Next Steps

- Use real data from RotoWire and BBM
- Take screenshots of results to track
- Compare edges across sites
- Focus on highest absolute edges

Happy picking! 🏀
