const pg = require("pg");
const fs = require("fs");
const path = require("path");

// Load env
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

// Timetable definition for Data Science
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
  const month = 6; // 0-indexed July
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
        dateStr
      });
    });
  });

  return lectures;
}

// Student targets
const studentTargets = [
  {
    id: 2,
    name: "Vivek Tiwari",
    rollNo: "SEA156",
    targets: {
      ds_ai: 73,
      ds_ml: 83,
      ds_sdav: 75,
      ds_cns: 64,
      ds_dcst: 73,
      ds_aiml: 33,
      ds_cns_lab: 67,
      ds_sdav_lab: 100,
      ds_dcst_lab: 75,
      ds_uiux: 100,
    }
  },
  {
    id: 6,
    name: "Ayush Vishwakarma",
    rollNo: "SEA159",
    targets: {
      ds_ai: 73,
      ds_ml: 75,
      ds_sdav: 58,
      ds_cns: 73,
      ds_dcst: 91,
      ds_aiml: 33,
      ds_cns_lab: 0,
      ds_sdav_lab: 100,
      ds_dcst_lab: 100,
      ds_uiux: 50,
    }
  },
  {
    id: 5,
    name: "Shubham Yadav",
    rollNo: "SEA164",
    targets: {
      ds_ai: 82,
      ds_ml: 83,
      ds_sdav: 75,
      ds_cns: 73,
      ds_dcst: 82,
      ds_aiml: 33,
      ds_cns_lab: 100,
      ds_sdav_lab: 100,
      ds_dcst_lab: 75,
      ds_uiux: 100,
    }
  }
];

function pickRandom(arr, count) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

async function main() {
  const julyLectures = generateLecturesForJuly("A3");

  // Group lectures by subjectId
  const lecturesBySubject = {};
  julyLectures.forEach(l => {
    if (!lecturesBySubject[l.subjectId]) lecturesBySubject[l.subjectId] = [];
    lecturesBySubject[l.subjectId].push(l);
  });

  console.log("July 2026 Lecture counts per subject (Batch A3):");
  Object.keys(lecturesBySubject).forEach(sub => {
    console.log(`  ${sub}: ${lecturesBySubject[sub].length} total lectures/labs`);
  });

  for (const student of studentTargets) {
    console.log(`\n========================================`);
    console.log(`Processing student: ${student.name} (ID: ${student.id}, Roll: ${student.rollNo})`);
    
    // Clear existing absences for this student for July 2026
    await pool.query(
      "DELETE FROM student_absences WHERE student_id = $1 AND lecture_id LIKE '2026-07%'",
      [student.id]
    );

    const absentLectureIds = [];

    Object.keys(student.targets).forEach(subId => {
      const targetPct = student.targets[subId];
      const subjectLectures = lecturesBySubject[subId] || [];
      const total = subjectLectures.length;
      if (total === 0) return;

      // Find absent count that gets closest to target percentage
      let bestAbsentCount = 0;
      let minDiff = Infinity;

      for (let absentCount = 0; absentCount <= total; absentCount++) {
        const attended = total - absentCount;
        const pct = Math.round((attended / total) * 100);
        const diff = Math.abs(pct - targetPct);
        if (diff < minDiff) {
          minDiff = diff;
          bestAbsentCount = absentCount;
        }
      }

      const chosenAbsences = pickRandom(subjectLectures, bestAbsentCount);
      chosenAbsences.forEach(l => absentLectureIds.push(l.id));

      const achievedPct = Math.round(((total - bestAbsentCount) / total) * 100);
      console.log(`  Subject ${subId}: Total=${total}, Target=${targetPct}%, AbsentCount=${bestAbsentCount}, Achieved=${achievedPct}%`);
    });

    console.log(`  Inserting ${absentLectureIds.length} absences into Supabase...`);

    // Insert absences into DB
    for (const lectureId of absentLectureIds) {
      await pool.query(
        "INSERT INTO student_absences (student_id, lecture_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [student.id, lectureId]
      );
    }

    console.log(`  Successfully populated attendance for ${student.name}!`);
  }

  await pool.end();
  console.log("\nAll 3 students' July 2026 attendance inserted successfully!");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
