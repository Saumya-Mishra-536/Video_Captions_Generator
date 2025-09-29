#!/bin/bash

echo "🛑 Stopping all Hinglish Captioning services..."

# Function to stop service by PID file
stop_service() {
    local name=$1
    local pid_file="${name,,}.pid"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            echo "🔄 Stopping $name (PID: $pid)..."
            kill "$pid"
            echo "✅ $name stopped"
        else
            echo "⚠️ $name was not running"
        fi
        rm -f "$pid_file"
    else
        echo "⚠️ No PID file found for $name"
    fi
}

# Stop all services
stop_service "Transliteration"
stop_service "Backend"
stop_service "Frontend"

# Also kill any remaining processes
echo "🧹 Cleaning up any remaining processes..."

# Kill any remaining node processes related to this project
pkill -f "node.*start_server.js" 2>/dev/null || true
pkill -f "node.*start" 2>/dev/null || true
pkill -f "python.*start_service.py" 2>/dev/null || true

echo "✅ All services stopped!"
