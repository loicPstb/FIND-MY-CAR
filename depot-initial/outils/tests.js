/* ==========================================================================
   FIND MY CAR — outils/tests.js   (Lot : P1, socle)
   --------------------------------------------------------------------------
   Lance tous les tests d'un dossier, sur Windows comme sur macOS/Linux :
     node outils/tests.js unit    → tests/unit/*.test.js   (npm test)
     node outils/tests.js e2e     → tests/e2e/*.test.js    (npm run test:e2e)
   Chaque membre ajoute SON fichier de test dans le bon dossier : il est
   détecté automatiquement, sans modifier package.json (pas de conflit Git).
   ========================================================================== */

const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const kind = process.argv[2] || 'unit';
const dir = path.join(__dirname, '..', 'tests', kind);

const files = fs.existsSync(dir)
  ? fs.readdirSync(dir).filter((f) => f.endsWith('.test.js')).sort().map((f) => path.join('tests', kind, f))
  : [];

if (files.length === 0) {
  console.log(`Aucun test dans tests/${kind}/ pour le moment.`);
  process.exit(0);
}

console.log(`Tests ${kind} : ${files.length} fichier(s)\n  - ${files.join('\n  - ')}\n`);
const result = spawnSync(process.execPath, ['--test', '--test-concurrency=1', ...files], {
  stdio: 'inherit',
  cwd: path.join(__dirname, '..')
});
process.exit(result.status === null ? 1 : result.status);
