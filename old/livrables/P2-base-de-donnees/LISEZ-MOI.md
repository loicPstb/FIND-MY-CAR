# Lot P2 — Base de données

> Livrable de référence **testé**. Mode d'emploi complet : `docs/MODE-OPERATOIRE.md` (§7 et §8) dans le dépôt.

| | |
|---|---|
| **Vague de fusion** | 1 |
| **Branche** | `feature/p2-base-de-donnees` |
| **Dépend de** | P1 |
| **Pilotage** | `pilotage/taches/P2.json` |

## Fichiers du lot (copiés aux mêmes emplacements dans le dépôt)

- `js/db/core.js`

Tests du lot :

- `tests/unit/core.test.js`

## Étapes

```bash
git checkout develop
git pull origin develop
git checkout -b feature/p2-base-de-donnees
# Façon A : écrire le code (prompt ci-dessous) — Façon B : copier les fichiers de ce dossier
npm test
npm run test:e2e
git add js/db/core.js tests/unit/core.test.js
git commit -m "feat(p2): Base de données"
git push -u origin feature/p2-base-de-donnees
# Puis ouvrir la Pull Request vers develop (modèle pré-rempli), relecteur : votre binôme
```

## Prompt simple (si vous écrivez le code avec l'aide d'une IA)

> Écris en JavaScript sans framework un module `DB` qui utilise sql.js dans le navigateur : `register({name, version, schema, seed})`, `init()` qui recharge la base depuis IndexedDB ou la crée, `handle()`, `save()` et `reset()`. Respecte docs/CONTRAT-INTERFACES.md et commente pour un débutant.

Relisez toujours le code proposé, comparez-le au contrat d'interfaces, puis **faites passer les tests du lot** : ce sont eux qui décident.

## Fini quand

- [ ] Les tests du lot sont verts sur votre poste **et** dans la CI de la Pull Request
- [ ] Le binôme a relu et approuvé, P1 a fusionné
- [ ] `pilotage/taches/P2.json` est à jour (tâches « termine », tests « reussi » avec la date)
- [ ] Vous savez expliquer chaque fichier de votre lot
