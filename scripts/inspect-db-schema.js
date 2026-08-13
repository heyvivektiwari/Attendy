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
  const tablesRes = await pool.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema='public'"
  );
  console.log("Database Tables:");
  console.log(tablesRes.rows);

  for (const row of tablesRes.rows) {
    const tableName = row.table_name;
    const countRes = await pool.query(`SELECT COUNT(*) FROM "${tableName}"`);
    console.log(`\nTable "${tableName}": ${countRes.rows[0].count} rows`);
    const sampleRes = await pool.query(`SELECT * FROM "${tableName}" LIMIT 5`);
    console.log(sampleRes.rows);
  }

  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
