import pdfHandler from "./pdfToJson.js";
import quoteHandler from "./quote.js";

export default async function handler(req, res) {
  try {
    const match = req.url.match(/^\/api\/(pdf|quote)$/);
    if (!match) return res.status(404).json({ error: "Not found" });

    const endpoint = match[1];

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    if (endpoint === "pdf") return pdfHandler(req, res);
    if (endpoint === "quote") return quoteHandler(req, res);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
