/* ==========================================================================
   FIND MY CAR — outils/verifier-photos.js   (Lot : P3)
   --------------------------------------------------------------------------
   Vérifie, avec une connexion Internet, que chaque photo du catalogue existe
   bien sur Wikimedia Commons et affiche son AUTEUR et sa LICENCE.
   Écrit le résultat dans img/CREDITS-PHOTOS.md (à relire puis à committer).

   Lancement :  npm run photos:verifier
   Si une photo est « INTROUVABLE » : choisir un autre fichier sur
   https://commons.wikimedia.org (catégorie du modèle), vérifier sa licence
   (CC BY, CC BY-SA, CC0 ou domaine public) et remplacer photo_file dans
   js/db/vehicules.repo.js, puis augmenter VERSION dans ce même fichier.
   ========================================================================== */

const fs = require('node:fs');
const path = require('node:path');
const Repo = require('../js/db/vehicules.repo.js');
const Photos = require('../js/photos.js');

async function main() {
  const files = Repo.SEED.map((v) => v.photo_file);
  const url = Photos.buildApiUrl(files);
  let json;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'FIND-MY-CAR-projet-etudiant/1.0 (verification des credits photos)' } });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    json = await res.json();
  } catch (err) {
    console.error('Impossible de joindre Wikimedia Commons :', err.message);
    console.error('Vérifiez votre connexion Internet (ou le proxy de l’école), puis relancez.');
    process.exit(2);
  }
  const found = Photos.parseApiResponse(json);
  const lines = [
    '# Crédits des photos — FIND MY CAR',
    '',
    `> Généré par \`npm run photos:verifier\` le ${new Date().toLocaleDateString('fr-FR')}. Photos issues de Wikimedia Commons,`,
    '> sous licences libres. L’application affiche ces crédits automatiquement sous chaque photo.',
    '',
    '| Véhicule | Fichier Commons | Auteur | Licence |',
    '|---|---|---|---|'
  ];
  let missing = 0;
  for (const v of Repo.SEED) {
    const p = found[v.photo_file];
    if (!p) missing++;
    const link = p && p.pageUrl ? `[${v.photo_file}](${p.pageUrl})` : v.photo_file;
    lines.push(`| ${v.brand} ${v.model} | ${link} | ${p ? p.author : '**INTROUVABLE**'} | ${p ? p.licence : '—'} |`);
    console.log(`${p ? 'OK ' : 'KO '} ${v.brand} ${v.model} — ${p ? p.author + ' — ' + p.licence : 'INTROUVABLE (dessin affiché à la place)'}`);
  }
  fs.writeFileSync(path.join(__dirname, '..', 'img', 'CREDITS-PHOTOS.md'), lines.join('\n') + '\n');
  console.log(`\n${Repo.SEED.length - missing}/${Repo.SEED.length} photos disponibles. Fichier écrit : img/CREDITS-PHOTOS.md`);
  process.exit(missing === 0 ? 0 : 1);
}

main();
