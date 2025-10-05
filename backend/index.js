import express from "express";
import serverless from "serverless-http";

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Route for PDF
app.post("/api/pdf", async (req, res) => {
  try {
    const { default: pdfHandler } = await import("./pdfTojson.js");
    return pdfHandler(req, res);
  } catch (err) {
    console.error("PDF handler error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Route for Quote
app.post("/api/quote", async (req, res) => {
  try {
    const { default: quoteHandler } = await import("./quote.js");
    return quoteHandler(req, res);
  } catch (err) {
    console.error("Quote handler error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Catch-all for other routes
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Export as serverless handler
export default serverless(app);
