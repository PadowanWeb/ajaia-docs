const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const isAzure = Boolean(process.env.WEBSITE_SITE_NAME);
const dataDir = isAzure ? "/home/data" : path.join(root, "data");
const dbPath = path.join(dataDir, "ajaia.db");
const bundledDb = path.join(root, "prisma", "seeded.db");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(dbPath) && fs.existsSync(bundledDb)) {
  fs.copyFileSync(bundledDb, dbPath);
  console.log(`[azure-start] Seeded database copied to ${dbPath}`);
}

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = `file:${dbPath}`;
}

console.log(`[azure-start] DATABASE_URL=${process.env.DATABASE_URL}`);

const port = process.env.PORT || "8080";
const standaloneServer = path.join(root, "server.js");
const args = fs.existsSync(standaloneServer)
  ? ["server.js"]
  : [path.join("node_modules", "next", "dist", "bin", "next"), "start", "-p", String(port)];

const child = spawn(process.execPath, args, {
  stdio: "inherit",
  env: { ...process.env, PORT: String(port), DATABASE_URL: process.env.DATABASE_URL },
  cwd: root,
});

child.on("exit", (code) => process.exit(code ?? 1));
