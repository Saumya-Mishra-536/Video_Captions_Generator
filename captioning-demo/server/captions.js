import dotenv from "dotenv";
dotenv.config();
import express from "express";
import multer from "multer";
import fs from "fs";
import { exec } from "child_process";
import path from "path";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/generate", upload.single("video"), async (req, res) => {
  const input = req.file.path;                        // mp4 temp file
  const wavFile = `${input}.wav`;                     // output wav
  const transcriptJson = `${input}.json`;             // transcript json
  const whisperBinary = path.resolve(
    "whisper.cpp/build/bin/whisper-cli"              // compiled whisper-cli binary
  );
  const whisperModel = path.resolve(
    "whisper.cpp/models/ggml-base.bin"               // multilingual model
  );

  // 1. Convert uploaded MP4 to WAV
  const ffmpegCmd = `ffmpeg -y -i ${input} -ar 16000 -ac 1 -c:a pcm_s16le ${wavFile}`;

  exec(ffmpegCmd, (ffmpegErr) => {
    if (ffmpegErr) {
      console.error("FFmpeg error:", ffmpegErr);
      return res.status(500).json({ error: "ffmpeg conversion failed" });
    }

    // 2. Run whisper.cpp on wav file
    const whisperCmd = `${whisperBinary} -m ${whisperModel} -f ${wavFile} -oj -of ${input}`;

    exec(whisperCmd, (whisperErr) => {
      if (whisperErr) {
        console.error("Whisper error:", whisperErr);
        return res.status(500).json({ error: "whisper.cpp transcription failed" });
      }

      try {
        // 3. Parse transcript.json
        const transcript = JSON.parse(fs.readFileSync(transcriptJson, "utf8"));

        const segments = (transcript.segments || []).map((s) => ({
          start: s.start,
          end: s.end,
          text: s.text.trim(),
        }));

        // 4. Respond with captions
        res.json({ segments });
      } catch (err) {
        return res.status(500).json({ error: "Failed to parse transcript" });
      } finally {
        // 5. Cleanup temporary files
        try { fs.unlinkSync(input); } catch {}
        try { fs.unlinkSync(wavFile); } catch {}
        try { fs.unlinkSync(transcriptJson); } catch {}
      }
    });
  });
});

export default router;
