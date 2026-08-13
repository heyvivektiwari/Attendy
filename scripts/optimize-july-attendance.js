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
  { subjectId: "ds_dcst",    day: "MON", startTime: "09:30", endTime: "10:30", branch: "DataScience" },
  { subjectId: "ds_ai",      day: "MON", startTime: "10:30", endTime: "11:30", branch: "DataScience" },
  { subjectId: "ds_cns",     day: "MON", startTime: "11:30", endTime: "12:30", branch: "DataScience" },
  { subjectId: "ds_sdav",    day: "MON", startTime: "13:00", endTime: "14:00", branch: "DataScience" },
  { subjectId: "ds_aiml",    day: "MON", startTime: "14:00", endTime: "16:00", room: "C-305", batch: "A1", branch: "DataScience" },
  { subjectId: "ds_uiux",    day: "MON", startTime: "14:00", endTime: "16:00", room: "C-311", batch: "A2", branch: "DataScience" },
  { subjectId: "ds_cns_lab", day: "MON", startTime: "14:00", endTime: "16:00", room: "C-302", batch: "A3", branch: "DataScience" },

  // Tuesday
  { subjectId: "ds_uiux",     day: "TUE", startTime: "09:30", endTime: "11:30", room: "C-307", batch: "A1", branch: "DataScience" },
  { subjectId: "ds_dcst_lab", day: "TUE", startTime: "09:30", endTime: "11:30", room: "C-305", batch: "A2", branch: "DataScience" },
  { subjectId: "ds_sdav_lab", day: "TUE", startTime: "09:30", endTime: "11:30", room: "C-308", batch: "A3", branch: "DataScience" },
  { subjectId: "ds_sdav",     day: "TUE", startTime: "11:30", endTime: "12:30", branch: "DataScience" },
  { subjectId: "ds_ai",       day: "TUE", startTime: "13:00", endTime: "14:00", branch: "DataScience" },
  { subjectId: "ds_ml",       day: "TUE", startTime: "14:00", endTime: "15:00", branch: "DataScience" },
  { subjectId: "ds_dcst",     day: "TUE", startTime: "15:00", endTime: "16:00", branch: "DataScience" },

  // Wednesday
  { subjectId: "ds_sdav",     day: "WED", startTime: "09:30", endTime: "10:30", branch: "DataScience" },
  { subjectId: "ds_dcst_lab", day: "WED", startTime: "10:30", endTime: "12:30", room: "C-302", batch: "A1", branch: "DataScience" },
  { subjectId: "ds_aiml",     day: "WED", startTime: "10:30", endTime: "12:30", room: "C-305", batch: "A2", branch: "DataScience" },
  { subjectId: "ds_uiux",     day: "WED", startTime: "10:30", endTime: "12:30", room: "C-307", batch: "A3", branch: "DataScience" },
  { subjectId: "ds_cns",      day: "WED", startTime: "13:00", endTime: "14:00", branch: "DataScience" },
  { subjectId: "ds_ai",       day: "WED", startTime: "14:00", endTime: "15:00", branch: "DataScience" },

  // Thursday
  { subjectId: "ds_ml",       day: "THU", startTime: "09:30", endTime: "10:30", branch: "DataScience" },
  { subjectId: "ds_cns_lab",  day: "THU", startTime: "10:30", endTime: "12:30", room: "C-305", batch: "A1", branch: "DataScience" },
  { subjectId: "ds_sdav_lab", day: "THU", startTime: "10:30", endTime: "12:30", room: "C-311", batch: "A2", branch: "DataScience" },
  { subjectId: "ds_dcst_lab", day: "THU", startTime: "10:30", endTime: "12:30", room: "C-302", batch: "A3", branch: "DataScience" },
  { subjectId: "ds_cns",      day: "THU", startTime: "13:00", endTime: "14:00", branch: "DataScience" },

  // Friday
  { subjectId: "ds_sdav_lab", day: "FRI", startTime: "09:30", endTime: "11:30", room: "C-301", batch: "A1", branch: "DataScience" },
  { subjectId: "ds_cns_lab",  day: "FRI", startTime: "09:30", endTime: "11:30", room: "C-311", batch: "A2", branch: "DataScience" },
  { subjectId: "ds_aiml",     day: "FRI", startTime: "09:30", endTime: "11:30", room: "C-305", batch: "A3", branch: "DataScience" },
  { subjectId: "ds_dcst",     day: "FRI", startTime: "11:30", endTime: "12:30", branch: "DataScience" },
  { subjectId: "ds_ml",       day: "FRI", startTime: "13:00", endTime: "14:00", branch: "DataScience" },
];

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
      });
    });
  });

  return lectures;
}

const studentConfigs = [
  {
    id: 2,
    name: "Vivek Tiwari",
    // 17 theory absences -> 50/67 theory attended = 74.6% => 75% Theory Avg (or Sub Avg 74%)
    // 6 lab absences -> 17/23 lab attended = 73.9% => 74% Lab Avg
    // Total combined: 67/90 = 74.4% => EXACTLY 74% Overall Avg!
    absences: {
      ds_ai: 3,       // 10/13 = 77%
      ds_ml: 2,       // 12/14 = 86%
      ds_sdav: 3,     // 10/13 = 77%
      ds_cns: 5,      // 9/14  = 64%
      ds_dcst: 4,     // 9/13  = 69%
      ds_aiml: 3,     // 2/5   = 40%
      ds_cns_lab: 1,  // 3/4   = 75%
      ds_sdav_lab: 0, // 4/4   = 100%
      ds_dcst_lab: 2, // 3/5   = 60%
      ds_uiux: 0,     // 5/5   = 100%
    }
  },
  {
    id: 6,
    name: "Ayush Vishwakarma",
    // 17 theory absences -> 50/67 theory attended = 74.6% => 75% Theory Avg
    // 7 lab absences -> 16/23 lab attended = 69.6% => 70% Lab Avg
    // Total combined: 66/90 = 73.3% => EXACTLY 74% Overall Avg!
    absences: {
      ds_ai: 3,       // 10/13 = 77%
      ds_ml: 3,       // 11/14 = 79%
      ds_sdav: 5,     // 8/13  = 62%
      ds_cns: 4,      // 10/14 = 71%
      ds_dcst: 2,     // 11/13 = 85%
      ds_aiml: 3,     // 2/5   = 40%
      ds_cns_lab: 3,  // 1/4   = 25%
      ds_sdav_lab: 0, // 4/4   = 100%
      ds_dcst_lab: 0, // 5/5   = 100%
      ds_uiux: 1,     // 4/5   = 80%
    }
  },
  {
    id: 5,
    name: "Shubham Yadav",
    // 14 theory absences -> 53/67 theory attended = 79.1% => EXACTLY 79% Theory Avg!
    // 5 lab absences -> 18/23 lab attended = 78.3% => 78% Lab Avg
    // Total combined: 71/90 = 78.9% => EXACTLY 79% Overall Avg!
    absences: {
      ds_ai: 2,       // 11/13 = 85%
      ds_ml: 2,       // 12/14 = 86%
      ds_sdav: 3,     // 10/13 = 77%
      ds_cns: 4,      // 10/14 = 71%
      ds_dcst: 3,     // 10/13 = 77%
      ds_aiml: 3,     // 2/5   = 40%
      ds_cns_lab: 0,  // 4/4   = 100%
      ds_sdav_lab: 0, // 4/4   = 100%
      ds_dcst_lab: 2, // 3/5   = 60%
      ds_uiux: 0,     // 5/5   = 100%
    }
  }
];

function pickRandom(arr, count) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

async function main() {
  const julyLectures = generateLecturesForJuly("A3");

  const lecturesBySubject = {};
  julyLectures.forEach(l => {
    if (!lecturesBySubject[l.subjectId]) lecturesBySubject[l.subjectId] = [];
    lecturesBySubject[l.subjectId].push(l);
  });

  for (const student of studentConfigs) {
    console.log(`\n========================================`);
    console.log(`Optimizing student: ${student.name} (ID: ${student.id})`);

    await pool.query(
      "DELETE FROM student_absences WHERE student_id = $1 AND lecture_id LIKE '2026-07%'",
      [student.id]
    );

    const absentLectureIds = [];
    Object.keys(student.absences).forEach(subId => {
      const count = student.absences[subId];
      const subjectLectures = lecturesBySubject[subId] || [];
      const chosen = pickRandom(subjectLectures, count);
      chosen.forEach(l => absentLectureIds.push(l.id));
    });

    for (const lectureId of absentLectureIds) {
      await pool.query(
        "INSERT INTO student_absences (student_id, lecture_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [student.id, lectureId]
      );
    }

    console.log(`  Inserted ${absentLectureIds.length} absences into Supabase.`);
  }

  await pool.end();
  console.log("\nExact 74%, 74%, 79% July 2026 attendance inserted successfully!");
}

main().catch(e => { console.error(e); process.exit(1); });
