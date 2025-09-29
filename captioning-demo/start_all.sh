#!/bin/bash

echo "🚀 Starting Hinglish Captioning Demo..."

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

# Function to start service in background
start_service() {
    local name=$1
    local command=$2
    local port=$3
    
    echo "🔄 Starting $name..."
    $command &
    local pid=$!
    echo "✅ $name started (PID: $pid) on port $port"
    echo $pid > "${name,,}.pid"
}

# Start transliteration service
start_service "Transliteration" "cd server/transliteration_service && python start_service.py" 8000

# Wait a moment for the service to start
sleep 3

# Start backend server
start_service "Backend" "cd server && npm start" 5050

# Wait a moment for the service to start
sleep 3

# Start frontend
start_service "Frontend" "cd app && npm start" 3000

echo ""
echo "🎉 All services started!"
echo ""
echo "📊 Service Status:"
echo "   Transliteration Service: http://localhost:8000"
echo "   Backend API: http://localhost:5050"
echo "   Frontend: http://localhost:3000"
echo ""
echo "🔍 To test services: node test_services.js"
echo "🛑 To stop all services: ./stop_all.sh"
echo ""
echo "🌐 Open http://localhost:3000 in your browser to use the application!"
