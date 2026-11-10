/* FIND MY CAR — tests/e2e/parcours.e2e.test.js   (Lot : P8, fusionné EN DERNIER)
   Test d'INTÉGRATION : le parcours complet d'un client et de l'agence,
   à travers les 4 onglets, sur ordinateur puis sur smartphone.
   Il valide que les 8 lots fonctionnent ENSEMBLE. */
const test = require('node:test');
const assert = require('node:assert/strict');
const { startApp } = require('../helpers/e2e.js');

let app;
test.before(async () => { app = await startApp(); });
test.after(async () => { if (app) await app.close(); });

test('tous les onglets sont actifs (aucun lot manquant)', async () => {
  const active = await app.page.evaluate(() => ['vehicules', 'reservation', 'contact', 'connexion'].map((t) => App.isActive(t)));
  assert.deepEqual(active, [true, true, true, true]);
  assert.equal(await app.page.$$eval('.waiting-lots', (e) => e.length), 0);
});

test('parcours client : catalogue → détails → réserver → créer un compte → confirmer', async () => {
  const p = app.page;
  await p.select('#filter-category', 'Électrique');
  await p.click('button[data-action="details"][data-id="7"]');
  await p.waitForSelector('#vehicle-dialog[open]');
  await p.click('#dialog-reserve');
  assert.equal(await p.$eval('#res-vehicle', (e) => e.value), '7');
  await app.setValue('#res-start', app.day(3));
  await app.setValue('#res-end', app.day(5));
  assert.equal(app.clean(await app.text('#summary-total')), '98,00€'); // 2 × 49 €
  await p.click('#res-submit');                                         // pas encore de compte
  assert.equal(await app.visiblePanel(), 'connexion');
  await app.setValue('#register-name', 'Lucas Martin');
  await app.setValue('#register-email', 'lucas.martin@exemple.fr');
  await app.setValue('#register-password', 'Location2026');
  await app.setValue('#register-confirm', 'Location2026');
  await p.click('#register-submit');
  await p.waitForFunction(() => document.querySelector('[data-panel="reservation"]').hidden === false);
  await p.click('#res-submit');
  await p.waitForFunction(() => /confirmée/.test(document.getElementById('reservation-message').textContent));
  assert.match(await app.text('#reservation-list'), /Renault Zoe/);
});

test('parcours agence : l’administrateur voit la réservation de Lucas et l’annule', async () => {
  await app.logout();
  assert.equal(await app.login('admin@findmycar.example.com', 'AdminDemo2026!'), null);
  await app.goTab('reservation');
  assert.match(await app.text('#reservation-list'), /lucas\.martin@exemple\.fr/);
  await app.page.click('#reservation-list button[data-cancel]');
  await app.page.waitForSelector('#list-message:not([hidden])');
  assert.match(await app.text('#reservation-list'), /Annulée/);
});

test('contact puis réinitialisation, sur smartphone', async () => {
  await app.page.setViewport({ width: 390, height: 844 });
  await app.goTab('contact');
  await app.page.evaluate(() => { Contact.openMailClient = () => {}; });
  await app.setValue('#contact-name', 'Lucas Martin');
  await app.setValue('#contact-email', 'lucas.martin@exemple.fr');
  await app.setValue('#contact-subject', 'Facture');
  await app.setValue('#contact-body', 'Bonjour, pouvez-vous m’envoyer la facture de ma location ?');
  await app.page.click('#contact-form button[type="submit"]');
  assert.match(await app.text('#contact-message'), /messagerie devrait s’ouvrir/);
  await app.page.click('#reset-demo');
  await app.page.waitForFunction(() => document.querySelectorAll('#reservation-list .reservation-item').length === 0);
  assert.equal(await app.page.$eval('#user-chip', (e) => e.hidden), true);
});

test('aucune erreur JavaScript sur tout le parcours', () => {
  assert.deepEqual(app.errors, []);
});
