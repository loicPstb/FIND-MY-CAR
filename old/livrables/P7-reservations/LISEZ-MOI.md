# Lot P7 — Réservations

> Livrable de référence **testé**. Mode d'emploi complet : `docs/MODE-OPERATOIRE.md` (§7 et §8) dans le dépôt.

| | |
|---|---|
| **Vague de fusion** | 4 |
| **Branche** | `feature/p7-reservations` |
| **Dépend de** | P2, P3, P5, P6 |
| **Pilotage** | `pilotage/taches/P7.json` |

## Fichiers du lot (copiés aux mêmes emplacements dans le dépôt)

- `js/db/reservations.repo.js`
- `pages/reservation.html`
- `css/reservation.css`
- `js/ui/reservation.js`

Tests du lot :

- `tests/unit/reservations.test.js`
- `tests/e2e/reservation.e2e.test.js`

## Étapes

```bash
git checkout develop
git pull origin develop
git checkout -b feature/p7-reservations
# Façon A : écrire le code (prompt ci-dessous) — Façon B : copier les fichiers de ce dossier
npm test
npm run test:e2e
git add js/db/reservations.repo.js pages/reservation.html css/reservation.css js/ui/reservation.js tests/unit/reservations.test.js tests/e2e/reservation.e2e.test.js
git commit -m "feat(p7): Réservations"
git push -u origin feature/p7-reservations
# Puis ouvrir la Pull Request vers develop (modèle pré-rempli), relecteur : votre binôme
```

## Prompt simple (si vous écrivez le code avec l'aide d'une IA)

> Écris une requête SQLite qui trouve les réservations actives d’un véhicule chevauchant la période [début, fin[ (fin exclue), puis les fonctions `ReservationsRepo.quote`, `create`, `listFor` et `cancel` décrites dans docs/CONTRAT-INTERFACES.md (prix calculé depuis la base, droits client / administrateur).

Relisez toujours le code proposé, comparez-le au contrat d'interfaces, puis **faites passer les tests du lot** : ce sont eux qui décident.

## Fini quand

- [ ] Les tests du lot sont verts sur votre poste **et** dans la CI de la Pull Request
- [ ] Le binôme a relu et approuvé, P1 a fusionné
- [ ] `pilotage/taches/P7.json` est à jour (tâches « termine », tests « reussi » avec la date)
- [ ] Vous savez expliquer chaque fichier de votre lot
