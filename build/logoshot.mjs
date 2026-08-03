import { chromium } from 'playwright';
import fs from 'node:fs';
const CHROME='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const b=await chromium.launch({executablePath:fs.existsSync(CHROME)?CHROME:undefined,args:['--no-sandbox','--disable-dev-shm-usage','--font-render-hinting=none']});
for (const [n,w,h] of [['mobile',390,844],['desktop',1440,900]]) {
  const c=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:2});const p=await c.newPage();
  await p.goto('http://127.0.0.1:8899/index.html',{waitUntil:'load'});
  await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(1200);
  const el = await p.$('.cc-logos');
  const box = await el.boundingBox();
  const m = await p.evaluate(()=>{
    const v=document.querySelector('.cc-logos__viewport');
    const t=document.querySelectorAll('.cc-logos__track');
    const li=[...document.querySelectorAll('.cc-logos__track:first-child li')].map(x=>{
      const r=x.getBoundingClientRect(); return {x:Math.round(r.left),w:Math.round(r.width),h:Math.round(r.height)};});
    // chevauchement : un élément commence-t-il avant la fin du précédent ?
    let chevauche=0;
    for(let i=1;i<li.length;i++) if(li[i].x < li[i-1].x+li[i-1].w-1) chevauche++;
    const imgs=[...document.querySelectorAll('.cc-logos__img')];
    return {pistes:t.length, elements:li.length, chevauche,
            largeurViewport:Math.round(v.getBoundingClientRect().width),
            imgsChargees: imgs.filter(i=>i.naturalWidth>0).length, imgsTotal: imgs.length,
            anim: getComputedStyle(t[0]).animationName, duree: getComputedStyle(t[0]).animationDuration};
  });
  console.log(n, '| hauteur bande', Math.round(box.height)+'px |', JSON.stringify(m));
  await el.screenshot({path:`shots/logos-${n}.png`});
  await c.close();
}
await b.close();
