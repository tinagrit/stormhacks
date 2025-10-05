import pdfHandler from "./pdfToJson.js";
import quoteHandler from "./quote.js";

export default async function handler(req, res) {
  try {
    console.log("Request received:", req.method, req.url);

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed. Use POST." });
    }

    // Use Vercel routes to decide which handler
    if (req.url === "/api/pdf") {
      return pdfHandler(req, res);
    }
    if (req.url === "/api/quote") {
      return quoteHandler(req, res);
    }

    res.status(404).json({ error: "Not found" });
  } catch (err) {
    console.error("Handler error:", err);
    res.status(500).json({ error: err.message });
  }
}
