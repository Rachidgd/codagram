import { chromium } from 'playwright';
import fs from 'node:fs';
const CHROME='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const b=await chromium.launch({executablePath:fs.existsSync(CHROME)?CHROME:undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
const c=await b.newContext({viewport:{width:1440,height:900}});const p=await c.newPage();
await p.goto('http://127.0.0.1:8899/index.html',{waitUntil:'load'});
await p.waitForTimeout(3000);
const r=await p.evaluate(()=>[...document.querySelectorAll('img')].map(i=>({
  src:i.currentSrc.split('/').pop().split('?')[0], w:i.naturalWidth, h:i.naturalHeight})));
console.log('images dans la page :', r.length);
console.log('chargées :', r.filter(x=>x.w>0).length, '| échouées :', r.filter(x=>x.w===0).length);
for (const x of r.slice(0,4)) console.log('  ', x.src, x.w+'x'+x.h);
await b.close();
