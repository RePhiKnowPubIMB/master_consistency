#!/bin/bash

echo "🚀 Deploying CF Revise Queue to GitHub Pages..."
echo ""

# Check if gh-pages is installed
if ! npm list -g gh-pages > /dev/null 2>&1; then
    echo "📦 Installing gh-pages..."
    cd frontend
    npm install --save-dev gh-pages
    cd ..
fi

echo ""
echo "⚙️  IMPORTANT: Before deploying, make sure you have:"
echo "   1. Created a GitHub repository"
echo "   2. Pushed your code to GitHub"
echo "   3. Deployed your backend to Render/Railway"
echo ""

read -p "Have you deployed the backend? (yes/no): " backend_deployed

if [ "$backend_deployed" != "yes" ]; then
    echo ""
    echo "⚠️  Please deploy your backend first!"
    echo ""
    echo "Quick Backend Deployment Options:"
    echo ""
    echo "1️⃣  Render.com (Recommended):"
    echo "   - Go to: https://render.com"
    echo "   - Sign up and connect GitHub"
    echo "   - New Web Service → Select repo"
    echo "   - Root Directory: backend"
    echo "   - Build Command: npm install"
    echo "   - Start Command: node server.js"
    echo "   - Add Environment Variable: MONGODB_URI"
    echo ""
    echo "2️⃣  Railway.app:"
    echo "   - Go to: https://railway.app"
    echo "   - Sign up with GitHub"
    echo "   - New Project → Deploy from GitHub"
    echo "   - Select repo → Add MONGODB_URI env var"
    echo ""
    echo "3️⃣  Fly.io:"
    echo "   - Install: curl -L https://fly.io/install.sh | sh"
    echo "   - Run: fly launch"
    echo ""
    exit 1
fi

echo ""
read -p "Enter your backend URL (e.g., https://your-app.onrender.com): " BACKEND_URL

if [ -z "$BACKEND_URL" ]; then
    echo "❌ Backend URL is required!"
    exit 1
fi

# Remove trailing slash if present
BACKEND_URL=${BACKEND_URL%/}

echo ""
echo "📝 Creating production environment file..."
cd frontend
echo "VITE_API_URL=${BACKEND_URL}/api" > .env.production

echo ""
echo "🔨 Building frontend..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo ""
echo "📤 Deploying to GitHub Pages..."
npm run deploy

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "🎉 Your app will be live at:"
    echo "   https://$(git config user.name | tr '[:upper:]' '[:lower:]').github.io/cf-revise-queue/"
    echo ""
    echo "⏳ Note: It may take 2-3 minutes for GitHub Pages to update."
    echo ""
    echo "📝 Don't forget to:"
    echo "   1. Enable GitHub Pages in repository settings"
    echo "   2. Set source to 'gh-pages' branch"
    echo ""
else
    echo "❌ Deployment failed!"
    exit 1
fi
