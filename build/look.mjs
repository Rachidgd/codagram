import { chromium } from 'playwright';
import fs from 'node:fs';
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const b = await chromium.launch({ executablePath: fs.existsSync(CHROME) ? CHROME : undefined,
  args: ['--no-sandbox','--disable-dev-shm-usage','--font-render-hinting=none'] });
for (const [vp, w, h] of [['mobile',390,844],['desktop',1440,900]]) {
  const c = await b.newContext({ viewport:{width:w,height:h}, deviceScaleFactor:2 });
  const p = await c.newPage();
  for (const name of ['index','agence-seo','reserver']) {
    await p.goto(`http://127.0.0.1:8899/${name}.html`, { waitUntil:'load' });
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(600);
    await p.screenshot({ path: `shots/fold-${name}-${vp}.png` });   // premier écran seul
  }
  await c.close();
}
await b.close();
console.log('captures du premier écran prêtes');
