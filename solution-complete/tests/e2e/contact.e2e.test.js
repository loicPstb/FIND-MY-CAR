/* FIND MY CAR — tests/e2e/contact.e2e.test.js   (Lot : P8)
   Onglet Nous contacter : coordonnées, contrôles, lien mailto, message honnête.
   Ne dépend d'aucun autre lot (hors socle). */
const test = require('node:test');
const assert = require('node:assert/strict');
const { startApp } = require('../helpers/e2e.js');

let app;
test.before(async () => { app = await startApp({ hash: 'contact' }); });
test.after(async () => { if (app) await app.close(); });

test('coordonnées fictives affichées', async () => {
  assert.equal(await app.visiblePanel(), 'contact');
  assert.match(await app.text('#contact-details'), /contact@findmycar\.example\.com/);
});

test('formulaire vide : 4 champs en erreur ; e-mail invalide : seul ce champ', async () => {
  const p = app.page;
  await p.click('#contact-form button[type="submit"]');
  assert.match(await p.$eval('#contact-message', (e) => e.className), /alert-error/);
  assert.equal(await p.$$eval('#contact-form [aria-invalid="true"]', (e) => e.length), 4);
  await app.setValue('#contact-name', 'Client Démo');
  await app.setValue('#contact-email', 'client.exemple.fr');
  await app.setValue('#contact-subject', 'Question sur la Zoe');
  await app.setValue('#contact-body', 'Bonjour, la Renault Zoe est-elle disponible avec un câble de recharge ?');
  await p.click('#contact-form button[type="submit"]');
  assert.match(await app.text('#contact-message'), /format de l’adresse e-mail est invalide/);
  assert.deepEqual(await p.$$eval('#contact-form [aria-invalid="true"]', (e) => e.map((x) => x.id)), ['contact-email']);
});

test('formulaire valide : lien mailto correct, sans prétendre que le message est envoyé', async () => {
  const p = app.page;
  await p.evaluate(() => { window.__mailto = null; Contact.openMailClient = (url) => { window.__mailto = url; }; });
  await app.setValue('#contact-email', 'client.demo@exemple.fr');
  await p.click('#contact-form button[type="submit"]');
  const url = await p.evaluate(() => window.__mailto);
  assert.ok(url.startsWith('mailto:contact@findmycar.example.com?subject='));
  assert.match(decodeURIComponent(url), /\[FIND MY CAR\] Question sur la Zoe/);
  assert.match(decodeURIComponent(url), /E-mail : client\.demo@exemple\.fr/);
  const info = await p.$eval('#contact-message', (e) => ({ cls: e.className, text: e.textContent }));
  assert.match(info.cls, /alert-info/);
  assert.match(info.text, /aucun message n’est parti/);
  assert.doesNotMatch(info.text, /envoyé avec succès|a bien été envoyé/i);
});

test('aucune erreur JavaScript', () => {
  assert.deepEqual(app.errors, []);
});
