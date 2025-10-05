require("dotenv").config();
const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");

const sfucoursesRouter = require("./sfucourses");

const app = express();

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-2.5-flash";

// Middleware to parse JSON
app.use(express.json());

app.use(cors({
  origin: "https://stormhacks.tinagrit.com"
}))

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
app.get("/api/quote", async (req, res) => {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
    const body = {
      contents: [
        { parts: [{ text: "Give me a short, original motivational quote to inspire and reward someone with who just finished studying but needs to still study more. No formatting of any sorts, I just want the quote." }] }
      ]
    };
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    const quote = data.candidates?.[0]?.content?.parts?.[0]?.text || "No quote generated.";
    res.json({ quote });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.use("/api/sfucourses", sfucoursesRouter);

// Catch-all for other routes
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Export as serverless handler
module.exports = app;
module.exports.handler = serverless(app);
