import dotenv from "dotenv";
dotenv.config();
import express from "express";
import multer from "multer";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import ffprobeStatic from "ffprobe-static";

// Set FFmpeg paths for npm packages
ffmpeg.setFfmpegPath(ffmpegStatic);
ffmpeg.setFfprobePath(ffprobeStatic.path);

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/generate", upload.single("video"), async (req, res) => {
  console.log("📥 /captions/generate called with Deepgram API");
  
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  if (!process.env.DEEPGRAM_API_KEY) {
    console.error("❌ DEEPGRAM_API_KEY not found in environment variables");
    return res.status(500).json({ error: "Deepgram API key not configured" });
  }

  const input = req.file.path;
  const audioFile = `${input}.wav`;
  
  try {
    // 1. Convert MP4 to WAV for Deepgram using npm package
    console.log("🎬 Converting video to audio using npm FFmpeg...");
    
    // Use fluent-ffmpeg npm package with WAV codec (better speech detection)
    await new Promise((resolve, reject) => {
      ffmpeg(input)
        .noVideo()
        .audioCodec('pcm_s16le')
        .audioFrequency(16000)
        .audioChannels(1)
        .outputOptions([
          '-avoid_negative_ts', 'make_zero',
          '-fflags', '+genpts',
          '-acodec', 'pcm_s16le',
          '-ar', '16000',
          '-ac', '1',
          '-af', 'highpass=f=80,lowpass=f=8000,volume=2.0'
        ])
        .output(audioFile)
        .on('start', (commandLine) => {
          console.log("🔧 FFmpeg command:", commandLine);
        })
        .on('progress', (progress) => {
          if (progress.percent) {
            console.log(`📊 Processing: ${Math.round(progress.percent)}% done`);
          }
          if (progress.timemark) {
            console.log(`⏱️ Current time: ${progress.timemark}`);
          }
        })
        .on('end', () => {
          console.log("✅ FFmpeg conversion successful");
          resolve();
        })
        .on('error', (err) => {
          console.error("❌ FFmpeg error:", err.message);
          reject(new Error(`FFmpeg conversion failed: ${err.message}`));
        })
        .run();
    });
    
    // 2. Read audio file and validate
    const audioBuffer = fs.readFileSync(audioFile);
    console.log(`📊 Audio file size: ${(audioBuffer.length / 1024 / 1024).toFixed(2)} MB`);
    
    // Check if audio file is too small (might be silent or corrupted)
    if (audioBuffer.length < 1000) {
      throw new Error("Audio file is too small or corrupted. Please check your video has audio.");
    }
    
    // Check if audio file has valid WAV header
    const wavHeader = audioBuffer.slice(0, 4);
    if (wavHeader.toString() !== 'RIFF') {
      console.warn("⚠️ Audio file may not be valid WAV format");
    }
    
    // Calculate expected audio duration based on file size
    const expectedDuration = (audioBuffer.length / (16000 * 2)); // 16kHz, 16-bit
    console.log(`⏱️ Expected audio duration: ${expectedDuration.toFixed(2)} seconds`);
    
    // Test audio file with ffprobe to check if it has audio
    let actualDuration = 0;
    try {
      await new Promise((resolve, reject) => {
        ffmpeg.ffprobe(audioFile, (err, metadata) => {
          if (err) {
            console.warn("⚠️ Could not probe audio file:", err.message);
            resolve();
          } else {
            actualDuration = parseFloat(metadata.format.duration) || 0;
            console.log("🔍 Audio file info:", {
              duration: actualDuration,
              sampleRate: metadata.streams[0]?.sample_rate,
              channels: metadata.streams[0]?.channels,
              codec: metadata.streams[0]?.codec_name,
              bitrate: metadata.format.bit_rate
            });
            
            // Check if duration seems reasonable
            if (actualDuration < 1) {
              console.warn("⚠️ Audio duration is very short, might be incomplete");
            } else if (actualDuration > 3600) {
              console.warn("⚠️ Audio duration is very long, might be too large for API");
            }
            resolve();
          }
        });
      });
    } catch (error) {
      console.warn("⚠️ Could not probe audio file:", error.message);
    }
    
    // 3. Call Deepgram API with enhanced parameters
    console.log("🎤 Calling Deepgram API...");
    console.log(`📤 Sending ${(audioBuffer.length / 1024 / 1024).toFixed(2)} MB of audio data to Deepgram`);
    
    // Deepgram nova-3 with explicit multilingual language setting
    const dgParams = new URLSearchParams({
      model: 'nova-3',
      smart_format: 'true',
      punctuate: 'true',
      diarize: 'false',
      timestamps: 'true',
      utterances: 'true',
      paragraphs: 'true',
      multichannel: 'false',
      summarize: 'false',
      language: 'multi',
      numerals: 'true',
      filler_words: 'false'
    });

    const response = await fetch(`https://api.deepgram.com/v1/listen?${dgParams.toString()}`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
        'Content-Type': 'audio/wav',
      },
      body: audioBuffer,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Deepgram API error:", response.status, errorText);
      
      // Check if it's an audio format issue
      if (response.status === 400 && errorText.includes("corrupt or unsupported data")) {
        return res.status(400).json({ 
          error: "Audio conversion failed. Please ensure your video has clear audio and try again." 
        });
      }
      
      return res.status(500).json({ error: `Deepgram API failed: ${response.status}` });
    }
    
    const result = await response.json();
    console.log("✅ Deepgram API response received");
    
    
    // 4. Format response to match your frontend
    const words = result.results.channels[0].alternatives[0].words || [];
    const utterances = result.results.utterances || [];
    console.log(`📝 Found ${words.length} words, ${utterances.length} utterances from Deepgram`);
    
    // Check if we have any words at all
    if (words.length === 0) {
      console.warn("⚠️ No words found in Deepgram response");
      return res.json({ segments: [] });
    }
    
    // Helper: detect Devanagari
    const hasDevanagari = (text) => /[\u0900-\u097F]/.test(text || "");

    // Helper: transliterate using AI4Bharat microservice
    const transliterationServiceUrl = process.env.TRANSLITERATION_SERVICE_URL || "http://localhost:8000/transliterate";
    const toHinglish = async (text) => {
      if (!text || !hasDevanagari(text)) return text || "";
      try {
        console.log(`🔤 Transliterating: "${text}"`);
        const r = await fetch(transliterationServiceUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        });
        if (!r.ok) {
          console.warn(`⚠️ Transliteration service failed: ${r.status}`);
          return text; // fallback
        }
        const j = await r.json();
        const hinglishText = j.hinglish || text;
        console.log(`✅ Transliterated: "${text}" -> "${hinglishText}"`);
        return hinglishText;
      } catch (error) {
        console.warn(`⚠️ Transliteration error:`, error.message);
        return text;
      }
    };

    // Group words into sentences for better captions
    const segments = [];
    let currentSegment = { start: 0, end: 0, text: '' };
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      
      if (currentSegment.text === '') {
        currentSegment.start = word.start;
      }
      
      currentSegment.text += word.word + ' ';
      currentSegment.end = word.end;
      
      // End segment on punctuation or every 8 words (shorter segments for better readability)
      const hasPunctuation = word.punctuated_word?.includes('.') || 
                           word.punctuated_word?.includes('!') || 
                           word.punctuated_word?.includes('?') || 
                           word.punctuated_word?.includes(',');
      const isLongSegment = currentSegment.text.split(' ').length >= 8;
      
      if (hasPunctuation || isLongSegment || i === words.length - 1) {
        if (currentSegment.text.trim() !== '') {
          const rawText = currentSegment.text.trim();
          segments.push({
            start: currentSegment.start,
            end: currentSegment.end,
            text: rawText
          });
        }
        currentSegment = { start: word.end, end: word.end, text: '' };
      }
    }
    
    // Ensure we have at least one segment
    if (segments.length === 0 && words.length > 0) {
      console.warn("⚠️ No segments created, creating fallback segment");
      const rawText = words.map(w => w.word).join(' ');
      segments.push({
        start: words[0].start,
        end: words[words.length - 1].end,
        text: rawText
      });
    }
    
    // If we have utterances and they provide better coverage, use them
    if (utterances.length > 0) {
      const utteranceSegmentsRaw = utterances.map(utterance => ({
        start: utterance.start,
        end: utterance.end,
        text: (utterance.transcript || '').trim()
      }));
      
      // Check if utterances provide better coverage
      if (utteranceSegmentsRaw.length > segments.length) {
        console.log("🗣️ Using utterances for better coverage");
        segments.splice(0, segments.length, ...utteranceSegmentsRaw);
      }
    }

    // Transliterate any Devanagari segments to Hinglish via microservice (batch processing)
    const devanagariCount = segments.filter(s => hasDevanagari(s.text)).length;
    console.log(`🔡 Found ${devanagariCount} segments with Devanagari text`);
    
    let segmentsWithHinglish = segments;
    if (devanagariCount > 0) {
      try {
        // Use batch processing to reduce API calls
        const devanagariSegments = segments.filter(s => hasDevanagari(s.text));
        const devanagariTexts = devanagariSegments.map(s => s.text);
        
        console.log(`🔤 Batch transliterating ${devanagariTexts.length} texts...`);
        const batchResponse = await fetch(`${transliterationServiceUrl.replace('/transliterate', '/transliterate-batch')}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ texts: devanagariTexts })
        });
        
        if (batchResponse.ok) {
          const batchResult = await batchResponse.json();
          const hinglishTexts = batchResult.hinglish_texts || [];
          
          // Map back to segments
          let hinglishIndex = 0;
          segmentsWithHinglish = segments.map(s => {
            if (hasDevanagari(s.text)) {
              const hinglishText = hinglishTexts[hinglishIndex] || s.text;
              hinglishIndex++;
              return { ...s, text: hinglishText };
            }
            return s;
          });
          
          const stillDevanagari = segmentsWithHinglish.filter(s => hasDevanagari(s.text)).length;
          console.log(`🔡 Batch transliteration: had ${devanagariCount} Devanagari segments, after=${stillDevanagari}`);
        } else {
          console.warn(`⚠️ Batch transliteration failed, using original text`);
        }
      } catch (error) {
        console.warn(`⚠️ Batch transliteration failed, using original text:`, error.message);
        // Keep original segments if transliteration fails
      }
    }
    
    console.log(`📝 Generated ${segmentsWithHinglish.length} caption segments`);
    
    res.json({ segments: segmentsWithHinglish });
    
  } catch (error) {
    console.error("❌ Transcription error:", error);
    res.status(500).json({ error: "Transcription failed: " + error.message });
  } finally {
    // 5. Cleanup temporary files
    try { 
      fs.unlinkSync(input); 
      console.log("🗑️ Cleaned up input file");
    } catch (e) {}
    try { 
      fs.unlinkSync(audioFile); 
      console.log("🗑️ Cleaned up audio file");
    } catch (e) {}
  }
});

export default router;