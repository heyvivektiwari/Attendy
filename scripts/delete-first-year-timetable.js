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
  const countBefore = await pool.query("SELECT COUNT(*) FROM timetable_slots WHERE year = 'First' OR LOWER(year) LIKE '%first%'");
  console.log(`Found ${countBefore.rows[0].count} First Year timetable slots to remove.`);

  const deleteRes = await pool.query("DELETE FROM timetable_slots WHERE year = 'First' OR LOWER(year) LIKE '%first%'");
  console.log(`Deleted ${deleteRes.rowCount} First Year timetable slots from timetable_slots table.`);

  const remaining = await pool.query("SELECT COUNT(*) FROM timetable_slots");
  console.log(`Remaining timetable_slots in database: ${remaining.rows[0].count}`);

  const remainingGroups = await pool.query("SELECT DISTINCT year, branch, division FROM timetable_slots");
  console.log("Remaining timetable_slots groups:", remainingGroups.rows);

  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
