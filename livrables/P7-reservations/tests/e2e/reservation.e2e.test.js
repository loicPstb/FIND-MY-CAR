/* FIND MY CAR — tests/e2e/reservation.e2e.test.js   (Lot : P7)
   Onglet Réservation : connexion requise, prix, dates, chevauchement,
   sauvegarde, annulation, droits client / administrateur.
   Dépend des lots P2, P3, P5 et P6. */
const test = require('node:test');
const assert = require('node:assert/strict');
const { startApp } = require('../helpers/e2e.js');

let app;
test.before(async () => { app = await startApp({ hash: 'reservation' }); });
test.after(async () => { if (app) await app.close(); });

async function fill(vehicleId, start, end) {
  await app.setValue('#res-vehicle', String(vehicleId));
  await app.setValue('#res-start', start);
  await app.setValue('#res-end', end);
}
async function submit() {
  await app.page.click('#res-submit');
  await app.page.waitForSelector('#reservation-message:not([hidden])');
  return app.page.$eval('#reservation-message', (e) => ({ cls: e.className, text: e.textContent }));
}
const count = () => app.page.$$eval('#reservation-list .reservation-item', (i) => i.length);

test('sans compte : prix simulé, puis connexion demandée et retour avec la sélection', async () => {
  await fill(4, app.day(10), app.day(13));
  assert.equal(await app.text('#summary-days'), '3 jours');
  assert.equal(app.clean(await app.text('#summary-total')), '165,00€'); // 3 × 55 €
  assert.match(await app.text('#res-account'), /pas connecté/);
  assert.equal(await app.text('#reservation-empty'), 'Connectez-vous pour voir vos réservations.');
  await app.page.click('#res-submit');
  assert.equal(await app.visiblePanel(), 'connexion');
  assert.match(await app.text('#auth-notice'), /Connectez-vous ou créez un compte/);
  await app.setValue('#login-email', 'client@findmycar.example.com');
  await app.setValue('#login-password', 'ClientDemo2026!');
  await app.page.click('#login-submit');
  await app.page.waitForFunction(() => document.querySelector('[data-panel="reservation"]').hidden === false);
  assert.equal(await app.page.$eval('#res-vehicle', (e) => e.value), '4');
  assert.equal(await app.page.$eval('#res-start', (e) => e.value), app.day(10));
  assert.match(await app.text('#res-account'), /Client Démo/);
});

test('réservation valide et prix calculé automatiquement', async () => {
  assert.match(await app.text('#summary-availability'), /disponible/);
  assert.equal(await app.page.$('#summary-total input'), null); // montant non modifiable
  const msg = await submit();
  assert.match(msg.cls, /alert-success/);
  assert.match(msg.text, /confirmée/);
  assert.match(app.clean(msg.text), /165,00€/);
  assert.equal(await count(), 1);
  const item = await app.text('#reservation-list .reservation-item');
  assert.match(item, /Volkswagen Golf 8/);
  assert.match(item, /Confirmée/);
  assert.match(item, /Client Démo/);
});

test('dates incorrectes refusées', async () => {
  await fill(1, app.day(-1), app.day(2));
  assert.match((await submit()).text, /antérieure à aujourd'hui/);
  await fill(1, app.day(5), app.day(5));
  assert.match((await submit()).text, /postérieure à la date de début/);
  await fill(1, app.day(8), app.day(6));
  assert.match((await submit()).text, /postérieure à la date de début/);
  assert.equal(await count(), 1);
});

test('chevauchement refusé, réservation bout à bout acceptée', async () => {
  await fill(4, app.day(12), app.day(15));
  assert.match(await app.page.$eval('#summary-availability', (e) => e.className), /is-error/);
  assert.match((await submit()).text, /déjà réservé/);
  await fill(4, app.day(13), app.day(14));
  assert.match((await submit()).cls, /alert-success/);
  assert.equal(await count(), 2);
});

test('sauvegarde : tout est retrouvé après rechargement (session comprise)', async () => {
  await app.reload();
  assert.equal(await app.visiblePanel(), 'reservation');
  assert.equal(await count(), 2);
  await fill(4, app.day(11), app.day(12));
  assert.match(await app.text('#summary-availability'), /déjà réservé/);
});

test('annulation : statut sauvegardé, créneau libéré, compteur de « Mon compte » à jour', async () => {
  const id = await app.page.$eval('#reservation-list .reservation-item', (e) => e.dataset.id);
  await app.page.click(`button[data-cancel="${id}"]`);
  await app.page.waitForSelector('#list-message:not([hidden])');
  assert.match(await app.text('#list-message'), /annulée/);
  await app.reload();
  assert.match(await app.text(`#reservation-list .reservation-item[data-id="${id}"]`), /Annulée/);
  await fill(4, app.day(10), app.day(13));
  assert.match(await app.text('#summary-availability'), /disponible/);
  await app.goTab('connexion');
  assert.equal(await app.text('#account-count'), '1');
});

test('droits : un autre client ne voit rien mais le chevauchement reste contrôlé ; l’admin voit et annule tout', async () => {
  await app.logout();
  await app.goTab('connexion');
  await app.setValue('#register-name', 'Jeanne Testeuse');
  await app.setValue('#register-email', 'jeanne.test@exemple.fr');
  await app.setValue('#register-password', 'Voiture2026');
  await app.setValue('#register-confirm', 'Voiture2026');
  await app.page.click('#register-submit');
  await app.page.waitForSelector('#auth-user:not([hidden])');
  await app.goTab('reservation');
  assert.equal(await count(), 0);
  await fill(4, app.day(13), app.day(14)); // déjà pris par Client Démo
  assert.match((await submit()).text, /déjà réservé/);

  await app.logout();
  assert.equal(await app.login('admin@findmycar.example.com', 'AdminDemo2026!'), null);
  await app.goTab('reservation');
  assert.equal(await app.text('#my-res-title'), 'Toutes les réservations');
  assert.equal(await count(), 2);
  assert.match(await app.text('#reservation-list'), /client@findmycar\.example\.com/);
  const activeId = await app.page.$eval('#reservation-list button[data-cancel]', (b) => b.dataset.cancel);
  await app.page.click(`button[data-cancel="${activeId}"]`);
  await app.page.waitForSelector('#list-message:not([hidden])');
  assert.equal(await app.page.$$eval('#reservation-list button[data-cancel]', (b) => b.length), 0);
});

test('aucune erreur JavaScript', () => {
  assert.deepEqual(app.errors, []);
});
