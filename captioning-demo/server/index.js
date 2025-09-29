import express from "express";
import cors from "cors";
import captionsRoute from "./captions_offline.js";

const app = express();

// ✅ CORS: Allow requests from React dev server (port 3000)
app.use(cors({ origin: "http://localhost:3000" }));

// ✅ JSON body parser
app.use(express.json());

// ✅ Health check route (so browser shows something at localhost:5000)
app.get("/", (req, res) => {
  res.send("✅ Captioning server is running!");
});

// ✅ Captions API endpoint
app.use("/captions", captionsRoute);

// ✅ Start server
const PORT = 5050;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});