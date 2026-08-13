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
  const students = [
    { id: 2, rollNo: "SEA156", name: "Vivek Tiwari" },
    { id: 6, rollNo: "SEA159", name: "Ayush Vishwakarma" },
    { id: 5, rollNo: "SEA164", name: "Shubham Yadav" },
  ];

  for (const s of students) {
    const res = await pool.query("SELECT lecture_id FROM student_absences WHERE student_id = $1", [s.id]);
    console.log(`Student ${s.name} (id ${s.id}, rollNo ${s.rollNo}): ${res.rows.length} absence records in DB`);
    console.log(`Sample absence IDs:`, res.rows.slice(0, 3).map(r => r.lecture_id));
  }

  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
