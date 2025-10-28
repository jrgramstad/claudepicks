# 🚀 Deploy Your App in 5 Minutes

## Easiest Option: Render (FREE)

### Step 1: Sign Up
Go to **[Render.com](https://render.com)** and sign up with GitHub (free, no credit card)

### Step 2: Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect repository: **`jrgramstad/claudepicks`**
3. Select branch: **`claude/session-011CUa4a7sqzVgtRGkp3vnax`**

### Step 3: Configure (copy-paste these)
```
Name: nba-pickem-calculator
Environment: Python 3
Build Command: pip install -r requirements.txt
Start Command: gunicorn app:app
```

### Step 4: Add Environment Variable
- Click **"Advanced"**
- Add: `FLASK_ENV` = `production`

### Step 5: Deploy!
Click **"Create Web Service"** and wait 2-3 minutes.

Your app will be live at: `https://nba-pickem-calculator.onrender.com`

---

## Alternative: Railway (Also FREE)

### Super Quick:
1. Go to **[Railway.app](https://railway.app)**
2. Sign up with GitHub
3. Click **"New Project"** → **"Deploy from GitHub"**
4. Select **`jrgramstad/claudepicks`**
5. Add environment variable: `FLASK_ENV=production`
6. Deploy!

Done! Your app will be live at a Railway URL.

---

## What You Get

✅ **Live web app** accessible from anywhere
✅ **Automatic HTTPS** (secure)
✅ **Auto-deploy** on git push (Render/Railway)
✅ **Free hosting** (no credit card needed)
✅ **Upload files** and calculate edges online
✅ **Share with others** via URL

---

## After Deployment

### Test It:
1. Go to your deployed URL
2. Upload the test files from `test_data/` folder
3. Click "Calculate Edges"
4. Download the CSV

### Share It:
- Send the URL to your friends
- Use it daily for your picks
- Access from phone, tablet, or computer

---

## Free Tier Details

**Render:**
- Sleeps after 15 min of inactivity
- First request takes ~30 seconds to wake up
- 750 hours/month free (plenty for daily use)

**Railway:**
- $5/month free credit
- Enough for ~500 hours of usage
- No sleep delay

---

## Need Help?

Check out the detailed guides:
- **DEPLOYMENT.md** - All deployment options
- **deploy-render.md** - Render-specific guide
- **README.md** - App documentation

---

## Too Lazy? Use Docker Locally

```bash
docker build -t nba-pickem .
docker run -p 5000:5000 nba-pickem
```

Open: `http://localhost:5000`

---

## Questions?

- Render won't deploy? Check the logs in dashboard
- App not working? Test locally first: `python app.py`
- Files not uploading? Check file size (16MB max)

**You got this! 🏀**
