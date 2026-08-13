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

// Import exact dsWeeklyTimetable matching attendance-store.ts
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
  const julyLectures = generateLecturesForJuly("A3");

  const students = [
    { id: 2, name: "Vivek Tiwari" },
    { id: 6, name: "Ayush Vishwakarma" },
    { id: 5, name: "Shubham Yadav" },
  ];

  for (const student of students) {
    const absencesRes = await pool.query(
      "SELECT lecture_id FROM student_absences WHERE student_id = $1 AND lecture_id LIKE '2026-07%'",
      [student.id]
    );
    const absentSet = new Set(absencesRes.rows.map(r => r.lecture_id));

    let theoryTotal = 0, theoryAttended = 0;
    let labTotal = 0, labAttended = 0;

    julyLectures.forEach(l => {
      const isAbsent = absentSet.has(l.id);
      if (l.isLab) {
        labTotal++;
        if (!isAbsent) labAttended++;
      } else {
        theoryTotal++;
        if (!isAbsent) theoryAttended++;
      }
    });

    const theoryPct = Math.round((theoryAttended / theoryTotal) * 100);
    const labPct = Math.round((labAttended / labTotal) * 100);
    const overallTotal = theoryTotal + labTotal;
    const overallAttended = theoryAttended + labAttended;
    const overallPct = Math.round((overallAttended / overallTotal) * 100);

    console.log(`\n----------------------------------------`);
    console.log(`Student: ${student.name}`);
    console.log(`  Theory Average : ${theoryAttended}/${theoryTotal} (${theoryPct}%)`);
    console.log(`  Lab Average    : ${labAttended}/${labTotal} (${labPct}%)`);
    console.log(`  Overall Average: ${overallAttended}/${overallTotal} (${overallPct}%)`);
  }

  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
