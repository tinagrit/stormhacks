import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-2.5-flash";

async function callGemini(prompt, text) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

  const body = {
    contents: [{ parts: [{ text: `${prompt}\n\n${text}` }] }]
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
}

export default async function pdfHandler(req, res) {
  try {
    const { file } = req.body;
    if (!file) {
      return res.status(400).json({ error: "No PDF file provided (base64 expected)" });
    }

    const buffer = Buffer.from(file, "base64");
    const pdfData = await pdf(buffer);

    const prompt = `You are given a university course outline. 
    Extract its key information (course name, instructor, contact info, topics, grading scheme, schedule, policies, etc.)
    and return it as valid JSON.`;

    const jsonString = await callGemini(prompt, pdfData.text);

    res.status(200).json({ outline: jsonString });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
