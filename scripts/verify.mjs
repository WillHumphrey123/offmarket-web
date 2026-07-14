import { chromium } from "playwright";
import { mkdirSync } from "fs";
import { join } from "path";

const OUT = join(process.cwd(), ".verify-shots");
mkdirSync(OUT, { recursive: true });
const URL = process.env.VERIFY_URL || "http://localhost:4173/";

const consoleErrors = [];
const pageErrors = [];
const failedRequests = [];

async function run() {
  const browser = await chromium.launch();

  // ---------- Desktop pass ----------
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => pageErrors.push(String(err)));
  page.on("requestfailed", (req) => failedRequests.push(req.url() + " :: " + req.failure()?.errorText));

  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/01-hero.png` });

  // scroll to problem section
  await page.locator(".problem").scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/02-problem.png` });

  // scroll through how-it-works: step by step
  const howSection = page.locator(".how");
  const howBox = await howSection.boundingBox();
  await page.mouse.wheel(0, howBox.y - 100 + 50);
  await page.waitForTimeout(300);

  // step through the sticky mechanic by scrolling within it
  for (let i = 0; i < 6; i++) {
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${OUT}/03-how-step-${i}.png` });
  }

  // portfolio
  await page.locator(".portfolio").scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/04-portfolio.png` });

  // drag portfolio rail
  const rail = page.locator("#portfolioRail");
  const railBox = await rail.boundingBox();
  await page.mouse.move(railBox.x + railBox.width / 2, railBox.y + railBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(railBox.x + railBox.width / 2 - 400, railBox.y + railBox.height / 2, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/05-portfolio-scrolled.png` });

  // split section
  await page.locator(".split").scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/06-split.png` });

  // principle
  await page.locator(".principle").scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/07-principle.png` });

  // footer cta
  await page.locator("#access").scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/08-footer.png` });

  await ctx.close();

  // ---------- Mobile pass ----------
  const ctxMobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  const pageMobile = await ctxMobile.newPage();
  await pageMobile.goto(URL, { waitUntil: "networkidle" });
  await pageMobile.waitForTimeout(1200);
  await pageMobile.screenshot({ path: `${OUT}/m1-hero.png` });
  await pageMobile.locator(".how").scrollIntoViewIfNeeded();
  await pageMobile.waitForTimeout(600);
  await pageMobile.screenshot({ path: `${OUT}/m2-how.png` });
  await pageMobile.locator(".portfolio").scrollIntoViewIfNeeded();
  await pageMobile.waitForTimeout(600);
  await pageMobile.screenshot({ path: `${OUT}/m3-portfolio.png` });
  await pageMobile.locator("#access").scrollIntoViewIfNeeded();
  await pageMobile.waitForTimeout(600);
  await pageMobile.screenshot({ path: `${OUT}/m4-footer.png` });
  await ctxMobile.close();

  // ---------- Reduced motion pass ----------
  const ctxRM = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const pageRM = await ctxRM.newPage();
  await pageRM.goto(URL, { waitUntil: "networkidle" });
  await pageRM.waitForTimeout(800);
  await pageRM.screenshot({ path: `${OUT}/rm1-hero.png` });
  await pageRM.locator(".how").scrollIntoViewIfNeeded();
  await pageRM.waitForTimeout(500);
  await pageRM.screenshot({ path: `${OUT}/rm2-how.png` });
  await ctxRM.close();

  await browser.close();

  console.log("CONSOLE ERRORS:", JSON.stringify(consoleErrors, null, 2));
  console.log("PAGE ERRORS:", JSON.stringify(pageErrors, null, 2));
  console.log("FAILED REQUESTS:", JSON.stringify(failedRequests, null, 2));
}

run();
