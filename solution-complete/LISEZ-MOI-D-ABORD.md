# FIND MY CAR — Kit de l'équipe (8 personnes)

Ce kit permet de **reconstruire FIND MY CAR à 8, sur GitHub**. Chaque membre développe **son lot dans ses propres fichiers**, l'ouvre en Pull Request, la fait relire, et les tests automatiques s'exécutent avant chaque fusion. **Le site reste fonctionnel après chaque fusion.**

## Contenu

| Dossier / fichier | À quoi il sert | Qui l'utilise |
|---|---|---|
| `MODE-OPERATOIRE.md` | **Le document à lire en premier** : rôles, tâches de chacun, ordre des fusions, commandes Git, Pull Requests, tests, extensions VS Code, dépannage | tout le monde |
| `depot-initial/` | Le **socle** que P1 pousse sur GitHub le premier jour : site navigable avec 4 onglets « en construction », tests du socle, CI GitHub Actions, CODEOWNERS, modèles de PR et d'issues, tableau de pilotage | P1 |
| `livrables/P<n>-…/` | Le **code de référence testé** de chaque lot, avec son `LISEZ-MOI.md` : fichiers, branche, étapes, prompt, critères de fin | chaque membre |
| `solution-complete/` | Le site final, intégré (pour comparer ou dépanner) | en cas de blocage |

## Démarrage

1. Tout le monde lit `MODE-OPERATOIRE.md`, puis remplit le tableau « Qui fait quoi » (§2).
2. **P1** crée le dépôt GitHub à partir de `depot-initial/` (§5 du mode opératoire).
3. Chacun clone le dépôt, crée **sa branche** et livre **son lot** dans l'ordre des vagues (§3).

## Vérification faite avant la remise du kit

Le scénario complet a été **rejoué** : socle seul, puis ajout de chaque livrable dans l'ordre des vagues, avec **tous** les tests relancés après chaque ajout.

| Étape | Tests unitaires | Tests de bout en bout | Onglets actifs |
|---|---|---|---|
| Socle P1 | 7 / 7 | 5 / 5 | aucun (4 « en construction ») |
| + P2 base de données | 11 / 11 | 5 / 5 | — |
| + P5 comptes et sécurité | 18 / 18 | 5 / 5 | — |
| + P8 onglet Contact | 18 / 18 | 9 / 9 | Contact |
| + P3 véhicules et photos | 24 / 24 | 9 / 9 | Contact |
| + P4 onglet Véhicules | 24 / 24 | 15 / 15 | Véhicules, Contact |
| + P6 onglet Connexion | 24 / 24 | 22 / 22 | + Connexion |
| + P7 réservations | 31 / 31 | 30 / 30 | les 4 |
| + P8 parcours complet | 31 / 31 | 35 / 35 | les 4 |

Résultat final **identique** à `solution-complete/`. Un lot fusionné trop tôt (avant ses dépendances) n'empêche pas le site de marcher : son onglet affiche « en attente de … ».

**Non vérifié** (à faire par l'équipe, voir `tests/RAPPORT-TESTS.md`) :
- l'affichage des **vraies photos** et l'exactitude de leurs crédits (Wikimedia Commons n'était pas joignable pendant la préparation ; les tests utilisent des photos simulées) → P3 lance `npm run photos:verifier` ;
- l'exécution de la CI sur votre dépôt GitHub → P1 ;
- la recette sur Firefox, Edge, Safari et un vrai smartphone → P8.
