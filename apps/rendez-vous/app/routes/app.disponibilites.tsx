/* Édition des plages d'ouverture et des durées de soin.

   L'app écrit dans les mêmes métaobjets que ceux édités depuis Contenu →
   Métaobjets. Les deux chemins restent donc valables, et l'un ne casse
   jamais l'autre. */

import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Form, useLoaderData, useNavigation } from '@remix-run/react';
import {
  Banner,
  BlockStack,
  Button,
  Card,
  DataTable,
  FormLayout,
  Layout,
  Page,
  Select,
  Text,
  TextField,
} from '@shopify/polaris';
import { TitleBar } from '@shopify/app-bridge-react';
import { useState } from 'react';
import { authenticate } from '../shopify.server';
import { creerPlage, lireDonnees } from '../donnees.server';
import { JOURS } from '../creneaux';

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin } = await authenticate.admin(request);
  return lireDonnees(admin);
}

export async function action({ request }: ActionFunctionArgs) {
  const { admin } = await authenticate.admin(request);
  const f = await request.formData();

  const debut = String(f.get('debut') || '');
  const fin = String(f.get('fin') || '');
  const horaire = /^([01]\d|2[0-3]):[0-5]\d$/;

  if (!horaire.test(debut) || !horaire.test(fin)) {
    return { erreur: 'Les horaires doivent être au format 24 h, par exemple 09:30.' };
  }
  if (fin <= debut) {
    // Comparaison de chaînes volontaire : « 09:30 » < « 13:00 » est vrai en
    // ordre lexicographique tant que le format est fixe.
    return { erreur: 'La fermeture doit être postérieure à l’ouverture.' };
  }

  await creerPlage(admin, {
    libelle: String(f.get('libelle') || 'Nouvelle plage'),
    jour: String(f.get('jour') || 'mardi'),
    debut,
    fin,
    actif: true,
  });

  return { ok: true };
}

export default function Disponibilites() {
  const { soins, plages } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const [jourChoisi, setJourChoisi] = useState('mardi');

  // JOURS commence au dimanche, parce que c'est l'ordre de getUTCDay(). Pour
  // l'affichage, la semaine commence au lundi.
  const semaine: string[] = [...JOURS.slice(1), JOURS[0]];

  return (
    <Page>
      <TitleBar title="Disponibilités" />
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingMd">
                Plages d&apos;ouverture
              </Text>
              <DataTable
                columnContentTypes={['text', 'text', 'text', 'text']}
                headings={['Jour', 'Ouverture', 'Fermeture', 'Soins concernés']}
                rows={plages.map((p) => [
                  p.jour,
                  p.debut,
                  p.fin,
                  p.soins.length ? p.soins.join(', ') : 'Tous',
                ])}
              />
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <Form method="post">
              <FormLayout>
                <Text as="h2" variant="headingMd">
                  Ajouter une plage
                </Text>
                <TextField label="Libellé" name="libelle" autoComplete="off" />
                <Select
                  label="Jour"
                  name="jour"
                  value={jourChoisi}
                  onChange={setJourChoisi}
                  options={semaine.map((j) => ({ label: j, value: j }))}
                />
                <FormLayout.Group>
                  <TextField
                    label="Ouverture"
                    name="debut"
                    placeholder="09:30"
                    autoComplete="off"
                  />
                  <TextField label="Fermeture" name="fin" placeholder="13:00" autoComplete="off" />
                </FormLayout.Group>
                <Button submit loading={navigation.state === 'submitting'}>
                  Ajouter
                </Button>
              </FormLayout>
            </Form>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingMd">
                Durées par soin
              </Text>
              <Banner tone="info">
                La durée du créneau et le battement se modifient dans l&apos;admin, sous Contenu →
                Métaobjets → Rendez-vous — soin.
              </Banner>
              <DataTable
                columnContentTypes={['text', 'numeric', 'numeric', 'numeric']}
                headings={['Soin', 'Durée', 'Battement', 'Cabine occupée']}
                rows={soins.map((s) => [
                  s.nom,
                  `${s.duree} min`,
                  `${s.battement} min`,
                  `${s.duree + s.battement} min`,
                ])}
              />
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
