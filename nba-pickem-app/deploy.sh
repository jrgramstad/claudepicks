#!/bin/bash
# Netlify Deployment Script
# Run this to deploy your NBA Pick'em Edge Calculator

set -e  # Exit on error

echo "🚀 NBA Pick'em Edge Calculator - Netlify Deployment"
echo "=================================================="
echo ""

# Navigate to app directory
cd "$(dirname "$0")"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in the app directory"
    exit 1
fi

echo "📦 Building production version..."
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Error: Build failed - dist folder not found"
    exit 1
fi

echo "✅ Build complete!"
echo ""
echo "📤 Ready to deploy to Netlify"
echo ""
echo "Next steps:"
echo "1. Run: netlify login"
echo "2. Run: netlify deploy --prod"
echo "3. Or run: netlify deploy --prod --open (opens in browser)"
echo ""
echo "Follow the prompts:"
echo "  - Create & configure new site? Yes"
echo "  - Choose team: (select your team)"
echo "  - Site name: nba-pickem-edge-calculator (or custom name)"
echo "  - Publish directory: ./dist"
echo ""
echo "🎉 You'll get a URL like: https://nba-pickem-edge-calculator.netlify.app"
