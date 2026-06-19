# Checkpoint — TT Game Creator

**Date :** 2026-06-19  
**Phase en cours :** Phase 3 (suite) — Tuiles libres + correctif pinch-zoom/pan mobile  
**Statut :** Phase complétée

---

## 1. Objectif du projet

Application web permettant de concevoir, tester et jouer à des jeux de société personnalisés dans un navigateur. Cette session a livré le système de tuiles libres (carrés + hexagones flat-top avec aimantation bord à bord) et corrigé trois bugs critiques du pinch-zoom/pan mobile.

---

## 2. État d'avancement

### Ce qui est complété

- **Phase 1** — Fondations + table de jeu locale (cartes, deck, zones, tours, drag-and-drop).
- **Phase 2** — Plateau (grille ou parcours), pions draggables, dé à faces configurables.
- **Phase 3 — Support mobile** (session précédente) — `onTap`/`onDblTap`, `touch-action: none`, `user-scalable=no`, pinch-zoom/pan Stage.
- **Phase 3 (suite) — Tuiles libres :**
  - **Types** — `TileShape`, `Tile`, `tiles: Tile[]` dans `GameState`.
  - **Palette prédéfinie** — `src/data/tiles.ts` : 4 carrés + 4 hexagones avec couleurs distinctes.
  - **Géométrie pure** — `src/engine/tileUtils.ts` : `getNeighborSlots` (4 voisins pour carré, 6 pour hexagone flat-top à distance √3·R), `isSlotOpen`, `findSnapPosition` (threshold = 0.6 × size, epsilon = 0.5 × size).
  - **Actions pures** — `addTile`, `moveTile` (avec snap bord à bord), `removeTile` dans `gameEngine.ts`.
  - **Store** — actions `addTile`, `moveTile`, `removeTile` ; état initial `tiles: []`.
  - **Composant `Tile.tsx`** — `Rect` pour carré, `RegularPolygon sides=6 rotation=30` pour hexagone flat-top ; draggable ; double-clic/tap supprime la tuile.
  - **Palette `TilePalette.tsx`** — overlay gauche avec swatches (clip-path CSS hex pour les hexagones) ; clic place la tuile au centre du viewport courant (compatible zoom/pan).
  - **`GameTable.tsx`** — tuiles rendues entre le plateau et les cartes/pions ; palette câblée via `viewportCenter()`.
- **Correctif pinch-zoom/pan mobile (PR #9) :**
  - **Cause racine** : l'updater de `setStageView` lisait `touchRef.current` de manière asynchrone (après mutation du ref ou après `null` au lâcher) → `sf = NaN` ou valeur inversée → zoom/pan inversés + tout disparaît au lâcher des doigts.
  - **Fix** : capturer `oldDist`, `oldCenterX`, `oldCenterY` comme variables locales stables avant de muter le ref ; formule corrigée `newOffset = newCenter - (oldCenter - prevOffset) * sf`.
- **PR #8** (tuiles) et **PR #9** (correctif mobile) ouvertes et assignées à `patbed8`.

### Ce qui est en cours

Rien — toutes les PRs sont ouvertes, en attente de merge.

### Ce qui reste à faire dans la phase en cours

Rien. Phase 3 terminée.

---

## 3. Décisions techniques prises

| Décision | Justification |
|---|---|
| Hexagone flat-top via `RegularPolygon rotation={30}` | Konva's `RegularPolygon sides=6` est pointy-top par défaut ; +30° donne les bords haut/bas horizontaux requis |
| Voisins hexagonaux : `(0, ±√3R)` + `(±1.5R, ±√3R/2)` | Distance centre-à-centre de √3·R pour tous les voisins = accolement bord à bord exact |
| Snap uniquement entre tuiles de même forme | Empêche le chevauchement carré/hexagone sans complexité géométrique inutile |
| `viewportCenter()` pour le placement depuis la palette | Fonctionne correctement avec zoom et pan ; la tuile apparaît toujours au centre visible |
| Capturer les valeurs du ref comme locaux stables avant `setStageView` | Évite la race condition entre la mutation synchrone du ref et l'exécution asynchrone de l'updater React |
| `newOffset = newCenter - (oldCenter - prevOffset) * sf` | Formule exacte : le point canvas sous l'ancien centre des doigts apparaît sous le nouveau centre ; élimine le terme pan redondant de l'ancienne formule |
| Double-clic/tap sur une tuile → suppression | Cohérent avec le reste de l'UI (double-clic = action principale) ; pas de bouton dédié nécessaire |
| Création automatique de PR + assignation à `patbed8` | Préférence établie : chaque poussée de code génère une PR assignée |

---

## 4. Fichiers importants du projet

### Créés lors de la Phase 3 (suite)

| Fichier | Rôle |
|---|---|
| `src/data/tiles.ts` | `TileModel`, `TILE_PALETTE` (4 carrés + 4 hexagones) |
| `src/engine/tileUtils.ts` | Géométrie pure : `getNeighborSlots`, `isSlotOpen`, `findSnapPosition` |
| `src/components/Tile.tsx` | Rendu Konva d'une tuile, drag, suppression double-clic |
| `src/components/TilePalette.tsx` | Overlay palette gauche avec swatches clip-path |

### Modifiés lors de la Phase 3 (suite)

| Fichier | Changement |
|---|---|
| `src/types/index.ts` | `TileShape`, `Tile`, `tiles: Tile[]` dans `GameState` |
| `src/engine/gameEngine.ts` | `addTile`, `moveTile`, `removeTile` |
| `src/store/gameStore.ts` | Actions tuiles + `tiles: []` état initial |
| `src/components/GameTable.tsx` | Rendu tuiles, palette, `viewportCenter()`, correctif pinch-zoom/pan |

### Fichiers clés des phases précédentes

| Fichier | Rôle |
|---|---|
| `src/types/index.ts` | Types TypeScript complets |
| `src/engine/gameEngine.ts` | Logique de jeu pure complète |
| `src/store/gameStore.ts` | Store Zustand centralisé |
| `src/components/Board.tsx` | Plateau grille/parcours |
| `src/components/Pawn.tsx` | Pion draggable |
| `src/components/Die.tsx` | Dé configurable |
| `.github/workflows/deploy.yml` | CI/CD GitHub Pages |

### Fournis par l'utilisateur

| Fichier | Contenu |
|---|---|
| `README.md` | Contexte projet, stack technologique, règles de travail |
| `modele-checkpoint-projet-dev.md` | Modèle de checkpoint à suivre |

---

## 5. Problèmes rencontrés et solutions

**Zoom/pan inversés + disparition au lâcher** — L'updater de `setStageView` était asynchrone et lisait `touchRef.current` au moment de son exécution, pas au moment de l'appel. Selon le timing : valeur du frame suivant (zoom/pan inversés) ou `null` après `onTouchEnd` (NaN → Stage invisible). **Solution** : capturer `oldDist`/`oldCenter` comme locaux stables avant de muter le ref ; formule `newOffset = newCenter - (oldCenter - prevOffset) * sf`.

---

## 6. Problèmes non résolus et obstacles connus

- **Pas de limite de pan** — l'utilisateur peut paner jusqu'à perdre tous les éléments hors champ. Aucun clamp de position.
- **Pas de bouton « Reset view »** — aucun moyen de revenir à scale=1, x=0, y=0 sans recharger.
- **Positions non réactives au redimensionnement** — les positions x/y des cartes/tuiles sont calculées une seule fois au démarrage.
- **Chevauchement de tuiles libre possible** — uniquement empêché par le snap. Une tuile déposée loin de tout groupe peut en recouvrir une autre (accepté pour cette phase).

---

## 7. Point de reprise

Les PRs #8 et #9 sont ouvertes sur `claude/youthful-hypatia-mnu8bn → main`, assignées à `patbed8`.

La prochaine phase est à définir. Pistes probables :
- **Éditeur de jeu** — UI pour configurer règles, plateau, pions, cartes, tuiles sans modifier le code.
- **Multijoueur réseau** — synchronisation via WebSocket ou Supabase Realtime.
- **Persistance** — sauvegarde/chargement d'une partie (localStorage ou back-end).
- **Améliorations UX mobile** — bouton reset view, clamp de pan, feedback visuel du snap.

Le projet se lance avec `npm run dev` dans `/TT-game-creator/`. Branche de travail : `claude/youthful-hypatia-mnu8bn`.

**Rappel préférence utilisateur :** créer automatiquement une PR et l'assigner à `patbed8` après chaque poussée de code.

---

## 8. Notes libres

- Le moteur dans `src/engine/` reste entièrement découplé de React et Konva : toutes les fonctions prennent `GameState` et retournent `Partial<GameState>`.
- `findSnapPosition` filtre d'abord les tuiles de même forme, puis collecte tous les slots voisins ouverts, et retourne le plus proche dans le rayon `threshold = 0.6 * size`. Si aucun slot n'est assez proche, la tuile se pose librement (premier tile d'un groupe).
- Le clip-path CSS `polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)` donne un hexagone flat-top fidèle dans la palette HTML sans SVG ni canvas.
- Environnement de travail : Claude Code sur le web (session distante), branche `claude/youthful-hypatia-mnu8bn`, dépôt `patbed8/TT-game-creator`.
