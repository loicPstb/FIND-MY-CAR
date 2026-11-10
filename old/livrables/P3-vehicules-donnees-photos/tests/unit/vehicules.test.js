/* FIND MY CAR — tests/unit/vehicules.test.js   (Lot : P3)
   Table vehicles, catalogue de démonstration, filtres, photos Wikimedia Commons. */
const test = require('node:test');
const assert = require('node:assert/strict');
globalThis.Utils = require('../../js/utils.js'); // utilisé par Photos.imageFor
const VehiculesRepo = require('../../js/db/vehicules.repo.js');
const Photos = require('../../js/photos.js');
const { freshDb } = require('../helpers/db.js');

const Q = VehiculesRepo.Q;

test('Catalogue : au moins 8 véhicules, tous avec dessin de secours et photo Commons', async () => {
  const db = await freshDb([VehiculesRepo]);
  const all = Q.getVehicles(db, {});
  assert.ok(all.length >= 8);
  assert.equal(all.length, VehiculesRepo.SEED.length);
  all.forEach((v) => {
    assert.match(v.image, /^img\/vehicules\/.+\.svg$/);
    assert.ok(v.photo_file && /\.(jpe?g|png)$/i.test(v.photo_file), 'photo_file pour ' + v.model);
  });
  VehiculesRepo.seed(db); // pas de doublon si rappelé
  assert.equal(Q.getVehicles(db, {}).length, VehiculesRepo.SEED.length);
});

test('Contraintes CHECK : catégorie et prix invalides refusés', async () => {
  const db = await freshDb([VehiculesRepo]);
  assert.throws(() => db.run("INSERT INTO vehicles (brand, model, category, daily_price, seats, transmission, fuel, image) VALUES ('A','B','Avion',10,5,'Manuelle','Essence','x')"), /CHECK/);
  assert.throws(() => db.run("INSERT INTO vehicles (brand, model, category, daily_price, seats, transmission, fuel, image) VALUES ('A','B','SUV',0,5,'Manuelle','Essence','x')"), /CHECK/);
});

test('Catégories triées à la française et filtres catégorie / prix', async () => {
  const db = await freshDb([VehiculesRepo]);
  assert.deepEqual(Q.getCategories(db), ['Citadine', 'Compacte', 'Électrique', 'Monospace', 'Premium', 'SUV', 'Utilitaire']);
  const suv = Q.getVehicles(db, { category: 'SUV' });
  assert.ok(suv.length > 0 && suv.every((v) => v.category === 'SUV'));
  assert.ok(Q.getVehicles(db, { priceRange: 'eco' }).every((v) => v.daily_price < 50));
  assert.ok(Q.getVehicles(db, { priceRange: 'mid' }).every((v) => v.daily_price >= 50 && v.daily_price <= 80));
  assert.ok(Q.getVehicles(db, { priceRange: 'high' }).every((v) => v.daily_price > 80));
  const total = ['eco', 'mid', 'high'].reduce((n, r) => n + Q.getVehicles(db, { priceRange: r }).length, 0);
  assert.equal(total, VehiculesRepo.SEED.length); // chaque véhicule dans exactement une gamme
  assert.deepEqual(Q.getVehicles(db, { category: 'Utilitaire', priceRange: 'eco' }), []);
  assert.equal(Q.getVehicleById(db, 4).model, 'Golf 8');
  assert.equal(Q.getVehicleById(db, 999), null);
});

test('Photos : adresse de l’API Commons (une seule requête, crédits demandés)', () => {
  const url = Photos.buildApiUrl(['Renault Clio V 1X7A0392.jpg', 'Citroën Berlingo III IMG 9223.jpg']);
  assert.ok(url.startsWith('https://commons.wikimedia.org/w/api.php?'));
  assert.match(url, /origin=\*/);        // autorise l'appel depuis le navigateur (CORS)
  assert.match(url, /extmetadata/);      // auteur et licence
  assert.match(url, /iiurlwidth=640/);   // vignette légère
  const titles = decodeURIComponent(new URL(url).searchParams.get('titles'));
  assert.equal(titles, 'File:Renault Clio V 1X7A0392.jpg|File:Citroën Berlingo III IMG 9223.jpg');
});

test('Photos : lecture de la réponse Commons (auteur, licence, fichiers absents ou sans crédit)', () => {
  const json = {
    query: {
      normalized: [{ from: 'File:Renault_Clio_V_1X7A0392.jpg', to: 'File:Renault Clio V 1X7A0392.jpg' }],
      pages: [
        { title: 'File:Renault Clio V 1X7A0392.jpg', imageinfo: [{ thumburl: 'https://upload.wikimedia.org/a.jpg', descriptionurl: 'https://commons.wikimedia.org/wiki/File:A',
          extmetadata: { Artist: { value: '<a href="//x">Jean&nbsp;Dupont</a>' }, LicenseShortName: { value: 'CC BY-SA 4.0' }, LicenseUrl: { value: 'https://creativecommons.org/licenses/by-sa/4.0' } } }] },
        { title: 'File:Inexistant.jpg', missing: true },
        { title: 'File:Sans credit.jpg', imageinfo: [{ thumburl: 'https://upload.wikimedia.org/b.jpg', extmetadata: {} }] }
      ]
    }
  };
  const out = Photos.parseApiResponse(json);
  assert.deepEqual(Object.keys(out), ['Renault Clio V 1X7A0392.jpg']); // titre « normalisé » ramené au nom d'origine
  const p = out['Renault Clio V 1X7A0392.jpg'];
  assert.equal(p.author, 'Jean Dupont');
  assert.equal(p.licence, 'CC BY-SA 4.0');
  assert.equal(p.src, 'https://upload.wikimedia.org/a.jpg');
  assert.equal(out['Inexistant.jpg'], undefined);
  assert.equal(out['Sans credit.jpg'], undefined); // jamais de photo sans crédit
  assert.deepEqual(Photos.parseApiResponse({}), {});
});

test('Photos.imageFor : dessin si pas de photo, photo + crédit protégé sinon', () => {
  Photos.clear();
  const v = { brand: 'Renault', model: 'Clio V', image: 'img/vehicules/renault-clio.svg', photo_file: 'X.jpg' };
  const fallback = Photos.imageFor(v);
  assert.equal(fallback.isPhoto, false);
  assert.equal(fallback.src, 'img/vehicules/renault-clio.svg');
  assert.equal(Photos.textFromHtml('<b>A</b> &amp; <i>B</i>'), 'A & B');
});
