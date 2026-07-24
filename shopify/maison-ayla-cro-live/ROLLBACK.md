# Procédure de rollback — Trustpilot cart drawer

**Portée** thème de staging `Maison Ayla - CRO LIVE 2026-07-24` (`202893754705`) uniquement.
Le thème principal n'ayant jamais été modifié, aucun rollback de production n'est requis.

---

## Option A — Restauration fichier par fichier (recommandée, ~2 min)

À privilégier : elle préserve les autres travaux CRO faits sur le thème depuis.

Les versions d'origine sont dans `_backup/` de ce dépôt.

1. Restaurer les trois fichiers modifiés depuis `_backup/` vers le thème `202893754705` :
   - `assets/ma-cro-cart-ui.js`
   - `assets/ma-cro-dev-fixes.css`
   - `snippets/ma-cro-dev-fixes.liquid`
2. Supprimer les deux fichiers ajoutés :
   - `snippets/ma-cro-trustpilot.liquid`
   - `assets/ma-cro-trustpilot.js`

Via Shopify CLI depuis la racine `shopify/maison-ayla-cro-live/` :

```bash
shopify theme push --theme 202893754705 --nodelete \
  --only assets/ma-cro-cart-ui.js \
  --only assets/ma-cro-dev-fixes.css \
  --only snippets/ma-cro-dev-fixes.liquid   # depuis _backup/
```

Puis supprimer les deux fichiers ajoutés depuis l'éditeur de code du thème
(Boutique en ligne → Thèmes → … → Modifier le code).

**Note** : restaurer `_backup/` remet en place le faux Trustpilot refusé par le brief.
Cette option n'est donc justifiée que pour revenir à un état de référence connu.

## Option A bis — Neutralisation sans restauration (~30 s)

Pour désactiver le composant sans remettre le faux rendu : dans
`snippets/ma-cro-dev-fixes.liquid`, commenter la dernière ligne.

```liquid
{%- comment -%}{%- render 'ma-cro-trustpilot' -%}{%- endcomment -%}
```

Le drawer redevient identique à l'état antérieur, sans aucun bloc Trustpilot.
C'est l'option la plus sûre en cas d'incident.

---

## Option B — Retour au thème de sauvegarde complet (~1 min)

Un snapshot complet du staging **antérieur à toute modification** a été créé avant
écriture :

| Thème | ID | Rôle | Créé |
|---|---|---|---|
| BACKUP CRO LIVE avant Trustpilot 2026-07-24 | `202934714705` | UNPUBLISHED | 2026-07-24 18:26:24 UTC |

Le thème cible a été modifié à 18:29:32 UTC, soit **après** la sauvegarde : le snapshot
est bien antérieur.

Pour repartir de cet état : dupliquer `202934714705`, ou le désigner comme nouveau thème
de travail. Ne **jamais** le publier — il porte le rôle UNPUBLISHED et doit le conserver.

---

## Vérifications après rollback

- [ ] `202893754705` toujours `UNPUBLISHED`
- [ ] `201404973393` (MAIN) toujours `updatedAt = 2026-06-24T00:13:32Z`
- [ ] Ouverture du drawer : aucune erreur console
- [ ] Barre de livraison offerte présente
- [ ] Ajout au panier, code promotionnel et bouton de paiement fonctionnels

---

## Responsable et durée

Exécutable par toute personne disposant d'un accès « Modifier le code » au thème, sans
avoir participé au développement. Durée mesurée sur la structure livrée : **< 3 minutes**
pour l'option A, **< 1 minute** pour l'option A bis.
