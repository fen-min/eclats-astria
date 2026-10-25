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

## Mise à jour du personnage — v0.1.3

Le personnage jouable reprend les détails du premier skin anime en pixel art (cheveux noirs, yeux rouges, tenue noire et rouge). Un atlas transparent de **256 × 400 pixels** fournit **4 directions × 4 images de marche**, découpées en cellules de **64 × 100 pixels**. Il est chargé depuis `docs/assets/hero-reference.png` (et `site/assets/hero-reference.png` en local). Les images restent nettes avec l'interpolation désactivée.

GitHub Pages continue de publier `main /docs`. Le mode coopératif n'est pas activé.

## Nouveaux décors 0.1.5

La carte utilise maintenant des décors pixel art **originaux générés dans `terrain.js`** : feuillages et sapins volumineux, arbustes, hautes herbes, fleurs, chemins texturés, eau animée et deux maisons détaillées (tuiles, cheminée, fenêtres, portes et jardinières). Les collisions et la progression existantes sont conservées.

Inspiration visuelle : RPG rétro sur navigateur, notamment l'ambiance de PokéSurvivor, sans reprendre les fichiers Pokémon, son code ou ses ressources protégées.

## Menu et collection de jeux (0.1.9)

La page d'accueil affiche désormais un **lanceur multi-jeux** : Éclats d'Astria est disponible ; deux places sont prévues pour les prochains jeux. Le bouton « ← Jeux » retourne au menu sans perdre la progression, et les commandes de déplacement sont désactivées lorsque le menu est ouvert.

La liste des jeux se trouve dans `site/hub.js` et `docs/hub.js`. Pour ajouter un nouveau jeu : créer un dossier de jeu indépendant, ajouter une entrée `status: 'available'` avec son chemin `href` dans `GAMES` et la carte apparaît automatiquement dans le menu. Les jeux en cours de préparation utilisent `status: 'planned'` et ne lancent rien.

Les versions `site/` et `docs/` doivent rester identiques.

## Arbres et herbes illustrés (0.1.10)

Les quatre nouveaux arbres et les quatre variantes de hautes herbes ont été découpés depuis la planche originale validée. L'atlas `assets/foliage-atlas.png` est chargé dans le navigateur (rendu pixelisé sans lissage). Le moteur affiche un décor vectoriel de secours jusqu'au chargement, puis reconstruit la carte avec la planche. La palette des sols est harmonisée avec le vert des nouveaux sprites. La densité et les collisions de la carte restent inchangées. Le menu multi-jeux et la sauvegarde du personnage sont conservés.

## Maisons vertes et rouges (version 0.1.11)

Les deux maisons du village utilisent désormais les sprites approuvés : cottage au toit **vert** à l'ouest (entrée en 11,12) et cottage au toit **rouge** à l'est (entrée en 35,12). L'atlas transparent `assets/houses-atlas.png` contient les deux maisons (2 cellules de 128 × 120 pixels), affichées en pixel art sans lissage. Les deux ressources (feuillage et maisons) se chargent séparément puis déclenchent un nouveau rendu de la carte effacée, pour éviter les anciens décors visibles derrière les transparences. Les collisions, les sauvegardes, le menu des jeux et les animations du personnage restent inchangés.
