# Deploy to Netlify with Serverless Functions

## Phase 1 Implementation (NO DATABASE)

This deployment uses:
- **Frontend:** Static HTML/JS (Tailwind CSS)
- **Backend:** Netlify Python Functions (serverless)
- **Storage:** CSV download only (no database)
- **Historical tracking:** None (Phase 2 feature)

---

## Quick Deploy (5 minutes)

### Step 1: Go to Netlify
Visit **[netlify.com](https://netlify.com)** and sign up with GitHub (free)

### Step 2: Import Project
1. Click **"Add new site"** → **"Import an existing project"**
2. Choose **"Deploy with GitHub"**
3. Authorize Netlify to access your repos
4. Select repository: **`jrgramstad/claudepicks`**
5. Select branch: **`claude/session-011CUa7wzSaWR7UudtKQqjHn`**

### Step 3: Configure Build Settings
Netlify should auto-detect the settings, but verify:

```
Build command: (leave empty)
Publish directory: public
Functions directory: netlify/functions
```

### Step 4: Deploy
Click **"Deploy site"** and wait 2-3 minutes.

Your app will be live at: `https://random-name-123.netlify.app`

You can change the site name in: **Site settings** → **Site details** → **Change site name**

---

## How It Works

### Frontend (Static)
- Deployed to Netlify CDN (public/ directory)
- HTML + vanilla JavaScript
- Reads files as base64 in browser
- Sends to serverless function as JSON

### Backend (Serverless Functions)
- Python functions in netlify/functions/
- Auto-deployed with each git push
- Processes files with pandas/rapidfuzz
- Returns results + CSV data as JSON

### No Database
- All processing happens on-demand
- Results are shown on screen
- CSV can be downloaded
- Nothing is saved (Phase 1 design)

---

## Testing Your Deployment

1. Go to your Netlify URL
2. Upload your 6 CSV files:
   - PrizePicks CSV
   - Underdog CSV
   - Pick6 CSV
   - Sleeper CSV
   - FanDuel CSV
   - BBM Daily file
3. Click **"Calculate Edges"**
4. View results on screen
5. Click **"Download CSV"** to save picks

---

## Limitations to Know

### Netlify Free Tier:
- **125,000 function invocations/month** (plenty for daily use)
- **100 GB bandwidth/month** (more than enough)
- **10-second function timeout** (should be fine for typical file sizes)

### If Processing Times Out:
This can happen with very large files. Solutions:
1. **Use smaller date ranges** in your input files
2. **Deploy to Render instead** (see DEPLOY_NOW.md)
3. **Use hybrid approach** (Netlify frontend + Render backend)

---

## Auto-Deploy on Push

Every time you push to your branch:
1. Netlify auto-detects the change
2. Rebuilds and deploys automatically
3. Takes 1-2 minutes
4. Your site updates with zero downtime

Monitor deploys at: `https://app.netlify.com/sites/YOUR-SITE/deploys`

---

## Troubleshooting

### Functions not working?
1. Check function logs in Netlify dashboard
2. Go to: **Functions** tab → Click function name → View logs
3. Look for Python errors or import issues

### Files not uploading?
1. Check browser console (F12) for errors
2. Verify file sizes aren't too large (10MB max recommended)
3. Ensure filenames contain date in format: YYYY-MM-DD

### Timeout errors?
1. Processing is taking >10 seconds
2. Solution: Use Render instead (no timeout limits)
3. See DEPLOY_NOW.md for Render deployment

---

## Comparing Deployment Options

| Option | Setup | Complexity | Timeout | Best For |
|--------|-------|------------|---------|----------|
| **Netlify Functions** | Easy | Low | 10s | Small files, fast processing |
| **Render** | Easy | Low | None | Large files, reliable |
| **Hybrid** | Medium | Medium | None | Best performance + reliability |

---

## What's NOT Included (By Design)

Phase 1 deliberately excludes:
- ❌ Database storage (Supabase)
- ❌ Historical pick tracking
- ❌ Multi-day comparisons
- ❌ ROI analytics
- ❌ User accounts

**These are Phase 2 features.** Keep Phase 1 simple and working first.

---

## Next Steps

### After Deployment Works:
1. **Use it daily** for 3-5 days
2. **Screenshot results** (no auto-save yet)
3. **Download CSVs** to keep records
4. **Validate** that picks match your manual calculations

### Ready for Phase 2?
Once you've validated Phase 1 works perfectly:
- Add Supabase for database storage
- Track historical picks
- Add ROI calculations
- Build heater board

**But not yet.** Phase 1 first.

---

## Need Help?

**If Netlify Functions timeout:**
→ Use Render (see DEPLOY_NOW.md)

**If you want historical tracking now:**
→ You're falling into feature creep. Resist.

**If something breaks:**
→ Check Netlify function logs
→ Check browser console (F12)
→ Verify file formats match expected columns

---

## Success Criteria

Your Phase 1 deployment is successful when:
- ✅ You can upload 6 files
- ✅ Processing completes in <10 seconds
- ✅ Results display correctly
- ✅ CSV downloads work
- ✅ You use it for actual daily picks

**Then and only then** consider Phase 2.

---

Ready to deploy? Go to [netlify.com](https://netlify.com) and follow Step 1 above!
