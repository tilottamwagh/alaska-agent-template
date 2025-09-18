import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors()); // allow calls from your frontend
app.use(express.json());

const AGENT_ID = process.env.AGENT_ID; // set in Railway
const API_KEY = process.env.API_KEY;   // set in Railway (if you have one)

app.post("/api/ultravox", async (req, res) => {
  const userMessage = req.body.message || "";
  try {
    const headers = { "Content-Type": "application/json" };
    if (API_KEY) headers.Authorization = `Bearer ${API_KEY}`;

    const uvResponse = await fetch(
      `https://api.ultravox.ai/agents/${AGENT_ID}/webhook`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ text: userMessage }),
      }
    );

    const data = await uvResponse.json();
    // Ultravox reply location can be data.response or data.text — fallback safe
    const reply = data.response || data.text || "Sorry, I didn't get that.";
    res.json({ reply });
  } catch (err) {
    console.error("Error calling Ultravox:", err);
    res.json({ reply: "⚠️ Error contacting Ultravox agent." });
  }
});

// route to receive webhook events from Ultravox
app.post("/webhook", (req, res) => {
  console.log("Ultravox webhook event:", JSON.stringify(req.body, null, 2));
  res.status(200).send("ok");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend listening on ${PORT}`));
