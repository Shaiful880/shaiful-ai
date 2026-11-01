module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      return res.status(500).json({ error: "API key missing" });
    }

    const { message } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message required" });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=" + encodeURIComponent(key),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }]
        })
      }
    );

    const data = await response.json();
    if (!response.ok) {
      return res.status(502).json({
  error: data.error?.message || "Gemini API Fehler"
});
    }

    const reply = data.candidates?.[0]?.content?.parts
      ?.map(part => part.text || "").join("") || "Keine Antwort erhalten.";

    return res.status(200).json({ reply });
  } catch {
    return res.status(500).json({ error: "Serverfehler" });
  }
};
