# TT Game Creator

## Contexte du projet

Une application web permettant de concevoir, tester et jouer à des jeux de société personnalisés directement dans un navigateur. La plateforme s'adresse en premier lieu aux concepteurs de jeux qui souhaitent prototyper et tester leurs idées rapidement, sans avoir à fabriquer un prototype physique. Dans un second temps, elle permet à n'importe quel utilisateur d'apprendre et de jouer à un jeu créé sur la plateforme, en bénéficiant d'une automatisation partielle des règles pour faciliter la prise en main.

La plateforme repose sur trois piliers distincts :

1. **L'éditeur de jeu** : une interface visuelle permettant de définir les composantes d'un jeu (plateau, cartes, pions, dés) et ses règles de fonctionnement via un système de conditions et d'actions par glisser-déposer.
2. **Le moteur de jeu** : le système qui interprète les règles définies dans l'éditeur et les applique en temps réel lors d'une partie.
3. **La table de jeu** : l'interface de jeu proprement dite, où les joueurs interagissent avec les composantes sur le même écran (mode local en priorité, multijoueur en ligne comme évolution).

### Types de jeux supportés

La plateforme supporte quatre types de composantes de jeu, qui peuvent être combinées librement :

- **Jeux de cartes** : deck de pioche, main de joueur, défausse, cartes face cachée ou visible.
- **Jeux de plateau avec grille** : plateau à cases numérotées ou colorées, déplacement de pions selon des règles définies.
- **Jeux de plateau libre** : placement de tuiles personnalisées sur une surface sans grille fixe.
- **Jeux de dés** : un ou plusieurs dés à n faces, dont les résultats peuvent déclencher des règles.

Le document d'analyse complet est joint aux fichiers de ce projet.
Tous les checkpoints du projet sont joints aux fichiers de ce projet — ils documentent l'historique complet des décisions et de l'avancement. Le checkpoint le plus récent contient le point de reprise actuel.

## Stack technologique

| Couche | Technologie | Justification |
|---|---|---|
| Framework web | React + Vite | Rapidité de développement, écosystème riche |
| Rendu canvas / table de jeu | Konva.js (react-konva) | Interactivité avancée sur canvas, compatible React |
| Éditeur de règles (nœuds) | React Flow | Librairie de référence pour les éditeurs visuels à nœuds |
| Gestion d'état global | Zustand | Léger, simple, adapté à un état de jeu complexe |
| Persistance et comptes | Supabase | Base de données, auth et temps réel en un seul service |
| Multijoueur en ligne (v2) | Supabase Realtime | WebSockets intégrés à Supabase, sans backend supplémentaire |

## Règles de travail

- Toujours coder en anglais pour les lignes de codes et les commentaires, et bilingue pour les messages d’interface utilisateur.
- Respecter le stack technologique défini ci-dessus. Si une alternative est envisagée, l'expliquer avant de l'implémenter.
- Avant de proposer du code, exposer brièvement l'approche prévue.
- Si une décision d'architecture est ambiguë, poser la question plutôt qu'assumer.
- Prévenir si une tâche demandée dépasse la portée de la phase en cours.
- À la fin de chaque session, si le mot-clé « checkpoint » est mentionné, générer un fichier `.md` téléchargeable en suivant strictement le modèle de checkpoint joint aux fichiers de ce projet (modele-checkpoint-projet-dev.md). Nommer le fichier selon la convention : AAAA-MM-JJ_checkpoint_TT-Game-Creator.md.

## Environnement de développement

- Éditeur : VS Code avec Claude Code
- Abonnement : Claude Pro
