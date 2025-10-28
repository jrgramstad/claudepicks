# Deploy to Render in 2 Minutes

## Quick Deploy Button

1. Go to: https://render.com/deploy

2. Click "Connect Account" → GitHub

3. Enter this repository URL:
   ```
   https://github.com/jrgramstad/claudepicks
   ```

4. Select branch: `claude/session-011CUa4a7sqzVgtRGkp3vnax`

5. Render will auto-detect the `render.yaml` and deploy!

## Manual Deploy (Alternative)

1. **Go to [Render Dashboard](https://dashboard.render.com)**

2. **Click "New +" → "Web Service"**

3. **Connect GitHub**
   - Repository: `jrgramstad/claudepicks`
   - Branch: `claude/session-011CUa4a7sqzVgtRGkp3vnax`

4. **Configure:**
   ```
   Name: nba-pickem-calculator
   Environment: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: gunicorn app:app
   Instance Type: Free
   ```

5. **Environment Variables:**
   - `FLASK_ENV` = `production`

6. **Click "Create Web Service"**

7. **Wait 2-3 minutes**

Your app will be live at: `https://nba-pickem-calculator.onrender.com`

## After Deployment

Test your app:
1. Upload the test files from `test_data/` folder
2. Click "Calculate Edges"
3. Verify results display correctly
4. Download CSV

## Automatic Deployments

Every push to your GitHub branch will automatically trigger a new deployment on Render!

## Free Tier Limits

- Spins down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- 750 hours/month free compute
- More than enough for daily pick'em calculations!

## Need Help?

- Render Status: https://status.render.com
- Render Docs: https://render.com/docs/web-services
- Render Community: https://community.render.com
