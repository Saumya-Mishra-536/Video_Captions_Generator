#!/bin/bash

echo "🔄 Restarting services with rate limiting fixes..."

# Stop all services first
echo "🛑 Stopping existing services..."
./stop_all.sh

# Wait a moment
sleep 2

# Start services again
echo "🚀 Starting services with fixes..."
./start_all.sh

echo "✅ Services restarted with rate limiting fixes!"
echo "📊 The transliteration service now has:"
echo "   - Rate limiting (12 requests/minute)"
echo "   - Batch processing (reduces API calls)"
echo "   - 5-second intervals between requests"
echo ""
echo "🌐 Open http://localhost:3000 to test the application"
