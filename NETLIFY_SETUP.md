# Deploy with Netlify (Frontend) + Render (Backend)

Since Netlify is your standard, here's how to deploy this app using Netlify for the frontend and Render for the backend API.

## Why This Setup?

- ✅ **Netlify** hosts your fast, static frontend (what Netlify does best)
- ✅ **Render** runs the Python backend (pandas, file processing)
- ✅ Both are **100% free**
- ✅ Both **auto-deploy** from GitHub
- ✅ Takes **10 minutes** total

---

## Step 1: Deploy Backend to Render (5 minutes)

### 1.1 Sign Up
- Go to [render.com](https://render.com)
- Click "Get Started" → Sign up with GitHub

### 1.2 Create Web Service
- Click "New +" → "Web Service"
- Click "Connect repository"
- Find and select: **`jrgramstad/claudepicks`**
- Click "Connect"

### 1.3 Configure Service
Fill in these settings:
```
Name: nba-pickem-api
Branch: claude/session-011CUa4a7sqzVgtRGkp3vnax
Root Directory: (leave blank)
Environment: Python 3
Build Command: pip install -r requirements.txt
Start Command: gunicorn app:app
Instance Type: Free
```

### 1.4 Add Environment Variable
- Scroll down to "Environment Variables"
- Click "Add Environment Variable"
- Key: `FLASK_ENV`
- Value: `production`

### 1.5 Deploy
- Click "Create Web Service"
- Wait 2-3 minutes for deployment
- **Copy your backend URL**: `https://nba-pickem-api.onrender.com` (or similar)

---

## Step 2: Update Frontend Config (2 minutes)

### 2.1 Edit config.js
Open `public/config.js` and update line 9:

```javascript
// Change this line:
API_URL: 'https://YOUR-APP-NAME.onrender.com'

// To your actual Render URL:
API_URL: 'https://nba-pickem-api.onrender.com'
```

### 2.2 Commit and Push
```bash
git add public/config.js
git commit -m "Update API URL for production"
git push origin claude/session-011CUa4a7sqzVgtRGkp3vnax
```

---

## Step 3: Deploy Frontend to Netlify (3 minutes)

### 3.1 Sign Up
- Go to [netlify.com](https://netlify.com)
- Click "Sign up" → Sign up with GitHub

### 3.2 Add New Site
- Click "Add new site" → "Import an existing project"
- Click "Deploy with GitHub"
- Authorize Netlify to access your repos
- Search for and select: **`jrgramstad/claudepicks`**

### 3.3 Configure Site
```
Branch: claude/session-011CUa4a7sqzVgtRGkp3vnax
Base directory: (leave blank)
Build command: (leave blank)
Publish directory: public
```

### 3.4 Deploy
- Click "Deploy site"
- Wait 30 seconds
- Your site is live! Note the URL: `https://random-name-123456.netlify.app`

### 3.5 (Optional) Change Site Name
- Go to "Site settings" → "General" → "Site details"
- Click "Change site name"
- Enter: `nba-pickem-calculator` (or your preferred name)
- New URL: `https://nba-pickem-calculator.netlify.app`

---

## Step 4: Test Your Deployment

### 4.1 Visit Your Netlify URL
Open: `https://nba-pickem-calculator.netlify.app`

### 4.2 Test with Sample Data
1. Use the files from the `test_data/` folder in your repo
2. Upload all 6 files
3. Click "Calculate Edges"
4. Wait for results (first Render request may take 30s as it wakes up)
5. Download CSV

### 4.3 Verify
- ✅ Files upload successfully
- ✅ Results display correctly
- ✅ CSV downloads work
- ✅ No CORS errors in browser console (F12)

---

## Architecture

```
User Browser
     │
     ├─> Netlify (Static Frontend)
     │   └─> HTML, CSS, JavaScript
     │
     └─> Render (Backend API)
         └─> Flask + pandas + CSV processing
```

---

## Auto-Deploy Setup

### Both Services Auto-Deploy!

**Netlify:**
- Every push to your branch → Netlify rebuilds
- Takes ~30 seconds

**Render:**
- Every push to your branch → Render redeploys
- Takes ~2 minutes

**To update your app:**
```bash
# Make changes
git add .
git commit -m "Your changes"
git push
# Both services automatically redeploy!
```

---

## Troubleshooting

### Frontend loads but "Network error" on Calculate
**Problem:** config.js has wrong API_URL

**Fix:**
1. Check `public/config.js` has correct Render URL
2. Commit and push changes
3. Wait for Netlify to rebuild

### CORS Error in Browser Console
**Problem:** Backend not accepting requests from frontend

**Fix:**
- Backend already has CORS enabled
- Check both URLs use HTTPS (not HTTP)
- Verify Render backend is running (visit URL directly)

### "Application failed to respond" on Render
**Problem:** Render app is sleeping (free tier)

**Fix:**
- Wait 30 seconds for first request
- Subsequent requests are instant
- Render sleeps after 15 minutes of inactivity

### Files won't upload
**Problem:** File size over 16MB

**Fix:**
- Check file sizes (must be under 16MB total)
- Compress large CSV files if needed

---

## URLs to Save

After deployment, save these:

- **Frontend (Netlify):** `https://nba-pickem-calculator.netlify.app`
- **Backend (Render):** `https://nba-pickem-api.onrender.com`
- **GitHub Repo:** `https://github.com/jrgramstad/claudepicks`

---

## Costs

- **Netlify:** 100% free forever
  - 100GB bandwidth/month
  - Unlimited deploys

- **Render:** 100% free forever
  - 750 hours/month (more than enough)
  - Sleeps after 15 minutes inactivity

**Total: $0/month** 🎉

---

## Custom Domain (Optional)

### On Netlify:
1. Go to "Domain settings"
2. Click "Add custom domain"
3. Enter your domain (e.g., `picks.yourdomain.com`)
4. Follow DNS instructions

### On Render:
1. Go to "Settings" → "Custom Domains"
2. Add your API subdomain (e.g., `api.picks.yourdomain.com`)
3. Update DNS records
4. Update `config.js` with new API URL

---

## Monitoring

### Netlify Dashboard
- See deployment history
- View build logs
- Check analytics

### Render Dashboard
- See deployment logs
- Monitor app status
- View recent requests

---

## You're Done! 🎉

Your NBA Pick'em Edge Calculator is now live on your preferred Netlify platform!

**Share the Netlify URL with anyone** - they can use your calculator!

---

## Next Steps

1. **Bookmark your Netlify URL**
2. **Upload your daily files** and calculate edges
3. **Take screenshots** of results
4. **Make your picks** based on highest edges

Good luck with your picks! 🏀
