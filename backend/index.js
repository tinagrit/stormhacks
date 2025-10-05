import express from "express";
import serverless from "serverless-http";
import pdfHandler from "./pdfToJson.js";
import quoteHandler from "./quote.js";

const app = express();
app.use(express.json());

// PDF endpoint (POST only)
app.post("/api/pdf", pdfHandler);

// Quote endpoint (GET + POST)
app.get("/api/quote", quoteHandler);
app.post("/api/quote", quoteHandler);

// Catch-all
app.use((req, res) => res.status(404).json({ error: "not found" }));

export default serverless(app);
