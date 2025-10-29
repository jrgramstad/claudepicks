# NBA Pick'em Edge Calculator - Web App Specification
**Version:** 1.0 - Phase 1
**Date:** 2025-10-29
**Owner:** JR
**Status:** PENDING APPROVAL

---

## 1. PROJECT OVERVIEW

**What:** Web application that calculates daily pick'em edges for 5 NBA betting sites (PrizePicks, Underdog, Pick6, Sleeper, FanDuel) using Basketball Monster (BBM) projections.

**Who:** JR (solo user, daily use for betting research)

**Success Metric:** Upload 6 files → Get Top 25 picks displayed and downloadable in < 2 minutes

**Current State:** Working Python script with proven calculation logic

**Goal:** Browser-based version with no installation required, accessible via URL

---

## 2. TECH STACK DECISION

### Frontend Framework: **React 18 + Vite**
**Rationale:**
- Fast development with hot module reload
- Lightweight (no unnecessary backend)
- Large ecosystem for CSV/Excel parsing
- Easy Netlify deployment
- Client-side only (no server needed)

### Styling: **Tailwind CSS**
**Rationale:**
- Rapid UI development
- Consistent design system
- Small bundle size with purging
- Screenshot-friendly layouts

### Deployment: **Netlify**
**Rationale:**
- Free tier sufficient for solo user
- Instant deployment from Git
- Built-in CI/CD
- Custom domain support (future)
- No server configuration needed

### Processing: **Client-Side JavaScript**
**Rationale:**
- No backend costs
- Instant results (no API latency)
- Privacy (data never leaves browser)
- Simpler architecture than WASM Python
- Sufficient performance for 6 small files

### File Handling: **In-Memory Only**
**Rationale:**
- Phase 1 requirement: no storage
- Faster than database queries
- No privacy concerns
- Simpler architecture

### Key Libraries:
- **PapaParse** - CSV parsing (5 RotoWire files)
- **xlsx** (SheetJS) - Excel parsing (BBM .xls file)
- **fuzzball.js** - Fuzzy name matching (85% threshold)
- **React hooks** - State management (no Redux needed)

---

## 3. CORE FUNCTIONALITY (PHASE 1)

### ✅ IN SCOPE

**File Upload:**
- 6 labeled file inputs (5 RotoWire CSVs + 1 BBM file)
- Visual feedback when files selected
- Validation: all 6 files required
- Date extraction and matching from filenames

**Edge Calculation:**
- BBM projection mapping (14 stat types)
- Market parsing with special cases (OR, DR, combos)
- Fuzzy player name matching (85% threshold)
- Edge formula: `bbm_projection - site_line`
- Direction: Over if edge > 0, else Under

**Results Display:**
- Grouped by site (5 sites)
- Top 5 picks per site (ranked by absolute edge)
- Best Under per site (highlighted separately)
- Player uniqueness enforced per site
- Screenshot-ready formatting

**CSV Export:**
- All 25 picks in downloadable CSV
- Columns: Site, Rank, Player, Market, Direction, Line, BBM_Projection, Edge

**Error Handling:**
- Missing files warning
- Date mismatch detection
- Invalid column detection
- Unmatched players (warning, not failure)

### ❌ OUT OF SCOPE (PHASE 2+)

- Historical data storage (no database)
- Results recording (no Supabase yet)
- User authentication
- ROI tracking
- Heater tracking
- Multi-day comparison
- API integrations
- Auto-fetch data from sites

---

## 4. PROVEN CALCULATION LOGIC

### BBM Column Mapping
```javascript
const BBM_STAT_MAP = {
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
```

### Market Parsing Rules (Critical)
```javascript
// Special cases - ORDER MATTERS (check specific before general)
if (market === "Offensive Rebounds") → stats = ['OR']  // NOT 'REB'
if (market === "Defensive Rebounds") → stats = ['DR']  // NOT 'REB'
if (market === "Rebounds") → stats = ['REB']
if (market === "3PT Attempts") → stats = ['3PA']
if (market === "3PT Made") → stats = ['3PT']

// Combo markets (sum multiple stats)
if (market === "PTS+REB+AST") → stats = ['PTS', 'REB', 'AST']
if (market === "BLK+STL") → stats = ['BLK', 'STL']

// Skip markets
if (market === "Fantasy Score") → SKIP (cannot calculate)

// For each stat, sum BBM projections
projection = sum(bbm[BBM_STAT_MAP[stat]] for stat in stats)
```

### Edge Calculation
```javascript
edge = bbm_projection - site_line
direction = edge > 0 ? "Over" : "Under"
absolute_edge = Math.abs(edge)
```

### Fuzzy Name Matching
```javascript
// Use fuzzball.js ratio() function
threshold = 85  // 85% similarity
match = fuzzball.ratio(rotowire_player, bbm_name) >= threshold

// Case-insensitive
// Handles: "LeBron James" ↔ "Lebron James"
// Handles: "P.J. Washington" ↔ "PJ Washington"
```

### Ranking Algorithm (Per Site)
```javascript
1. Calculate all edges for site (all players × all markets)
2. Sort by absolute_edge DESC
3. Enforce uniqueness: each player max once per site
   - Keep first occurrence (highest absolute edge)
4. Select Top 5 picks
5. Find Best Under:
   - Filter direction === "Under"
   - Sort by absolute_edge DESC
   - Take first result
   - Highlight separately from Top 5
```

---

## 5. USER INTERFACE DESIGN

### Layout Structure
```
┌─────────────────────────────────────────────┐
│  NBA Pick'em Edge Calculator                │
│  [Date: Auto-detected from files]           │
├─────────────────────────────────────────────┤
│  UPLOAD FILES                               │
│                                             │
│  [📁 PrizePicks CSV]     [filename.csv]     │
│  [📁 Underdog CSV]       [filename.csv]     │
│  [📁 Pick6 CSV]          [filename.csv]     │
│  [📁 Sleeper CSV]        [filename.csv]     │
│  [📁 FanDuel CSV]        [filename.csv]     │
│  [📁 BBM Daily File]     [filename.xls]     │
│                                             │
│  [Calculate Edges] (disabled until 6 files) │
├─────────────────────────────────────────────┤
│  RESULTS                                    │
│                                             │
│  ═══ PRIZEPICKS (Top 5) ═══                │
│  Rank | Player | Market | Dir | Line | BBM | Edge │
│  1    | ...                                │
│  ...                                        │
│  Best Under: [highlighted row]             │
│                                             │
│  ═══ UNDERDOG (Top 5) ═══                  │
│  ...                                        │
│                                             │
│  [Download CSV]                             │
└─────────────────────────────────────────────┘
```

### Visual Design Principles
- **Clean & Minimal:** White background, clear sections
- **Screenshot-Ready:** High contrast, clear fonts
- **Monospace Data:** Results in fixed-width font or clean table
- **Color Coding:**
  - Green for "Over" picks
  - Red for "Under" picks
  - Yellow highlight for "Best Under" row
- **Responsive:** Works on desktop (primary) and tablet

### Components Breakdown
1. **FileUploader** - 6 labeled inputs with validation
2. **CalculateButton** - Triggers processing
3. **SiteResults** - Reusable component for each site's picks
4. **ErrorDisplay** - Shows validation errors
5. **CSVDownload** - Export button

---

## 6. DATA PROCESSING STRATEGY

### File Reading
```javascript
// RotoWire CSVs (5 files)
import Papa from 'papaparse';
Papa.parse(file, {
  header: true,
  complete: (results) => {
    // Validate columns: Player, Market Name, Line
    // Extract date from filename: YYYY-MM-DD
  }
});

// BBM Excel File (.xls)
import * as XLSX from 'xlsx';
const workbook = XLSX.read(fileBuffer, { type: 'array' });
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);
// Validate columns: Name, p, r, a, s, b, to, 3, 3a, fg, fga, ft, or, dr
```

### Date Extraction
```javascript
// Filename format: "sitename_YYYY-MM-DD.csv"
function extractDate(filename) {
  const match = filename.match(/(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
}

// Validate all 6 files have same date
if (new Set(dates).size > 1) {
  throw new Error(`Date mismatch: ${dates.join(', ')}`);
}
```

### Fuzzy Matching
```javascript
import fuzzball from 'fuzzball';

function findBBMPlayer(rotowireName, bbmPlayers) {
  for (const bbmPlayer of bbmPlayers) {
    const ratio = fuzzball.ratio(
      rotowireName.toLowerCase(),
      bbmPlayer.Name.toLowerCase()
    );
    if (ratio >= 85) {
      return bbmPlayer;
    }
  }
  return null; // Unmatched (warning, not error)
}
```

### Memory Management
- Process files sequentially to avoid browser freeze
- Use `useMemo` for expensive calculations
- Clear file buffers after processing
- No data persisted (everything in React state)

---

## 7. BUILD APPROACH

### Step-by-Step Implementation

**Step 1: Project Setup (10 min)**
```bash
npm create vite@latest nba-pickem-calculator -- --template react
cd nba-pickem-calculator
npm install
npm install papaparse xlsx fuzzball tailwindcss
npx tailwindcss init
```

**Step 2: File Upload Component (15 min)**
- Create `FileUploader.jsx`
- 6 labeled file inputs
- State management for files
- Visual feedback (file names displayed)
- Validation logic

**Step 3: Edge Calculation Engine (30 min)**
- Create `utils/calculator.js`
- Port Python logic to JavaScript:
  - `BBM_STAT_MAP` constant
  - `parseMarket()` function
  - `calculateEdge()` function
  - `rankPicks()` function
- Unit tests with sample data

**Step 4: Fuzzy Matching (10 min)**
- Create `utils/matcher.js`
- Implement `findBBMPlayer()` with 85% threshold
- Handle case insensitivity

**Step 5: File Processing (20 min)**
- Create `utils/fileProcessor.js`
- CSV parsing with PapaParse
- Excel parsing with SheetJS
- Date extraction and validation
- Column validation

**Step 6: Results Display Component (20 min)**
- Create `SiteResults.jsx`
- Table layout with styling
- Green/Red color coding
- Best Under highlighting
- Reusable for all 5 sites

**Step 7: CSV Download (10 min)**
- Create `utils/csvExport.js`
- Format results as CSV
- Trigger browser download

**Step 8: Error Handling (10 min)**
- Create `ErrorDisplay.jsx`
- User-friendly error messages
- Validation feedback

**Step 9: Styling (15 min)**
- Apply Tailwind CSS
- Screenshot-friendly layout
- Responsive design

**Step 10: Testing (20 min)**
- Test with sample 2025-10-28 files
- Verify calculations match Python output
- Test error cases
- Cross-browser check (Chrome, Firefox)

**Step 11: Deployment (10 min)**
- Create `netlify.toml`
- Deploy to Netlify
- Test production build

**Total Estimated Time:** ~2 hours

---

## 8. VALIDATION CHECKLIST

Phase 1 is complete when:

- [ ] User can upload 6 files (5 CSVs + 1 Excel)
- [ ] All files must be present to calculate
- [ ] Date extraction works from filenames
- [ ] Date mismatch detected and reported
- [ ] Edge calculations match Python script results exactly
- [ ] Display shows 25 picks (5 per site)
- [ ] Player uniqueness enforced per site (each player max once)
- [ ] Best Under shown per site (highlighted separately)
- [ ] CSV download works (all 25 picks)
- [ ] No errors on valid input (2025-10-28 test files)
- [ ] Deployed to Netlify and accessible via URL
- [ ] Screenshot-ready output (clean, aligned, color-coded)
- [ ] Offensive/Defensive Rebounds handled correctly (not confused with total)
- [ ] Combo markets work (PTS+REB+AST, BLK+STL)
- [ ] Fantasy Score markets skipped
- [ ] Unmatched players logged as warnings (not errors)

---

## 9. DEPLOYMENT PLAN

### Netlify Configuration
Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Build Commands
```bash
# Local development
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview
```

### Deployment Steps
1. Push code to GitHub repository
2. Connect repository to Netlify
3. Configure build settings (auto-detected from netlify.toml)
4. Deploy
5. Test live URL with sample files

### Environment Requirements
- Node.js 18+
- No environment variables needed (Phase 1)
- No API keys needed (client-side only)

---

## 10. KNOWN EDGE CASES

### Edge Case Handling

**1. BBM File Format Variance**
- **Issue:** BBM file might be .xls or .csv
- **Solution:** Check file extension, use appropriate parser

**2. Player Name Variations**
- **Issue:** "LeBron James" vs "Lebron James", "P.J. Washington" vs "PJ Washington"
- **Solution:** Fuzzy matching with 85% threshold (fuzzball.js)

**3. Offensive/Defensive Rebounds**
- **Issue:** Must NOT map to total rebounds (REB)
- **Solution:** Parse market name BEFORE checking for "Rebounds" generally
  ```javascript
  // ORDER MATTERS
  if (market === "Offensive Rebounds") return ['OR'];
  if (market === "Defensive Rebounds") return ['DR'];
  if (market === "Rebounds") return ['REB'];
  ```

**4. Fantasy Score Markets**
- **Issue:** Cannot calculate (no BBM mapping)
- **Solution:** Skip these markets entirely (filter out)

**5. Unmatched Players**
- **Issue:** Player in RotoWire but not in BBM
- **Solution:** Log warning, continue processing (don't fail entire calculation)

**6. Multiple Markets for Same Player**
- **Issue:** Player might have 10+ markets across files
- **Solution:** Rank ALL, then enforce uniqueness (keep highest absolute edge)

**7. Date Extraction Failures**
- **Issue:** Filename doesn't contain YYYY-MM-DD
- **Solution:** Prompt user to rename files with correct format

**8. Missing Required Columns**
- **Issue:** CSV/Excel missing expected columns
- **Solution:** Show clear error: "Missing columns: [list]"

**9. Empty Files**
- **Issue:** File uploaded but contains no data rows
- **Solution:** Error: "File [filename] is empty"

**10. Non-Numeric Lines**
- **Issue:** Line value is not a number
- **Solution:** Skip that market (log warning)

---

## 11. SUCCESS CRITERIA

### Technical Success
- ✅ All calculations match Python script output
- ✅ Processing time < 2 seconds for 6 files
- ✅ No console errors on valid input
- ✅ Works in Chrome, Firefox, Safari
- ✅ Mobile-friendly (bonus, not required)

### User Experience Success
- ✅ JR can use without reading documentation
- ✅ Clear error messages guide user to fix issues
- ✅ Results are screenshot-ready (no formatting needed)
- ✅ CSV export opens correctly in Excel/Google Sheets

### Deployment Success
- ✅ Accessible via public URL
- ✅ Loads in < 3 seconds
- ✅ No deployment errors
- ✅ Can update easily (push to Git = auto-deploy)

---

## NEXT STEPS

**After Spec Approval:**
1. Create React + Vite project
2. Implement in order outlined in Section 7
3. Test with 2025-10-28 sample files
4. Deploy to Netlify
5. Share URL with JR for validation

**Phase 2 Planning (Future):**
- Add Supabase for results storage
- Track ROI over time
- Heater tracking (player performance vs projection)
- Multi-day comparison
- Historical analysis

---

**Approval Required Before Build:** YES
**Estimated Build Time:** 1-2 hours
**Estimated Phase 1 Delivery:** Same session after approval
