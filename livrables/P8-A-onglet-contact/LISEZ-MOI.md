# Lot P8 — Onglet Nous contacter

> Livrable de référence **testé**. Mode d'emploi complet : `docs/MODE-OPERATOIRE.md` (§7 et §8) dans le dépôt.

| | |
|---|---|
| **Vague de fusion** | 1 |
| **Branche** | `feature/p8-contact` |
| **Dépend de** | P1 |
| **Pilotage** | `pilotage/taches/P8.json` |

## Fichiers du lot (copiés aux mêmes emplacements dans le dépôt)

- `pages/contact.html`
- `css/contact.css`
- `js/ui/contact.js`

Tests du lot :

- `tests/e2e/contact.e2e.test.js`

## Étapes

```bash
git checkout develop
git pull origin develop
git checkout -b feature/p8-contact
# Façon A : écrire le code (prompt ci-dessous) — Façon B : copier les fichiers de ce dossier
npm test
npm run test:e2e
git add pages/contact.html css/contact.css js/ui/contact.js tests/e2e/contact.e2e.test.js
git commit -m "feat(p8): Onglet Nous contacter"
git push -u origin feature/p8-contact
# Puis ouvrir la Pull Request vers develop (modèle pré-rempli), relecteur : votre binôme
```

## Prompt simple (si vous écrivez le code avec l'aide d'une IA)

> Crée en HTML/CSS/JavaScript sans framework un onglet « Nous contacter » : coordonnées fictives modifiables, formulaire (nom, e-mail, objet, message) avec contrôle de chaque champ, puis préparation d’un e-mail avec un lien `mailto:`. Le message affiché ne doit jamais prétendre que l’e-mail est envoyé.

Relisez toujours le code proposé, comparez-le au contrat d'interfaces, puis **faites passer les tests du lot** : ce sont eux qui décident.

## Fini quand

- [ ] Les tests du lot sont verts sur votre poste **et** dans la CI de la Pull Request
- [ ] Le binôme a relu et approuvé, P1 a fusionné
- [ ] `pilotage/taches/P8.json` est à jour (tâches « termine », tests « reussi » avec la date)
- [ ] Vous savez expliquer chaque fichier de votre lot
