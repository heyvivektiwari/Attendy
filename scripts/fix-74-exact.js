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

const dsWeeklyTimetable = [
  // Monday
  { subjectId: "ds_ai",       day: "MON", startTime: "09:30", endTime: "10:30", branch: "DataScience" },
  { subjectId: "ds_ml",       day: "MON", startTime: "10:30", endTime: "11:30", branch: "DataScience" },
  { subjectId: "ds_cns_lab", day: "MON", startTime: "11:30", endTime: "13:30", room: "C-302", batch: "A3", branch: "DataScience" },
  { subjectId: "ds_sdav",    day: "MON", startTime: "14:00", endTime: "15:00", branch: "DataScience" },

  // Tuesday
  { subjectId: "ds_uiux",     day: "TUE", startTime: "09:30", endTime: "11:30", room: "C-307", batch: "A3", branch: "DataScience" },
  { subjectId: "ds_sdav",     day: "TUE", startTime: "11:30", endTime: "12:30", branch: "DataScience" },
  { subjectId: "ds_cns",      day: "TUE", startTime: "13:00", endTime: "14:00", branch: "DataScience" },
  { subjectId: "ds_dcst",     day: "TUE", startTime: "14:00", endTime: "15:00", branch: "DataScience" },

  // Wednesday
  { subjectId: "ds_sdav",     day: "WED", startTime: "09:30", endTime: "10:30", branch: "DataScience" },
  { subjectId: "ds_cns",      day: "WED", startTime: "10:30", endTime: "11:30", branch: "DataScience" },
  { subjectId: "ds_aiml",     day: "WED", startTime: "11:30", endTime: "13:30", room: "C-305", batch: "A3", branch: "DataScience" },
  { subjectId: "ds_dcst",     day: "WED", startTime: "14:00", endTime: "15:00", branch: "DataScience" },

  // Thursday
  { subjectId: "ds_ai",       day: "THU", startTime: "09:30", endTime: "10:30", branch: "DataScience" },
  { subjectId: "ds_ml",       day: "THU", startTime: "10:30", endTime: "11:30", branch: "DataScience" },
  { subjectId: "ds_sdav_lab", day: "THU", startTime: "11:30", endTime: "13:30", room: "C-311", batch: "A3", branch: "DataScience" },
  { subjectId: "ds_cns",      day: "THU", startTime: "14:00", endTime: "15:00", branch: "DataScience" },

  // Friday
  { subjectId: "ds_ai",       day: "FRI", startTime: "09:30", endTime: "10:30", branch: "DataScience" },
  { subjectId: "ds_ml",       day: "FRI", startTime: "10:30", endTime: "11:30", branch: "DataScience" },
  { subjectId: "ds_dcst_lab", day: "FRI", startTime: "11:30", endTime: "13:30", room: "C-302", batch: "A3", branch: "DataScience" },
  { subjectId: "ds_dcst",     day: "FRI", startTime: "14:00", endTime: "15:00", branch: "DataScience" },
];

const labSubjectIds = ["ds_uiux", "ds_aiml", "ds_cns_lab", "ds_sdav_lab", "ds_dcst_lab"];

function getWeekdaysInMonth(month, year) {
  const dates = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      dates.push(date);
    }
  }
  return dates;
}

const dayCodeMap = { 1: "MON", 2: "TUE", 3: "WED", 4: "THU", 5: "FRI" };

function generateLecturesForJuly(selectedBatch = "A3") {
  const month = 6;
  const year = 2026;
  const weekdays = getWeekdaysInMonth(month, year);
  const lectures = [];

  weekdays.forEach((date) => {
    const dayCode = dayCodeMap[date.getDay()];
    if (!dayCode) return;
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const dayLectures = dsWeeklyTimetable.filter(l => l.day === dayCode);

    dayLectures.forEach((lecture, index) => {
      if (lecture.batch && lecture.batch !== selectedBatch) return;
      const id = `${dateStr}-${lecture.day}-${lecture.subjectId}-${index}`;
      lectures.push({
        id,
        subjectId: lecture.subjectId,
        isLab: labSubjectIds.includes(lecture.subjectId)
      });
    });
  });

  return lectures;
}

async function main() {
  await pool.query("DELETE FROM student_absences WHERE student_id IN (2, 5, 6) AND lecture_id LIKE '2026-07-%'");

  const julyLectures = generateLecturesForJuly("A3");
  const theoryIds = julyLectures.filter(l => !l.isLab).map(l => l.id);
  const labIds = julyLectures.filter(l => l.isLab).map(l => l.id);

  // Total sessions: 69 Theory, 23 Lab -> 92 Total
  // Vivek (id 2): 18 Theory absences, 6 Lab absences -> 51/69 (74%) Theory, 17/23 (74%) Lab -> 68/92 (73.9% -> 74%) Overall
  // Ayush (id 6): 18 Theory absences, 6 Lab absences -> 51/69 (74%) Theory, 17/23 (74%) Lab -> 68/92 (73.9% -> 74%) Overall
  // Shubham (id 5): 14 Theory absences, 5 Lab absences -> 55/69 (80%) Theory, 18/23 (78%) Lab -> 73/92 (79.3% -> 79%) Overall

  const rows = [];
  // Vivek
  theoryIds.slice(0, 18).forEach(id => rows.push(`(2, '${id}')`));
  labIds.slice(0, 6).forEach(id => rows.push(`(2, '${id}')`));

  // Ayush
  theoryIds.slice(0, 18).forEach(id => rows.push(`(6, '${id}')`));
  labIds.slice(0, 6).forEach(id => rows.push(`(6, '${id}')`));

  // Shubham
  theoryIds.slice(0, 14).forEach(id => rows.push(`(5, '${id}')`));
  labIds.slice(0, 5).forEach(id => rows.push(`(5, '${id}')`));

  const query = `INSERT INTO student_absences (student_id, lecture_id) VALUES ${rows.join(", ")}`;
  await pool.query(query);

  console.log("Successfully set exact 74%, 74%, 79% July absences in Supabase!");
  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
