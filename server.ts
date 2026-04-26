import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import "dotenv/config";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini Proxy Route
  app.post("/api/gemini", async (req, res) => {
    const { message, model = "gemini-1.5-flash" } = req.body;
    
    // Check both common environment variables for the Gemini key
    const rawApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    const apiKey = rawApiKey?.trim().replace(/^["']|["']$/g, ""); 

    if (!apiKey || apiKey === "undefined" || apiKey === "") {
      console.error("Gemini API Key missing. Checked GEMINI_API_KEY and GOOGLE_API_KEY.");
      return res.status(500).json({ 
        error: "Gemini API key is missing. Please ensure it is configured in the AI Studio 'Secrets' panel." 
      });
    }

    try {
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Gemini API Error:", JSON.stringify(errorData));
        // Extract the actual error message from Google's response if possible
        const message = errorData.error?.message || errorData.message || JSON.stringify(errorData);
        return res.status(response.status).json({ error: message });
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const usageMetadata = data.usageMetadata;

      res.json({ text, usageMetadata });
    } catch (error: any) {
      console.error("Gemini Proxy Exception:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // DeepSeek Proxy Route
  app.post("/api/deepseek", async (req, res) => {
    const { messages, model = "deepseek-chat" } = req.body;
    const rawApiKey = process.env.DEEPSEEK_API_KEY;
    const apiKey = rawApiKey?.trim().replace(/^["']|["']$/g, ""); // Clean quotes and whitespace

    if (!apiKey || apiKey === "undefined" || apiKey === "") {
      return res.status(500).json({ 
        error: "DEEPSEEK_API_KEY is missing or invalid. Please check your .env or environment configuration." 
      });
    }

    try {
      const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          stream: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }));
        return res.status(response.status).json(errorData);
      }

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
