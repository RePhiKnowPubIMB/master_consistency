#!/bin/bash

echo "🚀 Deploying CF Revise Queue to Vercel..."
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo ""
echo "📝 This will deploy both frontend and backend to Vercel"
echo ""

read -p "Do you have a MongoDB Atlas connection string? (yes/no): " has_mongodb

if [ "$has_mongodb" != "yes" ]; then
    echo ""
    echo "⚠️  You need MongoDB Atlas first!"
    echo ""
    echo "Steps:"
    echo "1. Go to: https://www.mongodb.com/cloud/atlas"
    echo "2. Create free account and cluster"
    echo "3. Create database user"
    echo "4. Get connection string"
    echo ""
    exit 1
fi

echo ""
read -p "Enter your MongoDB connection string: " MONGODB_URI

if [ -z "$MONGODB_URI" ]; then
    echo "❌ MongoDB URI is required!"
    exit 1
fi

echo ""
echo "🔨 Deploying to Vercel..."

# Deploy
vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "🎉 Your app is now live!"
    echo ""
    echo "📝 Add environment variable in Vercel dashboard:"
    echo "   MONGODB_URI=${MONGODB_URI}"
    echo ""
    echo "   Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables"
    echo ""
else
    echo "❌ Deployment failed!"
    exit 1
fi
