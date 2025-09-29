# 🎬 Hinglish Video Captioning Demo

A full-stack application that automatically generates Hinglish captions for videos using Deepgram speech-to-text and OpenAI for Hindi-to-Hinglish transliteration.

## ✨ Features

- **🎥 Video Upload**: Upload MP4 videos for captioning
- **🎤 Speech-to-Text**: Uses Deepgram Nova-3 for accurate multilingual transcription
- **🔤 Hinglish Transliteration**: Converts Hindi text to Romanized Hindi using OpenAI
- **🎨 Multiple Caption Styles**: Bottom, Top Bar, and Karaoke styles
- **⚡ Real-time Preview**: Live video playback with synchronized captions
- **📱 Responsive Design**: Modern UI with Tailwind CSS

## 🏗️ Architecture

```
Frontend (React + Remotion) ←→ Backend (Node.js + Express) ←→ Transliteration Service (Python + FastAPI)
                                      ↓
                              Deepgram API (Speech-to-Text)
```

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v16 or higher)
2. **Python** (v3.8 or higher)
3. **API Keys**:
   - [Deepgram API Key](https://deepgram.com/) (for speech-to-text)
   - [OpenRouter API Key](https://openrouter.ai/) (for transliteration)

### Setup

1. **Clone and navigate to the project**:
   ```bash
   cd captioning-demo
   ```

2. **Set environment variables**:
   ```bash
   export DEEPGRAM_API_KEY="your_deepgram_api_key_here"
   export OPENROUTER_API_KEY="your_openrouter_api_key_here"
   ```

3. **Run the setup script**:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

### Manual Setup (Alternative)

If the setup script doesn't work, follow these steps:

1. **Install backend dependencies**:
   ```bash
   cd server
   npm install
   ```

2. **Install transliteration service dependencies**:
   ```bash
   cd transliteration_service
   pip install -r requirements.txt
   ```

3. **Install frontend dependencies**:
   ```bash
   cd ../../app
   npm install
   ```

## 🎯 Running the Application

### Start all services (3 terminals):

**Terminal 1 - Transliteration Service**:
```bash
cd server/transliteration_service
python start_service.py
```

**Terminal 2 - Backend Server**:
```bash
cd server
npm start
```

**Terminal 3 - Frontend**:
```bash
cd app
npm start
```

### Access the application:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5050
- **Transliteration Service**: http://localhost:8000

## 🔧 API Endpoints

### Backend (Port 5050)
- `GET /` - Health check
- `POST /captions/generate` - Generate captions from video

### Transliteration Service (Port 8000)
- `GET /` - Health check
- `GET /test` - Test transliteration
- `POST /transliterate` - Convert Hindi to Hinglish

## 🎨 Caption Styles

1. **Bottom Captions** (Default): Yellow text at bottom
2. **Top Bar**: White text in top area  
3. **Karaoke**: Cyan text in center

## 🐛 Troubleshooting

### Common Issues:

1. **"DEEPGRAM_API_KEY not found"**:
   - Set your Deepgram API key: `export DEEPGRAM_API_KEY="your-key"`

2. **"OPENROUTER_API_KEY not found"**:
   - Set your OpenRouter API key: `export OPENROUTER_API_KEY="your-key"`

3. **Transliteration service not working**:
   - Check if service is running: `curl http://localhost:8000/`
   - Test transliteration: `curl http://localhost:8000/test`

4. **Video processing fails**:
   - Ensure your video has clear audio
   - Check video format (MP4 recommended)
   - Verify FFmpeg is working

### Debug Mode:

Enable detailed logging by setting:
```bash
export DEBUG=true
```

## 📝 Usage

1. **Upload Video**: Select an MP4 video file
2. **Choose Style**: Select caption style (Bottom/Top/Karaoke)
3. **Generate Captions**: Click "Auto-generate Captions"
4. **Preview**: Watch video with synchronized captions
5. **Export**: Use Remotion to render final video

## 🛠️ Development

### Project Structure:
```
captioning-demo/
├── app/                    # React frontend
│   ├── src/
│   │   ├── App.tsx        # Main app component
│   │   ├── VideoComposition.tsx  # Remotion video composition
│   │   └── CaptionStyles.tsx     # Caption style components
│   └── package.json
├── server/                 # Node.js backend
│   ├── captions.js        # Caption generation logic
│   ├── start_server.js    # Server startup script
│   └── transliteration_service/  # Python transliteration service
│       ├── hinglish_service.py   # FastAPI service
│       └── start_service.py       # Service startup script
└── setup.sh               # Setup script
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- [Deepgram](https://deepgram.com/) for speech-to-text API
- [OpenRouter](https://openrouter.ai/) for AI model access
- [Remotion](https://remotion.dev/) for video composition
- [React](https://react.dev/) for the frontend framework
