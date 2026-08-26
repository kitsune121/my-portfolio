const Database = require("better-sqlite3");
const fs = require("fs");

const dbPath = "data/portfolio.db";
if (!fs.existsSync(dbPath)) {
  console.log("No local DB to sync");
  process.exit(0);
}

const db = new Database(dbPath, { readonly: true });
const row = db.prepare("SELECT value FROM kv WHERE key = ?").get("portfolio");
if (row) {
  fs.writeFileSync(
    "data/portfolio.json",
    JSON.stringify(JSON.parse(row.value), null, 2)
  );
  console.log("Synced portfolio.json from DB");
}
db.close();
