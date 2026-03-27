import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "20mb" }));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// 🔥 NVIDIA NIM CONFIG
const NIM_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const NIM_API_KEY = process.env.NVIDIA_API_KEY;

app.post("/api/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "prompt is required" });
    }

    if (!NIM_API_KEY) {
      return res.status(500).json({ error: "NVIDIA_API_KEY missing in .env" });
    }

    console.log("🔥 Request received → sending to NVIDIA NIM");

    const response = await axios.post(
      NIM_URL,
      {
        model: "meta/llama-4-maverick-17b-128e-instruct",
        messages: [
          {
            role: "system",
            content:
              "You are a data generation assistant. Return ONLY valid JSON. No markdown. No explanation.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 2000,
      },
      {
        headers: {
          Authorization: `Bearer ${NIM_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(500).json({
        error: "Empty response from NVIDIA",
        details: response.data,
      });
    }

    res.json({ content });
  } catch (err) {
    console.error("❌ NVIDIA ERROR:", err.response?.data || err.message);
    res.status(500).json({
      error: "NVIDIA request failed",
      details: err.response?.data || err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});