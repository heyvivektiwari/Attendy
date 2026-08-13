const pg = require("pg");
const fs = require("fs");
const path = require("path");

const envPath = path.resolve(__dirname, "..", ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
envContent.split("\n").forEach((line) => {
  const idx = line.indexOf("=");
  if (idx > 0 && !line.trim().startsWith("#")) {
    const key = line.substring(0, idx).trim();
    let val = line.substring(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
});

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  // Kill/wait or clear existing July absences for 2 (Vivek), 6 (Ayush), 5 (Shubham)
  await pool.query("DELETE FROM student_absences WHERE student_id IN (2, 5, 6) AND lecture_id LIKE '2026-07-%'");

  // Generate exact July lecture IDs matching store dsWeeklyTimetable
  const daysInJuly = 31;
  const dsWeekly = {
    MON: [
      { id: "ds_ai", type: "theory" },
      { id: "ds_ml", type: "theory" },
      { id: "ds_cns_lab", type: "lab" },
      { id: "ds_sdav", type: "theory" },
    ],
    TUE: [
      { id: "ds_uiux", type: "lab" },
      { id: "ds_sdav", type: "theory" },
      { id: "ds_cns", type: "theory" },
      { id: "ds_dcst", type: "theory" },
    ],
    WED: [
      { id: "ds_sdav", type: "theory" },
      { id: "ds_cns", type: "theory" },
      { id: "ds_aiml", type: "lab" },
      { id: "ds_dcst", type: "theory" },
    ],
    THU: [
      { id: "ds_ai", type: "theory" },
      { id: "ds_ml", type: "theory" },
      { id: "ds_sdav_lab", type: "lab" },
      { id: "ds_cns", type: "theory" },
    ],
    FRI: [
      { id: "ds_ai", type: "theory" },
      { id: "ds_ml", type: "theory" },
      { id: "ds_dcst_lab", type: "lab" },
      { id: "ds_dcst", type: "theory" },
    ],
  };

  const dayCodes = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const theoryIds = [];
  const labIds = [];

  for (let day = 1; day <= daysInJuly; day++) {
    const date = new Date(2026, 6, day);
    const dayCode = dayCodes[date.getDay()];
    const slots = dsWeekly[dayCode];
    if (!slots) continue;

    const dateStr = `2026-07-${String(day).padStart(2, '0')}`;
    slots.forEach((slot, idx) => {
      const lectureId = `${dateStr}-${dayCode}-${slot.id}-${idx}`;
      if (slot.type === "lab") {
        labIds.push(lectureId);
      } else {
        theoryIds.push(lectureId);
      }
    });
  }

  // Vivek (id 2): 17 Theory absences, 6 Lab absences -> 67/90 (74.4% -> 74%)
  // Ayush (id 6): 17 Theory absences, 6 Lab absences -> 67/90 (74.4% -> 74%)
  // Shubham (id 5): 14 Theory absences, 5 Lab absences -> 71/90 (78.8% -> 79%)

  const rows = [];
  // Vivek
  theoryIds.slice(0, 17).forEach(id => rows.push(`(2, '${id}')`));
  labIds.slice(0, 6).forEach(id => rows.push(`(2, '${id}')`));

  // Ayush
  theoryIds.slice(0, 17).forEach(id => rows.push(`(6, '${id}')`));
  labIds.slice(0, 6).forEach(id => rows.push(`(6, '${id}')`));

  // Shubham
  theoryIds.slice(0, 14).forEach(id => rows.push(`(5, '${id}')`));
  labIds.slice(0, 5).forEach(id => rows.push(`(5, '${id}')`));

  const query = `INSERT INTO student_absences (student_id, lecture_id) VALUES ${rows.join(", ")}`;
  await pool.query(query);

  console.log("Successfully batch-inserted July 2026 absences!");
  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
