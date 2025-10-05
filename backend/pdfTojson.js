import pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-2.5-flash";

// Gemini call
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

// Extract text from PDF using pdfjs-dist
async function extractTextFromPdf(buffer) {
  const loadingTask = pdfjsLib.getDocument({ data: buffer });
  const pdf = await loadingTask.promise;
  let text = "";

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const strings = content.items.map(item => item.str);
    text += strings.join(" ") + "\n";
  }

  return text;
}

// Serverless handler
export default async function pdfHandler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "POST only" });
    }

    const { file } = req.body;
    if (!file) {
      return res.status(400).json({ error: "No PDF file provided (base64 expected)" });
    }

    const buffer = Buffer.from(file, "base64");
    const pdfText = await extractTextFromPdf(buffer);

    const prompt = `You are given a university course outline. 
    Extract its key information (course name, instructor, contact info, topics, grading scheme, schedule, policies, etc.)
    and return it as valid JSON.`;

    const jsonString = await callGemini(prompt, pdfText);

    res.status(200).json({ outline: jsonString });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
