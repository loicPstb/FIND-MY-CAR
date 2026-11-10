/* FIND MY CAR — tests/unit/auth.test.js   (Lot : P5)
   Hachage des mots de passe, comparaison en temps constant, politique, anti force brute. */
const test = require('node:test');
const assert = require('node:assert/strict');
const Auth = require('../../js/auth.js');

test('hachage PBKDF2 : vérification, sel aléatoire, mot de passe jamais en clair', async () => {
  const h1 = await Auth.hashPassword('MotDePasse123');
  const h2 = await Auth.hashPassword('MotDePasse123');
  assert.equal(h1.hash.length, 64);
  assert.equal(h1.salt.length, 32);
  assert.equal(h1.iterations, 600000);
  assert.notEqual(h1.salt, h2.salt);
  assert.notEqual(h1.hash, h2.hash);
  const record = { password_hash: h1.hash, password_salt: h1.salt, password_iterations: h1.iterations };
  assert.equal(await Auth.verifyPassword('MotDePasse123', record), true);
  assert.equal(await Auth.verifyPassword('motdepasse123', record), false);
  assert.equal(await Auth.verifyPassword('', record), false);
});

test('comparaison en temps constant', () => {
  assert.equal(Auth.constantTimeEqual('abcd', 'abcd'), true);
  assert.equal(Auth.constantTimeEqual('abcd', 'abce'), false);
  assert.equal(Auth.constantTimeEqual('abcd', 'abc'), false);
});

test('politique de mot de passe et contrôle de l’inscription', () => {
  assert.deepEqual(Auth.validatePassword('Voiture2026'), []);
  assert.ok(Auth.validatePassword('court1').length > 0);
  assert.ok(Auth.validatePassword('sanschiffre').length > 0);
  assert.ok(Auth.validatePassword('12345678').length > 0);
  assert.deepEqual(Auth.validateRegistration({ name: 'Jeanne Test', email: 'jeanne@exemple.fr', password: 'Voiture2026', passwordConfirm: 'Voiture2026' }), []);
  const fields = Auth.validateRegistration({ name: 'J', email: 'jeanne', password: 'abc', passwordConfirm: 'abd' }).map((e) => e.field);
  ['name', 'email', 'password', 'passwordConfirm'].forEach((f) => assert.ok(fields.includes(f), f));
});

test('blocage après 5 échecs pendant 30 s, puis déblocage', () => {
  const limiter = Auth.createLoginLimiter();
  const t0 = 1_000_000;
  for (let i = 0; i < 4; i++) limiter.recordFailure('A@exemple.fr', t0);
  assert.equal(limiter.secondsLocked('a@exemple.fr', t0), 0);
  limiter.recordFailure('a@exemple.fr', t0);
  assert.equal(limiter.secondsLocked('a@exemple.fr', t0), 30);
  assert.equal(limiter.secondsLocked('autre@exemple.fr', t0), 0);
  assert.equal(limiter.secondsLocked('a@exemple.fr', t0 + 30_001), 0);
  limiter.reset('a@exemple.fr');
  assert.equal(limiter.secondsLocked('a@exemple.fr', t0), 0);
});
