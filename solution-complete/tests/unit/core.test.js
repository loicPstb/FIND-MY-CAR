/* FIND MY CAR — tests/unit/core.test.js   (Lot : P2)
   Moteur de base : enregistrement des modules, création, requêtes, réinitialisation.
   Sous Node.js il n'y a pas d'IndexedDB : la base fonctionne alors « en mémoire »
   (c'est aussi le comportement du navigateur en navigation privée). */
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

globalThis.Utils = require('../../js/utils.js');
globalThis.initSqlJs = require('../../lib/sql-wasm.js');
const DB = require('../../js/db/core.js');

const ROOT = path.join(__dirname, '..', '..');

test('init : tables et données de chaque module enregistré, empreinte enregistrée', async () => {
  const cwd = process.cwd();
  process.chdir(ROOT); // sql.js cherche lib/sql-wasm.wasm depuis le dossier courant
  try {
    DB.register({ name: 'marques', version: 1, schema: 'CREATE TABLE marques (id INTEGER PRIMARY KEY, nom TEXT NOT NULL);',
      seed: (db) => db.run("INSERT INTO marques (nom) VALUES ('Renault'), ('Peugeot')") });
    DB.register({ name: 'modeles', version: 1, schema: 'CREATE TABLE modeles (id INTEGER PRIMARY KEY, marque_id INTEGER NOT NULL REFERENCES marques(id), nom TEXT);' });
    const info = await DB.init();
    assert.equal(info.persistent, false); // pas d'IndexedDB sous Node
    assert.equal(info.restored, false);
    assert.deepEqual(DB.modules(), ['marques', 'modeles']);
    assert.equal(DB.all('SELECT * FROM marques').length, 2);
    assert.equal(DB.get("SELECT value FROM fmc_meta WHERE key = 'modules'").value, 'marques@1,modeles@1');
  } finally {
    process.chdir(cwd);
  }
});

test('run / get / all et clés étrangères actives', () => {
  const r = DB.run('INSERT INTO modeles (marque_id, nom) VALUES (?, ?)', [1, 'Clio']);
  assert.equal(r.changes, 1);
  assert.equal(DB.get('SELECT nom FROM modeles WHERE id = ?', [r.lastId]).nom, 'Clio');
  assert.throws(() => DB.run('INSERT INTO modeles (marque_id, nom) VALUES (999, ?)', ['X']), /FOREIGN KEY/);
});

test('save ne plante pas sans IndexedDB, reset recrée la base de démonstration', async () => {
  assert.equal(await DB.save(), false);
  DB.run("INSERT INTO marques (nom) VALUES ('Dacia')");
  assert.equal(DB.all('SELECT * FROM marques').length, 3);
  await DB.reset();
  assert.equal(DB.all('SELECT * FROM marques').length, 2);
  assert.equal(DB.all('SELECT * FROM modeles').length, 0);
});

test('register remplace un module du même nom (pas de doublon)', () => {
  DB.register({ name: 'marques', version: 2, schema: 'CREATE TABLE marques (id INTEGER PRIMARY KEY, nom TEXT NOT NULL);' });
  assert.deepEqual(DB.modules(), ['modeles', 'marques']);
  assert.throws(() => DB.register({}), /nom de module/);
});
