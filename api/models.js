module.exports = async (req, res) => {
  const key = process.env.GEMINI_API_KEY;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`
  );

  const data = await response.json();

  if (!response.ok) {
    return res.status(500).json({ error: data.error?.message });
  }

  const models = (data.models || [])
    .filter(m => m.supportedGenerationMethods?.includes("generateContent"))
    .map(m => m.name);

  res.status(200).json({ models });
};