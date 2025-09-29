#!/bin/bash

echo "🚀 Deploying Hinglish Captioning Demo to Render + Vercel"
echo "=================================================="

# Check if required tools are installed
command -v git >/dev/null 2>&1 || { echo "❌ Git is required but not installed. Aborting." >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm is required but not installed. Aborting." >&2; exit 1; }

echo "✅ Prerequisites check passed"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit: Hinglish Captioning Demo"
fi

echo ""
echo "📋 Deployment Steps:"
echo "1. Push to GitHub repository"
echo "2. Deploy backend to Render"
echo "3. Deploy frontend to Vercel"
echo "4. Configure environment variables"
echo ""

echo "🔧 Next steps:"
echo "1. Create a GitHub repository"
echo "2. Push this code to GitHub:"
echo "   git remote add origin <your-github-repo-url>"
echo "   git push -u origin main"
echo ""
echo "3. Deploy backend to Render:"
echo "   - Go to https://render.com"
echo "   - Connect your GitHub repository"
echo "   - Deploy from server/ directory"
echo ""
echo "4. Deploy frontend to Vercel:"
echo "   - Go to https://vercel.com"
echo "   - Connect your GitHub repository"
echo "   - Deploy from app/ directory"
echo ""
echo "5. Set environment variables in Render:"
echo "   - DEEPGRAM_API_KEY"
echo "   - OPENROUTER_API_KEY"
echo "   - FRONTEND_ORIGIN (your Vercel URL)"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"
