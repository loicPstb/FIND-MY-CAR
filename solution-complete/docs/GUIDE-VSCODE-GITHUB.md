# Guide pas à pas — VS Code, Git et GitHub pour FIND MY CAR

> Ce guide explique les **gestes de base**. L'organisation de l'équipe (qui fait quoi, dans quel ordre) est dans [MODE-OPERATOIRE.md](MODE-OPERATOIRE.md).
>
> **Quel terminal ?** Le terminal intégré de VS Code (**Terminal → Nouveau terminal**), à la racine du dossier du projet. Sous Windows, c'est **PowerShell** ; sous macOS et Linux, **bash/zsh**.

---

## 1. Installer les outils (une fois par ordinateur)

| Outil | Lien | Vérification dans le terminal |
|---|---|---|
| Git | https://git-scm.com/downloads | `git --version` |
| Node.js LTS (22 ou plus) | https://nodejs.org | `node --version` et `npm --version` |
| VS Code | https://code.visualstudio.com | — |
| Compte GitHub | https://github.com | — |

Après installation, **fermer puis rouvrir VS Code**. Ensuite :

```bash
git config --global user.name "Prénom Nom"
git config --global user.email "identifiant@users.noreply.github.com"   # adresse masquée GitHub
```

## 2. Extensions VS Code du projet

À l'ouverture du dossier, VS Code propose d'installer les extensions recommandées : cliquez sur **Installer tout**.

- **GitHub Pull Requests** : connexion à GitHub, issues, création et relecture des Pull Requests dans VS Code.
- **GitLens** : historique et auteur de chaque ligne (*clic droit → Open Blame*).
- **GitHub Actions** : résultat des tests automatiques (CI) de chaque branche.
- **Live Server** : lancer le site sans Node.js.
- **Prettier** : mise en forme du code (`Maj + Alt + F`).

Connexion : icône **Comptes** en bas à gauche → *Se connecter avec GitHub* → autoriser VS Code dans le navigateur.

## 3. Récupérer le projet

```bash
cd ~/Documents                    # Windows : cd $HOME\Documents
git clone https://github.com/<compte>/find-my-car.git
cd find-my-car
git checkout develop
npm install                       # installe Puppeteer + un Chrome de test (~150 Mo)
code .                            # ouvre le dossier dans VS Code
```

*Sans terminal* : VS Code → `Ctrl + Maj + P` → **Git: Clone** → coller l'adresse du dépôt.

## 4. Lancer le site

> ❌ Ne pas double-cliquer sur `index.html` : en `file://`, le navigateur bloque SQLite et le chargement des onglets. Un message d'aide s'affiche dans ce cas.

- **Avec Node.js** : `npm start` → ouvrir **http://localhost:8080** (arrêt : `Ctrl + C`).
- **Avec Live Server** : clic droit sur `index.html` → **Open with Live Server**.
- Tableau de pilotage : **http://localhost:8080/pilotage/**.

Comptes de démonstration (fictifs) : `client@findmycar.example.com` / `ClientDemo2026!` et `admin@findmycar.example.com` / `AdminDemo2026!`.

## 5. Lancer les tests

```bash
npm test             # tests unitaires (Node.js)
npm run test:e2e     # tests de bout en bout dans Chrome
npm run test:all     # les deux
```

Les captures d'écran des tests sont dans `tests/captures/` (non publiées sur GitHub).

## 6. Git au quotidien : terminal et équivalent VS Code

| Action | Terminal | VS Code |
|---|---|---|
| Récupérer les nouveautés | `git checkout develop` puis `git pull origin develop` | Barre du bas : branche `develop` → icône 🔄 *Synchroniser* |
| Créer sa branche | `git checkout -b feature/p4-onglet-vehicules` | Clic sur le nom de branche (en bas à gauche) → *Créer une branche à partir de…* |
| Voir ses changements | `git status` puis `git diff` | Vue **Contrôle de code source** (`Ctrl + Maj + G`) |
| Préparer des fichiers | `git add <fichier>` | **+** à côté du fichier |
| Enregistrer (commit) | `git commit -m "feat(vehicules): …"` | Message, puis **Valider** |
| Publier | `git push -u origin <branche>` | **Publier la branche** / **Synchroniser** |
| Ouvrir une Pull Request | sur github.com : **Compare & pull request** | Vue **GitHub** → **Create Pull Request** |
| Relire une Pull Request | `git fetch origin` puis `git checkout <branche>` | Vue **GitHub Pull Requests** → *Checkout*, commentaires dans la marge, **Approve** |
| Voir la CI | onglet *Actions* sur github.com | Vue **GitHub Actions** |
| Mettre de côté un travail | `git stash` / `git stash pop` | `…` → *Stash* |

## 7. Vérifier la base SQLite dans le navigateur

`F12` → onglet **Application** (Chrome/Edge) ou **Stockage** (Firefox) → **IndexedDB** → `findmycar`.
Dans la **Console** : `DB.modules()`, `VehiculesRepo.getVehicles({})`, `Account.currentUser()`.

## 8. Erreurs fréquentes

| Symptôme | Solution |
|---|---|
| Bandeau « Impossible de démarrer » + mention `file://` | Lancer avec `npm start` ou Live Server |
| `Utils is not defined` | L'ordre des `<script>` de `index.html` a été modifié : remettre la version du dépôt |
| Les anciennes versions des fichiers s'affichent | `Ctrl + F5` |
| Le port 8080 est occupé | `node outils/serveur.js 8081` |
| Mot de passe d'un compte de test oublié | Bouton « Réinitialiser les données de démonstration » (pied de page) |
| Plus de cas | [MODE-OPERATOIRE.md §14](MODE-OPERATOIRE.md#14-dépannage) |
