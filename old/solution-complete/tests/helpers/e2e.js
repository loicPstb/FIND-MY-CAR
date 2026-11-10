/* ==========================================================================
   FIND MY CAR — tests/helpers/e2e.js   (Lot : P1, socle)
   --------------------------------------------------------------------------
   Aide pour les tests de bout en bout (Chrome sans fenêtre via Puppeteer).
     const app = await startApp();       // serveur local + Chrome + page prête
     await app.goTab('connexion');
     ...
     await app.close();
   Internet est COUPÉ pendant les tests (résultats identiques partout, y compris
   sur GitHub Actions). Les photos Wikimedia sont SIMULÉES :
     startApp({ photos: 'fake' })  → fausses photos + faux crédits (par défaut)
     startApp({ photos: 'block' }) → aucune photo : les dessins doivent s'afficher
   Chrome déjà installé : CHROME_PATH="/chemin/chrome" npm run test:e2e
   ========================================================================== */

const path = require('node:path');
const { createServer } = require('../../outils/serveur.js');
const Utils = require('../../js/utils.js');

let puppeteer;
try { puppeteer = require('puppeteer'); } catch (e) { puppeteer = require('puppeteer-core'); }

const PNG_1PX = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');

/** Fausse réponse de l'API Commons (même format que la vraie, formatversion=2). */
function fakeCommonsResponse(url) {
  const titles = decodeURIComponent(new URL(url).searchParams.get('titles') || '').split('|').filter(Boolean);
  return {
    query: {
      pages: titles.map((title, i) => ({
        title,
        imageinfo: [{
          thumburl: `https://upload.wikimedia.org/fake/photo-${i + 1}.png`,
          url: `https://upload.wikimedia.org/fake/photo-${i + 1}.png`,
          descriptionurl: 'https://commons.wikimedia.org/wiki/' + encodeURIComponent(title.replace(/ /g, '_')),
          extmetadata: {
            Artist: { value: `<a href="//commons.wikimedia.org/wiki/User:Test">Auteur Test ${i + 1}</a>` },
            LicenseShortName: { value: 'CC BY-SA 4.0' },
            LicenseUrl: { value: 'https://creativecommons.org/licenses/by-sa/4.0' }
          }
        }]
      }))
    }
  };
}

/**
 * Démarre un serveur local, Chrome et une page sur l'application.
 * @param {{photos?: 'fake'|'block', width?: number, height?: number, hash?: string}} [options]
 */
async function startApp(options = {}) {
  const photos = options.photos || 'fake';
  const server = createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = 'http://127.0.0.1:' + server.address().port + '/';

  const launch = { headless: true, args: ['--no-sandbox', '--lang=fr-FR'] };
  if (process.env.CHROME_PATH) launch.executablePath = process.env.CHROME_PATH;
  const browser = await puppeteer.launch(launch);
  const context = await browser.createBrowserContext(); // profil vierge (IndexedDB vide)
  const errors = [];

  async function newPage() {
    const page = await context.newPage();
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const url = req.url();
      if (url.startsWith(base) || url.startsWith('file:') || url.startsWith('data:')) return req.continue();
      if (url.startsWith('https://commons.wikimedia.org/w/api.php') && photos === 'fake') {
        return req.respond({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(fakeCommonsResponse(url)) });
      }
      if (url.startsWith('https://upload.wikimedia.org/') && photos === 'fake') {
        return req.respond({ status: 200, contentType: 'image/png', body: PNG_1PX });
      }
      return req.abort(); // tout le reste d'Internet est coupé
    });
    page.on('pageerror', (err) => errors.push('JS : ' + err.message));
    page.on('console', (msg) => {
      // Les ressources externes bloquées volontairement ne sont pas des erreurs de l'application
      if (msg.type() === 'error' && !/Failed to load resource/.test(msg.text())) errors.push('Console : ' + msg.text());
    });
    page.on('response', (res) => {
      if (res.url().startsWith(base) && res.status() >= 400) errors.push(`HTTP ${res.status()} : ${res.url().replace(base, '')}`);
    });
    page.on('dialog', (dialog) => dialog.accept()); // accepte les confirm()
    await page.setViewport({ width: options.width || 1280, height: options.height || 900 });
    return page;
  }

  const page = await newPage();

  const app = {
    page, browser, context, base, errors, newPage,
    TODAY: Utils.todayISO(),
    day: (n) => Utils.addDays(Utils.todayISO(), n),
    clean: (s) => s.replace(/\s/g, ''), // ignore les espaces insécables des montants

    async open(hash = options.hash || '') {
      await page.goto(base + (hash ? '#' + hash : ''), { waitUntil: 'domcontentloaded' });
      await app.waitReady();
    },
    async reload() {
      await page.reload({ waitUntil: 'domcontentloaded' });
      await app.waitReady();
    },
    async waitReady() {
      await page.waitForSelector('body[data-ready]', { timeout: 20000 });
    },
    async visiblePanel() {
      return page.$eval('[data-panel]:not([hidden])', (el) => el.dataset.panel);
    },
    /** Clique sur un onglet de la barre de navigation et attend son affichage. */
    async goTab(tab) {
      await page.click(`a.nav-link[data-tab="${tab}"]`);
      await page.waitForFunction((t) => document.querySelector(`[data-panel="${t}"]`).hidden === false, {}, tab);
    },
    /** Renseigne un champ et déclenche les événements, comme un utilisateur. */
    async setValue(selector, value) {
      await page.$eval(selector, (el, v) => {
        el.value = v;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }, value);
    },
    async text(selector) {
      return page.$eval(selector, (el) => el.textContent);
    },
    /** Connexion par le formulaire (onglet Connexion, P6). Renvoie le message d'erreur ou null. */
    async login(email, password) {
      await app.goTab('connexion');
      await app.setValue('#login-email', email);
      await app.setValue('#login-password', password);
      await page.click('#login-submit');
      await page.waitForFunction(() =>
        !document.getElementById('login-submit').disabled &&
        (document.getElementById('auth-guest').hidden || !document.getElementById('login-message').hidden));
      return page.$eval('#login-message', (e) => (e.hidden ? null : e.textContent));
    },
    async logout() {
      await app.goTab('connexion');
      await page.click('#logout-button');
      await page.waitForSelector('#auth-guest:not([hidden])');
    },
    async close() {
      await browser.close();
      server.close();
    }
  };
  await app.open();
  return app;
}

module.exports = { startApp, fakeCommonsResponse, PROJECT_ROOT: path.join(__dirname, '..', '..') };
