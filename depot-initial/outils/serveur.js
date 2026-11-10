/* ==========================================================================
   FIND MY CAR — outils/serveur.js   (Lot : P1, socle)
   --------------------------------------------------------------------------
   Petit serveur STATIQUE (il ne fait que renvoyer les fichiers du projet).
   Ce n'est PAS un back-end : aucune API, aucune donnée côté serveur.
   Il est nécessaire car les navigateurs refusent de charger le fichier
   SQLite WebAssembly (lib/sql-wasm.wasm) depuis une page ouverte en file://.

   Lancement :  npm start          puis ouvrir http://localhost:8080
   (ou :        node outils/serveur.js 8080)
   Dépendances : Node.js uniquement (modules intégrés).
   Alternative sans Node : extension « Live Server » de VS Code.
   ========================================================================== */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.wasm': 'application/wasm', // indispensable pour sql.js
  '.md': 'text/markdown; charset=utf-8',
  '.ico': 'image/x-icon'
};

/** Crée le serveur (exporté pour être réutilisé par les tests E2E). */
function createServer() {
  return http.createServer((req, res) => {
    let urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (urlPath.endsWith('/')) urlPath += 'index.html';
    const filePath = path.normalize(path.join(ROOT, urlPath));

    // Sécurité : interdit de sortir du dossier du projet (../../)
    if (!filePath.startsWith(ROOT + path.sep)) {
      res.writeHead(403).end('Accès refusé');
      return;
    }
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Fichier introuvable');
        return;
      }
      res.writeHead(200, {
        'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
        'Cache-Control': 'no-store' // toujours la dernière version pendant le développement
      });
      res.end(data);
    });
  });
}

if (require.main === module) {
  const port = Number(process.argv[2]) || 8080;
  createServer().listen(port, '127.0.0.1', () => {
    console.log('FIND MY CAR disponible sur http://localhost:' + port);
    console.log('Arrêter le serveur : Ctrl + C');
  });
}

module.exports = { createServer };
