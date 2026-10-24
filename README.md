# Éclats d’Astria

Prototype de RPG 2D **solo**, jouable dans un navigateur avec une carte pixel art, des déplacements, des collisions et des dialogues.

Le multijoueur et le mode coopératif sont en attente.

## Jouer

La démo sera accessible sur : https://fen-min.github.io/eclats-astria/

Pour activer GitHub Pages la première fois : **Settings → Pages → Build and deployment → Source : Deploy from a branch**, puis sélectionner **Branch : main** et **Folder : /docs**, et enregistrer.

Le dossier `docs/` contient la version statique du jeu publiée par GitHub Pages. Le dossier `site/` conserve l'application utilisée par le serveur local.

## Jouer en local et vérifier le code

- Installer Node.js 22+.
- `npm start` pour lancer la version locale.
- `npm test` pour lancer les tests automatiques.

## Contrôles

ZQSD, WASD ou flèches pour se déplacer ; E pour parler à Mira ; commandes tactiles sur mobile.

## Suite du développement

Version 0.1 : exploration solo. Version 0.2 envisagée : créatures originales, rencontres sauvages, combats au tour par tour et captures.

Les ressources du projet sont originales ; aucune ressource officielle Pokémon n'est utilisée.

## Personnage pixel art (0.1.2)

Le joueur utilise désormais le personnage aux **cheveux noirs, yeux rouges et veste sombre aux détails rouges**, issu de notre première planche de sprites. L'animation comporte quatre images pour chaque direction (face, gauche, droite et dos). L'atlas léger et transparent est disponible dans `docs/assets/hero-walk.png` et `site/assets/hero-walk.png`.

Le mode coopératif reste en attente ; la démo GitHub Pages est solo.
