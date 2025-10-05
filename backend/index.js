import express from "express";
import serverless from "serverless-http";

const app = express();
app.use(express.json());

// Import handlers
import pdfHandler from "./pdfTojson.js";
import quoteHandler from "./quote.js";

// Routes
app.post("/pdfTojson", pdfHandler);
app.post("/quote", quoteHandler);

// Catch-all 404
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Export serverless handler
export default serverless(app);
