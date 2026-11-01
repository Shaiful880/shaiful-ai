module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const key = process.env.GEMINI_API_KEY;

  if (!key) {
    return res.status(500).json({ error: "API-Schlüssel fehlt" });
  }

  const { message } = req.body || {};

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Nachricht fehlt" });
  }

  const models = [
    "gemini-3.8-flash"
  ];

  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: message }] }]
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        const reply = data.candidates?.[0]?.content?.parts
          ?.map(part => part.text || "").join("");

        if (reply) return res.status(200).json({ reply });
      }

      if (![429, 500, 503].includes(response.status)) {
        return res.status(502).json({
          error: data.error?.message || "KI-Fehler"
        });
      }
    } catch (error) {
      return res.status(502).json({ error: "Verbindung fehlgeschlagen" });
    }
  }

  return res.status(503).json({
    error: "KI ist gerade ausgelastet. Bitte erneut versuchen."
  });
};
