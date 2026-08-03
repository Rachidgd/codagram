import { chromium } from 'playwright';
import fs from 'node:fs';
const CHROME='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const b=await chromium.launch({executablePath:fs.existsSync(CHROME)?CHROME:undefined,args:['--no-sandbox','--disable-dev-shm-usage','--font-render-hinting=none']});
for (const [n,w,h] of [['desktop',1440,900],['mobile',390,844]]) {
  const c=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:2});const p=await c.newPage();
  await p.goto('http://127.0.0.1:8899/index.html',{waitUntil:'load'});
  await p.evaluate(()=>document.fonts.ready);
  await p.evaluate(async()=>{const s=window.innerHeight;
    for(let y=0;y<document.body.scrollHeight;y+=s){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,90));}
    window.scrollTo(0,0);});
  await p.waitForTimeout(900);
  const chargees = await p.evaluate(()=>[...document.querySelectorAll('img')].filter(i=>i.naturalWidth>0).length);
  console.log(n, '— images chargées :', chargees, '/', await p.evaluate(()=>document.querySelectorAll('img').length));
  await p.screenshot({path:`shots/home-${n}.png`, fullPage:true});
  await c.close();
}
await b.close();
