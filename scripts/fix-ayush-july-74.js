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
  // Let's verify student IDs:
  // Vivek Tiwari: id 2
  // Ayush Vishwakarma: id 6
  // Shubham Yadav: id 5

  // 1. Clear July 2026 absences for all three
  await pool.query("DELETE FROM student_absences WHERE student_id IN (2, 5, 6) AND lecture_id LIKE '2026-07-%'");

  // Generate July 2026 lectures using DS schedule
  // July 2026 weekdays (1 to 31):
  // 90 total sessions: 67 Theory, 23 Lab
  // Vivek Tiwari target: 17 Theory absences (50/67), 6 Lab absences (17/23) -> 23 total absences -> 67/90 (74.4% -> 74%)
  // Ayush Vishwakarma target: 17 Theory absences (50/67), 6 Lab absences (17/23) -> 23 total absences -> 67/90 (74.4% -> 74%)
  // Shubham Yadav target: 14 Theory absences (53/67), 5 Lab absences (18/23) -> 19 total absences -> 71/90 (78.8% -> 79%)

  // Helper to generate dynamic lectures matching store logic
  const daysInJuly = 31;
  const dsWeekly = {
    MON: [
      { id: "ds_ai", type: "theory" },
      { id: "ds_ml", type: "theory" },
      { id: "ds_cns_lab", type: "lab", batch: "A3" },
      { id: "ds_sdav", type: "theory" },
    ],
    TUE: [
      { id: "ds_uiux", type: "lab", batch: "A3" },
      { id: "ds_sdav", type: "theory" },
      { id: "ds_cns", type: "theory" },
      { id: "ds_dcst", type: "theory" },
    ],
    WED: [
      { id: "ds_sdav", type: "theory" },
      { id: "ds_cns", type: "theory" },
      { id: "ds_aiml", type: "lab", batch: "A3" },
      { id: "ds_dcst", type: "theory" },
    ],
    THU: [
      { id: "ds_ai", type: "theory" },
      { id: "ds_ml", type: "theory" },
      { id: "ds_sdav_lab", type: "lab", batch: "A3" },
      { id: "ds_cns", type: "theory" },
    ],
    FRI: [
      { id: "ds_ai", type: "theory" },
      { id: "ds_ml", type: "theory" },
      { id: "ds_dcst_lab", type: "lab", batch: "A3" },
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

  console.log(`Generated July 2026 sessions: ${theoryIds.length} Theory, ${labIds.length} Lab, ${theoryIds.length + labIds.length} Total.`);

  // Pick exact absences
  // Vivek (id 2): 17 theory, 6 lab
  const vivekTheoryAbs = theoryIds.slice(0, 17);
  const vivekLabAbs = labIds.slice(0, 6);
  const vivekAbs = [...vivekTheoryAbs, ...vivekLabAbs];

  // Ayush (id 6): 17 theory, 6 lab
  const ayushTheoryAbs = theoryIds.slice(0, 17);
  const ayushLabAbs = labIds.slice(0, 6);
  const ayushAbs = [...ayushTheoryAbs, ...ayushLabAbs];

  // Shubham (id 5): 14 theory, 5 lab
  const shubhamTheoryAbs = theoryIds.slice(0, 14);
  const shubhamLabAbs = labIds.slice(0, 5);
  const shubhamAbs = [...shubhamTheoryAbs, ...shubhamLabAbs];

  for (const lecId of vivekAbs) {
    await pool.query("INSERT INTO student_absences (student_id, lecture_id) VALUES ($1, $2)", [2, lecId]);
  }
  for (const lecId of ayushAbs) {
    await pool.query("INSERT INTO student_absences (student_id, lecture_id) VALUES ($1, $2)", [6, lecId]);
  }
  for (const lecId of shubhamAbs) {
    await pool.query("INSERT INTO student_absences (student_id, lecture_id) VALUES ($1, $2)", [5, lecId]);
  }

  console.log("Inserted exact July 2026 absence records into Supabase successfully!");
  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
