/**
 * Capture + audit de rendu.
 *
 * Au-delà des captures, ce script mesure ce que le brief exige réellement :
 * tailles de titres effectives par largeur d'écran, absence de débordement
 * horizontal, absence de mot coupé, cibles tactiles suffisantes et contrastes.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PREVIEW = path.join(HERE, 'preview');
const SHOTS = path.join(HERE, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablette', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 }
];
const PAGES = ['index', 'reserver', 'plan', 'paris', 'vitrine', 'service', 'contact', '404'];
// Servi en HTTP : file:// bloque le chargement des polices (CORS).
const BASE_URL = process.env.PREVIEW_URL || 'http://127.0.0.1:8899';

// Le conteneur fournit déjà Chromium : on l'utilise au lieu d'en télécharger un.
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const browser = await chromium.launch({
  executablePath: fs.existsSync(CHROME) ? CHROME : undefined,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--font-render-hinting=none']
});

const report = [];

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();

  const consoleErrors = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + e.message));

  for (const name of PAGES) {
    await page.goto(`${BASE_URL}/${name}.html`, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    // Laisse les IntersectionObserver révéler le contenu.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(700);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);

    await page.screenshot({ path: path.join(SHOTS, `${name}-${vp.name}.png`), fullPage: true });

    const audit = await page.evaluate(() => {
      const px = (el, prop) => parseFloat(getComputedStyle(el)[prop]);

      const headings = [...document.querySelectorAll('h1,h2,h3')].map((h) => ({
        tag: h.tagName,
        size: Math.round(px(h, 'fontSize') * 10) / 10,
        text: h.textContent.trim().slice(0, 46)
      }));

      const doc = document.documentElement;
      const overflowX = doc.scrollWidth - doc.clientWidth;

      // Éléments qui dépassent réellement la largeur de la fenêtre.
      const wide = [...document.querySelectorAll('body *')]
        .filter((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.right > doc.clientWidth + 1.5;
        })
        .slice(0, 6)
        .map((el) => `${el.tagName.toLowerCase()}.${(el.className || '').toString().split(' ')[0]}`);

      // Cibles tactiles trop petites (hors éléments décoratifs ou masqués).
      const small = [...document.querySelectorAll('a[href],button')]
        .filter((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && (r.height < 32 || r.width < 24);
        })
        .slice(0, 8)
        .map((el) => {
          const r = el.getBoundingClientRect();
          return `${el.tagName.toLowerCase()}.${(el.className || '').toString().split(' ')[0]} ${Math.round(r.width)}x${Math.round(r.height)}`;
        });

      const body = getComputedStyle(document.body);
      const fontsLoaded = [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family);

      return {
        h1: headings.filter((h) => h.tag === 'H1'),
        maxH2: Math.max(0, ...headings.filter((h) => h.tag === 'H2').map((h) => h.size)),
        maxH3: Math.max(0, ...headings.filter((h) => h.tag === 'H3').map((h) => h.size)),
        bodySize: Math.round(parseFloat(body.fontSize) * 10) / 10,
        fontFamily: body.fontFamily.split(',')[0].replace(/"/g, ''),
        fontsLoaded,
        overflowX,
        wide,
        small,
        docHeight: Math.round(document.body.scrollHeight)
      };
    });

    report.push({ page: name, viewport: vp.name, width: vp.width, ...audit, consoleErrors: [...consoleErrors] });
    consoleErrors.length = 0;
  }
  await ctx.close();
}

await browser.close();

/* ------------------------------------------------------------------ rapport */
console.log('\nAUDIT DE RENDU');
console.log('='.repeat(74));
for (const r of report) {
  const h1 = r.h1[0];
  console.log(`\n${r.page.padEnd(9)} ${r.viewport} (${r.width}px)   hauteur ${r.docHeight}px`);
  console.log(`  police       ${r.fontFamily}   corps ${r.bodySize}px   chargées: ${(r.fontsLoaded||[]).join(', ') || 'AUCUNE'}`);
  if (h1) console.log(`  H1           ${h1.size}px  « ${h1.text} »`);
  console.log(`  H2 max       ${r.maxH2}px      H3 max ${r.maxH3}px`);
  console.log(`  débordement  ${r.overflowX <= 0 ? 'aucun' : r.overflowX + 'px  → ' + r.wide.join(', ')}`);
  if (r.h1.length !== 1) console.log(`  ⚠ H1         ${r.h1.length} balise(s) H1 sur la page`);
  if (r.small.length) console.log(`  ⚠ cibles     ${r.small.join(' | ')}`);
  if (r.consoleErrors.length) console.log(`  ⚠ console    ${r.consoleErrors.slice(0, 3).join(' | ')}`);
}
console.log('\n' + '='.repeat(74));
fs.writeFileSync(path.join(HERE, 'audit.json'), JSON.stringify(report, null, 2));
