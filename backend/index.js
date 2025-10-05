import express from "express";
import serverless from "serverless-http";

import pdfHandler from "./pdfToJson.js";
import quoteHandler from "./quote.js";

const app = express();
app.use(express.json({ limit: "10mb" })); // support JSON body

// Routes
app.post("/api/pdf", pdfHandler);
app.get("/api/quote", quoteHandler); // can also be POST if needed

// Fallback
app.all("*", (req, res) => res.status(404).json({ error: "Not found" }));

export const handler = serverless(app);
