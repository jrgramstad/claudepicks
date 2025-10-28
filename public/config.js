// API Configuration
// Update API_URL to your Render backend URL after deployment
const CONFIG = {
    // For local development:
    // API_URL: 'http://localhost:5000'

    // For production (update with your Render URL):
    API_URL: window.location.hostname === 'localhost'
        ? 'http://localhost:5000'
        : 'https://YOUR-APP-NAME.onrender.com'
};

// Export for use in index.html
window.APP_CONFIG = CONFIG;
