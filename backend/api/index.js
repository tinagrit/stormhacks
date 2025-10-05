export default async function handler(req, res) {
  const path = req.url.replace(/\/$/, ""); 

  if (path === "/api/pdf") {
    const { default: pdfHandler } = await import("./pdf.js");
    return pdfHandler(req, res);
  }

  if (path === "/api/quote") {
    const { default: quoteHandler } = await import("./quote.js");
    return quoteHandler(req, res);
  }

  res.status(404).json({ error: "Not found" });
}
