import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const isAzure = Boolean(process.env.WEBSITE_SITE_NAME);
const dataDir = isAzure ? "/home/data" : path.join(process.cwd(), "prisma");
const dbPath = path.join(dataDir, "ajaia.db");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = `file:${dbPath}`;
}

console.log(`[azure-start] DATABASE_URL=${process.env.DATABASE_URL}`);

const prismaBin = path.join(process.cwd(), "node_modules", "prisma", "build", "index.js");
const seedBin = path.join(process.cwd(), "prisma", "seed.ts");
const tsxBin = path.join(process.cwd(), "node_modules", "tsx", "dist", "cli.mjs");
const nextBin = path.join(process.cwd(), "node_modules", "next", "dist", "bin", "next");
const serverJs = path.join(process.cwd(), "server.js");

execSync(`node "${prismaBin}" db push --skip-generate`, {
  stdio: "inherit",
  env: process.env,
});

if (fs.existsSync(tsxBin) && fs.existsSync(seedBin)) {
  execSync(`node "${tsxBin}" "${seedBin}"`, {
    stdio: "inherit",
    env: process.env,
  });
}

const port = process.env.PORT || "8080";
process.env.PORT = port;

if (fs.existsSync(serverJs)) {
  // Next.js standalone server
  await import(pathToFileURL(serverJs).href);
} else {
  execSync(`node "${nextBin}" start -p ${port}`, {
    stdio: "inherit",
    env: process.env,
  });
}

function pathToFileURL(filePath) {
  const { pathToFileURL: toUrl } = require("node:url");
  return toUrl(filePath);
}
