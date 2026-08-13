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
  const res = await pool.query(
    "SELECT id, name, roll_no, email, password FROM students WHERE LOWER(roll_no) IN ('156', '159', '164') OR name ILIKE '%vivek%' OR name ILIKE '%ayush%' OR name ILIKE '%shubham%'"
  );
  console.log("Matching students in database:");
  console.log(res.rows);
  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
