/* Captures section par section : une pleine page de 11 000 px n'est pas
   inspectable, on veut voir chaque bloc à sa taille réelle. */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const OUT = 'build/shots/sections';
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--disable-dev-shm-usage']
});

for (const [device, width] of [['desktop', 1440], ['mobile', 390]]) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto('http://127.0.0.1:8899/index.html', { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(900);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);

  const sections = await page.$$('main > section');
  for (let i = 0; i < sections.length; i++) {
    await sections[i].screenshot({ path: path.join(OUT, `${device}-${i + 1}.png`) }).catch(() => {});
  }
  // En-tête seul + pied de page
  const head = await page.$('.cc-head');
  if (head) await head.screenshot({ path: path.join(OUT, `${device}-header.png`) });
  const foot = await page.$('.cc-foot');
  if (foot) await foot.screenshot({ path: path.join(OUT, `${device}-footer.png`) });

  // Mega-menu ouvert (desktop uniquement)
  if (device === 'desktop') {
    // Rechargement : après le parcours de défilement, l'en-tête est en position
    // masquée (comportement voulu). On repart d'un état propre.
    await page.goto('http://127.0.0.1:8899/index.html', { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(400);
    await page.click('[data-nav-trigger]');
    await page.waitForTimeout(450);
    await page.screenshot({ path: path.join(OUT, 'desktop-megamenu.png'), clip: { x: 0, y: 0, width: 1440, height: 520 } });
    await page.keyboard.press('Escape');

    // Palette de commandes
    await page.keyboard.press('Control+k');
    await page.waitForTimeout(400);
    await page.keyboard.type('shopify');
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(OUT, 'desktop-palette.png'), clip: { x: 0, y: 0, width: 1440, height: 620 } });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // Tiroir de diagnostic
    await page.click('[data-diagnostic-open]');
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(OUT, 'desktop-diagnostic.png'), clip: { x: 640, y: 0, width: 800, height: 900 } });
  }
  await ctx.close();
}
await browser.close();
console.log(fs.readdirSync(OUT).sort().join('\n'));
