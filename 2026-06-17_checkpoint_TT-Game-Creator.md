# Checkpoint — TT Game Creator

**Date :** 2026-06-17  
**Phase en cours :** Phase 1 — Fondations + table de jeu locale (cartes)  
**Statut :** Phase complétée

---

## 1. Objectif du projet

Application web permettant de concevoir, tester et jouer à des jeux de société personnalisés dans un navigateur. La Phase 1 établit les fondations techniques et livre une table de jeu locale fonctionnelle pour deux joueurs avec des cartes uniquement.

---

## 2. État d'avancement

### Ce qui est complété

- **Initialisation du projet Vite** — projet `tt-game-creator` avec le gabarit `react-ts` (Vite 6, React 19, TypeScript 5.7), avec configuration `tsconfig.json` / `tsconfig.app.json` / `tsconfig.node.json`.
- **Dépendances installées** — `react-konva@19.2.5`, `konva@9.3.22`, `zustand@5.0.14`. React 19 confirmé, compatible avec react-konva 19.
- **Structure de dossiers** — `src/types/`, `src/store/`, `src/engine/`, `src/data/`, `src/components/` créés conformément au plan.
- **Modèle de données** — types `Card`, `Player`, `GameState`, `Suit`, `Rank`, `CardFace` dans `src/types/index.ts`.
- **Données de test** — `src/data/deck.ts` : 52 cartes définies statiquement (`BASE_DECK`), mélangées au démarrage via Fisher-Yates dans `src/engine/deckUtils.ts`.
- **Moteur de jeu pur** — `src/engine/gameEngine.ts` : fonctions pures sans dépendance React (`dealInitialHands`, `drawCardFromDeck`, `playCardToShared`, `flipCardById`, `moveCardById`, `advanceToNextPlayer`).
- **Store Zustand** — `src/store/gameStore.ts` : pont entre le moteur et les composants, gère le placement visuel initial des cartes (positions `x`/`y` calculées selon `window.innerWidth/Height`).
- **Rendu Konva** — `Stage + Layer` plein écran. Composants : `Card.tsx` (carte draggable), `Deck.tsx` (pioche), `Hand.tsx` (fond de zone main), `SharedZone.tsx` (bordure zone partagée), `GameTable.tsx` (orchestration + overlay HTML).
- **Système de tours** — indicateur bilingue « Tour de / Turn of : Joueur X », bouton « Passer le tour / End turn » alternant entre les deux joueurs.
- **Interactions cartes** — clic = retourner, double-clic = jouer vers zone partagée (cartes en main), glisser = déplacer.
- **Correctif double-clic** — débounce de 220 ms sur `onClick` pour les cartes en main afin d'éviter que le double-clic déclenche deux `flipCard` avant `onDblClick`.
- **Déploiement GitHub Pages** — `base: '/TT-game-creator/'` dans `vite.config.ts` + workflow `.github/workflows/deploy.yml` (déclenché sur push vers `main`).
- **PR #1 ouverte** — branche `claude/youthful-hypatia-mnu8bn` → `main`.

### Ce qui est en cours

Rien — la Phase 1 est complète et les changements sont poussés sur la PR #1.

### Ce qui reste à faire dans la phase en cours

Rien. Phase 1 terminée.

---

## 3. Décisions techniques prises

| Décision | Justification |
|---|---|
| Fonctions pures dans `engine/`, store Zustand comme seul pont vers React | Prépare l'extraction du moteur pour la Phase 4 (moteur de règles) sans refactoring majeur |
| Positions `x`/`y` stockées dans l'état de chaque carte | Permet le drag-and-drop libre sur tout le canvas ; positions assignées à l'initialisation selon les dimensions de la fenêtre |
| `Hand.tsx` et `SharedZone.tsx` n'encapsulent que le fond visuel, pas les cartes | Permet de contrôler l'ordre de rendu dans `GameTable` (fond → cartes zone partagée → cartes en main, pour que les cartes en main soient toujours au-dessus) |
| Débounce 220 ms sur `onClick` (cartes en main seulement) | Konva déclenche `onClick` sur chaque clic individuel, donc un double-clic génère deux `onClick` avant `onDblClick`. Le débounce distingue les deux sans affecter les cartes en zone partagée (flip immédiat) |
| Overlay HTML pour l'indicateur de tour et le bouton | Permet styles CSS natifs (hover, border-radius, etc.) sans complexité Konva supplémentaire |
| `base: '/TT-game-creator/'` dans Vite | Nécessaire pour GitHub Pages — les assets sont servis sous un sous-répertoire, pas à la racine |

---

## 4. Fichiers importants du projet

### Créés lors de ce projet

| Fichier | Rôle |
|---|---|
| `index.html` | Point d'entrée HTML |
| `vite.config.ts` | Config Vite (plugin React, `base` GitHub Pages) |
| `tsconfig.json` / `tsconfig.app.json` / `tsconfig.node.json` | Configuration TypeScript |
| `package.json` | Dépendances et scripts npm |
| `src/main.tsx` | Bootstrap React (createRoot) |
| `src/App.tsx` | Composant racine, initialise le jeu via `useEffect` |
| `src/index.css` | Reset CSS global, fond vert table |
| `src/types/index.ts` | Types TypeScript : `Card`, `Player`, `GameState`, etc. |
| `src/data/deck.ts` | `BASE_DECK` : 52 cartes statiques |
| `src/engine/deckUtils.ts` | `createDeck()`, `shuffleDeck()` |
| `src/engine/gameEngine.ts` | Logique de jeu pure (deal, draw, play, flip, move, nextPlayer) |
| `src/store/gameStore.ts` | Store Zustand avec actions et positions initiales |
| `src/components/Card.tsx` | Carte Konva (draggable, flip, jouer) |
| `src/components/Deck.tsx` | Zone pioche avec visuel empilé |
| `src/components/Hand.tsx` | Fond visuel de la zone main |
| `src/components/SharedZone.tsx` | Bordure en tirets de la zone partagée |
| `src/components/GameTable.tsx` | Table principale : Stage Konva + overlay HTML |
| `.github/workflows/deploy.yml` | Workflow CI/CD GitHub Pages |

### Fournis par l'utilisateur

| Fichier | Contenu |
|---|---|
| `README.md` | Contexte projet, stack technologique, règles de travail |
| `modele-checkpoint-projet-dev.md` | Modèle de checkpoint à suivre |

### Références externes

- Documentation react-konva : https://konvajs.org/docs/react/
- Documentation Zustand : https://zustand.docs.pmnd.rs/
- GitHub Actions — Deploy Pages : https://github.com/actions/deploy-pages

---

## 5. Problèmes rencontrés et solutions

**Double-clic non fonctionnel** — `onClick` se déclenche sur chaque clic individuel dans Konva, donc un double-clic générait la séquence `onClick → onClick → onDblClick`. Résultat : deux `flipCard` consécutifs avant que `onPlay` ne soit appelé. **Solution** : débounce de 220 ms sur `onClick` pour les cartes en main uniquement. Si un second clic arrive dans cette fenêtre, le timer est annulé et `onDblClick` appelle `onPlay` à la place.

---

## 6. Problèmes non résolus et obstacles connus

- **Positions non réactives au redimensionnement** — les positions `x`/`y` des cartes sont calculées une seule fois au démarrage via `window.innerWidth/Height`. Si la fenêtre est redimensionnée, les cartes restent à leurs positions initiales et peuvent déborder de la zone de main. Acceptable en Phase 1.
- **Activation manuelle de GitHub Pages** — avant le premier déploiement automatique, il faut activer GitHub Pages dans **Settings → Pages → Source : GitHub Actions** sur le dépôt.
- **Pas de validation de fin de main** — le jeu ne détecte pas si un joueur a épuisé sa main ou si le paquet est vide. Les actions échouent silencieusement (comportement voulu pour Phase 1).

---

## 7. Point de reprise

La Phase 1 est complète. La prochaine étape est la **Phase 2** selon la feuille de route du projet (à définir avec l'utilisateur — probablement l'éditeur de jeu ou l'ajout de plateau/dés).

Si l'on reprend sur la Phase 1 pour des ajustements, le projet se lance avec `npm run dev` dans le répertoire `/TT-game-creator/`. La PR #1 (`claude/youthful-hypatia-mnu8bn → main`) est prête à merger.

---

## 8. Notes libres

- Le moteur dans `src/engine/` est volontairement découplé de React et de Konva. Toutes les fonctions prennent `GameState` et retournent `Partial<GameState>`. Ce pattern facilitera l'extraction vers un moteur de règles générique en Phase 4.
- Le double-clic pour jouer une carte (main → zone partagée) n'est disponible que pour les cartes en main. Les cartes en zone partagée répondent uniquement au clic (flip) et au glisser (déplacement).
- Environnement de travail : Claude Code sur le web (session distante), branche `claude/youthful-hypatia-mnu8bn`, dépôt `patbed8/TT-game-creator`.
