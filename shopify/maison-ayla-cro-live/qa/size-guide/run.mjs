import { chromium } from 'playwright';
import { readFileSync } from 'fs';

const cases = JSON.parse(readFileSync('cases.json', 'utf8'));
const script = readFileSync('ma-size-guide.js', 'utf8');
const browser = await chromium.launch();
let pass = 0, fail = 0;
const check = (n, ok, extra='') => { ok ? pass++ : fail++; console.log(`${ok ? 'OK  ' : 'FAIL'}  ${n}${extra ? ' — ' + extra : ''}`); };

for (const [name, html] of Object.entries(cases)) {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.setContent(`<!doctype html><html><head></head><body>${html}</body></html>`);
  if (name === 'late-render') {
    await page.addScriptTag({ content: script });
    await page.evaluate(() => {
      setTimeout(() => {
        document.getElementById('slot').innerHTML = '<legend class="form__label">Taille</legend>';
      }, 200);
    });
    await page.waitForTimeout(600);
  } else {
    await page.addScriptTag({ content: script });
    await page.waitForTimeout(120);
  }

  const r = await page.evaluate(() => {
    const links = [...document.querySelectorAll('a[data-ma-size-guide]')];
    return {
      count: links.length,
      href: links[0]?.getAttribute('href') || null,
      text: links[0]?.textContent.trim() || null,
      hasSvg: !!links[0]?.querySelector('svg'),
      styleTag: !!document.getElementById('maSizeGuideStyles'),
      labelStillPresent: !!document.querySelector('legend, label.form__label'),
      beforeCta: (() => {
        const l = document.querySelector('a[data-ma-size-guide]');
        const b = document.querySelector('button[type="submit"], [name="add"]');
        return !!(l && b) && (l.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
      })()
    };
  });

  check(`${name} · pas d'erreur JS`, errors.length === 0, errors[0] || '');

  if (name === 'not-a-product') {
    check(`${name} · aucun lien injecté`, r.count === 0);
    check(`${name} · pas de <style> parasite`, r.styleTag === false);
  } else if (name === 'already-linked') {
    check(`${name} · pas de doublon`, r.count === 0);
  } else {
    check(`${name} · un seul lien`, r.count === 1, `count=${r.count}`);
    check(`${name} · href correct`, r.href === '/pages/guide-des-tailles', r.href || '');
    check(`${name} · libellé`, r.text === 'Guide des tailles', r.text || '');
    check(`${name} · icône présente`, r.hasSvg === true);
    if (name !== 'no-size-label') {
      check(`${name} · label d'origine conservé`, r.labelStillPresent === true);
    } else {
      check(`${name} · replié sur le bouton d'ajout`, r.beforeCta === true);
    }
  }
  await page.close();
}

// idempotence : deux exécutions ne doivent pas doubler le lien
{
  const page = await browser.newPage();
  await page.setContent(`<!doctype html><html><body>${cases['legend-fieldset']}</body></html>`);
  await page.addScriptTag({ content: script });
  await page.addScriptTag({ content: script });
  await page.waitForTimeout(120);
  const n = await page.evaluate(() => document.querySelectorAll('a[data-ma-size-guide]').length);
  check('double exécution · toujours un seul lien', n === 1, `count=${n}`);
  await page.close();
}

await browser.close();
console.log(`\n${pass} OK, ${fail} échec(s)`);
process.exit(fail ? 1 : 0);
