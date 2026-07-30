import { chromium } from "playwright";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.WALKTHROUGH_BASE_URL || "https://ajaia-docs.azurewebsites.net";
const outDir = path.join(__dirname);
const sampleMd = path.join(__dirname, "..", "samples", "sprint-notes.md");

async function pause(ms) {
  await new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: outDir, size: { width: 1440, height: 900 } },
  });
  const page = await context.newPage();

  // 0:00 opening / login (~25s)
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await pause(8000);
  await page.getByLabel("Email").fill("alice@demo.com");
  await pause(1500);
  await page.getByLabel("Password").fill("demo1234");
  await pause(2000);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/");
  await pause(12000);

  // dashboard owned vs shared (~20s)
  await page.mouse.wheel(0, 300);
  await pause(5000);
  await page.mouse.wheel(0, -300);
  await pause(5000);

  // open and edit (~55s)
  const welcome = page.getByRole("link").filter({ hasText: /Welcome|Untitled|document|notes|sprint/i }).first();
  await welcome.click();
  await pause(8000);

  const title = page.locator('input[placeholder="Untitled document"]');
  if (await title.count()) {
    await title.click();
    await title.fill("Welcome to Ajaia Docs — demo");
    await pause(2000);
    await title.blur();
    await pause(4000);
  }

  const editor = page.locator(".ProseMirror");
  if (await editor.count()) {
    await editor.click();
    await pause(1000);
    await page.keyboard.type(" Demo note: bold, italic, and autosave.");
    await pause(2000);
    await page.keyboard.press("Control+A");
    await pause(500);
    if (await page.getByTitle("Bold").count()) {
      await page.getByTitle("Bold").click();
      await pause(1500);
      await page.getByTitle("Italic").click();
      await pause(1500);
      await page.getByTitle("Heading 1").click();
      await pause(2000);
      await page.getByTitle("Heading 1").click();
      await pause(1000);
      await page.getByTitle("Bullet list").click();
      await pause(2000);
    }
  }

  await page.getByRole("button", { name: "Save now" }).click().catch(() => undefined);
  await pause(4000);
  await page.reload({ waitUntil: "networkidle" });
  await pause(10000);

  // import (~35s)
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await pause(6000);
  const fileInput = page.locator('input[type="file"]');
  await page.getByRole("button", { name: /Import/i }).click();
  await pause(2000);
  await fileInput.setInputFiles(sampleMd);
  await page.waitForURL("**/documents/**", { timeout: 30000 });
  await pause(12000);

  // share (~35s)
  const shareEmail = page.locator("#share-email");
  if (await shareEmail.count()) {
    await shareEmail.scrollIntoViewIfNeeded();
    await pause(3000);
    await shareEmail.fill("bob@demo.com");
    await pause(2000);
    await page.locator("#share-role").selectOption("editor");
    await pause(2000);
    await page.getByRole("button", { name: "Share" }).click();
    await pause(8000);
  }

  // bob (~40s)
  await page.getByRole("button", { name: "Sign out" }).click();
  await page.waitForURL("**/login");
  await pause(4000);
  await page.getByLabel("Email").fill("bob@demo.com");
  await page.getByLabel("Password").fill("demo1234");
  await pause(2000);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/");
  await pause(10000);

  const sharedSection = page.getByRole("heading", { name: /Shared with you/i });
  await sharedSection.scrollIntoViewIfNeeded();
  await pause(6000);
  const sharedDoc = page.locator("section").filter({ has: sharedSection }).getByRole("link").first();
  await sharedDoc.click();
  await pause(12000);

  // charlie (~25s)
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await pause(4000);
  await page.getByRole("button", { name: "Sign out" }).click();
  await page.waitForURL("**/login");
  await pause(3000);
  await page.getByLabel("Email").fill("charlie@demo.com");
  await page.getByLabel("Password").fill("demo1234");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/");
  await pause(12000);

  // closing hold on dashboard (~30s for wrap-up narration)
  await pause(30000);

  await context.close();
  await browser.close();

  const videos = fs.readdirSync(outDir).filter((f) => f.endsWith(".webm") && f !== "screen.webm");
  const candidates = fs.readdirSync(outDir).filter((f) => f.endsWith(".webm"));
  if (!candidates.length) throw new Error("No webm recorded");
  const latest = candidates
    .map((f) => ({ f, m: fs.statSync(path.join(outDir, f)).mtimeMs }))
    .sort((a, b) => b.m - a.m)[0].f;
  const target = path.join(outDir, "screen.webm");
  if (latest !== "screen.webm") {
    if (fs.existsSync(target)) fs.unlinkSync(target);
    fs.renameSync(path.join(outDir, latest), target);
  }
  console.log("Wrote", target, "unused", videos.length);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
