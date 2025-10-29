# NBA Pick'em Edge Calculator - Deployment Guide

## Quick Netlify Deployment

### Option 1: Deploy from GitHub (Recommended)

1. **Push to GitHub** (Already done!)
   ```bash
   git push origin your-branch
   ```

2. **Connect to Netlify**
   - Go to [app.netlify.com](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Choose "GitHub" and authorize
   - Select your repository `jrgramstad/claudepicks`
   - Select the `nba-pickem-app` directory

3. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `nba-pickem-app/dist`
   - Base directory: `nba-pickem-app`

   (These should auto-detect from `netlify.toml`)

4. **Deploy!**
   - Click "Deploy site"
   - Wait 1-2 minutes
   - Get your live URL: `https://your-site-name.netlify.app`

### Option 2: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Navigate to app directory
cd nba-pickem-app

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

## Local Development

### Start Dev Server
```bash
cd nba-pickem-app
npm install
npm run dev
```

Visit: http://localhost:5173

### Test Production Build
```bash
npm run build
npm run preview
```

## File Requirements

To use the app, you need 6 files:

1. **PrizePicks CSV** - RotoWire format with columns: Player, Market Name, Line
2. **Underdog CSV** - Same format
3. **Pick6 CSV** - Same format
4. **Sleeper CSV** - Same format
5. **FanDuel CSV** - Same format
6. **BBM Daily File** - Basketball Monster projections (.xls or .csv)
   - Required columns: Name, p, r, a, s, b, to, 3, 3a, fg, fga, ft, or, dr

### File Naming Convention
For date detection, include YYYY-MM-DD in filename:
- `prizepicks_2025-10-28.csv`
- `underdog_2025-10-28.csv`
- `bbm_projections_2025-10-28.xls`

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **CSV Parsing**: PapaParse
- **Excel Parsing**: SheetJS (xlsx)
- **Fuzzy Matching**: fuzzball.js
- **Deployment**: Netlify

## Architecture

- **Client-side only**: No backend needed
- **In-memory processing**: Files never uploaded to server
- **Fast**: Results in < 2 seconds
- **Private**: Your data stays in your browser

## Troubleshooting

### Build Fails
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Netlify Deployment Issues
- Ensure `netlify.toml` exists in root
- Check build command is `npm run build`
- Verify publish directory is `dist`
- Check Node version (should be 18+)

### File Upload Errors
- Check file format matches expected columns
- Ensure date in filename (YYYY-MM-DD)
- Verify BBM file has all required stat columns
- Check file size (should be < 10MB each)

## Next Steps (Phase 2)

Future enhancements:
- Supabase integration for result history
- ROI tracking over time
- Heater tracking (player performance vs projections)
- Multi-day comparison
- API integrations to auto-fetch data

## Support

For issues or questions:
- Check SPEC.md for detailed functionality docs
- Review console for error messages
- Verify file formats match requirements
