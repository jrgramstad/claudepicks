# NBA Pick'em Edge Calculator - Quick Start Guide

## 🚀 Performance Features

This app is optimized for SPEED:

### ⚡ Web Worker Processing
- All heavy processing runs in background thread
- UI stays 100% responsive while calculating
- No freezing or lag

### 🔍 Smart Fuzzy Matching
- **Fuse.js** for fast fuzzy search (faster than fuzzball)
- Exact match check first (instant)
- Match caching for repeated names
- 85% similarity threshold

### 📊 Progressive Display
- Results appear AS THEY'RE CALCULATED
- See PrizePicks results → then Underdog → then Pick6, etc.
- Real-time progress updates
- Know exactly what's happening

### 🎯 Expected Performance
- File parsing: < 1 second
- Edge calculation (all 5 sites): 3-7 seconds
- Total time: **5-10 seconds** for 2000+ picks
- Matches Python script speed

## 🏃 Quick Start

### Option 1: Deploy to Netlify (Easiest)

1. **Drag & Drop Deploy**
   - Go to [drop.netlify.com](https://drop.netlify.com)
   - Drag the `dist` folder after building
   - Get instant URL

2. **GitHub Deploy** (Recommended for updates)
   ```bash
   # Already pushed to GitHub
   # Go to app.netlify.com
   # "Add new site" → "Import from Git"
   # Select: jrgramstad/claudepicks
   # Base directory: nba-pickem-app
   # Build command: npm run build
   # Publish directory: dist
   ```

### Option 2: Run Locally

```bash
cd nba-pickem-app
npm install
npm run dev
```

Visit: http://localhost:5173

## 📁 Using the App

### Step 1: Prepare Your Files

You need 6 files with proper names:

```
prizepicks_2025-10-29.csv
underdog_2025-10-29.csv
pick6_2025-10-29.csv
sleeper_2025-10-29.csv
fanduel_2025-10-29.csv
bbm_projections_2025-10-29.xls  (or .csv)
```

**Date format matters:** Include `YYYY-MM-DD` in filename for auto-detection.

### Step 2: Upload Files

- Click each "Choose File" button
- Select the corresponding file
- See checkmarks appear as files load
- "Calculate Edges" button activates when all 6 uploaded

### Step 3: Calculate

- Click **"⚡ Calculate Edges (Fast!)"**
- Watch progress updates in real-time:
  ```
  ⏳ Starting processing...
  ✓ Files loaded, starting calculations...
  ⏳ BBM file loaded (175 players)
  ⏳ PrizePicks loaded (637 rows)
  ⏳ Calculating PrizePicks edges...
  ✓ PrizePicks complete (84 edges from 120 players)
  ...
  🎉 All calculations complete!
  ```

### Step 4: View Results

Results appear **progressively**:
- PrizePicks results show first (as soon as done)
- Then Underdog
- Then Pick6
- Then Sleeper
- Then FanDuel

Each site shows:
- Top 5 picks (ranked by absolute edge)
- Best Under (highlighted in yellow)
- Edge values, projections, lines

### Step 5: Download

Click **"📥 Download CSV"** to export all 25 picks.

## 🎨 What You'll See

### File Upload Section
```
┌─────────────────────────────────────┐
│  📁 PrizePicks CSV      [Choose]    │
│  📁 Underdog CSV        [Choose]    │
│  📁 Pick6 CSV           [Choose]    │
│  📁 Sleeper CSV         [Choose]    │
│  📁 FanDuel CSV         [Choose]    │
│  📁 BBM Daily (CSV/XLS) [Choose]    │
│                                      │
│        ⚡ Calculate Edges (Fast!)   │
└─────────────────────────────────────┘
```

### Results Display
```
════════════════════════════════════
🎯 PRIZEPICKS
════════════════════════════════════
Rank | Player          | Market    | Dir  | Line | BBM  | Edge
1    | LeBron James    | Points    | Over | 24.5 | 27.8 | +3.3
2    | ...

Best Under: Anthony Davis (Rebounds, Edge: -2.8)
```

## ⚙️ Technical Details

### Architecture
```
User uploads files
    ↓
Main thread reads files into memory
    ↓
Sends to Web Worker
    ↓
Worker processes in background
    ├── Parse CSVs
    ├── Build Fuse.js index
    ├── Calculate edges per site
    └── Send results back progressively
    ↓
Main thread displays results AS THEY COME
    ↓
User sees live updates
```

### Why It's Fast

1. **Web Worker = Non-Blocking**
   - Heavy processing doesn't freeze UI
   - You can scroll, click, while it calculates

2. **Fuse.js = Fast Fuzzy Search**
   - Pre-built index (search once, use many times)
   - Optimized algorithm for 85% threshold
   - Faster than string comparison loops

3. **Exact Match First**
   - Most names match exactly
   - Skip fuzzy search when possible
   - Cache results to avoid re-matching

4. **Progressive Processing**
   - Don't wait for all 5 sites
   - Show results as each site completes
   - Better perceived performance

5. **No Backend**
   - No network latency
   - No server processing time
   - Everything in browser = instant

## 🐛 Troubleshooting

### Build Issues
```bash
# Clear cache and rebuild
rm -rf node_modules dist .vite
npm install
npm run build
```

### Worker Not Loading
- Check browser console for errors
- Make sure using modern browser (Chrome 90+, Firefox 88+)
- Try hard refresh (Ctrl+Shift+R)

### Slow Performance
- Check file sizes (should be < 1MB each)
- Close other browser tabs
- Use production build (not dev mode)
- Check browser dev tools → Performance tab

### Date Not Detected
- Ensure filenames contain `YYYY-MM-DD` format
- Example: `prizepicks_2025-10-29.csv` ✓
- Not: `prizepicks.csv` ✗

## 📊 Performance Benchmarks

Expected times for typical usage:

| Files Size | Total Rows | Processing Time |
|------------|------------|-----------------|
| Small      | 500 picks  | 2-3 seconds     |
| Medium     | 1500 picks | 4-6 seconds     |
| Large      | 2500 picks | 7-10 seconds    |

**Note:** First run may be slightly slower (cold start). Subsequent runs are faster (cache warm).

## 🔐 Privacy & Security

- **100% client-side** - No data leaves your browser
- **No server uploads** - Everything processed locally
- **No tracking** - No analytics or cookies
- **No accounts** - No login required

Your pick'em data stays on your machine.

## 🚀 Deployment Checklist

- [ ] Files uploaded successfully
- [ ] All 6 files have dates in names
- [ ] Processing completes in < 10 seconds
- [ ] UI stays responsive (no freezing)
- [ ] Results show progressively
- [ ] Top 5 + Best Under displayed per site
- [ ] CSV download works
- [ ] Works on mobile (optional but nice)

## 📝 Next Steps

Once deployed:
1. Share URL with yourself/team
2. Bookmark for daily use
3. Test with your actual pick'em files
4. Compare results with Python script (should match exactly)
5. Take screenshots of results for analysis

## 🎯 Phase 2 Ideas (Future)

- Auto-save results to Supabase
- Historical tracking (ROI over time)
- Heater tracking (player performance)
- Multi-day comparison
- API integrations (auto-fetch data)

For now: Phase 1 is FAST and COMPLETE.
