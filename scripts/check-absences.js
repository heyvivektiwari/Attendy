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
  const studentRes = await pool.query(
    "SELECT id, name, roll_no FROM students WHERE LOWER(roll_no) = LOWER($1)",
    ["TEA176"]
  );
  if (studentRes.rows.length === 0) {
    console.log("No student found with roll number TEA176");
    await pool.end();
    return;
  }
  const student = studentRes.rows[0];
  console.log("Student:", student);

  const absencesRes = await pool.query(
    "SELECT lecture_id FROM student_absences WHERE student_id = $1",
    [student.id]
  );
  console.log(`Absences count for student ${student.id}:`, absencesRes.rows.length);
  console.log("Absences:", absencesRes.rows.map(r => r.lecture_id));

  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
