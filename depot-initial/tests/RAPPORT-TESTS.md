# Rapport de tests — FIND MY CAR

> Responsable de ce fichier : **P8**. Ne déclarer un test « réussi » que s'il a été **réellement exécuté**.
> Ce rapport contient d'abord les résultats de la **vérification du kit** faite avant sa remise à l'équipe, puis la partie que l'équipe complète pendant le projet.

## 1. Comment lancer les tests

| Commande | Contenu | Prérequis |
|---|---|---|
| `npm test` | tests unitaires (`tests/unit/`) | Node.js 18+ |
| `npm run test:e2e` | tests de bout en bout dans Chrome (`tests/e2e/`). Internet est coupé et les photos Wikimedia sont **simulées**, pour des résultats identiques partout | `npm install` |
| `npm run photos:verifier` | vérification **réelle** des photos, auteurs et licences auprès de Wikimedia Commons | Internet |

La CI GitHub Actions (`.github/workflows/ci.yml`) lance `npm test` puis `npm run test:e2e` à chaque Pull Request vers `develop` ou `main`.

## 2. Vérification du kit (10/11/2026, avant remise à l'équipe)

Environnement : Node.js 22, Google Chrome headless (Puppeteer), Linux.

### 2.1 Rejeu des fusions dans l'ordre des vagues — toutes les étapes vertes

Le dépôt initial (socle) a été copié, puis chaque livrable a été ajouté **dans l'ordre du mode opératoire**. **Tous** les tests présents ont été relancés après chaque ajout.

| Étape | Tests unitaires | Tests de bout en bout | Onglets actifs |
|---|---|---|---|
| Vague 0 — socle P1 | 7 / 7 ✅ | 5 / 5 ✅ | aucun (4 « en construction ») |
| + P2 base de données | 11 / 11 ✅ | 5 / 5 ✅ | aucun |
| + P5 comptes et sécurité | 18 / 18 ✅ | 5 / 5 ✅ | aucun |
| + P8 onglet Contact | 18 / 18 ✅ | 9 / 9 ✅ | Contact |
| + P3 véhicules et photos | 24 / 24 ✅ | 9 / 9 ✅ | Contact |
| + P4 onglet Véhicules | 24 / 24 ✅ | 15 / 15 ✅ | Véhicules, Contact |
| + P6 onglet Connexion | 24 / 24 ✅ | 22 / 22 ✅ | Véhicules, Contact, Connexion |
| + P7 réservations | 31 / 31 ✅ | 30 / 30 ✅ | les 4 |
| + P8 parcours complet | 31 / 31 ✅ | 35 / 35 ✅ | les 4 |

L'état final obtenu est **identique fichier par fichier** au dossier `solution-complete/` du kit.

**Fusions dans le désordre** (contrôle de robustesse) : socle + P4 seul, socle + P2 + P7, socle + P2 + P6. Dans les trois cas, l'onglet concerné affiche « Onglet en attente… » avec le nom du lot manquant. Il n'y a aucune erreur JavaScript, et le test du socle (5/5) reste vert.

### 2.2 Ce que couvrent les tests

| Lot | Fichier | Ce qui est vérifié |
|---|---|---|
| P1 | `utils.test.js` (7) | dates, prix, chevauchement, e-mail, protection HTML, raccourcis SQL |
| P1 | `socle.e2e.test.js` (5) | 4 onglets, adresse directe et inconnue, aucun défilement horizontal à 390 / 768 / 1280 px, message `file://`, aucune erreur |
| P2 | `core.test.js` (4) | modules enregistrés, tables et données de démo, clés étrangères, sauvegarde sans IndexedDB, réinitialisation |
| P3 | `vehicules.test.js` (6) | catalogue de 11 véhicules, contraintes, tri des catégories, filtres, adresse de l'API Commons, lecture des auteurs et licences, aucune photo sans crédit, dessin de secours |
| P4 | `vehicules.e2e.test.js` (6) | cartes, photos et crédits (auteur, licence, 2 liens), filtres, détails, bouton Réserver, dessins sans Internet |
| P5 | `auth.test.js` (4), `utilisateurs.test.js` (3) | PBKDF2 et sel aléatoire, temps constant, politique de mot de passe, blocage 5 échecs / 30 s, comptes de démo, e-mail unique, rôle client imposé, message générique |
| P6 | `connexion.e2e.test.js` (7) | inscription (erreurs, doublon, succès), session conservée, déconnexion, message générique, blocage, administrateur, réinitialisation |
| P7 | `reservations.test.js` (7), `reservation.e2e.test.js` (8) | prix depuis la base, dates, chevauchement entre comptes, contraintes SQLite, droits client / admin, persistance, connexion demandée puis retour avec la sélection |
| P8 | `contact.e2e.test.js` (4), `parcours.e2e.test.js` (5) | contact (contrôles, mailto, message honnête) ; parcours complet client + agence sur ordinateur puis smartphone |

### 2.3 Ce qui n'a PAS pu être vérifié avant la remise

| Point | Pourquoi | Qui / comment |
|---|---|---|
| Affichage des **vraies** photos et exactitude des crédits | Wikimedia Commons n'était pas accessible depuis l'environnement de préparation. Les tests utilisent des photos simulées | P3 : `npm run photos:verifier` avec Internet, puis remplacer toute photo « INTROUVABLE » |
| Exécution de la CI sur GitHub | Le dépôt de l'équipe n'existe pas encore. Le workflow lance les mêmes commandes que celles vérifiées ci-dessus | P1 : contrôler l'onglet *Actions* après le premier push |
| Navigateurs autres que Chrome, vrai smartphone, vraie messagerie, lecteur d'écran | Tests manuels | P8 : recette ci-dessous |

## 3. Recette manuelle — à compléter par l'équipe

| ID | Vérification | Comment faire | Testeur | Date | Résultat |
|---|---|---|---|---|---|
| M01 | Firefox, Edge, Safari | Rejouer le parcours : catalogue → réservation → connexion → annulation | | | ⏳ À faire |
| M02 | Vrai smartphone | Ouvrir le site publié sur GitHub Pages (https) | | | ⏳ À faire |
| M03 | Vraies photos et crédits | Avec Internet : photos visibles, crédits cliquables ; `npm run photos:verifier` à 11/11 | | | ⏳ À faire |
| M04 | Messagerie réelle | Formulaire Contact → brouillon dans Outlook / Mail / Gmail | | | ⏳ À faire |
| M05 | Navigation privée | Bandeau « sauvegarde locale indisponible » si IndexedDB est bloqué | | | ⏳ À faire |
| M06 | Clavier et lecteur d'écran | Tab / Entrée / Échap, puis NVDA ou VoiceOver | | | ⏳ À faire |

## 4. Anomalies détectées et corrections

| ID | Lot | Anomalie | Origine | Correction | Statut |
|---|---|---|---|---|---|
| A01 | P1 | Lors de la préparation du kit, les fichiers de test étaient remplacés par des fichiers vides dans le dépôt initial | Script de construction du kit : les tests étaient traités comme du code à remplacer | Les tests n'existent plus dans le dépôt initial : ils arrivent **avec** leur lot | ✅ Corrigé |
| A02 | P4 | Les images des cartes étaient rognées sur les côtés | L'attribut HTML `height="240"` l'emportait sur le ratio CSS `aspect-ratio: 5 / 3` | `height: auto` ajouté aux règles `.vehicle-card img` et `.vehicle-media img` (`css/vehicules.css`) | ✅ Corrigé (contrôle visuel) |
| | | *à compléter par l'équipe* | | | |
