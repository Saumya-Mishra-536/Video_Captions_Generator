from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import asyncio
import time
import re
from openai import OpenAI

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.environ["OPENROUTER_API_KEY"],
)

app = FastAPI(title="Hinglish Caption Service (OpenAI OSS Free)", version="1.0.0")

class HinglishRequest(BaseModel):
    text: str

class HinglishResponse(BaseModel):
    hinglish: str

class BatchHinglishRequest(BaseModel):
    texts: list[str]

class BatchHinglishResponse(BaseModel):
    hinglish_texts: list[str]

# Rate limiting variables
last_request_time = 0
request_count = 0
RATE_LIMIT_PER_MINUTE = 12  # Conservative limit (16 - 4 buffer)
MIN_REQUEST_INTERVAL = 5  # Minimum 5 seconds between requests

# Fallback transliteration dictionary for common Hindi words
HINDI_TO_HINGLISH = {
    # Common words
    'है': 'hai', 'हैं': 'hain', 'था': 'tha', 'थे': 'the', 'थी': 'thi',
    'में': 'mein', 'पर': 'par', 'से': 'se', 'को': 'ko', 'का': 'ka', 'की': 'ki', 'के': 'ke',
    'और': 'aur', 'या': 'ya', 'लेकिन': 'lekin', 'अगर': 'agar', 'तो': 'to', 'भी': 'bhi',
    'बहुत': 'bahut', 'कुछ': 'kuch', 'सब': 'sab', 'सभी': 'sabhi', 'हर': 'har',
    'यह': 'yeh', 'वह': 'vah', 'ये': 'ye', 'वे': 've', 'हम': 'hum', 'आप': 'aap', 'मैं': 'main',
    'तुम': 'tum', 'तू': 'tu', 'वो': 'vo', 'इस': 'is', 'उस': 'us', 'इन': 'in', 'उन': 'un',
    'क्या': 'kya', 'क्यों': 'kyon', 'कब': 'kab', 'कहाँ': 'kahan', 'कैसे': 'kaise',
    
    # Helpers & particles
    'ही': 'hi', 'भी': 'bhi', 'तो': 'to', 'ना': 'na', 'अब': 'ab', 'फिर': 'phir', 'वहाँ': 'vahan', 'यहाँ': 'yahan',
    
    # Family relations
    'माँ': 'maa', 'पिता': 'pita', 'पापा': 'papa', 'मम्मी': 'mummy', 'भाई': 'bhai', 'बहन': 'behen',
    'बेटा': 'beta', 'बेटी': 'beti', 'दोस्त': 'dost', 'यार': 'yaar', 'अंकल': 'uncle', 'आंटी': 'aunty',
    
    # Places
    'घर': 'ghar', 'स्कूल': 'school', 'बाजार': 'bazaar', 'गांव': 'gaon', 'शहर': 'shahar',
    'मंदिर': 'mandir', 'मस्जिद': 'masjid', 'गाड़ी': 'gaadi', 'दफ़्तर': 'daftar',
    
    # Food (extra)
    'आलू': 'aloo', 'प्याज़': 'pyaaz', 'टमाटर': 'tamatar', 'अंडा': 'anda', 'मछली': 'machhli',
    
    # Common verbs (extra)
    'खेलना': 'khelna', 'बैठना': 'baithna', 'चलना': 'chalna', 'रुकना': 'rukna',
    'देना': 'dena', 'लेना': 'lena', 'खोलना': 'kholna', 'बंद करना': 'band karna',
    
    # Time-related
    'आज': 'aaj', 'कल': 'kal', 'परसों': 'parson', 'सुबह': 'subah', 'शाम': 'shaam',
    'रात': 'raat', 'दिन': 'din', 'सप्ताह': 'saptah', 'महीना': 'mahina', 'साल': 'saal',
    'जल्दी': 'jaldi', 'धीरे': 'dheere', 'हमेशा': 'hamesha', 'कभी': 'kabhi',
    
    # Numbers
    'एक': 'ek', 'दो': 'do', 'तीन': 'teen', 'चार': 'char', 'पांच': 'paanch',
    'छह': 'chhah', 'सात': 'saat', 'आठ': 'aath', 'नौ': 'nau', 'दस': 'das',
    'सौ': 'sau', 'हज़ार': 'hazaar', 'लाख': 'lakh', 'करोड़': 'karod',
    
    # Common adjectives (expanded)
    'अच्छा': 'achha', 'बुरा': 'bura', 'बड़ा': 'bada', 'छोटा': 'chhota',
    'नया': 'naya', 'पुराना': 'purana', 'गर्म': 'garam', 'ठंडा': 'thanda',
    'मीठा': 'meetha', 'कड़वा': 'kadwa', 'नमकीन': 'namkeen',
    'सुंदर': 'sundar', 'तेज़': 'tez', 'धीमा': 'dheema',
    
    # Body parts (extra)
    'आंख': 'aankh', 'कान': 'kaan', 'नाक': 'naak', 'मुंह': 'muh', 'दांत': 'daant',
    'हाथ': 'haath', 'पैर': 'pair', 'सिर': 'sir', 'दिल': 'dil', 'पेट': 'pet',
    'गला': 'gala', 'बाल': 'baal', 'चेहरा': 'chehra',
    
    # Feelings & states
    'खुश': 'khush', 'दुखी': 'dukhi', 'थका': 'thaka', 'गुस्सा': 'gussa',
    'डर': 'dar', 'प्यार': 'pyaar', 'नफ़रत': 'nafrat', 'भूख': 'bhookh', 'प्यास': 'pyaas',
    
    # Common phrases
    'नमस्ते': 'namaste', 'धन्यवाद': 'dhanyawad', 'माफ करें': 'maaf karein',
    'कृपया': 'kripya', 'जी हां': 'ji haan', 'जी नहीं': 'ji nahi',
    'कैसे हैं': 'kaise hain', 'ठीक है': 'theek hai', 'बहुत अच्छा': 'bahut achha',
    'फिर मिलेंगे': 'phir milenge', 'शुभकामनाएं': 'shubhkamnayein',
    
    # Exclamations & fillers
    'अरे': 'arey', 'वाह': 'wah', 'ओह': 'oh', 'हाय': 'hai', 'उफ': 'uff',
    'चलो': 'chalo', 'सुनो': 'suno', 'देखो': 'dekho', 'यही': 'yahi', 'वही': 'vahi'
}

def simple_transliterate(text):
    """Simple transliteration using dictionary lookup"""
    if not text or not text.strip():
        return text
    
    # Split into words and transliterate each
    words = text.split()
    transliterated_words = []
    
    for word in words:
        # Remove punctuation for lookup
        clean_word = re.sub(r'[^\u0900-\u097F]', '', word)
        punctuation = re.sub(r'[\u0900-\u097F]', '', word)
        
        if clean_word in HINDI_TO_HINGLISH:
            transliterated_words.append(HINDI_TO_HINGLISH[clean_word] + punctuation)
        else:
            # Keep original if not found
            transliterated_words.append(word)
    
    return ' '.join(transliterated_words)

def check_rate_limit():
    """Check and enforce rate limiting"""
    global last_request_time, request_count
    
    current_time = time.time()
    
    # Reset counter if more than a minute has passed
    if current_time - last_request_time > 60:
        request_count = 0
        last_request_time = current_time
    
    # Check if we've exceeded the rate limit
    if request_count >= RATE_LIMIT_PER_MINUTE:
        wait_time = 60 - (current_time - last_request_time)
        if wait_time > 0:
            print(f"⏳ Rate limit reached. Waiting {wait_time:.1f} seconds...")
            time.sleep(wait_time)
            request_count = 0
            last_request_time = time.time()
    
    # Ensure minimum interval between requests
    time_since_last = current_time - last_request_time
    if time_since_last < MIN_REQUEST_INTERVAL:
        wait_time = MIN_REQUEST_INTERVAL - time_since_last
        print(f"⏳ Rate limiting: waiting {wait_time:.1f} seconds...")
        time.sleep(wait_time)
    
    request_count += 1
    last_request_time = time.time()

@app.post("/transliterate", response_model=HinglishResponse)
def transliterate(req: HinglishRequest):
    if not req.text.strip():
        return {"hinglish": ""}

    try:
        print(f"🔤 Transliterating: '{req.text}'")
        
        # Check if we've hit daily limits
        if request_count >= 50:  # Daily limit reached
            print("⚠️ Daily API limit reached, using fallback transliteration")
            fallback_result = simple_transliterate(req.text)
            print(f"✅ Fallback transliterated: '{req.text}' -> '{fallback_result}'")
            return {"hinglish": fallback_result}
        
        # Apply rate limiting
        check_rate_limit()
        
        completion = client.chat.completions.create(
            model="openai/gpt-oss-20b:free",
            messages=[
                {
                    "role": "system",
                    "content": "You are a translator. Convert Hindi text into easy Hinglish subtitles (Romanized Hindi). Keep the same meaning but make it readable in Roman script. If the text is already in English or Roman script, return it as is."
                },
                {
                    "role": "user",
                    "content": req.text,
                },
            ],
            temperature=0.3,
            extra_headers={
                "HTTP-Referer": "http://localhost:3000",   # optional, used for leaderboard stats
                "X-Title": "Captioning Demo"
            },
        )
        hinglish_out = completion.choices[0].message.content.strip()
        print(f"✅ API transliterated: '{req.text}' -> '{hinglish_out}'")
        return {"hinglish": hinglish_out}
    except Exception as e:
        print(f"❌ API transliteration error: {e}")
        # Use fallback transliteration
        print("🔄 Using fallback transliteration...")
        fallback_result = simple_transliterate(req.text)
        print(f"✅ Fallback transliterated: '{req.text}' -> '{fallback_result}'")
        return {"hinglish": fallback_result}

@app.get("/")
def health():
    return {"status": "ok", "engine": "openai/gpt-oss-20b:free via openrouter"}

@app.post("/transliterate-batch", response_model=BatchHinglishResponse)
def transliterate_batch(req: BatchHinglishRequest):
    """Batch transliteration to reduce API calls"""
    if not req.texts:
        return {"hinglish_texts": []}
    
    try:
        print(f"🔤 Batch transliterating {len(req.texts)} texts")
        
        # Check if we've hit daily limits
        if request_count >= 50:  # Daily limit reached
            print("⚠️ Daily API limit reached, using fallback transliteration")
            fallback_results = [simple_transliterate(text) for text in req.texts]
            print(f"✅ Fallback batch transliterated {len(fallback_results)} texts")
            return {"hinglish_texts": fallback_results}
        
        # Apply rate limiting for batch
        check_rate_limit()
        
        # Combine all texts into one request
        combined_text = " | ".join(req.texts)
        
        completion = client.chat.completions.create(
            model="openai/gpt-oss-20b:free",
            messages=[
                {
                    "role": "system",
                    "content": "You are a translator. Convert Hindi text into easy Hinglish subtitles (Romanized Hindi). Keep the same meaning but make it readable in Roman script. If the text is already in English or Roman script, return it as is. Return each translation separated by ' | ' in the same order as input."
                },
                {
                    "role": "user",
                    "content": combined_text,
                },
            ],
            temperature=0.3,
            extra_headers={
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "Captioning Demo"
            },
        )
        
        hinglish_output = completion.choices[0].message.content.strip()
        hinglish_texts = [text.strip() for text in hinglish_output.split(" | ")]
        
        # Ensure we have the same number of outputs as inputs
        while len(hinglish_texts) < len(req.texts):
            hinglish_texts.append("")
        
        print(f"✅ API batch transliterated {len(hinglish_texts)} texts")
        return {"hinglish_texts": hinglish_texts[:len(req.texts)]}
        
    except Exception as e:
        print(f"❌ API batch transliteration error: {e}")
        # Use fallback transliteration
        print("🔄 Using fallback batch transliteration...")
        fallback_results = [simple_transliterate(text) for text in req.texts]
        print(f"✅ Fallback batch transliterated {len(fallback_results)} texts")
        return {"hinglish_texts": fallback_results}

@app.get("/test")
def test_transliteration():
    """Test endpoint to verify the service is working"""
    test_text = "नमस्ते, आप कैसे हैं?"
    try:
        result = transliterate(HinglishRequest(text=test_text))
        return {
            "status": "ok", 
            "test_input": test_text,
            "test_output": result.hinglish,
            "service": "working"
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "service": "not working"
        }