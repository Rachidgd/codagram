/* Tests fonctionnels des composants interactifs, sur le rendu réel. */
import { chromium } from 'playwright';

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const results = [];
const check = (name, ok, detail = '') => { results.push({ name, ok, detail }); };

const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
const jsErrors = [];
p.on('pageerror', (e) => jsErrors.push(e.message));
// Le texte console d'un 404 ne porte pas l'URL : on écoute les réponses HTTP.
// favicon.ico n'existe pas dans l'aperçu local ; sur Shopify elle vient de
// content_for_header. Les visuels de démonstration pointent vers placehold.co,
// injoignable derrière le proxy.
p.on('response', (r) => {
  if (r.status() >= 400 && !/favicon|placehold/.test(r.url())) jsErrors.push(`HTTP ${r.status()} ${r.url()}`);
});

await p.goto('http://127.0.0.1:8899/index.html', { waitUntil: 'load' });
await p.waitForTimeout(500);

/* --- 1. Diagnostic : parcours nominal (objectif non e-commerce → 3 étapes) --- */
await p.click('[data-diagnostic-open]');
await p.waitForTimeout(500);
check('tiroir ouvert', await p.isVisible('[data-diagnostic] .cc-diag__panel'));
check('étape 1 affichée', (await p.locator('[data-step]:not([hidden])').count()) === 1);

// Validation bloquante : « Continuer » sans choix ne doit pas avancer
await p.click('[data-diagnostic-next]');
await p.waitForTimeout(250);
check('validation bloque sans réponse', await p.isVisible('[data-error]:not([hidden])'));

// Choix auto-avance
await p.click('label.choice:has-text("Être trouvé sur Google")');
await p.waitForTimeout(500);
let counter = await p.textContent('[data-diagnostic-counter]');
check('auto-avance après choix', /Étape 2 sur 3/.test(counter), counter);
check('étape e-commerce masquée', !(await p.isVisible('[data-step-when]')));

await p.click('[data-diagnostic-next]');
await p.waitForTimeout(350);
counter = await p.textContent('[data-diagnostic-counter]');
check('passage étape 3', /Étape 3 sur 3/.test(counter), counter);
check('bouton envoyer affiché', await p.isVisible('[data-diagnostic-submit]'));
check('bouton continuer masqué', !(await p.isVisible('[data-diagnostic-next]')));

await p.click('[data-diagnostic-back]');
await p.waitForTimeout(350);
check('retour arrière', /Étape 2 sur 3/.test(await p.textContent('[data-diagnostic-counter]')));

await p.keyboard.press('Escape');
await p.waitForTimeout(450);
check('fermeture par Échap', !(await p.isVisible('[data-diagnostic] .cc-diag__panel')));

/* --- 2. Branche conditionnelle e-commerce → 4 étapes ---
   Le tiroir conserve volontairement sa progression : on recharge pour repartir
   d'un formulaire vierge. */
await p.goto('http://127.0.0.1:8899/index.html', { waitUntil: 'load' });
await p.waitForTimeout(400);
await p.click('[data-diagnostic-open]');
await p.waitForTimeout(500);
await p.click('label.choice:has-text("Créer ou refondre ma boutique")');
await p.waitForTimeout(550);
counter = await p.textContent('[data-diagnostic-counter]');
check('branche e-commerce : 4 étapes', /sur 4/.test(counter), counter);
check('question boutique affichée', await p.isVisible('text=Où en est votre boutique ?'));
await p.keyboard.press('Escape');
await p.waitForTimeout(450);

/* --- 3. Palette de commandes --- */
await p.keyboard.press('Control+k');
await p.waitForTimeout(400);
check('palette ouverte', await p.isVisible('[data-palette] .cc-pal__box'));
await p.keyboard.type('lyon');
await p.waitForTimeout(300);
check('recherche sans accent', (await p.locator('.cc-pal__item').count()) > 0);
await p.keyboard.press('ArrowDown');
await p.waitForTimeout(150);
check('navigation clavier', (await p.locator('.cc-pal__item.is-cursor').count()) === 1);
await p.keyboard.press('Escape');
await p.waitForTimeout(300);
check('palette fermée', !(await p.isVisible('[data-palette] .cc-pal__box')));

/* --- 4. Sélecteur d'onglets (ARIA tablist) --- */
await p.click('[data-selector-tab]:nth-of-type(1)').catch(() => {});
const tabs = p.locator('[data-selector-tab]');
await tabs.nth(2).click();
await p.waitForTimeout(300);
check('onglet 3 sélectionné', (await tabs.nth(2).getAttribute('aria-selected')) === 'true');
check('un seul panneau visible', (await p.locator('[data-selector-panel]:not([hidden])').count()) === 1);
await tabs.nth(2).press('ArrowRight');
await p.waitForTimeout(250);
check('flèche droite change d’onglet', (await tabs.nth(3).getAttribute('aria-selected')) === 'true');

/* --- 5. En-tête caméléon + masquage au défilement --- */
await p.evaluate(() => window.scrollTo(0, 1600));
await p.waitForTimeout(600);
check('en-tête ancré', await p.evaluate(() => document.querySelector('[data-header]').classList.contains('is-stuck')));
const theme = await p.evaluate(() => document.querySelector('[data-header]').getAttribute('data-theme'));
check('thème adaptatif actif', theme === 'paper' || theme === 'dark', `data-theme=${theme}`);
await p.evaluate(() => window.scrollTo(0, 3000));
await p.waitForTimeout(500);
check('masquage en descente', await p.evaluate(() => document.querySelector('[data-header]').classList.contains('is-hidden')));
await p.evaluate(() => window.scrollTo(0, 2400));
await p.waitForTimeout(500);
check('réapparition en montée', !(await p.evaluate(() => document.querySelector('[data-header]').classList.contains('is-hidden'))));

/* --- 6. Menu mobile --- */
const mctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
const mp = await mctx.newPage();
mp.on('pageerror', (e) => jsErrors.push('mobile: ' + e.message));
await mp.goto('http://127.0.0.1:8899/index.html', { waitUntil: 'load' });
await mp.waitForTimeout(400);
await mp.click('[data-mobile-toggle]');
await mp.waitForTimeout(600);
check('feuille mobile ouverte', await mp.isVisible('[data-mobile-sheet] .cc-sheet__panel'));
check('corps verrouillé', await mp.evaluate(() => document.body.classList.contains('is-locked')));
await mp.click('.cc-acc__head');
await mp.waitForTimeout(350);
check('accordéon mobile déplié', await mp.isVisible('.cc-acc[open] .cc-acc__body'));
await mp.keyboard.press('Escape');
await mp.waitForTimeout(600);
check('déverrouillage après fermeture', !(await mp.evaluate(() => document.body.classList.contains('is-locked'))));

check('aucune erreur JS', jsErrors.length === 0, jsErrors.slice(0, 3).join(' | '));

await b.close();

const pad = Math.max(...results.map((r) => r.name.length));
let ko = 0;
console.log('\nTESTS FONCTIONNELS');
console.log('='.repeat(pad + 30));
for (const r of results) {
  if (!r.ok) ko++;
  console.log(`  ${r.ok ? '✓' : '✗'}  ${r.name.padEnd(pad)}  ${r.detail}`);
}
console.log('='.repeat(pad + 30));
console.log(`${results.length - ko}/${results.length} tests réussis\n`);
process.exit(ko ? 1 : 0);
