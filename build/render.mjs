/**
 * Banc de rendu Liquid — vérification visuelle hors Shopify.
 *
 * Reproduit assez fidèlement le contexte Shopify (objets globaux, filtres,
 * tags section/form/paginate/schema) pour produire un HTML réel à partir des
 * gabarits JSON. Sert uniquement à la QA locale : ce fichier n'est jamais
 * déployé sur la boutique.
 */
import { Liquid } from 'liquidjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const THEME = path.join(HERE, '..', 'theme');
const OUT = path.join(HERE, 'preview');

/* ------------------------------------------------------------------ moteur */
const engine = new Liquid({
  root: [path.join(THEME, 'snippets'), path.join(THEME, 'sections'), THEME],
  extname: '.liquid',
  jekyllInclude: false,
  strictFilters: false,
  strictVariables: false
});

/* ------------------------------------------------------------------ filtres */
const money = (v) => (Number(v || 0) / 100).toFixed(2).replace('.', ',') + ' €';

engine.registerFilter('asset_url', (v) => `assets/${v}`);
engine.registerFilter('stylesheet_tag', (v) => `<link rel="stylesheet" href="${v}">`);
engine.registerFilter('script_tag', (v) => `<script src="${v}"></script>`);
// Les valeurs d'image_picker sont des références « shopify://shop_images/… ».
// On les résout vers l'URL réelle du CDN pour que la maquette montre les
// vraies images, et non un rectangle gris qui masquerait tout défaut.
const SHOP_FILES = JSON.parse(fs.readFileSync(path.join(HERE, 'shop_files.json'), 'utf8'));
// Le CDN Shopify n'est pas joignable depuis l'environnement de test. Quand des
// gabarits locaux existent (mêmes dimensions exactes que les fichiers réels),
// on les sert : la géométrie de la mise en page est alors fidèle, seul le
// contenu du visuel diffère. PREVIEW_CDN=1 force l'URL réelle.
function resoudreImage(v) {
  const s = String(v || '');
  const m = s.match(/^shopify:\/\/shop_images\/(.+)$/);
  if (!m) return null;
  const nom = m[1];
  const local = path.join(OUT, 'mock', nom.replace(/\.[^.]+$/, '') + '.png');
  if (!process.env.PREVIEW_CDN && fs.existsSync(local)) {
    return 'mock/' + nom.replace(/\.[^.]+$/, '') + '.png';
  }
  return SHOP_FILES[nom] || null;
}
engine.registerFilter('image_url', function (v, ...args) {
  const reel = resoudreImage(v);
  if (reel) return reel;
  const width = args.length ? args[args.length - 1] : 1200;
  const seed = encodeURIComponent(String(v || 'placeholder')).slice(0, 24);
  return `https://placehold.co/${width}x${Math.round(width * 0.62)}/1b201e/98a39e?text=${seed}`;
});
engine.registerFilter('image_tag', function (src, ...rest) {
  // liquidjs transmet les arguments nommés sous forme de paires [clé, valeur].
  // Les lire comme des objets faisait perdre class et alt : la maquette
  // affichait alors des images sans style et sans texte alternatif, ce qui
  // faussait à la fois le rendu et l'audit d'accessibilité.
  const opts = {};
  for (const r of rest) {
    if (Array.isArray(r) && r.length === 2) opts[r[0]] = r[1];
    else if (r && typeof r === 'object') Object.assign(opts, r);
  }
  const attrs = [`src="${src}"`, `loading="${opts.loading || 'lazy'}"`];
  if (opts.width) attrs.push(`width="${opts.width}"`);
  if (opts.height) attrs.push(`height="${opts.height}"`);
  if (opts.class) attrs.push(`class="${opts.class}"`);
  if (opts.sizes) attrs.push(`sizes="${opts.sizes}"`);
  attrs.push(`alt="${String(opts.alt || '').replace(/"/g, '&quot;')}"`);
  return `<img ${attrs.join(' ')}>`;
});
engine.registerFilter('money', money);
engine.registerFilter('handle', (v) =>
  String(v || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
engine.registerFilter('handleize', (v) => engine.filters.handle.call(null, v));
engine.registerFilter('default_errors', (v) => `<span>${v}</span>`);
engine.registerFilter('within', (v) => v);
engine.registerFilter('link_to', (v, url) => `<a href="${url}">${v}</a>`);
engine.registerFilter('json', (v) => JSON.stringify(v === undefined ? null : v));
engine.registerFilter('t', (v) => v);

/* -------------------------------------------------------------------- tags */
// {% schema %} … {% endschema %} : ignoré au rendu.
engine.registerTag('schema', {
  parse(token, remain) {
    while (remain.length) { const t = remain.shift(); if (t.name === 'endschema') break; }
  },
  render() { return ''; }
});

// {% section 'nom' %}
engine.registerTag('section', {
  parse(token) { this.name = token.args.trim().replace(/^['"]|['"]$/g, ''); },
  async render(ctx) { return renderSection(this.name, {}, ctx.environments); }
});

// {% form 'type', id: '…', class: '…' %} … {% endform %}
// Shopify reporte id et class sur la balise <form> : sans cela, l'aperçu perd
// la classe de mise en page et affiche une structure fausse.
engine.registerTag('form', {
  parse(token, remain) {
    const args = token.args || '';
    this.formClass = (args.match(/class:\s*'([^']*)'/) || [])[1] || '';
    this.formId = (args.match(/id:\s*'([^']*)'/) || [])[1] || '';
    this.tpls = [];
    const stream = this.liquid.parser.parseStream(remain)
      .on('template', (tpl) => this.tpls.push(tpl))
      .on('tag:endform', function () { this.stop(); })
      .on('end', () => { throw new Error('{% form %} non fermé'); });
    stream.start();
  },
  *render(ctx, emitter) {
    ctx.push({ form: { posted_successfully: false, errors: null } });
    const html = yield this.liquid.renderer.renderTemplates(this.tpls, ctx);
    ctx.pop();
    const attrs = ['method="post"', 'action="/contact#contact_form"', 'accept-charset="UTF-8"'];
    if (this.formId) attrs.push(`id="${this.formId}"`);
    if (this.formClass) attrs.push(`class="${this.formClass}"`);
    emitter.write(`<form ${attrs.join(' ')}>${html}</form>`);
  }
});

// {% paginate collection by n %} … {% endpaginate %}
engine.registerTag('paginate', {
  parse(token, remain) {
    this.tpls = [];
    const stream = this.liquid.parser.parseStream(remain)
      .on('template', (tpl) => this.tpls.push(tpl))
      .on('tag:endpaginate', function () { this.stop(); })
      .on('end', () => { throw new Error('{% paginate %} non fermé'); });
    stream.start();
  },
  *render(ctx, emitter) {
    ctx.push({ paginate: { pages: 1, current_page: 1, parts: [] } });
    emitter.write(yield this.liquid.renderer.renderTemplates(this.tpls, ctx));
    ctx.pop();
  }
});

/* ---------------------------------------------------- contexte Shopify simulé */
const link = (title, url, links = []) => ({ title, url, links, active: false, child_active: false });

const MENUS = {
  main: [
    link('Accueil', '/'),
    link('Services', '#', [
      link('Consultant SEO', '/pages/agence-seo'),
      link('Site vitrine', '/pages/creation-site-vitrine'),
      link('Agence Shopify', '/pages/agence-shopify'),
      link('Optimisation CRO', '/pages/optimisation-cro'),
      link('Meta Ads', '/pages/expert-meta-ads'),
      link('Audit SEO', '/pages/audit-seo')
    ]),
    link('Résultats', '/pages/resultats'),
    link('Blog', '/blogs/ressources'),
    link('À propos', '/pages/a-propos'),
    link('Contact', '/pages/contact')
  ],
  services: [
    link('Agence SEO', '/pages/agence-seo'), link('SEO local', '/pages/seo-local'),
    link('SEO e-commerce', '/pages/seo-ecommerce'), link('Audit SEO', '/pages/audit-seo'),
    link('Création site vitrine', '/pages/creation-site-vitrine'),
    link('Agence Shopify', '/pages/agence-shopify'), link('Expert Meta Ads', '/pages/expert-meta-ads'),
    link('Optimisation CRO', '/pages/optimisation-cro')
  ],
  zones: ['Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Nantes', 'Lille', 'Toulouse', 'Nice', 'Rennes', 'Strasbourg']
    .map((v) => link(`SEO ${v}`, `/pages/agence-seo-${v.toLowerCase()}`)),
  resources: [
    link('Résultats', '/pages/resultats'), link('Blog', '/blogs/ressources'),
    link('À propos', '/pages/a-propos'), link('Contact', '/pages/contact'),
    link('Plan du site', '/pages/plan-du-site')
  ],
  legal: [link('Mentions légales', '/pages/mentions-legales'), link('Confidentialité', '/pages/politique-de-confidentialite')]
};

function themeSettings() {
  const groups = JSON.parse(fs.readFileSync(path.join(THEME, 'config', 'settings_schema.json'), 'utf8'));
  const s = {};
  groups.forEach((g) => (g.settings || []).forEach((f) => { if (f.id) s[f.id] = f.default ?? ''; }));
  Object.assign(s, {
    header_menu: { links: MENUS.main },
    footer_services_menu: { links: MENUS.services },
    footer_zones_menu: { links: MENUS.zones },
    footer_resources_menu: { links: MENUS.resources },
    footer_legal_menu: { links: MENUS.legal },
    palette_blog: { articles: [
      { title: 'Structurer une arborescence SEO qui tient dans le temps', url: '/blogs/ressources/arborescence-seo' },
      { title: 'Fiche produit Shopify : ce qui fait vraiment basculer l’achat', url: '/blogs/ressources/fiche-produit' }
    ] },
    logo: ''
  });
  // Les valeurs réellement enregistrées priment sur les défauts du schema :
  // sans cela la maquette teste une configuration qui n'existe nulle part.
  const data = JSON.parse(fs.readFileSync(path.join(THEME, 'config', 'settings_data.json'), 'utf8'));
  for (const [k, v] of Object.entries(data.current || {})) {
    if (k === 'sections' || typeof v === 'object') continue;
    if (typeof s[k] === 'object' && s[k] !== null) continue;   // menus déjà simulés
    s[k] = v;
  }
  if (!s.share_image) s.share_image = '';
  return s;
}

const BASE = {
  shop: { name: 'Clickscreation', url: 'https://clickscreation.com', email: 'contact@clickscreation.com' },
  routes: { root_url: '/', search_url: '/search', cart_url: '/cart' },
  request: { locale: { iso_code: 'fr' }, page_type: 'index' },
  template: { name: 'index', suffix: '' },
  canonical_url: 'https://clickscreation.com/',
  page_title: 'Clickscreation',
  page_description: '',
  content_for_header: '',
  current_tags: null,
  current_page: 1,
  settings: themeSettings(),
  page: { title: 'Page', content: '', handle: 'page', metafields: {} },
  blog: { title: 'Ressources', url: '/blogs/ressources', articles: [], all_tags: [] },
  article: { title: '', content: '', metafields: {} },
  cart: { item_count: 0, items: [], total_price: 0 },
  search: { performed: false, results: [], results_count: 0, terms: '' },
  product: { title: '', variants: [], media: [] },
  collection: { title: '', products: [], description: '' },
  form: { posted_successfully: false, errors: null }
};

/* ------------------------------------------------------- rendu d'une section */
function schemaOf(file) {
  const m = file.match(/\{%-?\s*schema\s*-?%\}([\s\S]*?)\{%-?\s*endschema\s*-?%\}/);
  return m ? JSON.parse(m[1]) : { settings: [], blocks: [] };
}

/**
 * Sur Shopify, un réglage de type `link_list` ou `blog` est résolu en objet
 * (avec .links / .articles). Le défaut du schema n'est qu'un identifiant :
 * si on le laissait tel quel, toute navigation issue d'un réglage de section
 * rendrait à vide dans l'aperçu — et masquerait la moitié de l'interface.
 */
const BLOG_MOCK = {
  title: 'Ressources', url: '/blogs/ressources',
  articles: [
    { title: 'Structurer une arborescence SEO qui tient dans le temps', url: '/blogs/ressources/arborescence-seo' },
    { title: 'Fiche produit Shopify : ce qui fait vraiment basculer l’achat', url: '/blogs/ressources/fiche-produit' },
    { title: 'Pourquoi vos pages de ville ne se positionnent pas', url: '/blogs/ressources/pages-ville' }
  ]
};

const LINKLIST_BY_DEFAULT = {
  'main-menu': { links: MENUS.main },
  'menu-footer-services-cs26': { links: MENUS.services },
  'menu-footer-villes-cs26': { links: MENUS.zones },
  'menu-footer-ressources-cs26': { links: MENUS.resources },
  'menu-legal-cs26': { links: MENUS.legal }
};

function defaultsFrom(list = []) {
  const out = {};
  list.forEach((f) => {
    if (!f.id) return;
    if (f.type === 'link_list') {
      out[f.id] = LINKLIST_BY_DEFAULT[f.default] || { links: MENUS.main };
    } else if (f.type === 'blog') {  // page-sitemap et la palette listent des articles
      out[f.id] = { articles: [], title: 'Ressources', url: '/blogs/ressources' };
    } else {
      out[f.id] = f.default ?? '';
    }
  });
  return out;
}

/**
 * En-tête et pied de page sont insérés par le layout via {% section %}, donc
 * sans gabarit JSON : leurs blocs viennent normalement de settings_data.json.
 * On reproduit ici la configuration livrée, sinon l'aperçu montrerait un pied
 * de page vide qui ne correspond à rien.
 */
const SECTION_BLOCKS = {
  header: {
    blocks: {
      n1: { type: 'nav_note', settings: { handle: 'agence-seo', description: 'Capter la demande déjà présente sur votre marché.', icon: 'signal' } },
      n2: { type: 'nav_note', settings: { handle: 'creation-site-vitrine', description: 'Un site développé pour votre modèle, pas pour un gabarit.', icon: 'layers' } },
      n3: { type: 'nav_note', settings: { handle: 'agence-shopify', description: 'Boutique pensée pour la décision d’achat mobile.', icon: 'cart' } },
      n4: { type: 'nav_note', settings: { handle: 'optimisation-cro', description: 'Retirer ce qui empêche vos visiteurs d’agir.', icon: 'gauge' } },
      n5: { type: 'nav_note', settings: { handle: 'expert-meta-ads', description: 'Accélérer une offre qui tient déjà debout.', icon: 'megaphone' } },
      n6: { type: 'nav_note', settings: { handle: 'audit-seo', description: 'Un état des lieux chiffré avant toute décision.', icon: 'target' } },
      sp: { type: 'nav_spotlight', settings: {
        parent: 'Services', eyebrow: 'Dernier résultat', title: 'Maison Ayla — refonte de l’architecture SEO.',
        metric: '+350 %', metric_label: 'clics organiques en 3 mois',
        text: 'Trois mois de travail sur la structure et la couverture des intentions de recherche.',
        cta_label: 'Voir les résultats', cta_url: '/pages/resultats' } }
    },
    block_order: ['n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'sp']
  },
  footer: {
    blocks: {
      f1: { type: 'menu', settings: { title: 'Expertises', menu: { links: MENUS.services } } },
      f2: { type: 'menu', settings: { title: 'SEO par ville', menu: { links: MENUS.zones }, dense: true, extra_label: 'Toutes les zones', extra_url: '/pages/seo-par-ville' } },
      f3: { type: 'menu', settings: { title: 'Ressources', menu: { links: MENUS.resources } } },
      f4: { type: 'menu', settings: { title: 'Légal', menu: { links: MENUS.legal } } }
    },
    block_order: ['f1', 'f2', 'f3', 'f4']
  }
};

async function renderSection(type, conf, env) {
  const file = fs.readFileSync(path.join(THEME, 'sections', `${type}.liquid`), 'utf8');
  const schema = schemaOf(file);

  if (!conf.blocks && SECTION_BLOCKS[type]) conf = Object.assign({}, conf, SECTION_BLOCKS[type]);

  /* Les valeurs venues du gabarit JSON sont des identifiants (« main-menu »).
     Shopify les résout en objets ; le banc doit faire pareil, sinon toute
     navigation définie dans un gabarit rend à vide. */
  const coerce = (fieldList, values) => {
    const types = Object.fromEntries((fieldList || []).filter((f) => f.id).map((f) => [f.id, f.type]));
    const out = Object.assign({}, values);
    for (const [k, v] of Object.entries(out)) {
      if (typeof v !== 'string' || !v) continue;
      if (types[k] === 'link_list') out[k] = LINKLIST_BY_DEFAULT[v] || { links: MENUS.main };
      if (types[k] === 'blog') out[k] = BLOG_MOCK;
    }
    return out;
  };

  const settings = Object.assign(defaultsFrom(schema.settings),
                                 coerce(schema.settings, conf.settings || {}));
  const blockSchema = Object.fromEntries((schema.blocks || []).map((b) => [b.type, b.settings]));
  const blockDefs = Object.fromEntries((schema.blocks || []).map((b) => [b.type, defaultsFrom(b.settings)]));

  const order = conf.block_order || Object.keys(conf.blocks || {});
  const blocks = order.map((id) => {
    const b = (conf.blocks || {})[id];
    return {
      id, type: b.type,
      settings: Object.assign({}, blockDefs[b.type] || {},
                              coerce(blockSchema[b.type], b.settings || {})),
      shopify_attributes: ''
    };
  });

  const section = { id: conf.id || type, settings, blocks, blocks_size: blocks.length };
  return engine.parseAndRender(file, Object.assign({}, env, { section }), { globals: env });
}

/* ------------------------------------------------------------- rendu de page */
async function renderTemplate(templateName, overrides = {}) {
  const tpl = JSON.parse(fs.readFileSync(path.join(THEME, 'templates', `${templateName}.json`), 'utf8'));
  const env = Object.assign({}, BASE, overrides);

  let body = '';
  for (const key of tpl.order) {
    const conf = Object.assign({ id: key }, tpl.sections[key]);
    body += await renderSection(conf.type, conf, env);
  }

  const layout = fs.readFileSync(path.join(THEME, 'layout', 'theme.liquid'), 'utf8');
  return engine.parseAndRender(layout, Object.assign({}, env, { content_for_layout: body }), { globals: env });
}

/* ---------------------------------------------------------------------- main */
// Toutes les pages publiées, lues depuis le manifeste : l'audit doit porter
// sur l'intégralité du site, pas sur un échantillon.
const manifest = JSON.parse(fs.readFileSync(path.join(HERE, 'live_pages.json'), 'utf8'));
const pages = manifest.map((p) => {
  if (p.template === 'index') return ['index', 'index', {}];
  return [p.handle, `page.${p.suffix}`, {
    canonical_url: `https://clickscreation.com/pages/${p.handle}`,
    request: { locale: { iso_code: 'fr' }, page_type: 'page' },
    page: {
      title: p.title,
      content: p.content || '',
      handle: p.handle,
      url: `/pages/${p.handle}`,
      metafields: {
        seo_release: {
          title_tag: { value: p.titleTag || '' },
          description_tag: { value: p.descTag || '' }
        }
      }
    }
  }];
}).concat([['404', '404', { request: { locale: { iso_code: 'fr' }, page_type: '404' } }]]);

fs.mkdirSync(OUT, { recursive: true });
const assetLink = path.join(OUT, 'assets');
if (!fs.existsSync(assetLink)) fs.symlinkSync(path.join(THEME, 'assets'), assetLink, 'dir');

let failed = 0;
for (const [name, template, ctx] of pages) {
  try {
    const html = await renderTemplate(template, ctx);
    fs.writeFileSync(path.join(OUT, `${name}.html`), html);
    console.log(`ok    ${name}.html  (${(html.length / 1024).toFixed(1)} Ko)`);
  } catch (err) {
    failed++;
    console.error(`ÉCHEC ${name} — ${err.message}`);
  }
}
process.exit(failed ? 1 : 0);
