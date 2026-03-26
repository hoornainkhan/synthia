import express from "express";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json({ limit: "20mb" }));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Note: Image generation now uses Unsplash API directly from the frontend
// The HF proxy endpoint below is deprecated in favor of Unsplash integration
// For backward compatibility, it's kept but not actively used

// Deprecated endpoint - kept for reference
// Image proxy for Hugging Face (no longer in use, using Unsplash instead)
/*
const HF_TOKEN = process.env.HF_TOKEN;
const HF_MODEL = "gsdf/Counterfeit-V2.5";

app.post("/api/hf-image", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "prompt is required" });
    }

    const hfResp = await fetch(
      `https://api-inference.huggingface.co/models/${HF_MODEL}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          options: { wait_for_model: true, use_cache: false },
        }),
      },
    );

    if (!hfResp.ok) {
      const body = await hfResp.text();
      console.error("HF API failed", hfResp.status, body);
      return res.status(hfResp.status).send(body);
    }

    const arrayBuffer = await hfResp.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const contentType = hfResp.headers.get("content-type") || "image/png";
    const dataUrl = `data:${contentType};base64,${base64}`;

    res.json({ dataUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Image proxy failed", details: err.message });
  }
});
*/

app.listen(PORT, () => {
  console.log(`HF proxy server listening at http://localhost:${PORT}`);
});
