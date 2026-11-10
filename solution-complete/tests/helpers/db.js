/* ==========================================================================
   FIND MY CAR — tests/helpers/db.js   (Lot : P1, socle)
   Aide pour les tests unitaires : crée une base SQLite neuve en mémoire avec
   les tables et données de démo des dépôts demandés (dans cet ordre).
     const db = await freshDb([VehiculesRepo, Users, ReservationsRepo]);
   ========================================================================== */

const path = require('node:path');
const initSqlJs = require('../../lib/sql-wasm.js');

/** Date du jour fixée pour des tests reproductibles. */
const TODAY = '2026-11-10';

let SQL = null;

async function loadSql() {
  if (!SQL) SQL = await initSqlJs({ locateFile: (f) => path.join(__dirname, '..', '..', 'lib', f) });
  return SQL;
}

/** @param {Array<{SCHEMA?: string, seed?: Function}>} repos */
async function freshDb(repos) {
  const S = await loadSql();
  const db = new S.Database();
  db.exec('PRAGMA foreign_keys = ON;');
  for (const r of repos) if (r.SCHEMA) db.exec(r.SCHEMA);
  for (const r of repos) if (r.seed) r.seed(db);
  return db;
}

module.exports = { TODAY, loadSql, freshDb };
