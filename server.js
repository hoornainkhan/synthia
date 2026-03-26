import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// ✅ REQUIRED MIDDLEWARE
app.use(cors());
app.use(express.json({ limit: "20mb" }));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// OpenRouter config
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_BASE = "https://openrouter.ai/api/v1";
const OPENROUTER_MODEL = "meta-llama/llama-3.3-70b-instruct:free";

app.post("/api/groq", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "prompt is required" });
    }

    if (!OPENROUTER_API_KEY) {
      return res.status(500).json({ error: "OPENROUTER_API_KEY missing in .env" });
    }

    console.log("[OpenRouter] Sending request...");

    const response = await fetch(`${OPENROUTER_API_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "SYNTHIA",
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are a data generation assistant. Return ONLY valid JSON. No markdown code fences. No explanation. No extra text.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[OpenRouter] API error:", response.status, errorText);
      return res.status(response.status).json({
        error: `OpenRouter API error (${response.status})`,
        details: errorText,
      });
    }

    const data = await response.json();
    console.log("[OpenRouter] Response received successfully");

    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      console.error("[OpenRouter] Empty response body:", JSON.stringify(data));
      return res.status(500).json({
        error: "Empty response from OpenRouter",
        details: JSON.stringify(data),
      });
    }

    res.json({ content });
  } catch (err) {
    console.error("[OpenRouter] Server error:", err);
    res.status(500).json({ error: "OpenRouter request failed", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`🔑 OpenRouter API Key: ${OPENROUTER_API_KEY ? "configured" : "MISSING!"}`);
});