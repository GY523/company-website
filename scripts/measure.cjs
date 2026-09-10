// Run before and after changes under identical synthetic mobile conditions.
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const runs = [];
  const label = process.argv[2] || "after";
  fs.mkdirSync(".qa", { recursive: true });
  for (let i = 0; i < 3; i++) {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 1,
      isMobile: true,
      hasTouch: true,
    });
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 150,
      downloadThroughput: 200000,
      uploadThroughput: 93750,
    });
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await page.addInitScript(() => {
      window.metrics = { lcp: 0, cls: 0 };
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) window.metrics.lcp = e.startTime;
      }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((list) => {
        for (const e of list.getEntries())
          if (!e.hadRecentInput) window.metrics.cls += e.value;
      }).observe({ type: "layout-shift", buffered: true });
    });
    const failed = [];
    page.on("requestfailed", (request) => failed.push(request.url()));
    await page.goto("http://127.0.0.1:4173/", { waitUntil: "load" });
    await page.waitForTimeout(7000);
    runs.push(
      await page.evaluate(() => ({
        ...window.metrics,
        load: performance.getEntriesByType("navigation")[0].loadEventEnd,
        resources: performance.getEntriesByType("resource").length,
      })),
    );
    runs.at(-1).failedRequests = failed;
    if (i === 0)
      await page.screenshot({
        path: path.join(".qa", label + "-mobile.png"),
        fullPage: true,
      });
    await context.close();
  }
  await browser.close();
  fs.writeFileSync(
    path.join(".qa", label + "-performance.json"),
    JSON.stringify(
      {
        viewport: "390x844",
        cpuSlowdown: 4,
        latencyMs: 150,
        downloadBytesPerSecond: 200000,
        runs,
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify(runs, null, 2));
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
