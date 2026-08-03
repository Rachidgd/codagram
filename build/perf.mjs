import { chromium } from 'playwright';
import fs from 'node:fs';
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const browser = await chromium.launch({
  executablePath: fs.existsSync(CHROME) ? CHROME : undefined,
  args: ['--no-sandbox', '--disable-dev-shm-usage']
});
const pages = ['index', 'agence-seo', 'consultant-seo-paris', 'reserver'];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
console.log('page'.padEnd(24), 'poids', ' requêtes', ' DOM', '  LCP', '  CLS');
for (const p of pages) {
  const page = await ctx.newPage();
  let poids = 0, req = 0;
  page.on('response', async (r) => {
    req++;
    try { const b = await r.body(); poids += b.length; } catch {}
  });
  await page.goto(`http://127.0.0.1:8899/${p}.html`, { waitUntil: 'networkidle' });
  const m = await page.evaluate(() => new Promise((res) => {
    let lcp = 0, cls = 0;
    new PerformanceObserver((l) => { for (const e of l.getEntries()) lcp = e.startTime; })
      .observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) cls += e.value; })
      .observe({ type: 'layout-shift', buffered: true });
    setTimeout(() => res({
      lcp: Math.round(lcp), cls: Math.round(cls * 1000) / 1000,
      dom: document.querySelectorAll('*').length
    }), 1200);
  }));
  console.log(p.padEnd(24), (poids / 1024).toFixed(0).padStart(4) + ' Ko',
    String(req).padStart(6), String(m.dom).padStart(6), String(m.lcp).padStart(5) + 'ms',
    String(m.cls).padStart(6));
  await page.close();
}
await browser.close();
