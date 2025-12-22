# CF Revise Queue - Deployment Guide

## 🚀 Hosting Options

### Option 1: Full Free Hosting (Recommended)
- **Frontend**: GitHub Pages (Free)
- **Backend**: Render.com or Railway.app (Free tier)
- **Database**: MongoDB Atlas (Free tier)

### Option 2: Vercel (Easiest)
- Deploy both frontend and backend on Vercel (Free)

---

## 📦 Option 1: GitHub Pages + Render

### Step 1: Deploy Backend to Render.com

1. Go to [render.com](https://render.com) and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && node server.js`
   - **Environment Variables**:
     - `MONGODB_URI`: Your MongoDB Atlas connection string
     - `PORT`: 5000 (Render will set this automatically)

5. Click "Create Web Service"
6. Note your backend URL (e.g., `https://your-app.onrender.com`)

### Step 2: Setup MongoDB Atlas

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and cluster
3. Create a database user
4. Get your connection string
5. Add it to Render environment variables

### Step 3: Deploy Frontend to GitHub Pages

Run these commands:

```bash
# Update frontend to use deployed backend URL
cd frontend
echo "VITE_API_URL=https://your-app.onrender.com/api" > .env.production

# Install gh-pages
npm install --save-dev gh-pages

# Build and deploy
npm run build
npx gh-pages -d dist
```

Your app will be live at: `https://yourusername.github.io/repository-name`

---

## 📦 Option 2: Vercel (Full Stack - Easiest)

### Deploy Everything to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click "New Project"
3. Import your repository
4. Vercel will auto-detect the setup
5. Add environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string

Vercel will:
- Deploy frontend automatically
- Deploy backend as serverless functions
- Give you a URL like `https://your-app.vercel.app`

---

## 📦 Option 3: Railway.app (Simplest Backend)

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway auto-detects Node.js and MongoDB
6. Add environment variable: `MONGODB_URI`

---

## 🎯 Quick Deploy Script

I've created scripts to help you deploy:

```bash
# For GitHub Pages + Render
./deploy-github-pages.sh

# For Vercel
./deploy-vercel.sh
```

Choose your preferred option and I'll help you set it up!
