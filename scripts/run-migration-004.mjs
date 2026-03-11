import { readFileSync } from "fs";
import pg from "pg";

const envFile = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const env = {};
for (const line of envFile.split("\n")) {
  const match = line.match(/^([^#=]+)="?([^"]*)"?$/);
  if (match) env[match[1].trim()] = match[2].trim();
}

// Extract connection info from Supabase URL
const supabaseUrl = new URL(env.NEXT_PUBLIC_SUPABASE_URL);
const projectRef = supabaseUrl.hostname.split(".")[0];
const dbHost = `db.${projectRef}.supabase.co`;
const dbPass = env.SUPABASE_DB_PASSWORD || env.SUPABASE_SERVICE_ROLE_KEY;

const client = new pg.Client({
  host: dbHost,
  port: 5432,
  database: "postgres",
  user: "postgres",
  password: dbPass,
  ssl: { rejectUnauthorized: false },
});

const sql = readFileSync(
  new URL("../supabase/migrations/004_listing_number.sql", import.meta.url),
  "utf8"
);

try {
  await client.connect();
  console.log("Connected to DB.");
  await client.query(sql);
  console.log("Migration 004 applied successfully.");

  const { rows } = await client.query(
    "SELECT listing_number, title FROM properties ORDER BY listing_number LIMIT 5"
  );
  console.log("Sample listing numbers:");
  rows.forEach((r) => console.log(`  #${r.listing_number} — ${r.title}`));
} catch (err) {
  console.error("Migration error:", err.message);
} finally {
  await client.end();
}
