// backend.js
// Node.js + Express server for SFU Course Outlines API proxy

const express = require("express");
const fetch = require("node-fetch");
const path = require('path');
const cors = require("cors");

// -----------------------------------------------------------------------------
// CONFIGURATION
// -----------------------------------------------------------------------------
const router = express.Router();
const PORT = process.env.PORT || 4000;
const BASE_URL = "http://www.sfu.ca/bin/wcm/course-outlines";

// Enable CORS so frontend (e.g., localhost:5173) can access it
// router.use(cors());

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

// Global ID tracker
let appendCounter = 0;

// --- Routes ---

router.use(cors())

router.get("/years", async (req, res) => {
  try {
    const data = await cachedFetch(BASE_URL);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch years" });
  }
});

router.get("/terms", async (req, res) => {
  const { year } = req.query;
  if (!year) return res.status(400).json({ error: "Missing ?year" });

  try {
    const data = await cachedFetch(`${BASE_URL}?${encodeURIComponent(year)}`);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch terms" });
  }
});

router.get("/departments", async (req, res) => {
  const { year, term } = req.query;
  if (!year || !term) return res.status(400).json({ error: "Missing ?year or ?term" });

  try {
    const data = await cachedFetch(`${BASE_URL}?${encodeURIComponent(year)}/${encodeURIComponent(term)}`);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch departments" });
  }
});

router.get("/courses", async (req, res) => {
  const { year, term, dept } = req.query;
  if (!year || !term || !dept) return res.status(400).json({ error: "Missing ?year, ?term, or ?dept" });

  try {
    const data = await cachedFetch(`${BASE_URL}?${encodeURIComponent(year)}/${encodeURIComponent(term)}/${encodeURIComponent(dept)}`);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});

router.get("/sections", async (req, res) => {
  const { year, term, dept, course } = req.query;
  if (!year || !term || !dept || !course) return res.status(400).json({ error: "Missing parameters" });

  try {
    const data = await cachedFetch(`${BASE_URL}?${encodeURIComponent(year)}/${encodeURIComponent(term)}/${encodeURIComponent(dept)}/${encodeURIComponent(course)}`);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch sections" });
  }
});

// --- New /outline route that returns events in your desired JSON ---
router.get("/outline", async (req, res) => {
  const { year, term, dept, course, section } = req.query;
  if (!year || !term || !dept || !course || !section)
    return res.status(400).json({ error: "Missing parameters" });

  try {
    const data = await cachedFetch(`${BASE_URL}?${encodeURIComponent(year)}/${encodeURIComponent(term)}/${encodeURIComponent(dept)}/${encodeURIComponent(course)}/${encodeURIComponent(section)}`);
    const courseSchedule = data.courseSchedule;
    const info = data.info;

    console.log(courseSchedule);

    // Prepare JSON object
    const appendID = appendCounter++;
    let subID = 0;
    const events = [];

    // SFU API usually has a 'meetings' array for section events
    if (data.courseSchedule) {
      data.courseSchedule.forEach(ev => {
        // TODO: for however many of each weekday, keep going from range start date to end date 
        const calcStartEpoch = new Date(`${"2025-09-03"}T${ev.startTime}:00`).getTime();
        const calcEndEpoch = new Date(`${"2025-09-03"}T${ev.endTime}:00`).getTime();
        events.push({
          ID: appendID,
          subID: subID++,
          type: ev.sectionCode || "",
          startEpoch: calcStartEpoch,
          endEpoch: calcEndEpoch,
          elapsed: calcEndEpoch - calcStartEpoch
        });
      });
    }

    res.json({ sem: `${term} ${year}`, info, events});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch course outline" });
  }
});

module.exports = router;
