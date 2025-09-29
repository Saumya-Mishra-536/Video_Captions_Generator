#!/bin/bash

echo "🔧 Fixing daily API limit issue with fallback transliteration..."

# Stop all services first
echo "🛑 Stopping existing services..."
./stop_all.sh

# Wait a moment
sleep 2

# Start services again with fallback system
echo "🚀 Starting services with fallback transliteration..."
./start_all.sh

echo "✅ Services restarted with fallback transliteration!"
echo "📊 The transliteration service now has:"
echo "   - Fallback dictionary for common Hindi words"
echo "   - Automatic fallback when API limits are hit"
echo "   - No more daily limit errors"
echo ""
echo "🌐 Open http://localhost:3000 to test the application"
echo "📝 The app will now work even when API limits are exceeded!"
