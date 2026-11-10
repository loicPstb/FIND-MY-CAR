# Lot P3 — Données véhicules et photos

> Livrable de référence **testé**. Mode d'emploi complet : `docs/MODE-OPERATOIRE.md` (§7 et §8) dans le dépôt.

| | |
|---|---|
| **Vague de fusion** | 2 |
| **Branche** | `feature/p3-vehicules-donnees` |
| **Dépend de** | P2 |
| **Pilotage** | `pilotage/taches/P3.json` |

## Fichiers du lot (copiés aux mêmes emplacements dans le dépôt)

- `js/db/vehicules.repo.js`
- `js/photos.js`
- `outils/verifier-photos.js`
- `img/CREDITS-PHOTOS.md`
- `img/vehicules/*.svg` (11 dessins de secours)

Tests du lot :

- `tests/unit/vehicules.test.js`

## Étapes

```bash
git checkout develop
git pull origin develop
git checkout -b feature/p3-vehicules-donnees
# Façon A : écrire le code (prompt ci-dessous) — Façon B : copier les fichiers de ce dossier
npm test
npm run test:e2e
git add js/db/vehicules.repo.js js/photos.js outils/verifier-photos.js img/CREDITS-PHOTOS.md … tests/unit/vehicules.test.js
git commit -m "feat(p3): Données véhicules et photos"
git push -u origin feature/p3-vehicules-donnees
# Puis ouvrir la Pull Request vers develop (modèle pré-rempli), relecteur : votre binôme
```

## Prompt simple (si vous écrivez le code avec l'aide d'une IA)

> Crée la table SQLite `vehicles` et 11 véhicules fictifs. Puis, avec l’API de Wikimedia Commons (prop=imageinfo, extmetadata), écris une fonction JavaScript qui récupère pour chaque photo une vignette de 640 px, l’auteur et la licence, pour les afficher en crédit. Sans Internet, un dessin de secours doit s’afficher.

Relisez toujours le code proposé, comparez-le au contrat d'interfaces, puis **faites passer les tests du lot** : ce sont eux qui décident.

## Fini quand

- [ ] Les tests du lot sont verts sur votre poste **et** dans la CI de la Pull Request
- [ ] Le binôme a relu et approuvé, P1 a fusionné
- [ ] `pilotage/taches/P3.json` est à jour (tâches « termine », tests « reussi » avec la date)
- [ ] Vous savez expliquer chaque fichier de votre lot
