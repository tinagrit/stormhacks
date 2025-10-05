// backend.js
// Node.js + Express server for SFU Course Outlines API proxy

const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const path = require('path');

// -----------------------------------------------------------------------------
// CONFIGURATION
// -----------------------------------------------------------------------------
const router = express.Router();
const PORT = process.env.PORT || 4000;
const BASE_URL = "http://www.sfu.ca/bin/wcm/course-outlines";

// Enable CORS so frontend (e.g., localhost:5173) can access it
router.use(cors());

// Optional: simple in-memory cache to reduce repeated API calls
// cache[key] = { data, timestamp }
const cache = {};
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

// Helper to fetch with caching
async function cachedFetch(url) {
  const now = Date.now();
  const entry = cache[url];
  if (entry && now - entry.timestamp < CACHE_TTL) {
    return entry.data;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`SFU API error: ${response.status}`);
  }

  const data = await response.json();
  cache[url] = { data, timestamp: now };
  return data;
}

// -----------------------------------------------------------------------------
// ROUTES
// -----------------------------------------------------------------------------

router.get("/", async (req,res)=> {
  res.sendFile(path.join(__dirname, 'public_html', 'sfucourses.html'));
})

// 1️⃣ Get available years
router.get("/years", async (req, res) => {
  try {
    const url = BASE_URL;
    const data = await cachedFetch(url);
    res.json(data);
  } catch (err) {
    console.error("Error fetching years:", err);
    res.status(500).json({ error: "Failed to fetch years" });
  }
});

// 2️⃣ Get available terms for a year
router.get("/terms", async (req, res) => {
  const year = (req.query.year || "").trim();
  if (!year) return res.status(400).json({ error: "Missing ?year parameter" });

  try {
    const url = `${BASE_URL}?${encodeURIComponent(year)}`;
    const data = await cachedFetch(url);
    res.json(data);
  } catch (err) {
    console.error("Error fetching terms:", err);
    res.status(500).json({ error: "Failed to fetch terms" });
  }
});

// 3️⃣ Get departments for a given year + term
router.get("/departments", async (req, res) => {
  const { year = "", term = "" } = req.query;
  if (!year || !term)
    return res.status(400).json({ error: "Missing ?year or ?term parameter" });

  try {
    const url = `${BASE_URL}?${encodeURIComponent(year)}/${encodeURIComponent(
      term.toLowerCase()
    )}`;
    const data = await cachedFetch(url);
    res.json(data);
  } catch (err) {
    console.error("Error fetching departments:", err);
    res.status(500).json({ error: "Failed to fetch departments" });
  }
});

// 4️⃣ Get course numbers for a department
router.get("/courses", async (req, res) => {
  const { year = "", term = "", dept = "" } = req.query;
  if (!year || !term || !dept)
    return res
      .status(400)
      .json({ error: "Missing ?year, ?term, or ?dept parameter" });

  try {
    const url = `${BASE_URL}?${encodeURIComponent(year)}/${encodeURIComponent(
      term.toLowerCase()
    )}/${encodeURIComponent(dept.toLowerCase())}`;
    const data = await cachedFetch(url);
    res.json(data);
  } catch (err) {
    console.error("Error fetching courses:", err);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});

// 5️⃣ Get sections for a specific course
router.get("/sections", async (req, res) => {
  const { year = "", term = "", dept = "", course = "" } = req.query;
  if (!year || !term || !dept || !course)
    return res
      .status(400)
      .json({ error: "Missing ?year, ?term, ?dept, or ?course parameter" });

  try {
    const url = `${BASE_URL}?${encodeURIComponent(year)}/${encodeURIComponent(
      term.toLowerCase()
    )}/${encodeURIComponent(dept.toLowerCase())}/${encodeURIComponent(course)}`;
    const data = await cachedFetch(url);
    res.json(data);
  } catch (err) {
    console.error("Error fetching sections:", err);
    res.status(500).json({ error: "Failed to fetch sections" });
  }
});

// (optional) 6️⃣ Get specific section outline
router.get("/outline", async (req, res) => {
  const { year = "", term = "", dept = "", course = "", section = "" } =
    req.query;
  if (!year || !term || !dept || !course || !section)
    return res.status(400).json({
      error: "Missing ?year, ?term, ?dept, ?course, or ?section parameter",
    });

  try {
    const url = `${BASE_URL}?${encodeURIComponent(year)}/${encodeURIComponent(
      term.toLowerCase()
    )}/${encodeURIComponent(dept.toLowerCase())}/${encodeURIComponent(
      course
    )}/${encodeURIComponent(section.toLowerCase())}`;
    const data = await cachedFetch(url);
    res.json(data);
  } catch (err) {
    console.error("Error fetching outline:", err);
    res.status(500).json({ error: "Failed to fetch course outline" });
  }
});

module.exports = router;
