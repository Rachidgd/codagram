/**
 * Audit CRO mesuré dans un navigateur réel.
 *
 * La conversion se joue sur des distances et des visibilités, pas sur des
 * intentions : ce script mesure donc où se trouve la promesse, à quelle
 * hauteur apparaît le premier bouton, combien de pixels un visiteur peut
 * parcourir sans rencontrer d'occasion de convertir, et ce que coûte le
 * formulaire en champs obligatoires.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.PREVIEW_URL || 'http://127.0.0.1:8899';
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const pages = fs.readdirSync(path.join(HERE, 'preview'))
  .filter((f) => f.endsWith('.html'))
  .map((f) => f.replace(/\.html$/, ''))
  .sort();

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1440, height: 900 }
];

const browser = await chromium.launch({
  executablePath: fs.existsSync(CHROME) ? CHROME : undefined,
  args: ['--no-sandbox', '--disable-dev-shm-usage']
});

const rows = [];

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await ctx.newPage();

  for (const name of pages) {
    await page.goto(`${BASE}/${name}.html`, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    // Déclenche les révélations au défilement, sinon tout est masqué.
    await page.evaluate(async () => {
      const pas = window.innerHeight;
      for (let y = 0; y < document.body.scrollHeight; y += pas) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 40));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(350);

    const m = await page.evaluate(() => {
      const fold = window.innerHeight;
      const doc = document.documentElement;

      /* Une occasion de convertir : un lien vers une page de prise de contact,
         un bouton qui ouvre le diagnostic, ou l'envoi d'un formulaire. */
      const estConversion = (el) => {
        const href = (el.getAttribute('href') || '').toLowerCase();
        if (/\/pages\/(reserver|contact)/.test(href)) return true;
        if (el.hasAttribute('data-diagnostic-open')) return true;
        if (el.matches('button[type="submit"], input[type="submit"]')) return true;
        return false;
      };

      const visible = (el) => {
        const r = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none';
      };

      const ctas = [...document.querySelectorAll('a[href], button, input[type="submit"]')]
        .filter((el) => estConversion(el) && visible(el))
        .map((el) => ({
          y: Math.round(el.getBoundingClientRect().top + window.scrollY),
          texte: (el.textContent || el.value || '').trim().replace(/\s+/g, ' ').slice(0, 40)
        }))
        .sort((a, b) => a.y - b.y);

      const h1 = document.querySelector('h1');
      const h1Rect = h1 ? h1.getBoundingClientRect() : null;

      /* Mots réellement lisibles sans défiler : ce que le visiteur a pour
         décider s'il reste. */
      let motsFold = 0;
      for (const el of document.querySelectorAll('main h1, main h2, main p, main li, main .eyebrow')) {
        const r = el.getBoundingClientRect();
        if (r.top < fold && r.bottom > 0 && r.height > 0) {
          motsFold += (el.textContent || '').trim().split(/\s+/).filter(Boolean).length;
        }
      }

      const hauteur = Math.round(doc.scrollHeight);

      /* Plus long trajet sans occasion de convertir. */
      let plusGrandVide = ctas.length ? ctas[0].y : hauteur;
      for (let i = 1; i < ctas.length; i++) {
        plusGrandVide = Math.max(plusGrandVide, ctas[i].y - ctas[i - 1].y);
      }
      const finSansCta = ctas.length ? hauteur - ctas[ctas.length - 1].y : hauteur;

      /* Coût du formulaire : champs obligatoires réellement affichés. */
      const champs = [...document.querySelectorAll('form input, form select, form textarea')]
        .filter((el) => el.type !== 'hidden' && visible(el));
      const obligatoires = champs.filter((el) => el.required || el.getAttribute('aria-required') === 'true');

      /* Réassurance visible sans défiler. */
      const motsConfiance = /gratuit|sans engagement|48\s?h|réponse sous|vos accès|sans carte|rgpd|confidentiel/i;
      const confianceFold = [...document.querySelectorAll('main *')].some((el) => {
        if (el.children.length) return false;
        const r = el.getBoundingClientRect();
        return r.top < fold && r.bottom > 0 && motsConfiance.test(el.textContent || '');
      });

      return {
        hauteur,
        h1Y: h1Rect ? Math.round(h1Rect.top + window.scrollY) : null,
        h1DansFold: h1Rect ? h1Rect.top < fold : false,
        nbCta: ctas.length,
        premierCtaY: ctas.length ? ctas[0].y : null,
        ctaDansFold: ctas.length ? ctas[0].y < fold : false,
        premierCtaTexte: ctas.length ? ctas[0].texte : '',
        plusGrandVide,
        finSansCta,
        motsFold,
        champs: champs.length,
        obligatoires: obligatoires.length,
        confianceFold
      };
    });

    rows.push({ page: name, viewport: vp.name, ...m });
  }
  await ctx.close();
}

await browser.close();
fs.writeFileSync(path.join(HERE, 'audit_cro.json'), JSON.stringify(rows, null, 2));

/* ------------------------------------------------------------------ rapport */
const par = (v) => rows.filter((r) => r.viewport === v);

console.log('AUDIT CRO — ' + pages.length + ' pages, 2 largeurs');
console.log('='.repeat(78));

for (const vp of VIEWPORTS) {
  const set = par(vp.name);
  console.log(`\n${vp.name.toUpperCase()} (${vp.width}×${vp.height})`);

  const sansH1Fold = set.filter((r) => !r.h1DansFold).map((r) => r.page);
  const sansCtaFold = set.filter((r) => !r.ctaDansFold).map((r) => r.page);
  const sansCta = set.filter((r) => r.nbCta === 0).map((r) => r.page);
  const sansConfiance = set.filter((r) => !r.confianceFold).map((r) => r.page);

  console.log(`  promesse visible sans défiler   ${set.length - sansH1Fold.length}/${set.length}`);
  if (sansH1Fold.length) console.log(`     ✗ ${sansH1Fold.join(', ')}`);
  console.log(`  bouton visible sans défiler     ${set.length - sansCtaFold.length}/${set.length}`);
  if (sansCtaFold.length) console.log(`     ✗ ${sansCtaFold.join(', ')}`);
  if (sansCta.length) console.log(`  ✗ AUCUN bouton de conversion    ${sansCta.join(', ')}`);
  console.log(`  réassurance visible sans défiler ${set.length - sansConfiance.length}/${set.length}`);
  if (sansConfiance.length) console.log(`     ✗ ${sansConfiance.slice(0, 12).join(', ')}`);

  const vides = set.filter((r) => r.plusGrandVide > 2600)
    .sort((a, b) => b.plusGrandVide - a.plusGrandVide);
  console.log(`  trajets de plus de 2600 px sans occasion de convertir : ${vides.length}`);
  for (const r of vides.slice(0, 8)) {
    console.log(`     ${r.page.padEnd(34)} ${r.plusGrandVide} px`);
  }

  const finit = set.filter((r) => r.finSansCta > 1200).sort((a, b) => b.finSansCta - a.finSansCta);
  console.log(`  pages qui se terminent à plus de 1200 px du dernier bouton : ${finit.length}`);
  for (const r of finit.slice(0, 6)) console.log(`     ${r.page.padEnd(34)} ${r.finSansCta} px`);

  const mots = set.map((r) => r.motsFold).sort((a, b) => a - b);
  console.log(`  mots lisibles sans défiler — médiane ${mots[Math.floor(mots.length / 2)]}, min ${mots[0]}, max ${mots[mots.length - 1]}`);
  const pauvres = set.filter((r) => r.motsFold < 12).map((r) => `${r.page} (${r.motsFold})`);
  if (pauvres.length) console.log(`     ✗ moins de 12 mots : ${pauvres.slice(0, 10).join(', ')}`);

  const nb = set.map((r) => r.nbCta).sort((a, b) => a - b);
  console.log(`  boutons de conversion par page — médiane ${nb[Math.floor(nb.length / 2)]}, min ${nb[0]}, max ${nb[nb.length - 1]}`);
}

const form = rows.find((r) => r.page === 'contact' && r.viewport === 'mobile');
const reserv = rows.find((r) => r.page === 'reserver' && r.viewport === 'mobile');
console.log('\nFORMULAIRES (mobile)');
for (const [nom, r] of [['contact', form], ['reserver', reserv]]) {
  if (r) console.log(`  ${nom.padEnd(12)} ${r.champs} champs affichés, ${r.obligatoires} obligatoires`);
}
console.log('\n' + '='.repeat(78));
