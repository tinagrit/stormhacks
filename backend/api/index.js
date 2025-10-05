import pdfHandler from "./pdfTojson.js";
import quoteHandler from "./quote.js";

export default async function handler(req, res) {
  const { url, method } = req;

  // Route: /api/pdf
  if (url.startsWith("/api/pdf") && method === "POST") {
    return pdfHandler(req, res);
  }

  // Route: /api/quote
  if (url.startsWith("/api/quote") && method === "POST") {
    return quoteHandler(req, res);
  }

  // Default: 404
  res.status(404).json({ error: "Not found" });
}
