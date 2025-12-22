# 🚀 Quick Deployment Guide for CF Revise Queue

## Easiest Option: GitHub Pages (Frontend Only - FREE)

Since GitHub Pages can only host static sites, you need to deploy backend separately.

### Step-by-Step Guide:

## 1️⃣ Deploy Backend (Choose ONE):

### Option A: Render.com (Recommended - Completely Free)

1. Go to [render.com](https://render.com) and sign up with GitHub
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `cf-revise-queue-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   
5. Add **Environment Variable**:
   - Key: `MONGODB_URI`
   - Value: `mongodb+srv://username:password@cluster.mongodb.net/cf-revise-queue?retryWrites=true&w=majority`
   
6. Click **"Create Web Service"**
7. **Copy your backend URL**: `https://cf-revise-queue-backend.onrender.com`

---

### Option B: Railway.app (Even Easier)

1. Go to [railway.app](https://railway.app)
2. Click **"Start a New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Add environment variable: `MONGODB_URI`
5. Railway will auto-deploy!
6. **Copy your backend URL**

---

## 2️⃣ Get MongoDB Atlas (FREE Forever)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create FREE account
3. Create a FREE cluster (M0 tier)
4. Click **"Connect"** → **"Connect your application"**
5. Copy connection string: `mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority`
6. Replace `<password>` with your database password
7. Add `/cf-revise-queue` before the `?` in the URL

---

## 3️⃣ Deploy Frontend to GitHub Pages

Run this command:

```bash
./deploy-github-pages.sh
```

It will ask for your backend URL - paste the URL from Step 1.

**OR** manually:

```bash
cd frontend

# Add your backend URL
echo "VITE_API_URL=https://your-backend.onrender.com/api" > .env.production

# Build and deploy
npm run build
npm run deploy
```

---

## 4️⃣ Enable GitHub Pages

1. Go to your GitHub repository
2. Click **"Settings"** → **"Pages"**
3. Under **"Source"**, select **"gh-pages"** branch
4. Click **"Save"**

Your app will be live at:
```
https://yourusername.github.io/cf-revise-queue/
```

---

## 🎯 Alternative: Deploy Everything to Vercel (One-Click)

Even easier - deploy both frontend AND backend to Vercel:

```bash
./deploy-vercel.sh
```

OR:

```bash
npm install -g vercel
vercel --prod
```

Then add `MONGODB_URI` in Vercel dashboard.

Your app will be at: `https://your-app.vercel.app`

---

## ✅ Summary

**FREE Hosting Options:**

1. **GitHub Pages + Render** (Best for learning)
   - Frontend: GitHub Pages
   - Backend: Render.com
   - Database: MongoDB Atlas
   - Total Cost: $0

2. **Vercel** (Easiest - Everything in one place)
   - Everything on Vercel
   - Total Cost: $0

3. **GitHub Pages + Railway**
   - Frontend: GitHub Pages
   - Backend: Railway.app
   - Database: MongoDB Atlas
   - Total Cost: $0

---

## 🎊 You're Ready to Deploy!

Choose your preferred method and run the deployment script. Your app will be live in minutes!

Need help? Check `DEPLOYMENT.md` for detailed instructions.
