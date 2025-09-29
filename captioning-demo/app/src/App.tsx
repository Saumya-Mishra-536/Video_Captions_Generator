import React, { useState } from "react";
import { Player } from "@remotion/player";
import axios from "axios";
import VideoComposition from "./VideoComposition";

type CaptionSegment = {
  start: number;
  end: number;
  text: string;
};

function App() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [captions, setCaptions] = useState<CaptionSegment[]>([]);
  const [preset, setPreset] = useState("bottom");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [videoDuration, setVideoDuration] = useState(3000); // Default 100 seconds

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      setVideoFile(file);
      setCaptions([]);
      setError("");
      
      // Get video duration
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        const duration = Math.ceil(video.duration * 30); // Convert to frames at 30fps
        setVideoDuration(duration);
        console.log(`📹 Video duration: ${video.duration}s (${duration} frames)`);
      };
      video.src = URL.createObjectURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!videoFile) return;
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("video", videoFile);

    try {
      const API_BASE = (process.env.REACT_APP_API_BASE || "http://localhost:5050").replace(/\/$/, "");
      const { data } = await axios.post<{ segments: CaptionSegment[] }>(
        `${API_BASE}/captions/generate`,
        formData
      );
      setCaptions(data.segments || []);
      console.log(`📝 Generated ${data.segments?.length || 0} caption segments`);
      console.log("📋 Captions:", data.segments);
    } catch {
      setError("❌ Caption generation failed. Please check backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-600 via-pink-400 to-blue-400 text-white">
      {/* HERO */}
      <header className="text-center py-16 px-6">
        <h1 className="text-5xl font-extrabold drop-shadow-lg leading-tight">
          Hinglish Captioner 🎬 <br />
          <span className="text-white/90 text-3xl font-light block mt-3">
            Upload. Generate. Export. All in Minutes.
          </span>
        </h1>
      </header>

      {/* Upload Box */}
      <section id="upload" className="flex flex-col items-center justify-center mt-4">
        <div className="bg-white/20 backdrop-blur-xl p-8 rounded-2xl shadow-2xl 
          w-full max-w-xl border border-white/30 space-y-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Upload your Video</h2>
          <input
            type="file"
            accept="video/mp4"
            onChange={handleUpload}
            className="block w-full text-sm text-white
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-white/90 file:text-purple-700
              hover:file:bg-gray-100 transition"
          />

          <button
            onClick={handleGenerate}
            disabled={!videoFile || loading}
            className="w-full py-3 rounded-lg bg-purple-700 text-white font-bold shadow-md
              hover:bg-purple-600 transition disabled:bg-gray-500"
          >
            {loading ? "⏳ Generating..." : "⚡ Auto-generate Captions"}
          </button>

          {/* PRESETS */}
          <div className="flex justify-around mt-6">
            {[
              { id: "bottom", label: "⭐ Bottom" },
              { id: "top", label: "📍 Top Bar" },
              { id: "karaoke", label: "🎤 Karaoke" },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setPreset(opt.id)}
                className={`px-4 py-2 rounded-lg font-medium transition 
                  ${preset === opt.id ? 
                    "bg-white text-purple-700 shadow" : 
                    "bg-purple-600/40 text-white hover:bg-purple-600/70"}`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {error && <p className="text-red-200 font-semibold">{error}</p>}
        </div>
      </section>

      {/* Video Player Preview */}
      {videoFile && (
        <div className="flex flex-col items-center mt-12 space-y-6">
          {/* Remotion Player with Captions */}
          <div className="relative">
            <Player
              component={VideoComposition}
              inputProps={{ videoFile, captions, preset }}
              durationInFrames={videoDuration}
              fps={30}
              compositionWidth={720}
              compositionHeight={480}
              style={{
                width: "640px",
                height: "360px",
                borderRadius: "12px",
                border: "4px solid white",
                backgroundColor: "#000",
                boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
              }}
              controls
              loop
              allowFullscreen
              spaceKeyToPlayOrPause
              doubleClickToFullscreen
              clickToPlay
              showPlaybackRateControl
              showVolumeControls={true}
            />
            
            {/* Caption Overlay Indicator */}
            {captions.length > 0 && (
              <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-sm font-bold">
                📝 {captions.length} Captions
              </div>
            )}
          </div>
          
          
          {/* Caption Preview */}
          {captions.length > 0 && (
            <div className="bg-white/20 backdrop-blur-xl p-6 rounded-2xl shadow-2xl w-full max-w-4xl border border-white/30">
              <h3 className="text-2xl font-bold mb-4 text-center">📝 Generated Captions ({captions.length} segments)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                {captions.map((caption, index) => (
                  <div key={index} className="bg-white/10 p-3 rounded-lg">
                    <div className="text-sm text-white/70 mb-1">
                      {Math.floor(caption.start)}s - {Math.floor(caption.end)}s
                    </div>
                    <div className="text-white font-medium">
                      {caption.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Features */}
      <section className="py-20 grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto text-center">
        <div className="bg-white/10 rounded-lg p-6 shadow hover:shadow-lg transition">
          <div className="text-4xl mb-2">⚡</div>
          <h3 className="font-bold text-lg">Auto Hinglish Captions</h3>
          <p className="text-white/80">Mix Hindi + English accurately</p>
        </div>
        <div className="bg-white/10 rounded-lg p-6 shadow hover:shadow-lg transition">
          <div className="text-4xl mb-2">🎨</div>
          <h3 className="font-bold text-lg">Multiple Styles</h3>
          <p className="text-white/80">Bottom, Top Bar, or Karaoke</p>
        </div>
        <div className="bg-white/10 rounded-lg p-6 shadow hover:shadow-lg transition">
          <div className="text-4xl mb-2">🚀</div>
          <h3 className="font-bold text-lg">Export Quickly</h3>
          <p className="text-white/80">Render MP4 instantly in high quality</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center bg-black/30 backdrop-blur text-sm text-white/80">
        Hinglish Captioner — Built with 💜 React + Remotion + Whisper
      </footer>
    </div>
  );
}

export default App;