# Ély'Skin — app de rendez-vous

App Shopify embarquée : elle ajoute un agenda dans l'admin du cabinet, et
transforme la prise de rendez-vous de la boutique en vraie réservation.

## Ce qu'elle apporte, et ce qui marche sans elle

Le site fonctionne **sans cette app**. La section « Prise de rendez-vous »
lit les plages d'ouverture dans les métaobjets Shopify, calcule les créneaux
dans le navigateur et envoie une demande par e-mail. C'est utilisable dès
aujourd'hui, sans hébergement, sans abonnement.

Ce que l'app ajoute, et qu'aucune solution sans serveur ne peut apporter :

| | Sans l'app | Avec l'app |
|---|---|---|
| Horaires modifiables depuis l'admin | oui | oui |
| Créneaux calculés selon la durée du soin | oui | oui |
| Rendez-vous déjà pris déduits des créneaux | **non** | oui |
| Deux personnes ne peuvent pas prendre la même heure | **non** | oui |
| Agenda et liste des rendez-vous dans l'admin | non | oui |
| Confirmer / annuler en un clic | non | oui |

Tant que l'app n'est pas déployée, la section affiche une mention exacte :
la demande n'est pas une réservation. Dès que le proxy répond, la mention est
remplacée par celle du réglage « Mention quand l'app répond ». La promesse
faite au client suit donc l'état réel du système, sans intervention.

## Pourquoi un hébergement est nécessaire

Une app embarquée Shopify est un serveur web que l'admin affiche dans une
iframe. Shopify n'héberge pas ce serveur. Il faut donc une URL HTTPS
publique — Fly.io, Railway, Render, Vercel ou un VPS font l'affaire — et une
base de données pour les réservations.

C'est la seule partie du projet qui ne peut pas vivre uniquement dans
Shopify.

## Déploiement

### 1. Créer l'app

```bash
npm install -g @shopify/cli@latest
cd apps/rendez-vous
npm install
shopify app config link      # crée l'app dans le compte partenaire, remplit client_id
```

### 2. Base de données

SQLite convient pour un cabinet unique. Pour un hébergement sans disque
persistant (Vercel, Render free), passez à PostgreSQL : dans
`prisma/schema.prisma`, remplacez `provider = "sqlite"` par
`provider = "postgresql"`.

```bash
npx prisma migrate dev --name init
```

### 3. Variables d'environnement

| Variable | Rôle |
|---|---|
| `SHOPIFY_API_KEY` / `SHOPIFY_API_SECRET` | fournies par `shopify app config link` |
| `SHOPIFY_APP_URL` | l'URL HTTPS publique de l'app |
| `SCOPES` | `read_metaobjects,write_metaobjects,read_metaobject_definitions` |
| `DATABASE_URL` | `file:./dev.sqlite` en local, sinon l'URL PostgreSQL |
| `FUSEAU_CABINET` | `Europe/Paris` par défaut |
| `HORIZON_JOURS` | jours proposés à l'avance (28) |
| `DELAI_HEURES` | délai minimum avant un rendez-vous (24) |

`FUSEAU_CABINET`, `HORIZON_JOURS` et `DELAI_HEURES` doivent correspondre aux
réglages de la section dans l'éditeur de thème, sinon la boutique et le
serveur ne proposeront pas les mêmes créneaux.

### 4. Développement puis mise en ligne

```bash
shopify app dev              # tunnel + installation sur la boutique de test
npm run build && npm start   # en production
shopify app deploy           # publie la configuration, dont l'app proxy
```

### 5. Brancher la boutique

Dans l'éditeur de thème, section « Prise de rendez-vous », renseignez
**Chemin de l'app de réservation** : `/apps/rendez-vous`.

Laissé vide, la section reste en mode demande. C'est le comportement voulu
tant que l'app n'est pas en ligne : la boutique ne dépend jamais de l'app
pour rester utilisable.

## Architecture

```
app/
  creneaux.ts          moteur de créneaux, isomorphe et sans dépendance
  creneaux.test.mjs    11 tests (npm test)
  donnees.server.ts    lecture/écriture des métaobjets
  db.server.ts         Prisma
  shopify.server.ts    session, authentification
  routes/
    app._index.tsx        agenda des rendez-vous à venir
    app.disponibilites.tsx plages d'ouverture et durées
    proxy.creneaux.tsx    créneaux libres → boutique
    proxy.reserver.tsx    réservation ferme ← boutique
```

Deux principes tiennent l'ensemble :

**Les disponibilités restent dans Shopify.** L'app les lit et les écrit, mais
ne les possède pas. Si l'app est désinstallée ou son hébergement coupé, le
cabinet garde ses horaires, éditables sous Contenu → Métaobjets, et la
boutique continue d'afficher un agenda.

**Le serveur tranche, le navigateur estime.** `assets/agenda.js` et
`app/creneaux.ts` appliquent la même règle de calcul, mais seul le serveur
connaît les rendez-vous pris. Un créneau demandé est donc revalidé côté
serveur avant écriture, et la contrainte d'unicité `(shop, date, début)`
tranche la course entre deux personnes qui cliquent à la même seconde.

## Vérifications

```bash
npm test          # 11 tests du moteur de créneaux
npm run typecheck
npm run build
```
