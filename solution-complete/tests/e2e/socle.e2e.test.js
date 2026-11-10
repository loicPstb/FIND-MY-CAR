/* FIND MY CAR — tests/e2e/socle.e2e.test.js   (Lot : P1, socle)
   Doit passer À CHAQUE ÉTAPE du projet (socle seul, puis après chaque fusion) :
   navigation entre les 4 onglets, affichage responsive, aucune erreur. */
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { startApp, PROJECT_ROOT } = require('../helpers/e2e.js');

const TABS = ['vehicules', 'reservation', 'contact', 'connexion'];
const CAPTURES = path.join(PROJECT_ROOT, 'tests', 'captures');
let app;

test.before(async () => { app = await startApp(); });
test.after(async () => { if (app) await app.close(); });

test('les 4 onglets s’affichent un par un, l’onglet actif est signalé', async () => {
  assert.equal(await app.visiblePanel(), 'vehicules');
  for (const tab of [...TABS, 'vehicules']) {
    await app.goTab(tab);
    assert.equal(await app.visiblePanel(), tab);
    assert.equal(await app.page.$$eval('[data-panel]:not([hidden])', (e) => e.length), 1);
    assert.equal(await app.page.$eval('a.nav-link[aria-current="page"]', (e) => e.dataset.tab), tab);
    const content = await app.page.$eval(`[data-panel="${tab}"]`, (e) => e.textContent.trim().length);
    assert.ok(content > 0, `onglet ${tab} vide`);
  }
});

test('accès direct par l’adresse, adresse inconnue → Véhicules', async () => {
  await app.open('contact');
  assert.equal(await app.visiblePanel(), 'contact');
  await app.open('page-inexistante');
  assert.equal(await app.visiblePanel(), 'vehicules');
});

test('responsive : pas de défilement horizontal sur smartphone, tablette, ordinateur', async () => {
  fs.mkdirSync(CAPTURES, { recursive: true });
  for (const [name, width, height] of [['smartphone', 390, 844], ['tablette', 768, 1024], ['ordinateur', 1280, 900]]) {
    await app.page.setViewport({ width, height });
    for (const tab of TABS) {
      await app.open(tab);
      await new Promise((r) => setTimeout(r, 250)); // fin des transitions CSS
      const overflow = await app.page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      assert.ok(overflow <= 0, `${name} / ${tab} : défilement horizontal de ${overflow}px`);
      const navOk = await app.page.$$eval('.nav-link', (links) => links.every((l) => {
        const r = l.getBoundingClientRect();
        return r.width > 0 && r.right <= window.innerWidth;
      }));
      assert.ok(navOk, `${name} / ${tab} : onglets visibles`);
      await app.page.screenshot({ path: path.join(CAPTURES, `${name}-${tab}.png`), fullPage: true });
    }
  }
  await app.page.setViewport({ width: 1280, height: 900 });
});

test('message clair si la page est ouverte sans serveur (file://)', async () => {
  const p = await app.newPage();
  await p.goto('file://' + path.join(PROJECT_ROOT, 'index.html').replace(/\\/g, '/'));
  await p.waitForSelector('body[data-ready="error"]', { timeout: 15000 });
  assert.match(await p.$eval('#app-status', (e) => e.textContent), /serveur local/);
  await p.close();
  // Ces erreurs-là sont attendues (fichiers bloqués en file://) : on les retire
  app.errors.splice(0, app.errors.length, ...app.errors.filter((e) => !/file:|Fetch API|Failed to fetch|pages\//.test(e)));
});

test('aucune erreur JavaScript ni fichier manquant', () => {
  assert.deepEqual(app.errors, []);
});
