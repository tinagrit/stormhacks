// frontend/script.js

const backendURL = "http://localhost:3000"; // your backend server
const output = document.getElementById("output");

const yearSelect = document.getElementById("yearSelect");
const termSelect = document.getElementById("termSelect");
const deptSelect = document.getElementById("deptSelect");
const courseSelect = document.getElementById("courseSelect");
const sectionSelect = document.getElementById("sectionSelect");
const confirmBtn = document.getElementById("confirmBtn");

// Utility: Populate a <select> with options
function fillDropdown(select, data, key = "text") {
  select.innerHTML = "";
  const defaultOption = document.createElement("option");
  defaultOption.textContent = "-- select --";
  defaultOption.value = "";
  select.appendChild(defaultOption);

  data.forEach((item) => {
    const opt = document.createElement("option");
    opt.value = item.value || item.text || item[key];
    opt.textContent = item.text || item.value || item[key];
    select.appendChild(opt);
  });
}

// 1️⃣ Load years on startup
async function loadYears() {
  const res = await fetch(`${backendURL}/years`);
  const data = await res.json();
  fillDropdown(yearSelect, data);
}

yearSelect.addEventListener("change", async () => {
  const year = yearSelect.value;
  if (!year) return;
  const res = await fetch(`${backendURL}/terms?year=${year}`);
  const data = await res.json();
  fillDropdown(termSelect, data);
});

termSelect.addEventListener("change", async () => {
  const year = yearSelect.value;
  const term = termSelect.value;
  if (!term) return;
  const res = await fetch(`${backendURL}/departments?year=${year}&term=${term}`);
  const data = await res.json();
  fillDropdown(deptSelect, data);
});

deptSelect.addEventListener("change", async () => {
  const year = yearSelect.value;
  const term = termSelect.value;
  const dept = deptSelect.value;
  if (!dept) return;
  const res = await fetch(`${backendURL}/courses?year=${year}&term=${term}&dept=${dept}`);
  const data = await res.json();
  fillDropdown(courseSelect, data);
});

courseSelect.addEventListener("change", async () => {
  const year = yearSelect.value;
  const term = termSelect.value;
  const dept = deptSelect.value;
  const course = courseSelect.value;
  if (!course) return;
  const res = await fetch(`${backendURL}/sections?year=${year}&term=${term}&dept=${dept}&course=${course}`);
  const data = await res.json();
  fillDropdown(sectionSelect, data);
});

// Confirm selection
confirmBtn.addEventListener("click", async () => {
  const year = yearSelect.value;
  const term = termSelect.value;
  const dept = deptSelect.value;
  const course = courseSelect.value;
  const section = sectionSelect.value;

  if (!year || !term || !dept || !course || !section) {
    alert("Please select all fields before confirming!");
    return;
  }

  output.textContent = "Loading course info...";

  try {
    const res = await fetch(
      `${backendURL}/outline?year=${year}&term=${term}&dept=${dept}&course=${course}&section=${section}`
    );
    const data = await res.json();
    output.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    output.textContent = "Error fetching course outline.";
    console.error(err);
  }
});

// Run initial load
loadYears();
