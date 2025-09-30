#!/usr/bin/env node

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import captionsRoute from "./captions.js";

// Check required environment variables
if (!process.env.DEEPGRAM_API_KEY) {
    console.error("❌ Error: DEEPGRAM_API_KEY environment variable not set!");
    console.error("Please set your Deepgram API key:");
    console.error("export DEEPGRAM_API_KEY='your-api-key-here'");
    console.error("Get your API key from: https://deepgram.com/");
    process.exit(1);
}

const app = express();

// ✅ CORS: Allow requests from configured frontend origin (fallback to localhost for dev)
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";
app.use(cors({ 
    origin: FRONTEND_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ JSON body parser
app.use(express.json());

// ✅ Health check route (so browser shows something at localhost:5000)
app.get("/", (req, res) => {
    res.json({
        status: "✅ Captioning server is running!",
        services: {
            deepgram: "✅ Configured",
            transliteration: process.env.TRANSLITERATION_SERVICE_URL || "http://localhost:8000/transliterate"
        }
    });
});

// ✅ Captions API endpoint
app.use("/captions", captionsRoute);

// ✅ Start server
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Frontend origin: ${FRONTEND_ORIGIN}`);
    console.log(`🔤 Transliteration service: ${process.env.TRANSLITERATION_SERVICE_URL || "http://localhost:8000/transliterate"}`);
    console.log(`🎤 Deepgram API: ✅ Configured`);
});
