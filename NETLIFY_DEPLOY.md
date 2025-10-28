# Deploy to Netlify

## Important: Hybrid Deployment Recommended

This Flask app with pandas processing is **not ideal for Netlify Functions** due to:
- Large dependencies (pandas, openpyxl)
- File upload processing
- 10-second timeout on free tier

**Recommended approach:**
- **Frontend on Netlify** (free, fast CDN)
- **Backend on Render** (free, Python support)

---

## Option 1: Hybrid Deploy (Recommended)

### Step 1: Deploy Backend to Render

1. Go to [Render.com](https://render.com)
2. Sign up with GitHub (free)
3. Click "New +" → "Web Service"
4. Connect: `jrgramstad/claudepicks`
5. Branch: `claude/session-011CUa4a7sqzVgtRGkp3vnax`
6. Configure:
   ```
   Build Command: pip install -r requirements.txt
   Start Command: gunicorn app:app
   ```
7. Add env var: `FLASK_ENV=production`
8. Deploy and note your URL: `https://your-app.onrender.com`

### Step 2: Update Frontend for Netlify

Update `public/index.html` line 173 and 206:

```javascript
// Change from:
const response = await fetch('/calculate', {

// To:
const response = await fetch('https://your-app.onrender.com/calculate', {
```

And line 206:
```javascript
// Change from:
const response = await fetch('/download-csv', {

// To:
const response = await fetch('https://your-app.onrender.com/download-csv', {
```

### Step 3: Update Flask for CORS

Add to `app.py` after imports:

```python
from flask_cors import CORS
CORS(app)
```

Add to `requirements.txt`:
```
flask-cors==4.0.0
```

Redeploy backend to Render.

### Step 4: Deploy Frontend to Netlify

1. Go to [Netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Click "Add new site" → "Import from Git"
4. Connect: `jrgramstad/claudepicks`
5. Configure:
   ```
   Branch: claude/session-011CUa4a7sqzVgtRGkp3vnax
   Build command: (leave empty)
   Publish directory: public
   ```
6. Deploy!

Your frontend will be at: `https://your-app.netlify.app`

**Benefits:**
- ✅ Frontend on fast Netlify CDN
- ✅ Backend has proper Python runtime
- ✅ Both are free
- ✅ No timeout issues

---

## Option 2: Full Netlify (Not Recommended)

Netlify Functions have limitations for this app:
- 10-second timeout (may fail on large files)
- 50MB function size limit
- Complex file upload handling

If you still want to try, here's how:

### Manual Setup Required:

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Bundle Python dependencies:**
   ```bash
   pip install -r requirements.txt -t netlify/functions/lib
   ```

3. **Create serverless function wrapper** (complex, not provided)

4. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

**Note:** This is significantly more complex and may not work reliably.

---

## Option 3: Just Use Render (Simplest)

Deploy everything to Render in one place:
1. Go to [Render.com](https://render.com)
2. Deploy from GitHub (see `DEPLOY_NOW.md`)
3. Done!

**Benefits:**
- ✅ Simplest setup (5 minutes)
- ✅ Everything in one place
- ✅ Proper Python runtime
- ✅ No CORS issues
- ✅ Free tier

---

## Comparison

| Option | Setup | Complexity | Reliability | Speed |
|--------|-------|------------|-------------|-------|
| **Render only** | ⭐⭐⭐⭐⭐ | Easy | High | Fast |
| **Netlify + Render** | ⭐⭐⭐ | Medium | High | Very Fast |
| **Netlify Functions** | ⭐ | Complex | Low | Fast |

---

## Recommendation

For this specific app, **use Render only** (see DEPLOY_NOW.md).

If you need Netlify for other projects, use the hybrid approach (Option 1).

Netlify is great for:
- React/Vue/Angular apps
- Static sites
- JAMstack projects
- Simple serverless functions

But Flask apps with pandas are better on:
- Render
- Railway
- Fly.io
- PythonAnywhere

---

## Already Have Netlify Account?

That's great! Use the **hybrid approach** (Option 1):
- Your familiar Netlify interface for frontend
- Render for the backend (set and forget)
- Both free, both auto-deploy from GitHub

---

## Questions?

**Q: Can't I just use Netlify?**
A: Technically yes with Functions, but it's complex and unreliable for pandas processing.

**Q: Is Render free?**
A: Yes! No credit card required, 750 hours/month free.

**Q: Do I need both?**
A: No, Render alone works perfectly. Hybrid is only if you prefer Netlify.

**Q: What about Netlify's Python support?**
A: Netlify Functions supports Python, but with strict limits (10s timeout, 50MB size) that don't fit this use case.

---

See `DEPLOY_NOW.md` for the simplest deployment option!
