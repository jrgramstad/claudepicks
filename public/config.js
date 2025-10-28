// API Configuration for Netlify Functions
const CONFIG = {
    // For Netlify: Functions are served from /.netlify/functions
    // The netlify.toml redirects /api/* to /.netlify/functions/*
    API_URL: window.location.hostname === 'localhost'
        ? 'http://localhost:8888/api'  // Netlify Dev local server
        : '/api'  // Production: relative path uses current domain
};

// Export for use in index.html
window.APP_CONFIG = CONFIG;
