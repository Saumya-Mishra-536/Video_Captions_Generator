import express from "express";
import cors from "cors";
import captionsRoute from "./captions.js";

const app = express();

// ✅ CORS: Allow requests from configured frontend origin (fallback to localhost for dev)
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";
app.use(cors({ origin: FRONTEND_ORIGIN }));

// ✅ JSON body parser
app.use(express.json());

// ✅ Health check route (so browser shows something at localhost:5000)
app.get("/", (req, res) => {
  res.send("✅ Captioning server is running!");
});

// ✅ Captions API endpoint
app.use("/captions", captionsRoute);

// ✅ Start server
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});