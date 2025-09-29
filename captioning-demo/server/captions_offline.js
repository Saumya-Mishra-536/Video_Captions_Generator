// captions_offline.js
import express from "express";
import multer from "multer";
import fs from "fs";
import { exec } from "child_process";
import path from "path";

// 1) Create express router and multer
const router = express.Router();
const upload = multer({ dest: "uploads/" });

// 2) Route definition
router.post("/generate", upload.single("video"), (req, res) => {
  console.log("📥 /captions/generate called");

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const input = req.file.path;
  const wavFile = `${input}.wav`;
  const transcriptJson = `${input}.json`;

  const whisperBinary = path.resolve("whisper.cpp/build/bin/whisper-cli");
  const whisperModel = path.resolve("whisper.cpp/models/ggml-base.bin");

  const ffmpegCmd = `ffmpeg -y -i ${input} -ar 16000 -ac 1 -c:a pcm_s16le ${wavFile}`;
  console.log("🎬 Running:", ffmpegCmd);

  exec(ffmpegCmd, (ffmpegErr, stdout, stderr) => {
    if (ffmpegErr) {
      console.error("❌ FFmpeg error:", stderr);
      return res.status(500).json({ error: "ffmpeg failed" });
    }

    const whisperCmd = `${whisperBinary} -m ${whisperModel} -f ${wavFile} -oj -of ${input}`;
    console.log("🎤 Running:", whisperCmd);

    exec(whisperCmd, (whisperErr, stdout, stderr) => {
      if (whisperErr) {
        console.error("❌ Whisper error:", stderr);
        return res.status(500).json({ error: "whisper.cpp failed" });
      }

      try {
        const transcript = JSON.parse(fs.readFileSync(transcriptJson, "utf8"));
        const segments = (transcript.segments || []).map(s => ({
          start: s.start,
          end: s.end,
          text: s.text.trim(),
        }));
        return res.json({ segments });
      } catch (err) {
        console.error("❌ JSON parse failed");
        return res.status(500).json({ error: "parse json failed" });
      } finally {
        try { fs.unlinkSync(input); } catch {}
        try { fs.unlinkSync(wavFile); } catch {}
        try { fs.unlinkSync(transcriptJson); } catch {}
      }
    });
  });
});

// 3) Export router for index.js to import
export default router;