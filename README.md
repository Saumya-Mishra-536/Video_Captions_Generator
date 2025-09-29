A local web application to upload MP4 videos, auto-generate captions (including Hinglish), and render them over the video using Remotion. The app supports multiple caption styles and provides real-time preview.

Project Structure
simora.ai/
│
├─ captioning-demo/
│   ├─ app/        # Frontend (React + Remotion)
│   └─ server/     # Backend (Node.js / Express)
│
├─ README.md

Features:
Upload MP4 videos from your local machine.
Auto-generate captions using Deepgram STT API.
Support for Hinglish captions (Devanagari + Latin characters).
2–3 predefined caption styles (bottom-centered, top bar, karaoke-style).
Real-time preview of captioned videos in the browser.
Export captioned video as MP4 using Remotion.

Prerequisites
Node.js >= 18.x
npm (comes with Node.js)
VS Code (recommended for running locally)
Deepgram API Key (sign up at https://deepgram.com
)
Optional: Install ffmpeg if using local video/audio processing.

Setup Instructions
1. Clone the repository
git clone https://github.com/<your-username>/simora.ai.git
cd simora.ai/captioning-demo

2. Install dependencies
Backend (server folder)
cd server
npm install

Frontend (app folder)
cd ../app
npm install

3. Configure Deepgram
Create a .env file in the server folder:
DEEPGRAM_API_KEY=your_deepgram_api_key_here


Make sure .env is added to .gitignore so your API key is not pushed.

4. Start the application
Start backend server
cd ../server
npm start

Start frontend app
cd ../app
npm start


Open your browser at http://localhost:3000 (or the port shown in terminal).
You should see the Captioning Demo UI.

5. Upload and Caption a Video
Click Upload MP4 and select a video.
Press Auto-generate captions.
Backend will send the audio to Deepgram for transcription.
Captions (including Hinglish text) will be returned to the frontend.
Choose a caption preset style from the dropdown.
The video with rendered captions will appear in the preview.
Backend flow (simplified):
Receive MP4 upload.
Extract audio from video (if needed).
Send audio to Deepgram API.
Receive caption text in JSON.
Send caption data back to frontend.
Frontend renders captions using Remotion with selected style.

6. Export Video
After selecting captions, click Export Video (or follow Remotion’s local render command):

# From app folder
npx remotion render src/VideoWithCaptions.tsx out/video.mp4

This will save the captioned video as video.mp4 locally.

Notes

Only 2–3 caption presets are included; no timeline editor or frame-by-frame placement.
Supports Hinglish captions — ensure fonts like Noto Sans Devanagari + Noto Sans.
Backend handles video upload and Deepgram transcription.
Frontend renders captions with Remotion Player for preview.
Optional / Bonus Features

Import/export SRT/VTT files.
Word-level karaoke effect.
Modular code, TypeScript, or containerized setup (Docker/devcontainer).

Sample Video
Include one sample MP4 and its captioned output in sample/ folder.

References
Remotion Documentation
Deepgram Speech-to-Text API
React
