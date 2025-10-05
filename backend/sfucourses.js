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

    // console.log(courseSchedule);

    // Prepare JSON object
    const appendID = appendCounter++;
    let subID = 0;
    const events = [];

    // SFU API usually has a 'meetings' array for section events
    if (data.courseSchedule) {
      data.courseSchedule.forEach(ev => {
        // Usage
        const startDate = ev.startDate;
        const endDate = ev.endDate;
        const daysOfWeek = ev.days;  

        const classDays = getDatesBetween(startDate, endDate, daysOfWeek);
        
        classDays.forEach(day => {
          const dateOnly = day.toISOString().split("T")[0];
          const calcStartEpoch = new Date(`${dateOnly}T${normalizeTime(ev.startTime)}:00`).getTime();
          const calcEndEpoch = new Date(`${dateOnly}T${normalizeTime(ev.endTime)}:00`).getTime();

          events.push({
            ID: appendID,
            subID: subID++,
            type: ev.sectionCode || "",
            startEpoch: calcStartEpoch,
            endEpoch: calcEndEpoch,
            elapsed: calcEndEpoch - calcStartEpoch
          });
        })
      });
    }

    res.json({ sem: `${term} ${year}`, info, courseSchedule, events});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch course outline" });
  }
});

module.exports = router;

// Function to iterate through dates and return matching days (We, Fr)
function getDatesBetween(startDateStr, endDateStr, days) {
    const startDate = new Date(startDateStr); // Parse the start date
    const endDate = new Date(endDateStr); // Parse the end date

    const daysOfWeek = {  // Mapping for day names to number
        "Su": 0,
        "Mo": 1,
        "Tu": 2,
        "We": 3,
        "Th": 4,
        "Fr": 5,
        "Sa": 6
    };

    // Split the `days` string and convert to an array of day numbers
    const targetDays = days.split(',').map(day => day.trim()).map(day => daysOfWeek[day]);

    let dates = [];
    let currentDate = new Date(startDate);

    // Loop through all dates from startDate to endDate
    while (currentDate <= endDate) {
        // If the current day matches one of the target days, add it to the list
        if (targetDays.includes(currentDate.getDay())) {
            dates.push(new Date(currentDate));  // Store a copy of the date
        }
        currentDate.setDate(currentDate.getDate() + 1);  // Increment by one day
    }

    return dates;
}

function normalizeTime(t) {
  // Handles "9:30" → "09:30", "10:05" → "10:05"
  const [h, m] = t.split(":");
  return `${h.padStart(2, "0")}:${m}`;
}





