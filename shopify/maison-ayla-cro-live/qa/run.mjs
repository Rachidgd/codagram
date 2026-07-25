import { chromium } from 'playwright';
import path from 'node:path';
import http from 'node:http';
import fs from 'node:fs';

const HERE = path.resolve('.');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
const server = http.createServer((req, res) => {
  const file = path.join(HERE, decodeURIComponent(req.url.split('?')[0]));
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const PAGE = `http://127.0.0.1:${server.address().port}/drawer.html`;

const results = [];
function check(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
}

const VIEWPORTS = [
  { w: 320, h: 568, label: '320x568' },
  { w: 360, h: 800, label: '360x800' },
  { w: 390, h: 844, label: '390x844' },
  { w: 430, h: 932, label: '430x932' },
  { w: 768, h: 1024, label: '768x1024' },
  { w: 1440, h: 900, label: '1440x900' }
];

const browser = await chromium.launch();

async function newPage(role = 'unpublished', viewport = { width: 1440, height: 900 }) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));

  const cart = { count: 0 };
  await page.route('**/cart.js', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ item_count: cart.count, items: [], total_price: cart.count * 8900 })
  }));
  const setCart = async (n) => {
    cart.count = n;
    await page.evaluate((c) => window.MA_TEST.setCart(c), n);
    await page.waitForTimeout(200);
  };

  await page.goto(`${PAGE}?role=${role}`);
  await page.waitForFunction(() => document.readyState === 'complete');
  /* Neutralise l'animation d'ouverture du drawer : les mesures et les
     captures portent sur l'état stabilisé, pas sur une frame de transition. */
  await page.addStyleTag({ content: '.cd-panel{transition:none !important}' });
  await page.waitForTimeout(150);
  return { ctx, page, errors, setCart };
}

/* ── 1. Panier vide : aucun widget visible ─────────────────────────── */
{
  const { ctx, page, errors, setCart } = await newPage();
  await setCart(0);
  await page.evaluate(() => window.MA_TEST.openDrawer());
  await page.waitForTimeout(120);
  const visible = await page.isVisible('#maCroTrustpilot');
  check('Panier vide : aucun widget visible', visible === false);
  check('Panier vide : zéro erreur console', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

/* ── 2. Un produit : widget visible et bien placé ──────────────────── */
{
  const { ctx, page, errors, setCart } = await newPage();
  await page.evaluate(() => window.MA_TEST.openDrawer());
  await setCart(1);
  await page.waitForTimeout(150);

  check('1 produit : widget visible', await page.isVisible('#maCroTrustpilot'));

  const pos = await page.evaluate(() => {
    const b = document.getElementById('maCroTrustpilot');
    const footer = document.getElementById('cdFooter');
    return {
      insideFooter: !!b && footer.contains(b),
      prevClass: b?.previousElementSibling?.className || null,
      nextClass: b?.nextElementSibling?.className || null,
      afterCheckoutBtn: !!b && !!document.getElementById('cdCheckoutBtn') &&
        (document.getElementById('cdCheckoutBtn').compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0
    };
  });
  check('Bloc dans le footer du drawer', pos.insideFooter);
  check('Bloc immédiatement APRÈS le CTA de paiement', pos.prevClass === 'cd-cta' && pos.afterCheckoutBtn, `prev=${pos.prevClass}`);
  check('Bloc AVANT les mentions secondaires', pos.nextClass === 'cd-legal', `next=${pos.nextClass}`);

  /* CTA reste visible et prioritaire */
  const cta = await page.evaluate(() => {
    const el = document.getElementById('cdCheckoutBtn').getBoundingClientRect();
    return { top: el.top, bottom: el.bottom, h: el.height, vh: window.innerHeight };
  });
  check('CTA de paiement dans la zone utile', cta.bottom <= cta.vh && cta.top >= 0, `bottom=${Math.round(cta.bottom)} vh=${cta.vh}`);

  check('1 produit : zéro erreur console', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

/* ── 3. Plusieurs produits, mutations, réouverture : un seul widget ── */
{
  const { ctx, page, errors, setCart } = await newPage();
  await page.evaluate(() => window.MA_TEST.openDrawer());
  for (const n of [1, 2, 3, 2, 1, 3]) {
    await setCart(n);
    await page.waitForTimeout(40);
  }
  await page.evaluate(() => window.MA_TEST.closeDrawer());
  await page.waitForTimeout(60);
  await page.evaluate(() => window.MA_TEST.openDrawer());
  await page.waitForTimeout(120);

  const count = await page.evaluate(() => document.querySelectorAll('#maCroTrustpilot, .ma-cro-tp').length);
  check('Aucun doublon de widget après mutations + réouverture', count === 1, `instances=${count}`);
  check('Widget toujours rendu après réouverture', await page.isVisible('#maCroTrustpilot'));

  /* Suppression du dernier produit */
  await setCart(0);
  await page.waitForTimeout(120);
  check('Suppression du dernier produit : widget masqué', (await page.isVisible('#maCroTrustpilot')) === false);

  check('Mutations : zéro erreur console', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

/* ── 4. Absence de boucle MutationObserver ─────────────────────────── */
{
  const { ctx, page, errors, setCart } = await newPage();
  await page.evaluate(() => window.MA_TEST.openDrawer());
  await setCart(2);
  await page.waitForTimeout(200);

  const loop = await page.evaluate(async () => {
    const footer = document.getElementById('cdFooter');
    let mutations = 0;
    const probe = new MutationObserver((recs) => { mutations += recs.length; });
    probe.observe(footer, { childList: true, subtree: true, attributes: true });
    await new Promise((r) => setTimeout(r, 1200));
    probe.disconnect();
    return { mutations, instances: document.querySelectorAll('.ma-cro-tp').length };
  });
  check('Aucune boucle MutationObserver (DOM stable au repos)', loop.mutations === 0 && loop.instances === 1,
    `mutations=${loop.mutations} instances=${loop.instances}`);
  check('Repos : zéro erreur console', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

/* ── 5. Garde de publication : thème publié => aucun rendu maquette ── */
{
  const { ctx, page, errors, setCart } = await newPage('main');
  await page.evaluate(() => window.MA_TEST.openDrawer());
  await setCart(2);
  await page.waitForTimeout(200);
  const present = await page.evaluate(() => document.querySelectorAll('.ma-cro-tp').length);
  check('Thème publié (role=main) : maquette de test NON rendue', present === 0, `instances=${present}`);
  check('Garde publication : zéro erreur console', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

/* ── 6. Aucun vestige du faux Trustpilot ───────────────────────────── */
{
  const { ctx, page, setCart } = await newPage();
  await page.evaluate(() => window.MA_TEST.openDrawer());
  await setCart(2);
  await page.waitForTimeout(150);
  const legacy = await page.evaluate(() => ({
    node: document.querySelectorAll('#maCroTrust, .ma-cro-trust, .ma-cro-trust__mark, .ma-cro-trust__stars').length,
    svg: document.querySelectorAll('#maCroTrustpilot svg').length,
    text: (document.getElementById('maCroTrustpilot')?.textContent || '')
  }));
  check('Aucun noeud hérité du faux Trustpilot', legacy.node === 0, `noeuds=${legacy.node}`);
  check('Aucun SVG maison dans le bloc', legacy.svg === 0, `svg=${legacy.svg}`);
  const label = await page.evaluate(() =>
    document.getElementById('maCroTrustpilot')?.getAttribute('aria-label') || '');
  check('Nom accessible signale une maquette non publiée et non vérifiée',
    /non publi/i.test(label) && /non v[eé]rifi[eé]e/i.test(label), label);
  await ctx.close();
}

/* ── 6 bis. Étoiles de notation et date de livraison estimée ───────── */
{
  const { ctx, page, errors, setCart } = await newPage();
  await page.evaluate(() => window.MA_TEST.openDrawer());
  await setCart(2);
  await page.waitForTimeout(200);

  const stars = await page.evaluate(() => {
    const base = document.querySelector('.ma-cro-tp__stars-base');
    const fill = document.querySelector('.ma-cro-tp__stars-fill');
    const cs = fill ? getComputedStyle(fill) : null;
    const csBase = base ? getComputedStyle(base) : null;
    const wrap = document.querySelector('.ma-cro-tp__stars');
    return {
      baseCount: (base?.textContent || '').length,
      fillCount: (fill?.textContent || '').length,
      widthPct: fill ? fill.style.width : null,
      fillColor: cs?.color,
      baseColor: csBase?.color,
      overflow: cs?.overflow,
      ariaHidden: wrap?.getAttribute('aria-hidden'),
      scoreText: document.querySelector('.ma-cro-tp__mock-score')?.textContent
    };
  });
  check('5 étoiles rendues (fond + remplissage)', stars.baseCount === 5 && stars.fillCount === 5);
  check('Remplissage proportionnel à 4,6/5 (92 %)', stars.widthPct === '92%', `width=${stars.widthPct}`);
  check('Étoiles à l\'identité Maison Ayla, aucun vert', stars.fillColor === 'rgb(10, 10, 10)' && stars.baseColor === 'rgb(216, 216, 216)', `${stars.fillColor} / ${stars.baseColor}`);
  check('Remplissage écrêté (overflow hidden)', stars.overflow === 'hidden');
  check('Étoiles masquées aux lecteurs d\'écran (score déjà en texte)', stars.ariaHidden === 'true');
  check('Score 4,6/5 affiché en clair', stars.scoreText === '4,6/5', stars.scoreText);

  const eta = await page.evaluate(() => {
    const node = document.querySelector('.ma-cro-shipping__eta');
    return { text: node?.textContent || '', hasBlock: !!document.getElementById('maCroShipping') };
  });
  check('Barre de livraison toujours présente', eta.hasBlock);
  check('Date de livraison estimée calculée', /^Livraison estimée entre le .+ et le .+\.$/.test(eta.text), eta.text);

  const noWeekend = await page.evaluate(() => {
    function add(count) {
      const d = new Date();
      let a = 0;
      while (a < count) { d.setDate(d.getDate() + 1); const w = d.getDay(); if (w !== 0 && w !== 6) a++; }
      return d.getDay();
    }
    return { min: add(8), max: add(12) };
  });
  check('Bornes de livraison hors week-end', ![0, 6].includes(noWeekend.min) && ![0, 6].includes(noWeekend.max),
    `j${noWeekend.min}/j${noWeekend.max}`);

  check('Étoiles + ETA : zéro erreur console', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

/* ── 6 ter. Le code promotionnel n'est plus intercepté ─────────────── */
{
  const { ctx, page, setCart } = await newPage();
  const intercepted = await page.evaluate(() => {
    let reached = false;
    const btn = document.createElement('button');
    btn.id = 'cdPromoBtn';
    btn.addEventListener('click', () => { reached = true; });
    document.getElementById('cdPromo').appendChild(btn);
    btn.click();
    return reached;
  });
  check('Le gestionnaire natif du code promo reçoit bien le clic', intercepted === true);
  await ctx.close();
}

/* ── 6 quater. Soutien MATW ────────────────────────────────────────── */
{
  const { ctx, page, errors, setCart } = await newPage();
  await page.evaluate(() => window.MA_TEST.openDrawer());
  await setCart(0);

  check('Panier vide : bulle MATW masquée', (await page.isVisible('#maMatwCart')) === false);

  await setCart(2);
  const matw = await page.evaluate(() => {
    const b = document.getElementById('maMatwCart');
    const prev = b?.previousElementSibling;
    const p = document.getElementById('maMatwProduct');
    return {
      cartVisible: !!b && !b.hidden,
      afterShipping: prev?.id === 'maCroShipping' || prev?.className?.includes('cd-header'),
      insidePanel: !!b && document.getElementById('cdPanel').contains(b),
      beforeCta: !!b && (b.compareDocumentPosition(document.getElementById('cdCheckoutBtn')) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0,
      cartText: b?.textContent || '',
      productExists: !!p,
      productText: p?.textContent || '',
      productLink: p?.querySelector('a')?.getAttribute('href'),
      linkTarget: p?.querySelector('a')?.getAttribute('rel'),
      instances: document.querySelectorAll('.ma-matw').length
    };
  });

  check('Panier rempli : bulle MATW visible', matw.cartVisible);
  check('Bulle MATW dans le drawer', matw.insidePanel);
  check('Bulle MATW placée sous la barre de livraison', matw.afterShipping);
  check('Bulle MATW n\'entre pas en concurrence avec le CTA', matw.beforeCta);
  check('Bulle MATW nomme MATW Project', /MATW Project/.test(matw.cartText), matw.cartText.trim().slice(0, 90));
  check('Aucun chiffre de reversement inventé', !/\d+\s*%/.test(matw.cartText) && /une part/.test(matw.cartText));
  check('Bloc MATW fiche produit injecté après le formulaire', matw.productExists);
  check('Bloc produit nomme MATW Project', /MATW Project/.test(matw.productText));
  check('Lien MATW officiel et sécurisé', matw.productLink === 'https://matwproject.org' && /noopener/.test(matw.linkTarget || ''));
  check('Exactement 2 blocs MATW (panier + produit)', matw.instances === 2, `n=${matw.instances}`);

  await setCart(0);
  check('Retrait du dernier produit : bulle MATW masquée', (await page.isVisible('#maMatwCart')) === false);

  check('MATW : zéro erreur console', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

/* ── 6 quinquies. La mention de test a disparu du bloc de notation ─── */
{
  const { ctx, page, setCart } = await newPage();
  await page.evaluate(() => window.MA_TEST.openDrawer());
  await setCart(1);
  const text = await page.evaluate(() => document.getElementById('maCroTrustpilot')?.textContent || '');
  check('Mention « Aperçu test » retirée du bloc de notation', !/Aper[çc]u test/i.test(text), text.trim().slice(0, 80));
  check('Score 4,6/5 toujours affiché', /4,6\/5/.test(text));
  await ctx.close();
}

/* ── 7. Responsive : pas de scroll horizontal, CTA préservé ────────── */
for (const vp of VIEWPORTS) {
  const { ctx, page, errors, setCart } = await newPage('unpublished', { width: vp.w, height: vp.h });
  await page.evaluate(() => window.MA_TEST.openDrawer());
  await setCart(2);
  await page.waitForTimeout(150);

  const m = await page.evaluate(() => {
    const b = document.getElementById('maCroTrustpilot');
    const btn = document.getElementById('cdCheckoutBtn').getBoundingClientRect();
    const r = b.getBoundingClientRect();
    const smallText = Array.from(b.querySelectorAll('*')).filter((n) => {
      const fs = parseFloat(getComputedStyle(n).fontSize);
      return n.textContent.trim() && fs < 11;
    }).length;
    return {
      overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      panelOverflow: r.right > document.querySelector('.cd-panel').getBoundingClientRect().right + 0.5,
      blockH: Math.round(r.height),
      marginTop: Math.round(parseFloat(getComputedStyle(b).marginTop)),
      borderTop: getComputedStyle(b).borderTopWidth + ' ' + getComputedStyle(b).borderTopColor,
      ctaVisible: btn.bottom <= window.innerHeight && btn.top >= 0,
      smallText
    };
  });
  check(`[${vp.label}] aucun scroll horizontal`, m.overflowX === false);
  check(`[${vp.label}] bloc contenu dans le drawer`, m.panelOverflow === false);
  check(`[${vp.label}] CTA de paiement visible`, m.ctaVisible);
  check(`[${vp.label}] aucun texte < 11px`, m.smallText === 0, `n=${m.smallText}`);
  check(`[${vp.label}] séparateur + marge conformes`, m.marginTop === 14 && m.borderTop === '1px rgb(232, 232, 232)', `mt=${m.marginTop} bt=${m.borderTop}`);
  check(`[${vp.label}] zéro erreur console`, errors.length === 0, errors.join(' | '));

  await page.screenshot({ path: `shot-${vp.label}.png`, fullPage: false });
  await ctx.close();
}

/* ── 8. Mode officiel simulé : TrustBox clonée, repli silencieux ───── */
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));

  await page.route('**/cart.js', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ item_count: 1, items: [], total_price: 8900 })
  }));
  await page.goto(`${PAGE}?role=unpublished`);
  /* Reconfiguration en mode "identifiants fournis" puis rechargement du module. */
  await page.evaluate(() => {
    document.getElementById('ma-cro-trustpilot-config').textContent =
      JSON.stringify({ configured: true, testMode: true, testScore: '4,6/5', profileUrl: 'https://fr.trustpilot.com/review/example.com' });
    const tpl = document.createElement('template');
    tpl.id = 'maCroTrustpilotTemplate';
    tpl.innerHTML = '<div class="trustpilot-widget" data-locale="fr-FR" data-template-id="TPL" data-businessunit-id="BU" data-style-height="52px" data-style-width="100%" data-theme="light"><a href="https://fr.trustpilot.com/review/example.com" target="_blank" rel="noopener noreferrer">Trustpilot</a></div>';
    document.body.appendChild(tpl);
    document.getElementById('maCroTrustpilot')?.remove();
  });
  await page.addScriptTag({ path: path.join(HERE, 'ma-cro-trustpilot.js') });
  await page.evaluate(() => window.MA_TEST.openDrawer());
  await page.evaluate(() => window.MA_TEST.setCart(1));
  await page.waitForTimeout(250);

  const official = await page.evaluate(() => {
    const b = document.getElementById('maCroTrustpilot');
    const w = b?.querySelector('.trustpilot-widget');
    return {
      mode: b?.dataset.maTpMode,
      hasWidget: !!w,
      bu: w?.getAttribute('data-businessunit-id'),
      link: w?.querySelector('a')?.getAttribute('href'),
      ready: b?.dataset.trustpilotReady ?? null,
      homeSvg: b?.querySelectorAll('svg').length
    };
  });
  check('Mode officiel : TrustBox officielle clonée', official.mode === 'official' && official.hasWidget && official.bu === 'BU');
  check('Mode officiel : lien de repli vers le profil Trustpilot', !!official.link);
  check('Mode officiel : aucun SVG maison', official.homeSvg === 0);
  check('Script Trustpilot absent => repli silencieux (data-trustpilot-ready non posé)', official.ready === null, `ready=${official.ready}`);
  check('Mode officiel : zéro erreur console', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

await browser.close();
server.close();

const failed = results.filter((r) => !r.ok);
console.log(`\n──────────────────────────────────────────`);
console.log(`${results.length - failed.length}/${results.length} contrôles réussis`);
if (failed.length) {
  console.log('ÉCHECS :');
  failed.forEach((f) => console.log(`  - ${f.name} ${f.detail}`));
  process.exit(1);
}
