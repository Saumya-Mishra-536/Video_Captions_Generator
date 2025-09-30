#!/usr/bin/env python3
"""
Start the Hinglish Transliteration Service
"""
import uvicorn
import os
from hinglish_service import app

if __name__ == "__main__":
    # Check if API key is set
    if not os.environ.get("OPENROUTER_API_KEY"):
        print("❌ Error: OPENROUTER_API_KEY environment variable not set!")
        print("Please set your OpenRouter API key:")
        print("export OPENROUTER_API_KEY='your-api-key-here'")
        exit(1)
    
    print("🚀 Starting Hinglish Transliteration Service...")
    print("📡 Service will be available at: http://localhost:8000")
    print("🔗 Health check: http://localhost:8000/")
    print("🔤 Transliteration endpoint: http://localhost:8000/transliterate")
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000,
        log_level="info"
    )
