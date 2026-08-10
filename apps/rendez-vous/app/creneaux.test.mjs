/* Tests du moteur de créneaux.

   Le moteur n'utilise aucune construction TypeScript à l'exécution : Node
   sait donc l'exécuter directement en retirant les annotations.

       node --experimental-strip-types --test app/creneaux.test.mjs

   (ou simplement `npm test` depuis apps/rendez-vous.) */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  creneauValide,
  creneauxDuJour,
  enHeure,
  enMinutes,
  joursOuverts,
} from './creneaux.ts';

const soin = { handle: 'hydrafacial', nom: 'Hydrafacial', duree: 60, battement: 15 };
const hifu = { handle: 'hifu', nom: 'HIFU', duree: 90, battement: 20 };

// Dimanche 9 août 2026, 12 h à Paris. Le 11 est un mardi, le 13 un jeudi.
const REFERENCE = new Date('2026-08-09T10:00:00Z');

const base = {
  soins: [soin, hifu],
  plages: [
    { jour: 'mardi', debut: '09:30', fin: '13:00', soins: [] },
    { jour: 'mardi', debut: '14:00', fin: '19:00', soins: [] },
    { jour: 'jeudi', debut: '10:00', fin: '19:00', soins: ['hifu'] },
  ],
  fermetures: [],
  occupations: [],
  fuseau: 'Europe/Paris',
  horizon: 28,
  delai: 24,
  reference: REFERENCE,
};

test('conversion heure ↔ minutes', () => {
  assert.equal(enMinutes('09:30'), 570);
  assert.equal(enHeure(570), '09:30');
  assert.equal(enMinutes('pas une heure'), null);
});

test('les créneaux tiennent dans la plage, battement compris', () => {
  const creneaux = creneauxDuJour('2026-08-11', soin, base).map(enHeure);
  assert.deepEqual(creneaux, ['09:30', '10:45', '12:00', '14:00', '15:15', '16:30', '17:45']);
});

test('un soin plus long produit moins de créneaux', () => {
  const creneaux = creneauxDuJour('2026-08-11', hifu, base).map(enHeure);
  assert.deepEqual(creneaux, ['09:30', '11:20', '14:00', '15:50']);
});

test('une plage réservée à un soin en exclut les autres', () => {
  assert.deepEqual(creneauxDuJour('2026-08-13', soin, base), []);
  assert.ok(creneauxDuJour('2026-08-13', hifu, base).length > 0);
});

test('une fermeture vide la journée', () => {
  const ctx = { ...base, fermetures: [{ debut: '2026-08-10', fin: '2026-08-12' }] };
  assert.deepEqual(creneauxDuJour('2026-08-11', soin, ctx), []);
});

test('un rendez-vous pris retire les créneaux qui le chevauchent', () => {
  const ctx = { ...base, occupations: [{ date: '2026-08-11', debut: 570, fin: 645 }] };
  const creneaux = creneauxDuJour('2026-08-11', soin, ctx).map(enHeure);
  assert.ok(!creneaux.includes('09:30'));
  assert.ok(creneaux.includes('10:45'));
});

test('le battement compte dans l’occupation de la cabine', () => {
  // 10:45 → 12:00 réservé : 12:00 reste libre, mais 10:45 ne l'est plus.
  const ctx = { ...base, occupations: [{ date: '2026-08-11', debut: 645, fin: 720 }] };
  const creneaux = creneauxDuJour('2026-08-11', soin, ctx).map(enHeure);
  assert.ok(!creneaux.includes('10:45'));
  assert.ok(creneaux.includes('12:00'));
  assert.ok(creneaux.includes('09:30'));
});

test('le délai minimum écarte les créneaux trop proches', () => {
  // Mardi 11 août, 08:00 à Paris : le jour même est entièrement écarté.
  const ctx = { ...base, reference: new Date('2026-08-11T06:00:00Z') };
  assert.deepEqual(creneauxDuJour('2026-08-11', soin, ctx), []);
  assert.ok(creneauxDuJour('2026-08-18', soin, ctx).length > 0);
});

test('aucun jour passé n’est proposé', () => {
  assert.deepEqual(creneauxDuJour('2026-08-04', soin, base), []);
});

test('joursOuverts ne renvoie que des jours ouverts, dans l’ordre', () => {
  const jours = joursOuverts(soin, base);
  assert.ok(jours.length > 0);
  assert.ok(jours.every((j) => j.creneaux.length > 0));
  assert.ok(jours.every((j, i, t) => i === 0 || t[i - 1].iso < j.iso));
});

test('creneauValide refuse ce que creneauxDuJour ne propose pas', () => {
  assert.equal(creneauValide('2026-08-11', 570, soin, base), true);
  assert.equal(creneauValide('2026-08-11', 585, soin, base), false);
  assert.equal(creneauValide('2026-08-13', 600, soin, base), false);
});
