# Lot P8 — Test d’intégration et recette

> Livrable de référence **testé**. Mode d'emploi complet : `docs/MODE-OPERATOIRE.md` (§7 et §8) dans le dépôt.

| | |
|---|---|
| **Vague de fusion** | 5 |
| **Branche** | `feature/p8-integration` |
| **Dépend de** | tous les lots |
| **Pilotage** | `pilotage/taches/P8.json` |

## Fichiers du lot (copiés aux mêmes emplacements dans le dépôt)



Tests du lot :

- `tests/e2e/parcours.e2e.test.js`

## Étapes

```bash
git checkout develop
git pull origin develop
git checkout -b feature/p8-integration
# Façon A : écrire le code (prompt ci-dessous) — Façon B : copier les fichiers de ce dossier
npm test
npm run test:e2e
git add  tests/e2e/parcours.e2e.test.js
git commit -m "feat(p8): Test d’intégration et recette"
git push -u origin feature/p8-integration
# Puis ouvrir la Pull Request vers develop (modèle pré-rempli), relecteur : votre binôme
```

## Prompt simple (si vous écrivez le code avec l'aide d'une IA)

> Écris un test Puppeteer qui ouvre le site, filtre les véhicules électriques, réserve la Renault Zoe, crée un compte quand le site le demande, confirme la réservation, puis vérifie que l’administrateur la voit et peut l’annuler.

Relisez toujours le code proposé, comparez-le au contrat d'interfaces, puis **faites passer les tests du lot** : ce sont eux qui décident.

## Fini quand

- [ ] Les tests du lot sont verts sur votre poste **et** dans la CI de la Pull Request
- [ ] Le binôme a relu et approuvé, P1 a fusionné
- [ ] `pilotage/taches/P8.json` est à jour (tâches « termine », tests « reussi » avec la date)
- [ ] Vous savez expliquer chaque fichier de votre lot
