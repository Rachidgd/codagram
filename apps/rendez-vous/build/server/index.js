var _a;
import { jsx, jsxs } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@remix-run/node";
import { RemixServer, Meta, Links, Outlet, ScrollRestoration, Scripts, useLoaderData, useNavigation, Form, useFetcher, Link, useRouteError } from "@remix-run/react";
import * as isbotModule from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { Page, Layout, Card, BlockStack, Text, DataTable, FormLayout, TextField, Select, Button, Banner, EmptyState, InlineStack, Badge } from "@shopify/polaris";
import { TitleBar, NavMenu } from "@shopify/app-bridge-react";
import { useState } from "react";
import "@shopify/shopify-app-remix/adapters/node";
import { shopifyApp, AppDistribution, ApiVersion } from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { PrismaClient } from "@prisma/client";
import { AppProvider } from "@shopify/shopify-app-remix/react";
const ABORT_DELAY = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, remixContext, loadContext) {
  let prohibitOutOfOrderStreaming = isBotRequest(request.headers.get("user-agent")) || remixContext.isSpaMode;
  return prohibitOutOfOrderStreaming ? handleBotRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  ) : handleBrowserRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  );
}
function isBotRequest(userAgent) {
  if (!userAgent) {
    return false;
  }
  if ("isbot" in isbotModule && typeof isbotModule.isbot === "function") {
    return isbotModule.isbot(userAgent);
  }
  if ("default" in isbotModule && typeof isbotModule.default === "function") {
    return isbotModule.default(userAgent);
  }
  return false;
}
function handleBotRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        }
      ),
      {
        onAllReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
function handleBrowserRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        }
      ),
      {
        onShellReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest
}, Symbol.toStringTag, { value: "Module" }));
function App$1() {
  return /* @__PURE__ */ jsxs("html", { lang: "fr", children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx("meta", { charSet: "utf-8" }),
      /* @__PURE__ */ jsx("meta", { name: "viewport", content: "width=device-width,initial-scale=1" }),
      /* @__PURE__ */ jsx("link", { rel: "preconnect", href: "https://cdn.shopify.com/" }),
      /* @__PURE__ */ jsx(Meta, {}),
      /* @__PURE__ */ jsx(Links, {})
    ] }),
    /* @__PURE__ */ jsxs("body", { children: [
      /* @__PURE__ */ jsx(Outlet, {}),
      /* @__PURE__ */ jsx(ScrollRestoration, {}),
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: App$1
}, Symbol.toStringTag, { value: "Module" }));
const prisma = global.prismaGlobal ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") global.prismaGlobal = prisma;
const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.January25,
  scopes: (_a = process.env.SCOPES) == null ? void 0 : _a.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  future: { unstable_newEmbeddedAuthStrategy: true, removeRest: true }
});
ApiVersion.January25;
shopify.addDocumentResponseHeaders;
const authenticate = shopify.authenticate;
shopify.unauthenticated;
shopify.login;
shopify.registerWebhooks;
shopify.sessionStorage;
const REQUETE_DONNEES = `#graphql
  query Donnees {
    soins: metaobjects(type: "ely_soin", first: 50) {
      nodes { handle fields { key value } }
    }
    plages: metaobjects(type: "ely_disponibilite", first: 100) {
      nodes {
        handle
        fields {
          key
          value
          references(first: 20) { nodes { ... on Metaobject { handle } } }
        }
      }
    }
    fermetures: metaobjects(type: "ely_fermeture", first: 100) {
      nodes { handle fields { key value } }
    }
  }
`;
const champ = (n, cle) => {
  var _a2;
  return ((_a2 = n.fields.find((f) => f.key === cle)) == null ? void 0 : _a2.value) ?? "";
};
const nombre = (n, cle, defaut = 0) => {
  const v = Number(champ(n, cle));
  return Number.isFinite(v) ? v : defaut;
};
const references = (n, cle) => {
  var _a2, _b;
  return ((_b = (_a2 = n.fields.find((f) => f.key === cle)) == null ? void 0 : _a2.references) == null ? void 0 : _b.nodes.map((r) => r.handle)) ?? [];
};
async function lireDonnees(admin) {
  const reponse = await admin.graphql(REQUETE_DONNEES);
  const { data } = await reponse.json();
  const soins = data.soins.nodes.filter((n) => champ(n, "actif") === "true").map((n) => ({
    handle: n.handle,
    nom: champ(n, "nom"),
    duree: nombre(n, "duree_minutes", 60),
    battement: nombre(n, "battement_minutes", 0),
    ordre: nombre(n, "ordre", 99)
  })).sort((a, b) => (a.ordre ?? 99) - (b.ordre ?? 99));
  const plages = data.plages.nodes.filter((n) => champ(n, "actif") === "true").map((n) => ({
    jour: champ(n, "jour"),
    debut: champ(n, "debut"),
    fin: champ(n, "fin"),
    soins: references(n, "soins")
  }));
  const fermetures = data.fermetures.nodes.map((n) => ({
    debut: champ(n, "date_debut"),
    fin: champ(n, "date_fin")
  }));
  return { soins, plages, fermetures };
}
const MUTATION_CREATION = `#graphql
  mutation CreerPlage($metaobject: MetaobjectCreateInput!) {
    metaobjectCreate(metaobject: $metaobject) {
      metaobject { id handle }
      userErrors { field message }
    }
  }
`;
async function creerPlage(admin, plage) {
  const reponse = await admin.graphql(MUTATION_CREATION, {
    variables: {
      metaobject: {
        type: "ely_disponibilite",
        fields: [
          { key: "libelle", value: plage.libelle },
          { key: "jour", value: plage.jour },
          { key: "debut", value: plage.debut },
          { key: "fin", value: plage.fin },
          { key: "actif", value: String(plage.actif) }
        ]
      }
    }
  });
  return reponse.json();
}
const JOURS = [
  "dimanche",
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi"
];
function enMinutes(heure) {
  const [h, m] = String(heure ?? "").split(":");
  const total = Number(h) * 60 + Number(m);
  return Number.isFinite(total) ? total : null;
}
function enHeure(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
function jour(iso) {
  return /* @__PURE__ */ new Date(`${iso}T12:00:00Z`);
}
function enISO(date) {
  return date.toISOString().slice(0, 10);
}
function maintenantAuCabinet(fuseau, reference = /* @__PURE__ */ new Date()) {
  const format = new Intl.DateTimeFormat("en-CA", {
    timeZone: fuseau,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
  const p = Object.fromEntries(
    format.formatToParts(reference).map((x) => [x.type, x.value])
  );
  return {
    date: `${p.year}-${p.month}-${p.day}`,
    minutes: Number(p.hour) * 60 + Number(p.minute)
  };
}
function estFerme(iso, fermetures) {
  return fermetures.some((f) => f.debut && f.fin && iso >= f.debut && iso <= f.fin);
}
function plagesDuJour(iso, soin, plages) {
  const nom = JOURS[jour(iso).getUTCDay()];
  return plages.filter((p) => {
    if (p.jour !== nom) return false;
    if (Array.isArray(p.soins) && p.soins.length) return p.soins.includes(soin.handle);
    return true;
  });
}
function chevauche(debut, fin, occupations, iso) {
  return occupations.some((o) => o.date === iso && debut < o.fin && o.debut < fin);
}
function creneauxDuJour(iso, soin, ctx) {
  if (estFerme(iso, ctx.fermetures)) return [];
  const maintenant = maintenantAuCabinet(ctx.fuseau, ctx.reference);
  if (iso < maintenant.date) return [];
  const pas = soin.duree + (soin.battement || 0);
  const plancher = iso === maintenant.date ? maintenant.minutes + ctx.delai * 60 : -1;
  const liste = [];
  for (const p of plagesDuJour(iso, soin, ctx.plages)) {
    const debut = enMinutes(p.debut);
    const fin = enMinutes(p.fin);
    if (debut === null || fin === null) continue;
    for (let t = debut; t + soin.duree <= fin; t += pas) {
      if (t <= plancher) continue;
      if (chevauche(t, t + pas, ctx.occupations, iso)) continue;
      liste.push(t);
    }
  }
  return [...new Set(liste)].sort((a, b) => a - b);
}
function joursOuverts(soin, ctx) {
  const sortie = [];
  const curseur = jour(maintenantAuCabinet(ctx.fuseau, ctx.reference).date);
  for (let i = 0; i < ctx.horizon; i += 1) {
    const iso = enISO(curseur);
    const creneaux = creneauxDuJour(iso, soin, ctx);
    if (creneaux.length) sortie.push({ iso, creneaux });
    curseur.setUTCDate(curseur.getUTCDate() + 1);
  }
  return sortie;
}
function creneauValide(iso, minutes, soin, ctx) {
  return creneauxDuJour(iso, soin, ctx).includes(minutes);
}
async function loader$4({ request }) {
  const { admin } = await authenticate.admin(request);
  return lireDonnees(admin);
}
async function action$3({ request }) {
  const { admin } = await authenticate.admin(request);
  const f = await request.formData();
  const debut = String(f.get("debut") || "");
  const fin = String(f.get("fin") || "");
  const horaire = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (!horaire.test(debut) || !horaire.test(fin)) {
    return { erreur: "Les horaires doivent être au format 24 h, par exemple 09:30." };
  }
  if (fin <= debut) {
    return { erreur: "La fermeture doit être postérieure à l’ouverture." };
  }
  await creerPlage(admin, {
    libelle: String(f.get("libelle") || "Nouvelle plage"),
    jour: String(f.get("jour") || "mardi"),
    debut,
    fin,
    actif: true
  });
  return { ok: true };
}
function Disponibilites() {
  const { soins, plages } = useLoaderData();
  const navigation = useNavigation();
  const [jourChoisi, setJourChoisi] = useState("mardi");
  const semaine = [...JOURS.slice(1), JOURS[0]];
  return /* @__PURE__ */ jsxs(Page, { children: [
    /* @__PURE__ */ jsx(TitleBar, { title: "Disponibilités" }),
    /* @__PURE__ */ jsxs(Layout, { children: [
      /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "300", children: [
        /* @__PURE__ */ jsx(Text, { as: "h2", variant: "headingMd", children: "Plages d'ouverture" }),
        /* @__PURE__ */ jsx(
          DataTable,
          {
            columnContentTypes: ["text", "text", "text", "text"],
            headings: ["Jour", "Ouverture", "Fermeture", "Soins concernés"],
            rows: plages.map((p) => [
              p.jour,
              p.debut,
              p.fin,
              p.soins.length ? p.soins.join(", ") : "Tous"
            ])
          }
        )
      ] }) }) }),
      /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(Form, { method: "post", children: /* @__PURE__ */ jsxs(FormLayout, { children: [
        /* @__PURE__ */ jsx(Text, { as: "h2", variant: "headingMd", children: "Ajouter une plage" }),
        /* @__PURE__ */ jsx(TextField, { label: "Libellé", name: "libelle", autoComplete: "off" }),
        /* @__PURE__ */ jsx(
          Select,
          {
            label: "Jour",
            name: "jour",
            value: jourChoisi,
            onChange: setJourChoisi,
            options: semaine.map((j) => ({ label: j, value: j }))
          }
        ),
        /* @__PURE__ */ jsxs(FormLayout.Group, { children: [
          /* @__PURE__ */ jsx(
            TextField,
            {
              label: "Ouverture",
              name: "debut",
              placeholder: "09:30",
              autoComplete: "off"
            }
          ),
          /* @__PURE__ */ jsx(TextField, { label: "Fermeture", name: "fin", placeholder: "13:00", autoComplete: "off" })
        ] }),
        /* @__PURE__ */ jsx(Button, { submit: true, loading: navigation.state === "submitting", children: "Ajouter" })
      ] }) }) }) }),
      /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "300", children: [
        /* @__PURE__ */ jsx(Text, { as: "h2", variant: "headingMd", children: "Durées par soin" }),
        /* @__PURE__ */ jsx(Banner, { tone: "info", children: "La durée du créneau et le battement se modifient dans l'admin, sous Contenu → Métaobjets → Rendez-vous — soin." }),
        /* @__PURE__ */ jsx(
          DataTable,
          {
            columnContentTypes: ["text", "numeric", "numeric", "numeric"],
            headings: ["Soin", "Durée", "Battement", "Cabine occupée"],
            rows: soins.map((s) => [
              s.nom,
              `${s.duree} min`,
              `${s.battement} min`,
              `${s.duree + s.battement} min`
            ])
          }
        )
      ] }) }) })
    ] })
  ] });
}
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$3,
  default: Disponibilites,
  loader: loader$4
}, Symbol.toStringTag, { value: "Module" }));
const FUSEAU$2 = process.env.FUSEAU_CABINET || "Europe/Paris";
const HORIZON = Number(process.env.HORIZON_JOURS || 28);
const DELAI$1 = Number(process.env.DELAI_HEURES || 24);
async function loader$3({ request }) {
  const { admin, session } = await authenticate.public.appProxy(request);
  if (!admin || !session) {
    return new Response(JSON.stringify({ erreur: "Boutique inconnue" }), {
      status: 401,
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  }
  const { soins, plages, fermetures } = await lireDonnees(admin);
  const occupations = (await prisma.reservation.findMany({
    where: { shop: session.shop, statut: { not: "annule" } },
    select: { date: true, debut: true, fin: true }
  })).map((r) => ({ date: r.date, debut: r.debut, fin: r.fin }));
  const contexte = {
    plages,
    fermetures,
    occupations,
    fuseau: FUSEAU$2,
    horizon: HORIZON,
    delai: DELAI$1
  };
  const resultat = soins.map((soin) => ({
    handle: soin.handle,
    nom: soin.nom,
    duree: soin.duree,
    jours: joursOuverts(soin, contexte).map((j) => ({
      date: j.iso,
      creneaux: j.creneaux.map(enHeure)
    }))
  }));
  return new Response(JSON.stringify({ fuseau: FUSEAU$2, soins: resultat }), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      // Court, mais suffisant pour absorber une rafale de visiteurs sans
      // servir un agenda périmé.
      "Cache-Control": "public, max-age=60"
    }
  });
}
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader: loader$3
}, Symbol.toStringTag, { value: "Module" }));
const FUSEAU$1 = process.env.FUSEAU_CABINET || "Europe/Paris";
Number(process.env.HORIZON_JOURS || 28);
const DELAI = Number(process.env.DELAI_HEURES || 24);
const json = (corps, statut = 200) => new Response(JSON.stringify(corps), {
  status: statut,
  headers: { "Content-Type": "application/json; charset=utf-8" }
});
async function action$2({ request }) {
  const { admin, session } = await authenticate.public.appProxy(request);
  if (!admin || !session) return json({ erreur: "Boutique inconnue" }, 401);
  const f = await request.formData();
  const soinHandle = String(f.get("soin") || "");
  const date = String(f.get("date") || "");
  const heure = String(f.get("heure") || "");
  const nom = String(f.get("nom") || "").trim();
  const email = String(f.get("email") || "").trim();
  const telephone = String(f.get("telephone") || "").trim();
  const message = String(f.get("message") || "").trim() || null;
  if (String(f.get("reference") || "")) return json({ ok: true });
  if (!nom || !email || !telephone) {
    return json({ erreur: "Nom, adresse e-mail et téléphone sont nécessaires." }, 422);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return json({ erreur: "Date invalide." }, 422);
  const debut = enMinutes(heure);
  if (debut === null) return json({ erreur: "Heure invalide." }, 422);
  const { soins, plages, fermetures } = await lireDonnees(admin);
  const soin = soins.find((s) => s.handle === soinHandle);
  if (!soin) return json({ erreur: "Ce soin n’est plus proposé à la réservation." }, 422);
  const occupations = (await prisma.reservation.findMany({
    where: { shop: session.shop, date, statut: { not: "annule" } },
    select: { date: true, debut: true, fin: true }
  })).map((r) => ({ date: r.date, debut: r.debut, fin: r.fin }));
  const contexte = {
    plages,
    fermetures,
    occupations,
    fuseau: FUSEAU$1,
    delai: DELAI
  };
  if (!creneauValide(date, debut, soin, contexte)) {
    return json({ erreur: "Ce créneau vient d’être pris ou n’est plus ouvert.", repris: true }, 409);
  }
  try {
    const reservation = await prisma.reservation.create({
      data: {
        shop: session.shop,
        soin: soin.handle,
        soinNom: soin.nom,
        date,
        debut,
        fin: debut + soin.duree + soin.battement,
        nom,
        email,
        telephone,
        message
      }
    });
    return json({ ok: true, id: reservation.id });
  } catch {
    return json({ erreur: "Ce créneau vient d’être pris.", repris: true }, 409);
  }
}
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$2
}, Symbol.toStringTag, { value: "Module" }));
const FUSEAU = process.env.FUSEAU_CABINET || "Europe/Paris";
async function loader$2({ request }) {
  const { session } = await authenticate.admin(request);
  const aujourdHui = maintenantAuCabinet(FUSEAU).date;
  const horizon = jour(aujourdHui);
  horizon.setUTCDate(horizon.getUTCDate() + 30);
  const reservations = await prisma.reservation.findMany({
    where: {
      shop: session.shop,
      statut: { not: "annule" },
      date: { gte: aujourdHui, lte: enISO(horizon) }
    },
    orderBy: [{ date: "asc" }, { debut: "asc" }]
  });
  return { reservations, aujourdHui };
}
async function action$1({ request }) {
  const { session } = await authenticate.admin(request);
  const formulaire = await request.formData();
  const id = String(formulaire.get("id"));
  const statut = String(formulaire.get("statut"));
  if (!["demande", "confirme", "annule"].includes(statut)) {
    return { erreur: "Statut inconnu" };
  }
  await prisma.reservation.updateMany({
    where: { id, shop: session.shop },
    data: { statut }
  });
  return { ok: true };
}
function formaterJour(iso) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC"
  }).format(jour(iso));
}
function Agenda() {
  const { reservations, aujourdHui } = useLoaderData();
  const fetcher = useFetcher();
  const parJour = reservations.reduce((acc, r) => {
    var _a2;
    (acc[_a2 = r.date] || (acc[_a2] = [])).push(r);
    return acc;
  }, {});
  const jours = Object.keys(parJour).sort();
  return /* @__PURE__ */ jsxs(Page, { children: [
    /* @__PURE__ */ jsx(TitleBar, { title: "Agenda" }),
    /* @__PURE__ */ jsx(Layout, { children: /* @__PURE__ */ jsx(Layout.Section, { children: jours.length === 0 ? /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(
      EmptyState,
      {
        heading: "Aucun rendez-vous sur les trente prochains jours",
        image: "",
        children: /* @__PURE__ */ jsx("p", { children: "Les demandes envoyées depuis la boutique arrivent ici. Vérifiez que vos plages d'ouverture sont bien renseignées." })
      }
    ) }) : /* @__PURE__ */ jsx(BlockStack, { gap: "400", children: jours.map((iso) => /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "300", children: [
      /* @__PURE__ */ jsxs(InlineStack, { gap: "200", blockAlign: "center", children: [
        /* @__PURE__ */ jsx(Text, { as: "h2", variant: "headingMd", children: formaterJour(iso) }),
        iso === aujourdHui ? /* @__PURE__ */ jsx(Badge, { tone: "info", children: "Aujourd'hui" }) : null
      ] }),
      parJour[iso].map((r) => /* @__PURE__ */ jsxs(InlineStack, { gap: "400", blockAlign: "center", wrap: false, children: [
        /* @__PURE__ */ jsx(Text, { as: "span", variant: "headingSm", numeric: true, children: enHeure(r.debut) }),
        /* @__PURE__ */ jsxs(BlockStack, { gap: "050", children: [
          /* @__PURE__ */ jsxs(Text, { as: "span", fontWeight: "medium", children: [
            r.nom,
            " — ",
            r.soinNom
          ] }),
          /* @__PURE__ */ jsxs(Text, { as: "span", tone: "subdued", variant: "bodySm", children: [
            r.telephone,
            " · ",
            r.email,
            r.message ? ` · ${r.message}` : ""
          ] })
        ] }),
        /* @__PURE__ */ jsx(Badge, { tone: r.statut === "confirme" ? "success" : "attention", children: r.statut === "confirme" ? "Confirmé" : "À confirmer" }),
        r.statut !== "confirme" ? /* @__PURE__ */ jsx(
          Button,
          {
            onClick: () => fetcher.submit({ id: r.id, statut: "confirme" }, { method: "post" }),
            children: "Confirmer"
          }
        ) : null,
        /* @__PURE__ */ jsx(
          Button,
          {
            tone: "critical",
            variant: "tertiary",
            onClick: () => fetcher.submit({ id: r.id, statut: "annule" }, { method: "post" }),
            children: "Annuler"
          }
        )
      ] }, r.id))
    ] }) }, iso)) }) }) })
  ] });
}
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$1,
  default: Agenda,
  loader: loader$2
}, Symbol.toStringTag, { value: "Module" }));
async function action({ request }) {
  const { topic, shop, session } = await authenticate.webhook(request);
  if (topic === "APP_UNINSTALLED" && session) {
    await prisma.session.deleteMany({ where: { shop } });
  }
  return new Response();
}
const route5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action
}, Symbol.toStringTag, { value: "Module" }));
async function loader$1({ request }) {
  await authenticate.admin(request);
  return null;
}
const route6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader: loader$1
}, Symbol.toStringTag, { value: "Module" }));
const polarisStyles = "/assets/styles-C7YjYK5e.css";
const links = () => [{ rel: "stylesheet", href: polarisStyles }];
async function loader({ request }) {
  await authenticate.admin(request);
  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
}
function App() {
  const { apiKey } = useLoaderData();
  return /* @__PURE__ */ jsxs(AppProvider, { isEmbeddedApp: true, apiKey, children: [
    /* @__PURE__ */ jsxs(NavMenu, { children: [
      /* @__PURE__ */ jsx(Link, { to: "/app", rel: "home", children: "Agenda" }),
      /* @__PURE__ */ jsx(Link, { to: "/app/demandes", children: "Demandes" }),
      /* @__PURE__ */ jsx(Link, { to: "/app/disponibilites", children: "Disponibilités" })
    ] }),
    /* @__PURE__ */ jsx(Outlet, {})
  ] });
}
function ErrorBoundary() {
  return /* @__PURE__ */ jsx("div", { children: String(useRouteError()) });
}
const headers = (args) => ({ ...args.parentHeaders });
const route7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary,
  default: App,
  headers,
  links,
  loader
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-ZnaU-Tpd.js", "imports": ["/assets/components-Csna4H5K.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/root-CrjL1Kpz.js", "imports": ["/assets/components-Csna4H5K.js"], "css": [] }, "routes/app.disponibilites": { "id": "routes/app.disponibilites", "parentId": "routes/app", "path": "disponibilites", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/app.disponibilites-1_6sVQFK.js", "imports": ["/assets/components-Csna4H5K.js", "/assets/creneaux-C3qo5F0p.js", "/assets/context-DKuiv4ek.js"], "css": [] }, "routes/proxy.creneaux": { "id": "routes/proxy.creneaux", "parentId": "root", "path": "proxy/creneaux", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/proxy.creneaux-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/proxy.reserver": { "id": "routes/proxy.reserver", "parentId": "root", "path": "proxy/reserver", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/proxy.reserver-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/app._index": { "id": "routes/app._index", "parentId": "routes/app", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/app._index-BTn7QOKG.js", "imports": ["/assets/components-Csna4H5K.js", "/assets/creneaux-C3qo5F0p.js", "/assets/context-DKuiv4ek.js"], "css": [] }, "routes/webhooks": { "id": "routes/webhooks", "parentId": "root", "path": "webhooks", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/webhooks-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/auth.$": { "id": "routes/auth.$", "parentId": "root", "path": "auth/*", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/auth._-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/app": { "id": "routes/app", "parentId": "root", "path": "app", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": true, "module": "/assets/app-ClLbsTH0.js", "imports": ["/assets/components-Csna4H5K.js", "/assets/context-DKuiv4ek.js"], "css": [] } }, "url": "/assets/manifest-aa1ce0e6.js", "version": "aa1ce0e6" };
const mode = "production";
const assetsBuildDirectory = "build/client";
const basename = "/";
const future = { "v3_fetcherPersist": true, "v3_relativeSplatPath": true, "v3_throwAbortReason": true, "v3_routeConfig": false, "v3_singleFetch": false, "v3_lazyRouteDiscovery": true, "unstable_optimizeDeps": false };
const isSpaMode = false;
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/app.disponibilites": {
    id: "routes/app.disponibilites",
    parentId: "routes/app",
    path: "disponibilites",
    index: void 0,
    caseSensitive: void 0,
    module: route1
  },
  "routes/proxy.creneaux": {
    id: "routes/proxy.creneaux",
    parentId: "root",
    path: "proxy/creneaux",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/proxy.reserver": {
    id: "routes/proxy.reserver",
    parentId: "root",
    path: "proxy/reserver",
    index: void 0,
    caseSensitive: void 0,
    module: route3
  },
  "routes/app._index": {
    id: "routes/app._index",
    parentId: "routes/app",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route4
  },
  "routes/webhooks": {
    id: "routes/webhooks",
    parentId: "root",
    path: "webhooks",
    index: void 0,
    caseSensitive: void 0,
    module: route5
  },
  "routes/auth.$": {
    id: "routes/auth.$",
    parentId: "root",
    path: "auth/*",
    index: void 0,
    caseSensitive: void 0,
    module: route6
  },
  "routes/app": {
    id: "routes/app",
    parentId: "root",
    path: "app",
    index: void 0,
    caseSensitive: void 0,
    module: route7
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  mode,
  publicPath,
  routes
};
