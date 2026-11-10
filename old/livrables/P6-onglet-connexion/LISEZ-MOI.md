# Lot P6 — Onglet Connexion

> Livrable de référence **testé**. Mode d'emploi complet : `docs/MODE-OPERATOIRE.md` (§7 et §8) dans le dépôt.

| | |
|---|---|
| **Vague de fusion** | 3 |
| **Branche** | `feature/p6-onglet-connexion` |
| **Dépend de** | P2, P5 |
| **Pilotage** | `pilotage/taches/P6.json` |

## Fichiers du lot (copiés aux mêmes emplacements dans le dépôt)

- `pages/connexion.html`
- `css/connexion.css`
- `js/ui/connexion.js`

Tests du lot :

- `tests/e2e/connexion.e2e.test.js`

## Étapes

```bash
git checkout develop
git pull origin develop
git checkout -b feature/p6-onglet-connexion
# Façon A : écrire le code (prompt ci-dessous) — Façon B : copier les fichiers de ce dossier
npm test
npm run test:e2e
git add pages/connexion.html css/connexion.css js/ui/connexion.js tests/e2e/connexion.e2e.test.js
git commit -m "feat(p6): Onglet Connexion"
git push -u origin feature/p6-onglet-connexion
# Puis ouvrir la Pull Request vers develop (modèle pré-rempli), relecteur : votre binôme
```

## Prompt simple (si vous écrivez le code avec l'aide d'une IA)

> Crée un onglet de connexion en JavaScript sans framework : formulaire de connexion, formulaire d’inscription avec messages d’erreur par champ, carte « Mon compte » et bouton de déconnexion. Utilise `Users.login()` et `Users.register()`, garde la session dans `sessionStorage` et expose `Account.currentUser()` et `Account.requireLogin()`.

Relisez toujours le code proposé, comparez-le au contrat d'interfaces, puis **faites passer les tests du lot** : ce sont eux qui décident.

## Fini quand

- [ ] Les tests du lot sont verts sur votre poste **et** dans la CI de la Pull Request
- [ ] Le binôme a relu et approuvé, P1 a fusionné
- [ ] `pilotage/taches/P6.json` est à jour (tâches « termine », tests « reussi » avec la date)
- [ ] Vous savez expliquer chaque fichier de votre lot
