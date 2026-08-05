const pg = require("pg");
const fs = require("fs");
const path = require("path");

const envPath = path.resolve(__dirname, "..", ".env.local");
if (!fs.existsSync(envPath)) {
  console.error("No .env.local file found at:", envPath);
  process.exit(1);
}
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
  const all = await pool.query("SELECT id, name, email, roll_no, division FROM students");
  console.log("All students in database:");
  console.log(all.rows);
  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
