#!/bin/bash

echo "🚀 Setting up Hinglish Captioning Demo..."

# Check if required API keys are set
if [ -z "$DEEPGRAM_API_KEY" ]; then
    echo "❌ Error: DEEPGRAM_API_KEY environment variable not set!"
    echo "Please get your API key from: https://deepgram.com/"
    echo "Then run: export DEEPGRAM_API_KEY='your-api-key-here'"
    exit 1
fi

if [ -z "$OPENROUTER_API_KEY" ]; then
    echo "❌ Error: OPENROUTER_API_KEY environment variable not set!"
    echo "Please get your API key from: https://openrouter.ai/"
    echo "Then run: export OPENROUTER_API_KEY='your-api-key-here'"
    exit 1
fi

echo "✅ API keys found!"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd server
npm install

# Install transliteration service dependencies
echo "🐍 Installing Python dependencies..."
cd transliteration_service
pip install -r requirements.txt
cd ../..

# Install frontend dependencies
echo "⚛️ Installing frontend dependencies..."
cd app
npm install
cd ..

echo "🎉 Setup complete!"
echo ""
echo "To start the application:"
echo "1. Start the transliteration service:"
echo "   cd server/transliteration_service && python start_service.py"
echo ""
echo "2. Start the backend server:"
echo "   cd server && npm start"
echo ""
echo "3. Start the frontend:"
echo "   cd app && npm start"
echo ""
echo "Then open http://localhost:3000 in your browser!"
