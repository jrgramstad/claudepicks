# Enhancement Plan: Expanded Output & Underdog Ladders

## 1. Expanded Output for All Sites

### Current: Single Top 10 list (by Edge%)

### New: Multiple Rankings

#### A. Top 10 by Edge Percentage
- Best percentage plays (relative value)
- Good for finding value on any line

#### B. Top 10 by Absolute Edge
- Biggest raw point differences
- Good for confidence plays

#### C. Best Pick Per Market (Diversity)
- One pick from each market type (Points, Rebounds, Assists, PTS+REB+AST, etc.)
- Ensures market coverage

---

## 2. Underdog Ladders Mode

### What is Ladders?
- Points-only game type on Underdog
- Pick players who will score OVER their projected points
- More points over = better

### Special Output:
- **Filter:** Points market only
- **Filter:** Overs only (positive edge)
- **Rank:** By raw point edge (BBM projection - Line)
- **Count:** Top 20 players
- **Format:** Show projected points surplus

### Example Output:
```
🏀 UNDERDOG LADDERS - TOP 20 OVERS (Points Only)
================================================
#   Player                 Line    BBM     Edge
1   Joel Embiid           28.5    33.1    +4.6
2   Giannis               29.0    32.8    +3.8
...
```

---

## 3. Implementation Changes

### A. Update `rank_and_select_top_picks()`
- Return multiple lists: by_pct, by_abs, by_market

### B. Update `format_output_for_site()`
- Show all three ranking lists

### C. Add `format_ladder_output()`
- Special function for Underdog ladders
- Filters Points + Overs
- Top 20 by raw edge

### D. Update `/calculate` route
- Detect if Underdog file is uploaded
- Generate ladder output in addition to standard output

---

## 4. Files to Modify

- `app.py`:
  - `rank_and_select_top_picks()` - return multiple rankings
  - `format_output_for_site()` - show expanded output
  - New: `format_ladder_output()` - Underdog ladders
  - `/calculate` route - add ladder output

---

## 5. Output Preview

```
==============================================
🎯 SLEEPER - TOP 10 BY EDGE%
==============================================
#   Player          Market        Pick   Line   BBM    Edge   Edge%
1   Player A        Points        Over   15.0   20.0   +5.0   +33.3%
...

==============================================
🎯 SLEEPER - TOP 10 BY ABSOLUTE EDGE
==============================================
#   Player          Market        Pick   Line   BBM    Edge   Edge%
1   Player B        PTS+REB+AST   Over   35.0   45.0   +10.0  +28.6%
...

==============================================
🎯 SLEEPER - BEST BY MARKET
==============================================
Points:      Player C (Over 22.5, Edge: +4.2, +18.7%)
Rebounds:    Player D (Over 8.5, Edge: +2.1, +24.7%)
Assists:     Player E (Under 6.5, Edge: -1.8, -27.7%)
PTS+REB+AST: Player F (Over 38.5, Edge: +6.3, +16.4%)
...

==============================================
🏀 UNDERDOG LADDERS - TOP 20 POINT OVERS
==============================================
#   Player          Line    BBM Proj   Points Over
1   Joel Embiid     28.5    33.1       +4.6
2   Giannis         29.0    32.8       +3.8
...
```
