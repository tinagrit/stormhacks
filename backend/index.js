import express from "express";
import pdfHandler from "./pdfToJson.js";
import quoteHandler from "./quote.js";

const app = express();
app.use(express.json());

// POST /api/pdf
app.post("/api/pdf", pdfHandler);

// POST /api/quote
app.post("/api/quote", quoteHandler);

// catch-all for undefined routes
app.all("*", (req, res) => {
  res.status(404).json({ error: "Not found" });
});

export default app;
