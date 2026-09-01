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

## 6. Retrouver la même to-do sur plusieurs navigateurs/appareils (compte par e-mail)

Par défaut, la connexion est **anonyme automatique** : chaque navigateur (et donc chaque
origine — `http://localhost:3000` et `https://ton-projet.vercel.app` comptent comme deux
navigateurs différents même si c'est le même appareil) a sa propre session, donc sa
propre to-do. C'est pour ça que la to-do de ton localhost et celle de ton site en ligne
peuvent diverger.

Un bouton **👤 Invité** en haut à droite de la page permet de relier un e-mail (lien
magique, sans mot de passe, via `supabase.auth.updateUser()` / `signInWithOtp()`) :
- Sur le navigateur qui a **déjà ta vraie to-do**, clique dessus puis « 1ère fois : créer
  mon compte ici ». Tu gardes toutes tes données actuelles, elles sont juste rattachées à
  cet e-mail.
- Sur tes **autres** navigateurs/appareils, utilise « J'ai déjà un compte : m'y
  connecter » avec le **même e-mail** — tu rejoins alors ce même compte (et donc la même
  to-do), au lieu de rester sur une session anonyme séparée.

**Étape unique à faire toi-même dans le dashboard Supabase** (impossible à faire depuis le
code avec la clé publique) : **Authentication > URL Configuration**, ajoute dans
*Redirect URLs* chaque origine où l'app tourne, par ex. `http://localhost:3000/*` et
`https://ton-projet.vercel.app/*`. Sans ça, le clic sur le lien reçu par e-mail peut
rediriger vers la mauvaise adresse (ou une erreur).

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

### 2026-08-26

- **Sous-sous-catégories** : chaque sous-catégorie peut désormais avoir ses propres
  sous-sous-catégories (mêmes 4 statuts et %). Dès qu'une sous-catégorie en a au moins
  une, son propre % devient automatiquement la moyenne de ses sous-sous-catégories (même
  logique que projet ↔ sous-catégories) — plus besoin de le régler à la main. Ajout via
  « + Ajouter une sous-sous-catégorie » dans l'onglet « To-do complète » ; le panneau
  latéral d'une île (clic sur une île du mois) permet aussi de faire évoluer leur statut.
- **Renommer projets / sous-catégories / sous-sous-catégories** : un bouton ✎ à côté de
  chaque nom permet de le modifier (dans l'onglet « To-do complète »).
- **Sauvegarde immédiate à la première connexion Supabase** : vérification que le projet
  Supabase (table `app_state`, RLS, connexion anonyme) fonctionne bien de bout en bout.
  Correctif : sur un navigateur qui n'a encore aucune donnée en base, la to-do actuellement
  affichée est désormais poussée vers Supabase dès la connexion, au lieu d'attendre la
  première modification (`initApp` dans `app.js`).
- **Compte par e-mail (lien magique)** : la to-do de `localhost` et celle du site
  déployé sur Vercel étaient différentes car la connexion anonyme est isolée par origine
  (localhost ≠ vercel.app = deux sessions séparées). Ajout d'un bouton compte (« 👤
  Invité ») en haut à droite pour relier un e-mail à la session courante ou se connecter
  à un compte déjà relié ailleurs, afin de retrouver la même to-do partout. Voir
  README section 6 pour l'étape de configuration à faire dans le dashboard Supabase
  (Redirect URLs).
- **Collection d'animaux — action de déblocage affichée** : la légende qui indiquait
  auparavant l'action à accomplir uniquement sous les animaux encore verrouillés
  s'affiche désormais aussi sous les animaux déjà débloqués (quelle action a permis de
  les débloquer).
- **Réordonner les sous-catégories dans un projet** : boutons ▲▼ à côté de chaque
  sous-catégorie (onglet « To-do complète ») pour changer sa position dans la liste du
  projet (`moveSub` dans `app.js`).

### 2026-08-27

- **Mois sans projet = 0 % et île cachée** : un mois sans aucun projet affichait
  auparavant 100 % (« libre ») et son île restait visible/débloquée par défaut, y compris
  pour un mois passé. Il affiche désormais 0 % et son île reste cachée sous les nuages
  (comme un mois futur non commencé) tant qu'aucun projet n'y a été ajouté
  (`monthStats` / `isMonthUnlocked` dans `app.js`, `monthPct` dans l'onglet « To-do
  complète »).
- **Correctif : badges débloqués à tort** (ex. le Renard des Frimas alors qu'aucune île
  n'est débloquée). Deux causes : `CURRENT_MONTH` était figé sur août (démo) au lieu du
  mois réel, ce qui pouvait faire compter des îles comme « déjà découvertes » sans
  action ; et `checkBadges()` n'ajoutait des badges qu'il ne les retirait jamais, donc un
  badge débloqué à tort (à cause de ce ou d'un autre bug passé) restait affiché pour
  toujours même une fois la condition redevenue fausse. `CURRENT_MONTH` se base
  maintenant sur la date réelle, et `checkBadges()` réévalue chaque badge à chaque appel
  (retire ceux qui ne sont plus valides) — la correction s'applique automatiquement dès
  le prochain chargement de l'app.
- **Correctif (suite) : « île découverte » ne correspondait pas à ce qui s'affiche
  visuellement.** Un mois passé/courant avec un projet à 0% comptait comme « découvert »
  pour les badges (`islandsDiscovered`), alors que visuellement son île reste
  entièrement sous les nuages (le brouillard dépend du %, pas du fait que le mois soit
  passé). `isMonthUnlocked` exige désormais une vraie progression (`pct>0`) pour tous les
  mois, passés, courant ou futurs — plus de passe-droit pour les mois déjà entamés sans
  rien de fait. Une île à 0% reste donc gérable via l'onglet « To-do complète », mais
  n'est plus cliquable depuis la carte ni comptée comme découverte tant qu'aucune
  sous-catégorie n'a réellement avancé.
- **Correctif (suite et fin) : les badges liés aux îles comptaient une île comme
  « découverte » dès le premier pourcent de progression, pas à 100% comme prévu.**
  `isMonthFullyDone()` existait déjà dans le code (exactement pour ce calcul) mais
  n'était appelée nulle part : `islandsDiscovered` utilisait par erreur
  `isMonthUnlocked()` (qui ne demande qu'un peu de progression, pour le brouillard
  progressif de la carte). `islandsDiscovered` et `monthsDone` utilisent désormais tous
  les deux `isMonthFullyDone()` — une île ne compte pour les badges que si son mois est
  entièrement terminé (100%, plus aucun nuage).
- **Barre de régularité (52 semaines)** : nouvelle section au-dessus de l'archipel, avec
  un point par semaine de l'année (52 au total). Chaque semaine où au moins une action
  compte (mise à jour d'un statut, ajout d'un projet/sous-catégorie/sous-sous-catégorie,
  ajout d'un commentaire) s'allume en or ; une semaine passée sans action reste marquée
  (`missed`), la semaine en cours pulse, les semaines futures restent estompées.
  Fonctionne aussi depuis l'onglet « To-do complète » (le flag `markActive` est propagé
  au parent via `postMessage`, uniquement pour les actions qui comptent — pas pour
  supprimer/renommer/déplacer/archiver). Sauvegardé dans Supabase comme le reste de l'état
  (`activityWeeks` dans `getAppStateSnapshot`).

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

### 2026-08-28

- **Régularité — collection de pierres** : les 52 puces hebdomadaires deviennent des
  pierres illustrées (`assets/stones/`). Une pierre validée (action faite dans la
  semaine) affiche son image avec halo doré, sinon son image « au repos ». Les 52
  semaines sont groupées par 4 ; chaque groupe débloque au fil du temps un nouvel
  élément (nouvelle illustration de pierre) indépendamment de la validation — un seul
  élément pour l'instant (« Initial »), les 12 autres viendront compléter
  `STONE_ELEMENTS` dans `app.js`. L'affichage reste une seule barre continue comme avant.
- **Pierres — agrandissement** : taille des pierres de la barre de régularité augmentée
  (26px → 34px) pour mieux voir le détail des illustrations.
- **Menu sous le titre + vue « Collections »** : trois boutons (🗂️ Collections,
  🏆 Niveau, 📋 To-do complète) ajoutés sous le bandeau du haut. « Collections » ouvre un
  panneau avec un onglet par collection (🦊 Animaux, 💎 Pierres) montrant chaque
  élément en plus grand qu'auparavant ; cliquer sur une image débloquée l'agrandit
  encore dans une vue plein écran (loupe) pour bien voir les détails
  (`openCollectionsPanel`, `openLightbox` dans `app.js`). Le menu est positionné en
  haut à gauche, directement sous le titre (`.topbar-left` dans `styles.css`).
- **Pierres — taille ajustée** : 34px jugé trop grand, ramené à 22px.
- **Menu du haut empilé verticalement** : les 3 boutons (Collections, Niveau, To-do
  complète) s'affichent désormais les uns en dessous des autres au lieu d'une ligne.
- **Section renommée « Tes pierres d'éléments »** (au lieu de « Régularité ») et
  légende remplacée par un lien « ℹ️ En savoir plus » dont le texte explicatif
  s'affiche au survol (ou au focus clavier) via une infobulle (`.info-tip` dans
  `styles.css`), au lieu d'être affiché en permanence.
- **2ᵉ pierre d'élément : Neige** (`assets/stones/01_neige.png` au repos,
  `01_neige_y.png` validée) ajoutée à `STONE_ELEMENTS` dans `app.js`.
- **`STONE_ELEMENTS` passe à un tableau à taille fixe (13 positions = 52 semaines / 4)**,
  chaque pierre étant placée à sa position définitive au lieu de s'ajouter à la suite.
  Les positions pas encore reçues affichent un repère « Élément à venir »
  (`STONE_PLACEHOLDER`) tant qu'elles ne sont pas remplies.
- **10ᵉ pierre d'élément : Ombre** (`assets/stones/10_ombre.png` au repos,
  `10_ombre_y.png` découverte) placée en position 10 dans `STONE_ELEMENTS`.

### 2026-09-01

- **To-do complète — repli automatique des mois à 100 %** : dans l'onglet « To-do
  complète » (`openFullTodoTab` dans `app.js`), un mois dont tous les projets sont
  terminés (100 %) se replie désormais automatiquement à l'ouverture ; les mois non
  terminés restent dépliés. Ce comportement par défaut ne s'applique que tant que
  l'utilisateur n'a pas manuellement replié/déplié le mois lui-même durant la session
  (le clic manuel reste prioritaire).
