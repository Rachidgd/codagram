/* ==========================================================================
   LECTURE ET ÉCRITURE DES DISPONIBILITÉS

   Les métaobjets restent la source de vérité, y compris pour l'app. C'est
   volontaire : si l'app est un jour désinstallée ou son hébergement coupé,
   le cabinet garde ses horaires, éditables dans l'admin, et la boutique
   continue d'afficher un agenda. Rien n'est enfermé ici.
   ========================================================================== */

import type { Fermeture, Plage, Soin } from './creneaux';

/* Écrit en syntaxe de méthode, et non de propriété : TypeScript compare
   alors les paramètres de façon bivariante, ce qui laisse passer le client
   `admin` du SDK sans avoir à réimporter ses types internes — lesquels
   changent d'une version à l'autre. */
type Client = {
  graphql(
    requete: string,
    options?: { variables?: Record<string, unknown> }
  ): Promise<Response>;
};

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

type Noeud = {
  handle: string;
  fields: { key: string; value: string | null; references?: { nodes: { handle: string }[] } }[];
};

const champ = (n: Noeud, cle: string) => n.fields.find((f) => f.key === cle)?.value ?? '';
const nombre = (n: Noeud, cle: string, defaut = 0) => {
  const v = Number(champ(n, cle));
  return Number.isFinite(v) ? v : defaut;
};
const references = (n: Noeud, cle: string) =>
  n.fields.find((f) => f.key === cle)?.references?.nodes.map((r) => r.handle) ?? [];

export async function lireDonnees(admin: Client) {
  const reponse = await admin.graphql(REQUETE_DONNEES);
  const { data } = (await reponse.json()) as {
    data: { soins: { nodes: Noeud[] }; plages: { nodes: Noeud[] }; fermetures: { nodes: Noeud[] } };
  };

  const soins: Soin[] = data.soins.nodes
    .filter((n) => champ(n, 'actif') === 'true')
    .map((n) => ({
      handle: n.handle,
      nom: champ(n, 'nom'),
      duree: nombre(n, 'duree_minutes', 60),
      battement: nombre(n, 'battement_minutes', 0),
      ordre: nombre(n, 'ordre', 99),
    }))
    .sort((a, b) => (a.ordre ?? 99) - (b.ordre ?? 99));

  const plages: Plage[] = data.plages.nodes
    .filter((n) => champ(n, 'actif') === 'true')
    .map((n) => ({
      jour: champ(n, 'jour'),
      debut: champ(n, 'debut'),
      fin: champ(n, 'fin'),
      soins: references(n, 'soins'),
    }));

  const fermetures: Fermeture[] = data.fermetures.nodes.map((n) => ({
    debut: champ(n, 'date_debut'),
    fin: champ(n, 'date_fin'),
  }));

  return { soins, plages, fermetures };
}

const MUTATION_MAJ = `#graphql
  mutation MajPlage($id: ID!, $metaobject: MetaobjectUpdateInput!) {
    metaobjectUpdate(id: $id, metaobject: $metaobject) {
      metaobject { handle }
      userErrors { field message }
    }
  }
`;

const MUTATION_CREATION = `#graphql
  mutation CreerPlage($metaobject: MetaobjectCreateInput!) {
    metaobjectCreate(metaobject: $metaobject) {
      metaobject { id handle }
      userErrors { field message }
    }
  }
`;

export async function creerPlage(
  admin: Client,
  plage: { libelle: string; jour: string; debut: string; fin: string; actif: boolean }
) {
  const reponse = await admin.graphql(MUTATION_CREATION, {
    variables: {
      metaobject: {
        type: 'ely_disponibilite',
        fields: [
          { key: 'libelle', value: plage.libelle },
          { key: 'jour', value: plage.jour },
          { key: 'debut', value: plage.debut },
          { key: 'fin', value: plage.fin },
          { key: 'actif', value: String(plage.actif) },
        ],
      },
    },
  });
  return reponse.json();
}

export async function basculerPlage(admin: Client, id: string, actif: boolean) {
  const reponse = await admin.graphql(MUTATION_MAJ, {
    variables: { id, metaobject: { fields: [{ key: 'actif', value: String(actif) }] } },
  });
  return reponse.json();
}
