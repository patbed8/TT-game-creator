# Checkpoint — TT Game Creator

**Date :** 2026-06-21  
**Phase en cours :** Phase 4 — Écran de configuration (suite) — nommage des dés et des paquets  
**Statut :** Phase complétée

---

## 1. Objectif du projet

Application web permettant de concevoir, tester et jouer à des jeux de société personnalisés dans un navigateur. Cette session a consolidé l'écran de configuration (SetupScreen) : masquage des zones de carte lorsqu'aucun paquet n'est sélectionné, menu ☰ pour les hints et la nouvelle partie, palette de tuiles en accordéon, roulage individuel des dés, prise en charge de plusieurs paquets avec défausse et mélange automatique, et nommage libre de chaque dé et paquet.

---

## 2. État d'avancement

### Ce qui est complété

- **Phase 1** — Fondations + table de jeu locale (cartes, deck, zones, tours, drag-and-drop).
- **Phase 2** — Plateau (grille ou parcours), pions draggables, dé à faces configurables.
- **Phase 3** — Support mobile (touch, pinch-zoom, pan) + tuiles libres (carrés + hexagones).
- **Phase 4 — Écran de configuration :**
  - **SetupScreen complet (PR #10)** — formulaire de configuration avec sélection de plateau, dés, paquets, pions, joueurs ; remplace le lancement codé en dur.
  - **Masquage des zones de carte (PR #13)** — la zone de main et les zones de deck n'apparaissent que si au moins un paquet est configuré ; suppression du bouton "toggle board type" (le plateau se choisit dans le setup) ; toutes les cartes démarrent dans le paquet.
  - **Menu ☰ + palette accordéon (PR #14)** — les hints de jeu sont cachés derrière un bouton menu (☰) qui contient aussi l'option "Nouvelle partie / New game" (`goToSetup()`). La palette de tuiles est reorganisée en deux sections accordéon (Carré / Hexagone), fermées par défaut.
  - **Roulage individuel des dés + multi-deck (PR #15) :**
    - Chaque dé est cliquable/tappable individuellement (`rollDie(dieId)`).
    - Architecture multi-deck : `GameState.deck/discard` → `GameState.decks: DeckInstance[]` ; chaque carte porte un `deckId`.
    - Chaque deck a sa propre zone de défausse visuelle ; les decks s'empilent horizontalement.
    - Mélange automatique de la défausse dans le deck lorsque ce dernier est vide.
    - Les dés sont positionnés après la dernière zone de deck pour éviter le chevauchement.
  - **Correctifs (PR #16)** — cartes jouées qui atterrissaient au mauvais endroit (maintenant positionnées sur la défausse de leur deck) ; deck vide qui ne se mélange pas (la `DeckZone` était non-cliquable quand vide).
  - **Nommage des dés et paquets (PR #17) :**
    - `DieConfig` : le champ `count` est supprimé ; chaque entrée = un seul dé avec un champ `label`.
    - `DeckSpec` : ajout de `label?: string` propagé jusqu'à `DeckInstance.label`.
    - `SetupScreen` : `DieEntryEditor` (sélecteur de type + champ nom) et `DeckEntryEditor` (champ nom en tête) remplacent les compteurs d'ancienne génération.
    - Le composant `Die.tsx` affiche le `label` au-dessus de la face du dé.
    - `buildInitialState` utilise le label saisi ou replie sur `d{faces}` / `Paquet N / Deck N`.

### Ce qui est en cours

Rien — PR #17 ouverte et assignée à `patbed8`.

### Ce qui reste à faire dans la phase en cours

Rien. Toutes les fonctionnalités demandées sont livrées.

---

## 3. Décisions techniques prises

| Décision | Justification |
|---|---|
| `DieConfig.count` supprimé — une entrée = un dé | Simplifie le mapping dans `buildInitialState` (`.map` au lieu de `.flatMap`) et correspond à l'UX où chaque dé a son propre nom |
| `DeckInstance.label` dérivé du `DeckSpec.label` | Le label vit dans le config (setup) et est copié à l'instance runtime ; pas de synchronisation bidirectionnelle nécessaire |
| `goToSetup()` réinitialise tout l'état de jeu | Retour propre au setup sans rechargement de page, nécessaire pour le bouton "Nouvelle partie" dans le menu ☰ |
| `DECK_ZONE_WIDTH = 170` exporté depuis `gameStore.ts` | Constante partagée entre le store (placement des dés) et `GameTable.tsx` (rendu des zones) |
| Position des cartes jouées calculée par `deckIdx` | `playCard` calcule `x = DECK_START_X + deckIdx * DECK_ZONE_WIDTH + CARD_W + 10` pour que chaque carte rejoigne la bonne défausse visuelle |
| `DeckZone` cliquable via `<Group>` quand deck vide + défausse non vide | Un `<Rect>` seul ne peut pas capturer les événements Konva ; envelopper dans `<Group>` avec les handlers conditionnel corrige l'auto-mélange au clic |
| Sections accordéon fermées par défaut | Réduit l'encombrement visuel sur la palette gauche, en particulier sur petit écran mobile |
| Création automatique de PR + assignation à `patbed8` | Préférence établie : chaque poussée de code génère une PR assignée |

---

## 4. Fichiers importants du projet

### Modifiés lors de la Phase 4 (cette session)

| Fichier | Changement |
|---|---|
| `src/types/index.ts` | `DieConfig { sides, label }` (plus de `count`) ; `DeckSpec` variantes + `label?` ; `DeckInstance { id, label, cards, discard }` ; `Die.label: string` ; `GameState.decks: DeckInstance[]` |
| `src/store/gameStore.ts` | Multi-deck, `rollDie(dieId)`, `goToSetup()`, `buildInitialState` avec label dice/decks, `DECK_ZONE_WIDTH` exporté |
| `src/engine/gameEngine.ts` | `drawCardFromDeck(state, deckId, x, y)` avec auto-reshuffle ; `playCardToShared` route par `card.deckId` ; `rollSingleDie(state, dieId)` |
| `src/components/GameTable.tsx` | Multi-deck render, `hasDeck`, `rollDie`, menu ☰, `goToSetup`, `label` passé à `DieComponent` |
| `src/components/SetupScreen.tsx` | `DieEntryEditor`, `DeckEntryEditor` avec champ nom, `LocalConfig.dieEntries`, helpers `addDie/removeDie/updateDie` |
| `src/components/Die.tsx` | Prop `label: string`, affichage du label au-dessus du dé |
| `src/components/Deck.tsx` | Prop `label`, `discardCount` ; placeholder défausse cliquable pour l'auto-mélange |
| `src/components/TilePalette.tsx` | Accordéon deux sections (Carré / Hexagone), fermées par défaut |
| `src/data/configDefaults.ts` | `dice: [{ sides: 6, label: '' }]` (plus de `count`) |

### Fichiers clés des phases précédentes

| Fichier | Rôle |
|---|---|
| `src/types/index.ts` | Types TypeScript complets |
| `src/engine/gameEngine.ts` | Logique de jeu pure complète |
| `src/store/gameStore.ts` | Store Zustand centralisé |
| `src/data/tiles.ts` | `TileModel`, `TILE_PALETTE` |
| `src/engine/tileUtils.ts` | Géométrie snap des tuiles |
| `src/components/Board.tsx` | Plateau grille/parcours |
| `src/components/Pawn.tsx` | Pion draggable |
| `src/engine/deckGenerator.ts` | Génération dynamique de paquets (standard52, numbered, series) |
| `.github/workflows/deploy.yml` | CI/CD GitHub Pages |

### Fournis par l'utilisateur

| Fichier | Contenu |
|---|---|
| `README.md` | Contexte projet, stack technologique, règles de travail |
| `modele-checkpoint-projet-dev.md` | Modèle de checkpoint à suivre |

---

## 5. Problèmes rencontrés et solutions

**Cartes jouées au mauvais endroit** — `playCard` utilisait une ancienne fonction `sharedZonePos()` (centre d'écran) au lieu de la zone de défausse du deck. **Solution** : calcul `x = DECK_START_X + deckIdx * DECK_ZONE_WIDTH + CARD_W + 10 + discardCount * 3`, `y = 60 + discardCount * 3`.

**Auto-mélange non déclenché** — `DeckZone` rendait un `<Rect>` non-cliquable quand `cardCount === 0`, l'événement `onDraw` n'était jamais appelé. **Solution** : envelopper dans un `<Group onClick/onTap>` conditionnel quand `discardCount > 0`.

**TS6133 `sharedZonePos` inutilisée** — après suppression de son unique appel, TypeScript refusait de compiler. **Solution** : supprimer la fonction du store.

**GitHub API refuse de demander une review à l'auteur de la PR** — utiliser `mcp__github__issue_write` pour assigner comme `assignee` plutôt que reviewer.

---

## 6. Problèmes non résolus et obstacles connus

- **Pas de limite de pan** — l'utilisateur peut paner jusqu'à perdre tous les éléments hors champ.
- **Pas de bouton "Reset view"** — aucun moyen de revenir à scale=1, x=0, y=0 sans recharger.
- **Positions non réactives au redimensionnement** — les positions x/y des éléments sont calculées une seule fois au démarrage.
- **Chevauchement de tuiles libre possible** — uniquement bloqué par le snap, pas par détection de collision complète.
- **Noms de joueurs non configurables** — les joueurs s'appellent toujours "Joueur 1 / Player 1" etc. ; pas d'entrée de nom dans le setup.

---

## 7. Point de reprise

PR #17 est ouverte sur `claude/youthful-hypatia-mnu8bn → main`, assignée à `patbed8`.

Prochaines pistes probables :
- **Nommage des joueurs** — champs de texte dans le setup pour le nom de chaque joueur.
- **Sauvegarde / chargement** — localStorage pour persister une configuration entre les sessions.
- **Multijoueur réseau** — synchronisation de l'état via WebSocket ou Supabase Realtime.
- **Améliorations UX mobile** — bouton reset view, clamp de pan.

Le projet se lance avec `npm run dev` dans `/TT-game-creator/`. Branche de travail : `claude/youthful-hypatia-mnu8bn`.

**Rappel préférence utilisateur :** créer automatiquement une PR et l'assigner à `patbed8` après chaque poussée de code.

---

## 8. Notes libres

- Le moteur dans `src/engine/` reste entièrement découplé de React et Konva : toutes les fonctions prennent `GameState` et retournent `Partial<GameState>`.
- L'architecture multi-deck repose sur `card.deckId` : chaque carte sait à quel deck elle appartient, ce qui permet un routage précis vers la bonne défausse au moment du jeu et du retour dans le deck lors du mélange.
- `DieConfig.count` a été supprimé intentionnellement — l'ancienne UI demandait "combien de d6", la nouvelle demande "ajouter un dé" avec type + nom, ce qui est plus expressif pour un jeu personnalisé.
- Environnement de travail : Claude Code sur le web (session distante), branche `claude/youthful-hypatia-mnu8bn`, dépôt `patbed8/TT-game-creator`.
