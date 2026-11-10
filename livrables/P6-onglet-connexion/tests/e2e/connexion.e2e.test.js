/* FIND MY CAR — tests/e2e/connexion.e2e.test.js   (Lot : P6)
   Onglet Connexion : inscription, connexion, session, déconnexion,
   message générique, blocage, administrateur, réinitialisation.
   Dépend des lots P2 (base) et P5 (comptes). */
const test = require('node:test');
const assert = require('node:assert/strict');
const { startApp } = require('../helpers/e2e.js');

const JEANNE = { name: 'Jeanne Testeuse', email: 'jeanne.test@exemple.fr', password: 'Voiture2026' };
let app;
test.before(async () => { app = await startApp({ hash: 'connexion' }); });
test.after(async () => { if (app) await app.close(); });

test('inscription : 4 erreurs, puis e-mail déjà utilisé, puis succès', async () => {
  const p = app.page;
  assert.equal(await app.visiblePanel(), 'connexion');
  await app.setValue('#register-name', 'J');
  await app.setValue('#register-email', 'jeanne');
  await app.setValue('#register-password', 'abc');
  await app.setValue('#register-confirm', 'abd');
  await p.click('#register-submit');
  await p.waitForSelector('#register-message:not([hidden])');
  assert.equal(await p.$$eval('#register-form [aria-invalid="true"]', (e) => e.length), 4);

  await app.setValue('#register-name', JEANNE.name);
  await app.setValue('#register-email', 'CLIENT@findmycar.example.com');
  await app.setValue('#register-password', JEANNE.password);
  await app.setValue('#register-confirm', JEANNE.password);
  await p.click('#register-submit');
  await p.waitForFunction(() => /existe déjà/.test(document.getElementById('register-message').textContent));

  await app.setValue('#register-email', JEANNE.email);
  await p.click('#register-submit');
  await p.waitForSelector('#auth-user:not([hidden])');
  assert.equal(await app.text('#account-email'), JEANNE.email);
  assert.equal(await app.text('#account-role'), 'Client');
  assert.match(await app.text('#account-count'), /^(0|—)$/); // « — » tant que le lot P7 n'est pas fusionné
  assert.match(await p.$eval('#user-chip', (e) => (e.hidden ? '' : e.textContent)), /Jeanne Testeuse/);
  assert.equal(await app.text('a.nav-link[data-tab="connexion"]'), 'Mon compte');
});

test('la session est conservée au rechargement, puis déconnexion', async () => {
  await app.reload();
  assert.equal(await app.page.$eval('#auth-user', (e) => e.hidden), false);
  await app.logout();
  assert.equal(await app.page.$eval('#user-chip', (e) => e.hidden), true);
  assert.equal(await app.text('a.nav-link[data-tab="connexion"]'), 'Connexion');
});

test('mauvais mot de passe et compte inconnu : même message (pas d’énumération)', async () => {
  const wrong = await app.login('client@findmycar.example.com', 'Faux12345');
  const unknown = await app.login('personne@exemple.fr', 'Faux12345');
  assert.match(wrong, /E-mail ou mot de passe incorrect/);
  assert.equal(wrong, unknown);
});

test('blocage après 5 échecs, même avec le bon mot de passe', async () => {
  for (let i = 0; i < 5; i++) await app.login(JEANNE.email, 'Mauvais' + i + 'x');
  assert.match(await app.login(JEANNE.email, JEANNE.password), /Trop de tentatives/);
});

test('compte administrateur : badge et information', async () => {
  assert.equal(await app.login('admin@findmycar.example.com', 'AdminDemo2026!'), null);
  assert.match(await app.text('#user-chip'), /Admin/);
  assert.equal(await app.text('#account-role'), 'Administrateur');
  assert.equal(await app.page.$eval('#account-admin-note', (e) => e.hidden), false);
});

test('réinitialisation : session fermée, comptes créés supprimés, comptes de démo conservés', async () => {
  await app.page.click('#reset-demo'); // confirm() accepté automatiquement
  await app.page.waitForSelector('#auth-guest:not([hidden])');
  assert.equal(await app.page.$eval('#user-chip', (e) => e.hidden), true);
  await app.reload(); // remet aussi à zéro le compteur de blocage (en mémoire)
  assert.match(await app.login(JEANNE.email, JEANNE.password), /incorrect/);
  assert.equal(await app.login('client@findmycar.example.com', 'ClientDemo2026!'), null);
});

test('aucune erreur JavaScript', () => {
  assert.deepEqual(app.errors, []);
});
