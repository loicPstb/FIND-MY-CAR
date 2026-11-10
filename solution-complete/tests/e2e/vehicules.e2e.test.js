/* FIND MY CAR — tests/e2e/vehicules.e2e.test.js   (Lot : P4)
   Onglet Véhicules : catalogue, photos + crédits (simulés), dessins de secours,
   filtres, fenêtre de détails, bouton « Réserver ».
   Dépend des lots P2 (base) et P3 (données, photos). */
const test = require('node:test');
const assert = require('node:assert/strict');
const { startApp } = require('../helpers/e2e.js');

let app;
test.before(async () => { app = await startApp({ photos: 'fake' }); });
test.after(async () => { if (app) await app.close(); });

test('affichage : 11 cartes complètes et chiffres d’accueil', async () => {
  const p = app.page;
  await p.waitForSelector('.vehicle-card');
  const cards = await p.$$eval('.vehicle-card', (els) => els.map((c) => ({
    title: c.querySelector('h3').textContent,
    price: c.querySelector('.price strong').textContent,
    category: c.querySelector('.badge').textContent
  })));
  assert.equal(cards.length, 11);
  cards.forEach((c) => {
    assert.ok(c.title.trim().length > 0);
    assert.match(c.price, /€/);
    assert.ok(c.category.length > 0);
  });
  assert.equal(await app.text('#stat-count'), '11');
  assert.equal(app.clean(await app.text('#stat-min')), '39,00€');
});

test('photos réelles : chaque carte affiche la photo et son crédit (auteur + licence + source)', async () => {
  const p = app.page;
  await p.waitForFunction(() => [...document.querySelectorAll('.vehicle-card img')].every((i) => i.dataset.photo === '1'));
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await p.waitForFunction(() => [...document.querySelectorAll('.vehicle-card img')].every((i) => i.complete && i.naturalWidth > 0));
  const credits = await p.$$eval('.vehicle-card .photo-credit', (els) => els.map((e) => ({ text: e.textContent, links: e.querySelectorAll('a').length })));
  credits.forEach((c) => {
    assert.match(c.text, /^Photo : Auteur Test \d+ — CC BY-SA 4\.0 — Wikimedia Commons$/);
    assert.equal(c.links, 2); // lien licence + lien source
  });
});

test('filtres : catégorie, prix, aucun résultat, réinitialisation', async () => {
  const p = app.page;
  await p.select('#filter-category', 'SUV');
  const cats = await p.$$eval('.vehicle-card .badge', (els) => els.map((e) => e.textContent));
  assert.ok(cats.length > 0 && cats.every((c) => c === 'SUV'));
  assert.match(await app.text('#vehicle-count'), new RegExp('^' + cats.length + ' véhicule'));
  await p.select('#filter-category', 'all');
  await p.select('#filter-price', 'eco');
  const prices = await p.$$eval('.vehicle-card .price strong', (els) => els.map((e) => parseFloat(e.textContent.replace(/[^\d,]/g, '').replace(',', '.'))));
  assert.ok(prices.length > 0 && prices.every((x) => x < 50));
  await p.select('#filter-category', 'Utilitaire');
  assert.equal(await p.$$eval('.vehicle-card', (e) => e.length), 0);
  assert.equal(await p.$eval('#vehicle-empty', (e) => e.hidden), false);
  await p.click('#filters button[type="reset"]');
  await p.waitForFunction(() => document.querySelectorAll('.vehicle-card').length === 11);
});

test('détails puis « Réserver » : ouvre l’onglet Réservation', async () => {
  const p = app.page;
  await p.click('button[data-action="details"][data-id="4"]');
  await p.waitForSelector('#vehicle-dialog[open]');
  assert.equal(await app.text('#dialog-title'), 'Volkswagen Golf 8');
  assert.match(app.clean(await app.text('#dialog-price')), /55,00€/);
  assert.match(await app.text('#dialog-credit'), /Photo : Auteur Test/);
  await p.click('#dialog-reserve');
  assert.equal(await p.$eval('#vehicle-dialog', (e) => e.open), false);
  assert.equal(await app.visiblePanel(), 'reservation');
  // Si l'onglet Réservation (P7) est fusionné, le véhicule est présélectionné
  if (await p.evaluate(() => App.isActive('reservation'))) {
    assert.equal(await p.$eval('#res-vehicle', (e) => e.value), '4');
  }
  await app.open('vehicules');
  await p.click('button[data-action="reserve"][data-id="7"]');
  assert.equal(await app.visiblePanel(), 'reservation');
});

test('sans Internet : les dessins de secours remplacent les photos', async () => {
  const offline = await startApp({ photos: 'block' });
  try {
    await offline.page.waitForSelector('.vehicle-card');
    await new Promise((r) => setTimeout(r, 500));
    const imgs = await offline.page.$$eval('.vehicle-card img', (els) => els.map((i) => i.getAttribute('src')));
    assert.ok(imgs.every((src) => /^img\/vehicules\/.+\.svg$/.test(src)));
    const credits = await offline.page.$$eval('.vehicle-card .photo-credit', (els) => els.map((e) => e.textContent));
    assert.ok(credits.every((c) => c === 'Illustration générique'));
    assert.deepEqual(offline.errors, []);
  } finally {
    await offline.close();
  }
});

test('aucune erreur JavaScript', () => {
  assert.deepEqual(app.errors, []);
});
