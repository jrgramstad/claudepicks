# NBA Pick'em Edge Calculator - Version History

## Saved Versions

### 🎯 v1.0-phase1-complete (LATEST)
**Commit**: `2524420` - Fix styling issue and add PrizePicks debug logging
**Date**: 2025-11-03
**Status**: Production-ready for 4 sites + PrizePicks debugging

**Features**:
- ✅ Professional gradient UI (blue/purple theme)
- ✅ 5 betting sites supported (PrizePicks, Underdog, Pick6, Sleeper, FanDuel)
- ✅ 18+ market types (PTS, REB, AST, STL, BLK, TO, 3PT, FGA, FTA, 2PT, PF, combos)
- ✅ Web Worker processing (5-10 second calculation time)
- ✅ Tabbed results display
- ✅ CSV export
- ✅ Client-side only (no backend)
- ✅ Tailwind CSS v3 (gradients render correctly)
- 🔍 PrizePicks debug logging enabled

**Working Sites**: Underdog, Pick6, Sleeper, FanDuel
**Debugging**: PrizePicks (console logs added)

**Build**:
```bash
cd nba-pickem-app
npm run build
# Output: dist/
# CSS: 18KB (all gradients included)
```

---

### 🏀 working-4-sites-v1
**Commit**: `6b2293e` - COMPLETE UI OVERHAUL - Beautiful Professional Design
**Date**: 2025-11-03
**Status**: Pre-debug savepoint

**Features**:
- Same as v1.0 but WITHOUT debug logging
- Cleaner console output
- Tailwind v4 (styling was broken - appeared white)

**Note**: This version had the white styling bug. Use v1.0-phase1-complete instead.

---

## How to Revert to a Saved Version

### Option 1: Create a new branch from a tag
```bash
git checkout -b new-branch-name v1.0-phase1-complete
```

### Option 2: Reset current branch to a tag (CAREFUL - loses uncommitted work)
```bash
git reset --hard v1.0-phase1-complete
```

### Option 3: View files from a tag without changing branch
```bash
git show v1.0-phase1-complete:nba-pickem-app/src/App.jsx
```

---

## Current Branch
`claude/pickem-web-app-spec-011CUbdPgTCqJ89SLcqpHW7j`

---

## Tech Stack Summary

**Frontend**:
- React 19.1.1
- Vite 7.1.12
- Tailwind CSS 3.4.1 (downgraded from v4)

**Processing**:
- Web Workers (background processing)
- Fuse.js (fuzzy player matching)
- PapaParse (CSV parsing)
- SheetJS/xlsx (Excel parsing)

**Deployment**:
- Netlify
- Base directory: `nba-pickem-app`
- Build command: `npm run build`
- Publish directory: `dist`

---

## Quick Start

### Development
```bash
cd nba-pickem-app
npm install
npm run dev
# Open http://localhost:5173
```

### Production Build
```bash
cd nba-pickem-app
npm run build
# Deploy dist/ folder to Netlify
```

### Debug PrizePicks Issue
1. Run the app (dev or production)
2. Upload all 6 files
3. Click "Calculate Edges"
4. Open browser DevTools (F12) → Console
5. Look for `[PrizePicks]` messages showing:
   - CSV column names
   - Sample row data
   - Market parse failures
   - Processing statistics
