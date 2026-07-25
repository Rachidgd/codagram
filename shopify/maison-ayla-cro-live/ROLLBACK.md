# Procédure de rollback

**Portée** thème `CRO Maison Ayla — 2026-07-24` (`202938614097`, UNPUBLISHED) uniquement.
Le thème principal n'a pas été modifié par cette mission : aucun rollback de production
n'est requis.

> Les thèmes de sauvegarde créés le 2026-07-24 (`202934714705`) et les thèmes de staging
> antérieurs ont été supprimés hors de cette mission. Le point de restauration se trouve
> désormais dans ce dépôt et sur le thème principal, qui reste la référence.

---

## Option 1 — Neutralisation immédiate (~30 s, recommandée)

Retirer la dernière ligne de `layout/theme.liquid` :

```liquid
{% render 'ma-cro-dev-fixes' %}
```

Le drawer redevient strictement identique au thème principal. Aucun fichier à supprimer,
aucun risque d'effet de bord. C'est l'option à privilégier en cas d'incident.

## Option 2 — Neutralisation du seul bloc de notation (~30 s)

Dans `snippets/ma-cro-trustpilot.liquid` :

```liquid
assign trustpilot_test_mode = false
```

Le bloc de notation disparaît. La date de livraison estimée et la correction du code
promotionnel restent actives.

## Option 3 — Retrait complet des fichiers (~3 min)

Supprimer depuis l'éditeur de code du thème (Boutique en ligne → Thèmes → … →
Modifier le code) :

- `snippets/ma-cro-trustpilot.liquid`
- `snippets/ma-cro-dev-fixes.liquid`
- `assets/ma-cro-trustpilot.js`
- `assets/ma-cro-cart-ui.js`
- `assets/ma-cro-dev-fixes.css`

Puis retirer `{% render 'ma-cro-dev-fixes' %}` de `layout/theme.liquid`.

**Attention** : cette option restaure aussi le code promotionnel dans son état
défaillant, décrit au § 10 bis du dossier de livraison. Préférer l'option 2.

## Option 4 — Repartir du thème principal (~1 min)

Dupliquer `Maison Ayla - SEO Fix` (`201404973393`) pour obtenir un thème de travail
vierge. Ne jamais publier le duplicata sans validation.

---

## Vérifications après rollback

- [ ] `202938614097` toujours `UNPUBLISHED`
- [ ] Thème principal `201404973393` inchangé
- [ ] Ouverture du drawer : aucune erreur console
- [ ] Ajout au panier, code promotionnel et bouton de paiement fonctionnels
- [ ] Barre de livraison offerte présente

---

## Responsable et durée

Exécutable par toute personne disposant d'un accès « Modifier le code », sans avoir
participé au développement. Durée mesurée : **< 1 minute** pour les options 1, 2 et 4,
**< 3 minutes** pour l'option 3.
