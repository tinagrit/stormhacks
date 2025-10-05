const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-2.5-flash";

export default async function quoteHandler(req, res) {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
    const body = {
      contents: [
        { parts: [{ text: "Give me a short, original motivational quote to inspire someone who needs to study. Just the quote." }] }
      ]
    };
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    const quote = data.candidates?.[0]?.content?.parts?.[0]?.text || "No quote generated.";
    res.json({ quote });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
