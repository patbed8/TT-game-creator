# Checkpoint — TT Game Creator

**Date :** 2026-06-18  
**Phase en cours :** Phase 3 — Support mobile (touch, pinch-zoom, pan)  
**Statut :** Phase complétée

---

## 1. Objectif du projet

Application web permettant de concevoir, tester et jouer à des jeux de société personnalisés dans un navigateur. La Phase 3 ajoute le support complet des appareils tactiles : les gestes de tap, double-tap et glisser fonctionnent sur mobile, et l'utilisateur peut naviguer sur la table via un pincement à deux doigts (zoom) et un glisser à deux doigts (pan).

---

## 2. État d'avancement

### Ce qui est complété

- **Phase 1** — Fondations + table de jeu locale (cartes, deck, zones, tours, drag-and-drop).
- **Phase 2** — Plateau (grille ou parcours), pions draggables, dé à faces configurables.
- **Phase 3 — Support mobile :**
  - **Événements touch Konva** — ajout de `onTap`/`onDblTap` sur `Card.tsx` et `onTap` sur `Deck.tsx`. Konva sépare les événements souris (`onClick`/`onDblClick`) des événements tactiles (`onTap`/`onDblTap`) ; sans cette correction rien n'était interactif sur mobile.
  - **Guard double-fire** — `lastDblTime` ref dans `Card.tsx` (300 ms) pour éviter que `onDblClick` et `onDblTap` se déclenchent tous les deux sur les appareils hybrides. Même guard dans `Deck.tsx` via `lastDrawTime`.
  - **touch-action: none** — ajouté sur `#root` dans `src/index.css` pour que le navigateur ne consomme pas les événements tactiles avant Konva (corrige le drag bloqué).
  - **user-scalable=no** — ajouté dans le viewport `index.html` pour empêcher le zoom natif du navigateur de concurrencer le zoom Konva.
  - **Pinch-zoom + pan** — le Stage Konva gère un état `stageView` (`x`, `y`, `scale`). Un geste à deux doigts calcule le nouveau scale (ancré au point médian entre les doigts, clamped 0.3× – 3×) et le delta de pan. Les glissements à un doigt sur les éléments draggables (cartes, pions) fonctionnent indépendamment.
  - **Tap targets** — padding des boutons overlay augmenté à `12px 16px` pour des zones de tap ≥ 44 px.
  - **Texte d'aide** — mis à jour pour inclure « Clic/Tap », « Dbl-clic/Tap » et « 2 doigts : zoom + pan ».
- **PR #6** ouverte et assignée à `patbed8` : `claude/youthful-hypatia-mnu8bn → main`.

### Ce qui est en cours

Rien — la Phase 3 est complète et les changements sont poussés sur la PR #6.

### Ce qui reste à faire dans la phase en cours

Rien. Phase 3 terminée.

---

## 3. Décisions techniques prises

| Décision | Justification |
|---|---|
| `onTap`/`onDblTap` ajoutés aux côtés de `onClick`/`onDblClick` | Konva maintient une séparation stricte entre événements souris et tactiles ; les deux sont nécessaires pour la compatibilité desktop + mobile |
| Guard `lastDblTime` 300 ms sur `handleDblClick` | Sur les laptops touchscreen, Konva peut déclencher `onDblClick` ET `onDblTap` — sans guard, `onPlay()` serait appelé deux fois |
| `touch-action: none` sur `#root` plutôt que sur le canvas seul | Couvre tout le root, garantit qu'aucun ancêtre n'intercepte les événements avant Konva |
| Pinch-zoom ancré au midpoint (pas à l'origine du Stage) | UX standard : zoomer sur ce qu'on pinche, pas sur le coin supérieur gauche |
| Scale clamped à [0.3, 3] | Évite de perdre complètement la table (trop dézoomé) ou de rendre les éléments illisibles (trop zoomé) |
| Éléments draggables (cartes, pions) gérés par Konva nativement | Un seul doigt sur un élément draggable le déplace ; deux doigts sur le fond panent/zooment — pas de conflit |
| Création automatique de PR + assignation à `patbed8` | Préférence établie par l'utilisateur le 2026-06-18 : chaque poussée de code doit générer une PR assignée |

---

## 4. Fichiers importants du projet

### Modifiés lors de la Phase 3

| Fichier | Changement |
|---|---|
| `index.html` | `maximum-scale=1.0, user-scalable=no` dans le viewport |
| `src/index.css` | `touch-action: none` sur `#root` |
| `src/components/Card.tsx` | `onTap`, `onDblTap`, guard `lastDblTime` |
| `src/components/Deck.tsx` | `useRef`, `handleDraw` avec guard `lastDrawTime`, `onTap` |
| `src/components/GameTable.tsx` | State `stageView`, ref `touchRef`, handlers `onStageTouchStart/Move/End`, Stage avec props `x/y/scaleX/scaleY`, padding boutons, texte d'aide |

### Fichiers clés des phases précédentes

| Fichier | Rôle |
|---|---|
| `src/types/index.ts` | Types TypeScript : `Card`, `Player`, `GameState`, etc. |
| `src/data/deck.ts` | `BASE_DECK` : 52 cartes statiques |
| `src/engine/gameEngine.ts` | Logique de jeu pure (deal, draw, play, flip, move, nextPlayer) |
| `src/store/gameStore.ts` | Store Zustand avec actions et positions initiales |
| `src/components/Board.tsx` | Plateau (grille ou parcours) |
| `src/components/Pawn.tsx` | Pion draggable |
| `src/components/Die.tsx` | Dé à faces configurables |
| `.github/workflows/deploy.yml` | Workflow CI/CD GitHub Pages |

### Fournis par l'utilisateur

| Fichier | Contenu |
|---|---|
| `README.md` | Contexte projet, stack technologique, règles de travail |
| `modele-checkpoint-projet-dev.md` | Modèle de checkpoint à suivre |

### Références externes

- Documentation react-konva : https://konvajs.org/docs/react/
- Konva touch events : https://konvajs.org/docs/events/touch.html
- Documentation Zustand : https://zustand.docs.pmnd.rs/

---

## 5. Problèmes rencontrés et solutions

**Rien n'était interactif sur mobile** — Konva utilise des événements séparés pour la souris et le touch. `onClick` ne se déclenche jamais sur un appareil tactile ; il faut explicitement ajouter `onTap`. **Solution** : ajout de `onTap`/`onDblTap` sur `Card.tsx` et `onTap` sur `Deck.tsx`.

**Drag bloqué sur mobile** — le navigateur interceptait les événements tactiles pour son propre scroll avant que Konva ne les reçoive. **Solution** : `touch-action: none` sur `#root`.

**Double-fire sur appareils hybrides** — sur un laptop touchscreen, `onDblClick` et `onDblTap` peuvent tous deux se déclencher, appelant `onPlay()` deux fois. **Solution** : guard `lastDblTime` (300 ms) dans `handleDblClick`.

---

## 6. Problèmes non résolus et obstacles connus

- **Positions non réactives au redimensionnement** — les positions `x`/`y` des cartes sont calculées une seule fois au démarrage. Si la fenêtre est redimensionnée ou si l'orientation change, les cartes restent à leurs positions initiales.
- **Pan sans limite** — l'utilisateur peut paner le Stage au point de perdre tous les éléments hors champ. Aucun clamp de position n'est implémenté pour l'instant.
- **Pas de bouton « Reset view »** — il n'existe pas de moyen de revenir à la vue initiale (scale=1, x=0, y=0) sans recharger la page.
- **Activation manuelle de GitHub Pages** — toujours requise avant le premier déploiement automatique (**Settings → Pages → Source : GitHub Actions**).

---

## 7. Point de reprise

La Phase 3 est complète. Ouvrir la PR #6 (`claude/youthful-hypatia-mnu8bn → main`) pour review et merge.

La prochaine phase est à définir avec l'utilisateur. Pistes probables :
- **Éditeur de jeu** — UI pour configurer les règles, le plateau, les pions, les cartes sans modifier le code.
- **Multijoueur réseau** — synchronisation de l'état via WebSocket ou Supabase Realtime.
- **Persistance** — sauvegarde/chargement d'une partie (localStorage ou back-end).

Le projet se lance avec `npm run dev` dans `/TT-game-creator/`. Branche de travail : `claude/youthful-hypatia-mnu8bn`.

**Rappel préférence utilisateur :** créer automatiquement une PR et l'assigner à `patbed8` après chaque poussée de code.

---

## 8. Notes libres

- Le moteur dans `src/engine/` reste découplé de React et de Konva — toutes les fonctions prennent `GameState` et retournent `Partial<GameState>`. Ce pattern facilitera l'extraction vers un moteur de règles générique.
- Le double-clic/tap pour jouer une carte n'est disponible que pour les cartes en main. Les cartes en zone partagée répondent uniquement au clic/tap (flip) et au glisser (déplacement).
- Sur mobile, un seul doigt sur un élément draggable le déplace (géré nativement par Konva) ; deux doigts sur le fond effectuent le zoom + pan du Stage. Les deux gestes coexistent sans conflit.
- Environnement de travail : Claude Code sur le web (session distante), branche `claude/youthful-hypatia-mnu8bn`, dépôt `patbed8/TT-game-creator`.
