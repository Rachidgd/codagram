import { chromium } from 'playwright';
import fs from 'node:fs';
const CHROME='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const b=await chromium.launch({executablePath:fs.existsSync(CHROME)?CHROME:undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
for (const [n,w,h] of [['mobile',390,844],['desktop',1440,900]]) {
  const c=await b.newContext({viewport:{width:w,height:h}}); const p=await c.newPage();
  for (const page of ['index','agence-seo','reserver']) {
    await p.goto(`http://127.0.0.1:8899/${page}.html`,{waitUntil:'load'});
    await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(400);
    const m=await p.evaluate(()=>{
      const head=document.querySelector('header');
      const hb=head?head.getBoundingClientRect().bottom:0;
      const first=document.querySelector('main .eyebrow, main h1');
      const ft=first?first.getBoundingClientRect().top:0;
      const h1=document.querySelector('h1');
      return { videEnTete: Math.round(ft-hb), h1Top: Math.round(h1.getBoundingClientRect().top),
               foldRestant: Math.round(window.innerHeight - h1.getBoundingClientRect().top) };
    });
    console.log(`${n.padEnd(8)} ${page.padEnd(14)} vide sous l'en-tête ${String(m.videEnTete).padStart(4)}px  H1 à ${String(m.h1Top).padStart(4)}px  reste ${m.foldRestant}px de fold`);
  }
  await c.close();
}
await b.close();
