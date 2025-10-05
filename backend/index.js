// backend/index.js
export default async function handler(req, res) {
  try {
    console.log("Request received:", req.method, req.url);

    // Only allow POST
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed. Use POST." });
    }

    // Normalize URL (remove query params)
    const pathname = req.url.split("?")[0];

    // Route /api/pdf
    if (pathname === "/api/pdf") {
      const { default: pdfHandler } = await import("./pdfToJson.js");
      return pdfHandler(req, res);
    }

    // Route /api/quote
    if (pathname === "/api/quote") {
      const { default: quoteHandler } = await import("./quote.js");
      return quoteHandler(req, res);
    }

    // Fallback
    res.status(404).json({ error: "Not found" });
  } catch (err) {
    console.error("Handler error:", err);
    res.status(500).json({ error: err.message });
  }
}
