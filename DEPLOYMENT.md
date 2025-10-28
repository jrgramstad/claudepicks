# Deployment Guide

This guide covers the easiest ways to deploy your NBA Pick'em Edge Calculator to the cloud.

## Option 1: Render (Recommended - FREE)

**Why Render?**
- ✅ Free tier available
- ✅ No credit card required
- ✅ Automatic deployments from GitHub
- ✅ Easy setup (5 minutes)

### Steps:

1. **Push your code to GitHub** (already done!)

2. **Go to [Render.com](https://render.com)**
   - Sign up with GitHub (free)

3. **Create a New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `jrgramstad/claudepicks`
   - Select the branch: `claude/session-011CUa4a7sqzVgtRGkp3vnax`

4. **Configure the service:**
   ```
   Name: nba-pickem-calculator (or anything you like)
   Environment: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: gunicorn app:app
   ```

5. **Add Environment Variables:**
   - Click "Advanced"
   - Add: `FLASK_ENV` = `production`

6. **Click "Create Web Service"**
   - Wait 2-3 minutes for deployment
   - Your app will be live at: `https://nba-pickem-calculator.onrender.com`

### Automatic Deployments

Every time you push to your branch, Render will automatically redeploy!

---

## Option 2: Railway (Also FREE)

**Why Railway?**
- ✅ Free $5/month credit
- ✅ Very simple deployment
- ✅ Great for Python apps

### Steps:

1. **Go to [Railway.app](https://railway.app)**
   - Sign up with GitHub (free)

2. **Deploy from GitHub**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `jrgramstad/claudepicks`

3. **Configure:**
   - Railway auto-detects Python
   - Add environment variable: `FLASK_ENV=production`
   - Click "Deploy"

4. **Get your URL:**
   - Go to "Settings" → "Generate Domain"
   - Your app will be live at: `https://your-app.up.railway.app`

---

## Option 3: PythonAnywhere (Traditional Hosting)

**Why PythonAnywhere?**
- ✅ Free tier for small apps
- ✅ Built for Python
- ✅ Traditional hosting feel

### Steps:

1. **Sign up at [PythonAnywhere.com](https://www.pythonanywhere.com)**

2. **Upload your code:**
   - Use the Files tab
   - Or clone from GitHub: `git clone https://github.com/jrgramstad/claudepicks.git`

3. **Install dependencies:**
   - Open Bash console
   - `cd claudepicks`
   - `pip install --user -r requirements.txt`

4. **Configure Web App:**
   - Go to "Web" tab
   - Click "Add a new web app"
   - Choose "Manual configuration" → Python 3.10
   - Set source code directory: `/home/yourusername/claudepicks`
   - Edit WSGI file:
     ```python
     import sys
     path = '/home/yourusername/claudepicks'
     if path not in sys.path:
         sys.path.append(path)

     from app import app as application
     ```

5. **Reload web app**
   - Your app will be live at: `https://yourusername.pythonanywhere.com`

---

## Option 4: Fly.io (Developer-Friendly)

### Quick Deploy:

1. **Install Fly CLI:**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Create Dockerfile** (already included in instructions below)

3. **Deploy:**
   ```bash
   fly launch
   fly deploy
   ```

---

## Comparison

| Platform | Free Tier | Setup Time | Auto Deploy | Best For |
|----------|-----------|------------|-------------|----------|
| **Render** | ✅ Yes | 5 min | ✅ Yes | Easiest option |
| **Railway** | ✅ $5/mo | 3 min | ✅ Yes | Modern workflow |
| **PythonAnywhere** | ✅ Limited | 10 min | ❌ No | Traditional hosting |
| **Fly.io** | ✅ Yes | 8 min | ✅ Yes | Docker fans |

---

## Recommended: Render

**For this app, I recommend Render** because:
1. Completely free
2. No credit card required
3. Automatic deploys from GitHub
4. Scales if needed
5. Built-in HTTPS

### Quick Render Deploy (Using render.yaml):

Your repo already has `render.yaml` configured. Just:

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Blueprint"
3. Connect your GitHub repo
4. Click "Apply"

That's it! Your app is deployed.

---

## Post-Deployment Checklist

After deploying, test:

- ✅ Homepage loads
- ✅ File upload works (use test_data files)
- ✅ Edge calculation completes
- ✅ Results display correctly
- ✅ CSV download works

---

## Troubleshooting

### App won't start
- Check logs in your platform dashboard
- Verify `requirements.txt` is complete
- Ensure `gunicorn` is installed

### File upload fails
- Check file size limits (16MB max)
- Verify CSV format matches requirements

### Slow performance
- Free tiers have limited resources
- Consider upgrading if processing large files

---

## Custom Domain (Optional)

All platforms support custom domains:

**Render:**
- Go to Settings → Custom Domains
- Add your domain (e.g., `picks.yourdomain.com`)
- Update DNS records as shown

**Railway:**
- Settings → Networking → Custom Domain
- Add domain and update DNS

---

## Need Help?

- **Render Docs**: https://render.com/docs
- **Railway Docs**: https://docs.railway.app
- **PythonAnywhere Docs**: https://help.pythonanywhere.com

---

## Security Notes

- ✅ No sensitive data stored
- ✅ Files processed in-memory only
- ✅ No database required
- ✅ HTTPS enabled by default on all platforms

Your app is safe to deploy publicly!
