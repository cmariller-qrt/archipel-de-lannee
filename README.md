# 🧭 Archipel de l'Année

To-do gamifiée : chaque mois est une île à découvrir dans un archipel, avec projets,
sous-catégories à faire avancer, une collection d'animaux à débloquer, et un bloc-notes.

Ce dossier est prêt à être ouvert dans **Cursor**, versionné sur **GitHub**, connecté à
**Supabase** (sauvegarde des données) et déployé sur **Vercel**. Suis les étapes dans
l'ordre — chacune ne prend que quelques minutes.

---

## 0. Structure du projet

```
atlas-project/
├── index.html              → page principale
├── css/styles.css          → tous les styles
├── js/
│   ├── app.js               → toute la logique de l'application
│   ├── supabase-client.js   → connexion + sauvegarde/chargement des données
│   ├── config.example.js    → modèle de configuration Supabase
│   └── config.js            → (à créer par toi, contient tes vraies clés)
├── assets/
│   ├── islands/              → 12 illustrations d'îles (une par mois)
│   ├── animals/              → 12 illustrations d'animaux à collectionner
│   └── hub-depart.png        → illustration de l'île centrale
├── supabase/schema.sql      → script SQL à exécuter dans Supabase
├── vercel.json
├── package.json
└── .gitignore
```

Aucun outil de build n'est nécessaire (pas de npm install obligatoire) : c'est un site
statique classique en HTML/CSS/JS. Plus simple à comprendre et à modifier avec Cursor.

---

## 1. Tester en local avant toute chose

Ouvrir directement `index.html` dans un navigateur fonctionne, mais certains navigateurs
bloquent le chargement des fichiers JS locaux (erreurs CORS). Le plus fiable :

```bash
npx serve . -l 3000
```

puis ouvrir `http://localhost:3000`. À ce stade, sans Supabase configuré, l'app
fonctionne mais rien n'est sauvegardé (message d'avertissement dans la console) —
c'est normal, on configure Supabase à l'étape 3.

---

## 2. Créer le dépôt GitHub

1. Va sur [github.com/new](https://github.com/new), crée un dépôt (ex : `archipel-de-lannee`),
   **sans** cocher "Add a README" (on en a déjà un).
2. Dans Cursor, ouvre ce dossier (`File > Open Folder`).
3. Dans le panneau **Source Control** (icône branche sur la gauche) :
   - Clique sur "Initialize Repository"
   - Ajoute un message de commit (ex : "Premier commit")
   - Clique sur "Commit"
4. Relie ton dépôt GitHub et pousse :
   ```bash
   git remote add origin https://github.com/TON-COMPTE/archipel-de-lannee.git
   git branch -M main
   git push -u origin main
   ```
   (Cursor peut aussi te proposer de le faire directement via l'interface, sans terminal.)

---

## 3. Créer le projet Supabase

1. Va sur [supabase.com](https://supabase.com) → **New project** (gratuit).
2. Une fois le projet créé, va dans **SQL Editor** (menu de gauche) → **New query**.
3. Ouvre le fichier `supabase/schema.sql` de ce projet, colle tout son contenu dans
   l'éditeur SQL, clique sur **Run**. Ça crée la table `app_state` et ses règles de
   sécurité (chacun ne voit que ses propres données).
4. Active la connexion anonyme : **Authentication > Providers > Anonymous Sign-Ins**
   → active le interrupteur (elle est désactivée par défaut).
5. Récupère tes clés : **Project Settings > API**
   - `Project URL`
   - `anon public` key (⚠️ pas la `service_role` — celle-là ne doit jamais être utilisée
     côté navigateur)

---

## 4. Configurer l'app avec tes clés Supabase

Dans Cursor :

1. Duplique `js/config.example.js` en `js/config.js` (même dossier).
2. Remplace les deux valeurs par celles récupérées à l'étape précédente :
   ```js
   const SUPABASE_CONFIG = {
     url: 'https://xxxxxxxxxxxxx.supabase.co',
     anonKey: 'eyJhxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
   };
   ```
3. Relance `npx serve . -l 3000` et recharge la page : la console ne doit plus afficher
   l'avertissement Supabase. Fais une petite modification (coche une tâche) puis
   recharge la page → elle doit être toujours cochée. La sauvegarde fonctionne.

`js/config.js` est volontairement ignoré par Git (`.gitignore`) : chaque environnement
(le tien en local, puis Vercel) aura sa propre configuration. On règle Vercel à l'étape
suivante.

---

## 5. Déployer sur Vercel

1. Va sur [vercel.com](https://vercel.com) → connecte-toi avec ton compte GitHub.
2. **Add New… > Project**, sélectionne ton dépôt `archipel-de-lannee`.
3. Vercel détecte un site statique automatiquement (aucune configuration de build
   nécessaire) → clique sur **Deploy**.
4. Une fois déployé, ton site a une URL du type `archipel-de-lannee.vercel.app`.

**Problème à ce stade** : `js/config.js` n'est pas sur GitHub (il est gitignoré), donc
il n'existe pas non plus sur Vercel → Supabase ne fonctionnera pas encore en ligne.
Deux façons de régler ça :

- **Option simple** : retire `js/config.js` du `.gitignore` et commite-le quand même.
  Ce n'est pas dangereux (la clé "anon" est publique par nature), mais mélange
  configuration et code.
- **Option propre (recommandée)** : garde-le gitignoré, et à la place, génère ce fichier
  au moment du build à partir de variables d'environnement Vercel. Dis-le-moi quand tu
  en seras là, je t'aiderai à ajouter les 5 lignes de script nécessaires
  (`vercel.json` + petit script de build) — ça reste très simple, pas besoin d'un vrai
  framework.

Pour avancer vite maintenant, l'option simple suffit largement.

---

## 6. Étape suivante : vrais comptes utilisateurs (optionnel, plus tard)

Aujourd'hui, la connexion est **anonyme automatique** : chaque navigateur a ses propres
données, sans mot de passe ni email. C'est le plus rapide pour démarrer et tester.

Le jour où tu veux que la même personne retrouve ses données sur plusieurs appareils
(téléphone + ordinateur), il faudra ajouter un vrai écran de connexion. Supabase propose
plusieurs méthodes prêtes à l'emploi :
- **Magic link** (email avec lien de connexion, pas de mot de passe) — la plus simple à
  ajouter, quelques lignes avec `supabase.auth.signInWithOtp()`.
- Connexion Google / GitHub (OAuth).

On pourra faire cette étape ensemble quand tu seras prêt — c'est un ajout, pas une
réécriture de ce qui existe déjà.

---

## Ce qui a été simplifié pour ce prototype (à garder en tête)

- **Une seule ligne JSON par utilisateur** dans Supabase (`app_state.data`) plutôt que
  des tables séparées (projets / sous-catégories / commentaires). Suffisant pour un usage
  personnel ; à normaliser si tu veux un jour des statistiques croisées, une recherche, etc.
- **Pas de gestion de conflits** si la même personne modifie l'app sur deux onglets/appareils
  en même temps (le dernier qui sauvegarde écrase l'autre). Pas un problème en usage normal.
- **Onglet "to-do complète"** : sa synchronisation avec la carte se fait via `postMessage`
  entre les deux onglets du même navigateur (voir `openFullTodoTab` dans `app.js`) ; ce
  n'est pas encore relié à Supabase indépendamment — la sauvegarde se déclenche via la
  page principale qui reçoit la synchro.

---

## Journal des modifications

Historique des échanges avec l'assistant, pour garder trace des évolutions apportées au
fil du temps. Chaque entrée reprend les demandes traitées lors d'une session.

### 2026-08-25

- **To-do centrale (île du milieu)** : s'ouvre désormais toujours en plein écran sur la
  même page (overlay + `<iframe>` isolé), au lieu d'un nouvel onglet qui pouvait être
  bloqué par le navigateur (`openFullTodoOverlay` dans `app.js`).
- **To-do complète — mois repliables** : chaque mois a une flèche cliquable pour
  replier/déplier la liste de ses projets.
- **To-do complète — archivage de projet** : bouton 📦 pour archiver un projet (bouton
  ♻️ pour le désarchiver). Un projet archivé sort du calcul de progression et de la
  découverte des îles, mais reste visible dans une section « Projets archivés
  (historique) » repliable en bas de page.
- **To-do complète — déplacer un projet entre mois** : glisser-déposer (drag and drop)
  d'une carte projet vers un autre mois ; la couleur du projet est mise à jour selon la
  saison de sa nouvelle destination.
- **Clic sur une île du mois** : le panneau de to-do du mois s'ouvre en panneau latéral
  à droite, l'île zoomée s'affiche agrandie dans la zone restante à gauche. Cliquer sur
  l'île zoomée la fait grossir par paliers (3 tailles), jusqu'à occuper presque toute la
  zone gauche. (Ce comportement reste spécifique aux 12 îles des mois — la to-do centrale
  n'est pas concernée et garde son ouverture plein écran.)
- **Correctif de calcul de progression** : un projet sans aucune sous-catégorie compte
  désormais pour 0 % dans la progression du mois/année (au lieu d'être ignoré et de
  laisser le mois passer à 100 % / « libre » par défaut). L'île reste donc dans le
  brouillard tant que ce projet n'a pas été détaillé en sous-catégories.
- **Image de l'île de janvier** remplacée (`assets/islands/00_Janvier.png`).
- Rappel des contraintes pour remplacer une image d'île : ratio **4:3**, résolution
  conseillée **1600×1200 px minimum** (2000×1500 px pour un rendu net avec le zoom),
  PNG à fond transparent.
