const fs = require("node:fs");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const axeSource = fs.readFileSync(
  ".qa/tools/node_modules/axe-core/axe.min.js",
  "utf8",
);
const pages = [
  "index.html",
  "architecture-planning.html",
  "ip-selection.html",
  "design-verification.html",
  "analog-design.html",
  "physical-design.html",
  "chip-design.html",
  "ip-product-development.html",
  "about.html",
  "careers.html",
  "news.html",
  "contact.html",
];
const widths = [360, 390, 768, 1024, 1440];

(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const failures = [];
  for (const width of widths) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
    });
    for (const name of pages) {
      const page = await context.newPage();
      const errors = [];
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      page.on("pageerror", (error) => errors.push(error.message));
      const response = await page.goto(`http://127.0.0.1:4173/${name}`, {
        waitUntil: "load",
      });
      if (!response || !response.ok())
        failures.push(`${width}px ${name}: HTTP ${response?.status()}`);
      const layout = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      if (layout.scrollWidth > layout.clientWidth + 1)
        failures.push(
          `${width}px ${name}: horizontal overflow ${layout.scrollWidth}/${layout.clientWidth}`,
        );
      if (errors.length)
        failures.push(`${width}px ${name}: ${errors.join("; ")}`);
      if (width === 390 || width === 1440) {
        await page.addScriptTag({ content: axeSource });
        const report = await page.evaluate(() =>
          axe.run(document, {
            runOnly: {
              type: "tag",
              values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
            },
          }),
        );
        for (const violation of report.violations)
          failures.push(
            `${width}px ${name}: axe ${violation.id} (${violation.nodes.length})`,
          );
      }
      await page.close();
    }
    await context.close();
  }

  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
  });
  await mobile.goto("http://127.0.0.1:4173/index.html");
  const menu = mobile.locator(".menu-toggle");
  await menu.focus();
  await menu.press("Enter");
  if ((await menu.getAttribute("aria-expanded")) !== "true")
    failures.push("Mobile menu did not open from keyboard");
  if (
    !(await mobile
      .locator(".menu-close")
      .evaluate((element) => element === document.activeElement))
  )
    failures.push("Mobile menu did not move focus to close button");
  await mobile.keyboard.press("Escape");
  if (
    (await menu.getAttribute("aria-expanded")) !== "false" ||
    !(await menu.evaluate((element) => element === document.activeElement))
  )
    failures.push("Mobile menu did not close and return focus on Escape");

  const desktop = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  await desktop.goto("http://127.0.0.1:4173/index.html");
  const tech = desktop.locator(".dropdown-toggle").first();
  await tech.focus();
  await desktop.keyboard.press("ArrowDown");
  if (
    (await tech.getAttribute("aria-expanded")) !== "true" ||
    !(await desktop
      .locator("#technology-links a")
      .first()
      .evaluate((element) => element === document.activeElement))
  )
    failures.push("Desktop technology menu keyboard behavior failed");
  await desktop.keyboard.press("Escape");
  if (!(await tech.evaluate((element) => element === document.activeElement)))
    failures.push("Desktop dropdown did not return focus on Escape");

  const reduced = await browser.newContext({
    reducedMotion: "reduce",
    viewport: { width: 390, height: 844 },
  });
  const reducedPage = await reduced.newPage();
  await reducedPage.goto("http://127.0.0.1:4173/index.html");
  if (
    (await reducedPage.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    )) !== "auto"
  )
    failures.push("Reduced motion does not disable smooth scrolling");
  await reduced.close();

  const zoom = await browser.newPage({
    viewport: { width: 1280, height: 900 },
  });
  await zoom.goto("http://127.0.0.1:4173/index.html");
  await zoom.addStyleTag({ content: "html{font-size:32px!important}" });
  const zoomLayout = await zoom.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  if (zoomLayout.scrollWidth > zoomLayout.clientWidth + 1)
    failures.push(
      `200% text: horizontal overflow ${zoomLayout.scrollWidth}/${zoomLayout.clientWidth}`,
    );
  await zoom.screenshot({
    path: ".qa/after-desktop-200-percent.png",
    fullPage: true,
  });

  const shot = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  await shot.goto("http://127.0.0.1:4173/index.html");
  await shot.screenshot({ path: ".qa/after-desktop.png", fullPage: true });
  await browser.close();
  fs.writeFileSync(
    ".qa/qa-results.json",
    JSON.stringify({ pages: pages.length, widths, failures }, null, 2),
  );
  if (failures.length) {
    console.error(failures.join("\n"));
    process.exitCode = 1;
  } else
    console.log(
      `Passed ${pages.length * widths.length} responsive page checks, 24 accessibility scans, keyboard interactions, reduced motion, and 200% text enlargement.`,
    );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
