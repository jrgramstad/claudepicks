# NBA Fantasy Points Edge Calculator

Compares Basketball Monster (BBM) projections against Underdog Fantasy / PrizePicks fantasy point lines to identify +EV plays.

This tool automates what used to take an hour manually into a 30-second script.

## What It Does

1. **Ingests BBM daily export** (Excel file with stat projections)
2. **Ingests platform lines** (RotoWire CSV or manual entry)
3. **Calculates projected fantasy points** using BBM stats + platform scoring
4. **Compares** projected fantasy points vs platform's posted line
5. **Outputs ranked edges** (projected - line = edge)
6. **Flags** More plays (projection > line) and Less plays (projection < line)

## Fantasy Points Scoring

Both Underdog and PrizePicks use identical scoring:

| Stat | Weight |
|------|--------|
| Point | 1.0 |
| Rebound | 1.2 |
| Assist | 1.5 |
| Steal | 3.0 |
| Block | 3.0 |
| Turnover | -1.0 |

**Formula:**
```
Fantasy_Points = (pts × 1.0) + (reb × 1.2) + (ast × 1.5) + (stl × 3.0) + (blk × 3.0) + (to × -1.0)
```

## Installation

```bash
pip install -r requirements.txt
```

## Data Sources

### 1. Basketball Monster (BBM) Export

- Format: Excel (.xls or .xlsx)
- Required columns:
  - `Name` — player name
  - `p` — projected points
  - `r` — projected rebounds
  - `a` — projected assists
  - `s` — projected steals
  - `b` — projected blocks
  - `to` — projected turnovers
- Optional columns:
  - `Inj` — injury status (Q, D, O, P)
  - `Ease` — matchup ease rating
  - `Team` — team abbreviation

**Where to get:**
- Export from Basketball Monster daily projections
- Place in `./data/bbm_daily.xls`

### 2. Platform Lines

**Option A: RotoWire CSV** (preferred)
- File: `rw-underdog-predictions-YYYY-MM-DD.csv`
- Must contain:
  - `Player` or `NAME` column
  - `Line` column
  - `Market Name` column (script filters to "Fantasy Points")

**Option B: Manual CSV**
- Simple format: `Player,Line`
- Create manually for missing players
- Example:
  ```csv
  Player,Line
  LeBron James,45.5
  Stephen Curry,42.0
  ```

Place in `./data/lines.csv`

## Usage

### Basic Usage

```bash
python fp_edge.py --bbm ./data/bbm_daily.xls --lines ./data/lines.csv
```

### With Minimum Edge Filter

Only show edges >= 2.0:

```bash
python fp_edge.py --bbm ./data/bbm_daily.xls --lines ./data/lines.csv --min-edge 2.0
```

### Export to CSV

```bash
python fp_edge.py --bbm ./data/bbm_daily.xls --lines ./data/lines.csv --export
```

Exports to `./exports/fp_edges_YYYY-MM-DD.csv`

### Specify Platform

```bash
python fp_edge.py --bbm ./data/bbm_daily.xls --lines ./data/lines.csv --scoring prizepicks
```

(Note: Scoring is identical for both platforms, so this mainly affects output labeling)

### Adjust Fuzzy Matching Threshold

Default is 85% similarity. Lower for more matches (less strict):

```bash
python fp_edge.py --bbm ./data/bbm_daily.xls --lines ./data/lines.csv --threshold 80
```

## Output Example

```
================================================================================
NBA FANTASY POINTS EDGE CALCULATOR — 2025-02-06
Platform: Underdog Fantasy
================================================================================

🟢 OVERS (BBM projects ABOVE line): 15 plays
--------------------------------------------------------------------------------
#   Player                    Team  Line    BBM Proj   Edge     Edge%    Ease   Inj
--------------------------------------------------------------------------------
1   Nikola Jokic              DEN   52.5    58.34      +5.84    +11.1%   8.2
2   Luka Doncic               DAL   48.0    52.12      +4.12    +8.6%    7.5
3   Joel Embiid               PHI   50.0    53.45      +3.45    +6.9%    6.8
...

🔴 UNDERS (BBM projects BELOW line): 8 plays
--------------------------------------------------------------------------------
#   Player                    Team  Line    BBM Proj   Edge     Edge%    Ease   Inj
--------------------------------------------------------------------------------
1   Player Name               TM    35.0    29.23      -5.77    -16.5%   3.1
...

⚠️  SKIP (injured/DNP): 3 players
--------------------------------------------------------------------------------
   - Player Name (O) — BKN
   - Player Name (D) — LAL
```

## Player Name Matching

The script uses fuzzy matching to handle name differences between BBM and platform data:

- Handles Jr./Sr./III suffixes
- Handles first initial vs full first name
- Default threshold: 85% similarity
- Unmatched players are logged for manual review

## File Structure

```
nba_fp_edge/
├── fp_edge.py              # Main script
├── requirements.txt        # Python dependencies
├── README.md               # This file
├── data/
│   ├── bbm_daily.xls       # Drop BBM export here
│   └── lines.csv           # Platform lines (RotoWire or manual)
└── exports/
    └── fp_edges_YYYY-MM-DD.csv  # Exported results
```

## What This Tool Does NOT Do

- ❌ Make picks for you (just ranks edges)
- ❌ Track results (separate system)
- ❌ Pull live odds or lines
- ❌ Handle props besides fantasy points
- ❌ Integrate with betting platform APIs

## Success Criteria

- ✅ Correctly parses BBM export and calculates fantasy points
- ✅ Correctly reads platform lines
- ✅ Matches 95%+ of players between data sources
- ✅ Ranks by edge size
- ✅ Flags injuries
- ✅ Exports to CSV
- ✅ Runs in under 10 seconds
- ✅ Accurate math (validated against manual calculations)

## Historical Performance

Manual process (before automation):
- **+42.8% ROI** over 172 bets
- ~1 hour per day to build

This tool replicates that process in 30 seconds.

## Troubleshooting

### "Missing required columns"
- Check BBM export format
- Column names should be lowercase: `p`, `r`, `a`, `s`, `b`, `to`
- Use `--help` to see expected format

### Low match rate (<95%)
- Lower fuzzy matching threshold: `--threshold 75`
- Check for name format differences
- Unmatched players are logged in output

### "No players matched"
- Verify both files have data
- Check column names match expected format
- Try lowering `--threshold`

## Next Steps

After validating edges:
1. Review output for biggest edges
2. Cross-reference with injury news
3. Check Ease ratings for matchup context
4. Compare Underdog vs PrizePicks lines (if both available)
5. Make your picks!

## Support

Issues? Check:
1. Requirements installed: `pip install -r requirements.txt`
2. File paths correct: `ls -la ./data/`
3. File formats match expected structure

## License

For personal use. Do not redistribute without permission.
