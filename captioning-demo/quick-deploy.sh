#!/bin/bash

echo "🚀 Quick Deploy: Hinglish Captioning Demo"
echo "=========================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit: Hinglish Captioning Demo"
fi

# Check if remote exists
if ! git remote get-url origin >/dev/null 2>&1; then
    echo "❌ No GitHub remote found!"
    echo "Please create a GitHub repository and run:"
    echo "git remote add origin https://github.com/YOUR_USERNAME/hinglish-captioning-demo.git"
    exit 1
fi

echo "📤 Pushing to GitHub..."
git add .
git commit -m "Update: Ready for deployment" || echo "No changes to commit"
git push origin main

echo ""
echo "✅ Code pushed to GitHub!"
echo ""
echo "🔧 Next steps:"
echo "1. Go to https://render.com and deploy backend"
echo "2. Go to https://vercel.com and deploy frontend"
echo "3. Set environment variables as shown in DEPLOYMENT.md"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"
