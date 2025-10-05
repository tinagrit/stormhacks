export default async function handler(req, res) {
  const url = req.url.replace(/\/$/, ""); 

  if (url === "/api/pdfTojson") {
    const { default: pdfHandler } = await import("../pdfTojson.js");
    return pdfHandler(req, res);
  }

  if (url === "/api/quote") {
    const { default: quoteHandler } = await import("../quote.js");
    return quoteHandler(req, res);
  }


  res.status(404).json({ error: "Not found" });
}
