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
  // Trim name, email, roll_no
  await pool.query("UPDATE students SET email = TRIM(email), name = TRIM(name), roll_no = TRIM(roll_no)");
  
  // Set DataScience branch for the target students
  await pool.query("UPDATE students SET branch = 'DataScience' WHERE id IN (2, 5, 6, 12)");

  const res = await pool.query("SELECT id, name, roll_no, email, password, branch FROM students ORDER BY id ASC");
  console.log("Updated Students in Database:");
  console.log(res.rows);

  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
