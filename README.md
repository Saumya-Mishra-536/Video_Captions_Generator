Hinglish Captioning Demo
A full-stack app that auto-generates Hinglish captions for videos. Upload an MP4, get clean, styled captions that handle real-world Hindi + English speech, and preview them directly in your browser.

What it does:
Upload an MP4 video.
Speech is transcribed with Deepgram.
Hindi (Devanagari) words are automatically converted to Hinglish (Romanized Hindi).
Captions are previewed in the browser using Remotion with multiple styles:
🎵 Karaoke (center, bold cyan)
⬇️ Bottom (yellow, shorts/reels style)
⬆️ Top Bar (compact white label)
Provides a segment list for quick review and editing.

 Why it matters
Mixed-language (Hinglish) speech is common in social content.
Standard captioning tools often break on Hindi/English mixes.
This app ensures captions stay clean, readable, and engaging for platforms like YouTube Shorts, Instagram Reels, and TikTok.

 End-to-End User Flow
Open the web app → upload an MP4.
Backend extracts audio and sends it to Deepgram → returns word-level timestamps.
Segments are built and Hindi text is transliterated to Hinglish.
Browser previews captions in real time using Remotion.

High-Level Architecture
Frontend (React + Remotion)
        │
        ▼
Backend (Node.js + Express)
        │
  ┌─────┴─────┐
  ▼           ▼
Deepgram ASR  Transliteration Service (FastAPI + OpenRouter + fallback)

Frontend:
Built with React + Remotion.
Handles uploads, playback, and caption overlay.
Supports 3 styles (Bottom, Top, Karaoke).

Backend (Node.js + Express):
Receives MP4 uploads (via Multer).
Extracts audio using FFmpeg (mono, 16kHz, cleaned audio).
Calls Deepgram ASR for transcription.
Segments words into readable captions.
Calls transliteration service when Hindi text is detected.
Returns caption JSON.

Transliteration Service (Python + FastAPI)
Converts Hindi → Hinglish.
Endpoints: /transliterate and /transliterate-batch.
Uses OpenRouter/OpenAI models.
Rate limiting + fallback dictionary (no downtime when API quota is hit).

Tech Stack:
Frontend: React, Remotion, TailwindCSS
Backend: Node.js, Express, Multer, FFmpeg
ASR: Deepgram (multilingual transcription)
Transliteration: Python FastAPI + OpenRouter/OpenAI + fallback dictionary
Infra ready for: Render (backend), Vercel (frontend)

Installation & Setup
1. Clone the repo
git clone <your-github-repo-url>
cd hinglish-captioning-demo

2. Environment Variables
Create .env files for backend & transliteration service.

Backend (server/.env):

DEEPGRAM_API_KEY=your-deepgram-key
FRONTEND_ORIGIN=http://localhost:3000
TRANSLITERATION_SERVICE_URL=http://localhost:8000


Transliteration (transliteration/.env):
OPENROUTER_API_KEY=your-openrouter-key

3. Install dependencies
Backend
cd server
npm install

Frontend
cd app
npm install

Transliteration
cd transliteration
pip install -r requirements.txt

4. Run locally
Start all services:

# From project root
./start_all.sh


Frontend → http://localhost:3000
Backend API → http://localhost:5050
Transliteration → http://localhost:8000

Stop services:
./stop_all.sh

Deployment

Push repo to GitHub.
Backend (server/) → Deploy to Render
.
Frontend (app/) → Deploy to Vercel
.
Add environment variables in Render + Vercel:
DEEPGRAM_API_KEY
OPENROUTER_API_KEY
FRONTEND_ORIGIN (your Vercel URL)
Detailed deployment instructions: see DEPLOYMENT.md
.

Reliability & Resilience
Validates uploads (format, audio quality, duration).
Logs every FFmpeg, Deepgram, and transliteration call.
Cleans up temporary files after each run.
Falls back to dictionary-based transliteration when API quota is exceeded.


 Extensibility
Export captions to SRT/WEBVTT or burn into MP4.
Add more caption styles, fonts, brand templates.
Plug in other ASR engines (Google, Whisper, etc.).
Improve dictionary and add multi-language support.
