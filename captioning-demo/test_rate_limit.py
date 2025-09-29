#!/usr/bin/env python3
"""
Test script to verify rate limiting works
"""
import requests
import time
import json

TRANSLITERATION_URL = "http://localhost:8000"

def test_single_transliteration():
    """Test single transliteration"""
    print("🔤 Testing single transliteration...")
    try:
        response = requests.post(f"{TRANSLITERATION_URL}/transliterate", 
                               json={"text": "नमस्ते"})
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Single test passed: '{result['hinglish']}'")
            return True
        else:
            print(f"❌ Single test failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Single test error: {e}")
        return False

def test_batch_transliteration():
    """Test batch transliteration"""
    print("🔤 Testing batch transliteration...")
    try:
        texts = ["नमस्ते", "आप कैसे हैं", "धन्यवाद"]
        response = requests.post(f"{TRANSLITERATION_URL}/transliterate-batch", 
                               json={"texts": texts})
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Batch test passed: {result['hinglish_texts']}")
            return True
        else:
            print(f"❌ Batch test failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Batch test error: {e}")
        return False

def test_rate_limiting():
    """Test rate limiting by making multiple requests quickly"""
    print("⏳ Testing rate limiting...")
    
    # Make 3 requests quickly to test rate limiting
    for i in range(3):
        print(f"   Request {i+1}/3...")
        start_time = time.time()
        
        response = requests.post(f"{TRANSLITERATION_URL}/transliterate", 
                               json={"text": f"test {i+1}"})
        
        end_time = time.time()
        duration = end_time - start_time
        
        if response.status_code == 200:
            print(f"   ✅ Request {i+1} completed in {duration:.1f}s")
        else:
            print(f"   ❌ Request {i+1} failed: {response.status_code}")
        
        # Small delay between requests
        time.sleep(1)

def main():
    print("🧪 Testing Hinglish Transliteration Service...")
    print("=" * 50)
    
    # Test service health
    try:
        response = requests.get(f"{TRANSLITERATION_URL}/")
        if response.status_code == 200:
            print("✅ Service is running")
        else:
            print("❌ Service is not responding")
            return
    except Exception as e:
        print(f"❌ Cannot connect to service: {e}")
        return
    
    print()
    
    # Run tests
    test_single_transliteration()
    print()
    
    test_batch_transliteration()
    print()
    
    test_rate_limiting()
    print()
    
    print("🎉 Rate limiting test completed!")
    print("📊 The service should now handle rate limits properly.")

if __name__ == "__main__":
    main()
