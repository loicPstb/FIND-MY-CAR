/* FIND MY CAR — tests/unit/utilisateurs.test.js   (Lot : P5)
   Table users, comptes de démonstration, inscription et connexion.
   Ce test n'a PAS besoin du lot P2 : on fournit une petite « fausse » DB. */
const test = require('node:test');
const assert = require('node:assert/strict');
const Auth = require('../../js/auth.js');
const Users = require('../../js/db/utilisateurs.repo.js');
const { freshDb } = require('../helpers/db.js');

const Q = Users.Q;

test('comptes de démonstration : mots de passe documentés valides, rôles corrects', async () => {
  const db = await freshDb([Users]);
  const client = Q.getUserByEmail(db, 'client@findmycar.example.com');
  const admin = Q.getUserByEmail(db, 'ADMIN@findmycar.example.com'); // insensible à la casse
  assert.equal(client.role, 'client');
  assert.equal(admin.role, 'admin');
  assert.equal(await Auth.verifyPassword('ClientDemo2026!', client), true);
  assert.equal(await Auth.verifyPassword('AdminDemo2026!', admin), true);
  assert.equal(await Auth.verifyPassword('AdminDemo2026!', client), false);
  const pub = Q.getUserById(db, admin.id);
  assert.equal(pub.password_hash, undefined); // jamais exposé
  assert.equal(pub.password_salt, undefined);
});

test('contraintes : mot de passe en clair, rôle inconnu et e-mail en double refusés', async () => {
  const db = await freshDb([Users]);
  assert.throws(() => db.run("INSERT INTO users (name, email, password_hash, password_salt, password_iterations, created_at) VALUES ('Test', 't@t.fr', 'motdepasse', ?, 600000, 'now')", ['c'.repeat(32)]), /CHECK/);
  assert.throws(() => db.run("INSERT INTO users (name, email, password_hash, password_salt, password_iterations, role, created_at) VALUES ('Test', 't@t.fr', ?, ?, 600000, 'superadmin', 'now')", ['a'.repeat(64), 'c'.repeat(32)]), /CHECK/);
  const u = { name: 'Nouveau', email: 'Nouveau@Exemple.fr', password_hash: 'a'.repeat(64), password_salt: 'b'.repeat(32), password_iterations: 600000 };
  assert.equal(Q.insertUser(db, u).ok, true);
  assert.equal(Q.getUserByEmail(db, 'nouveau@exemple.fr').email, 'nouveau@exemple.fr'); // normalisé
  const doublon = Q.insertUser(db, { ...u, email: ' NOUVEAU@exemple.fr ' });
  assert.equal(doublon.ok, false);
  assert.match(doublon.errors[0], /existe déjà/);
});

test('Users.register / login : rôle client imposé, message générique, blocage', async () => {
  const db = await freshDb([Users]);
  globalThis.DB = { handle: () => db, save: () => Promise.resolve(true) }; // fausse DB (P2 non requis)

  const dup = await Users.register({ name: 'Jeanne Test', email: 'client@findmycar.example.com', password: 'Voiture2026', passwordConfirm: 'Voiture2026' });
  assert.equal(dup.ok, false);
  assert.match(dup.errors[0].message, /existe déjà/);

  const reg = await Users.register({ name: 'Jeanne Test', email: 'Jeanne@Exemple.fr', password: 'Voiture2026', passwordConfirm: 'Voiture2026' });
  assert.equal(reg.ok, true);
  assert.equal(reg.user.role, 'client');
  assert.equal(reg.user.password_hash, undefined);

  assert.equal((await Users.login('jeanne@exemple.fr', 'Voiture2026')).ok, true);
  const wrong = await Users.login('jeanne@exemple.fr', 'Mauvais123');
  const unknown = await Users.login('inconnu@exemple.fr', 'Voiture2026');
  assert.equal(wrong.ok, false);
  assert.equal(wrong.error, unknown.error); // ne révèle pas si le compte existe

  for (let i = 0; i < 4; i++) await Users.login('jeanne@exemple.fr', 'Mauvais123');
  const locked = await Users.login('jeanne@exemple.fr', 'Voiture2026');
  assert.equal(locked.ok, false);
  assert.match(locked.error, /Trop de tentatives/);
  assert.equal((await Users.login('admin@findmycar.example.com', 'AdminDemo2026!')).user.role, 'admin');
  delete globalThis.DB;
});
