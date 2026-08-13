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
  const slotsYears = await pool.query("SELECT DISTINCT year FROM timetable_slots");
  console.log("Distinct years in timetable_slots:", slotsYears.rows);

  const studentYears = await pool.query("SELECT DISTINCT year FROM students");
  console.log("Distinct years in students:", studentYears.rows);

  const feSlots = await pool.query("SELECT COUNT(*) FROM timetable_slots WHERE LOWER(year) LIKE '%first%' OR LOWER(year) LIKE '%fe%'");
  console.log("First Year slots count:", feSlots.rows[0].count);

  const firstHalfSlots = await pool.query("SELECT DISTINCT year, branch, division FROM timetable_slots");
  console.log("All timetable_slots groups:", firstHalfSlots.rows);

  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
