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

## Correction de la netteté et des couleurs (0.1.12)

Les deux maisons avaient été réduites à un atlas 256 × 120 (une cellule de 128 × 120 par maison), puis réagrandies en 192 × 176, avec seulement 32 couleurs. La qualité visuelle était dégradée. L'atlas a été reconstruit à partir de la planche illustrée d'origine, avec 96 couleurs et des cellules source de **192 × 176 pixels**, rendues à leur taille native, sans interpolation ni agrandissement. Le détourage a aussi été nettoyé. Les collisions et les entrées existantes restent inchangées. La végétation, le personnage et les autres éléments conservent leur esthétique pixel art existante ; leur homogénéisation graphique peut être poursuivie indépendamment.

## Nouveau personnage animé — version 0.1.13

Le personnage aux cheveux noirs, yeux rouges et tenue sombre utilise maintenant les **32 sprites de marche validés** : huit images pour chacune des quatre directions (face, gauche, droite, dos). L'atlas transparent `assets/hero-walk-8.png` fait 352 × 272 pixels, avec des cellules de 44 × 68 pixels. Les cellules ont été adaptées à leur taille d'affichage pour préserver des contours nets sans lissage lors de l'exploration. La marche défile toutes les 72 ms avec un léger balancement ; la respiration lente reste active à l'arrêt. L'ancienne planche reste dans le dépôt comme ressource historique, mais n'est plus utilisée pour afficher le héros. La sauvegarde, les collisions, le menu et les autres graphismes ne changent pas.

## Correction du trait noir et du repos — version 0.1.14

Certaines images latérales et arrière de la planche à 32 poses contiennent des pixels noirs isolés à leur sommet. Le moteur exclut désormais les 4 premières lignes de ces sprites lors du rendu, sans rogner les cheveux ni déplacer les pieds. L'animation de repos a été amplifiée à l'échelle réelle du personnage (respiration sur 1,9 seconde, variation de hauteur jusqu'à 5 %, balancement horizontal discret), tout en conservant la première pose fixe, les pieds au sol et les huit poses de marche par direction. Aucun sprite n'est lissé.

## Animation de repos dédiée — version 0.1.15

Le personnage dispose d'une **seconde planche de sprites**, `assets/hero-idle-4.png`, qui comporte quatre positions immobiles (face, gauche, droite, dos), découpées depuis le dessin validé en 176 × 68 pixels, fond transparent. Quand le joueur ne marche pas, cette planche est utilisée avec la respiration existante ; pendant les déplacements, la planche `hero-walk-8.png` et ses huit images par direction restent inchangées. Le rendu reste en pixels nets sans lissage. La sauvegarde, les cartes, les collisions et le menu multi-jeux ne sont pas modifiés.

## Affichage du repos corrigé — version 0.1.16

Le sprite de repos existait déjà en version 0.1.15, mais ressemblait beaucoup à la pose fixe de marche et l'effet était presque invisible à 44 × 68 pixels. Le moteur dessine désormais séparément les jambes (fixes au sol) et le torse/tête (respiration verticale de 0 à 3 px, petite oscillation horizontale). La planche à huit images est strictement réservée au déplacement. Le fichier JavaScript principal et les images portent un identifiant de version dans leur URL pour éviter l'ancienne version en cache du navigateur.

## Prairie émeraude et chemin de terre — version 0.1.17

Le sol utilise maintenant la **deuxième proposition graphique validée**. Une planche `ground-atlas.png` de 256 × 64 pixels contient huit variations d'herbe verte et huit variations de chemin terre/sable, extraites de l'image choisie et adaptées à la grille de 32 × 32 pixels sans lissage. Les bordures entre le chemin et l'herbe disposent d'une frange pixelisée. Le terrain d'eau reste intact, tout comme les arbres, les hautes herbes, les maisons, le personnage, les déplacements et les sauvegardes. La texture est chargée indépendamment et dispose du tracé précédent en secours.

## Étang illustré et collisions des arbres — version 0.1.18

Le plan d'eau utilise désormais une planche de **16 tuiles originales en 32 × 32 px**, découpées depuis la proposition approuvée : berges, coins, eau libre, reflets et nénuphars. Les sprites sont sélectionnés suivant les cases voisines et affichés sans lissage. L'ancien dessin sert de secours si l'image manque.

Les grands feuillages bloquent maintenant le personnage sur les cases qui se trouvent **jusqu'à deux cases au-dessus du tronc et une case de chaque côté**. Les chemins aménagés et les portes sont maintenus praticables pour préserver l'accès au village, aux maisons et à Mira. Le menu, les sauvegardes et les animations du héros sont inchangés.

## Eau sans traits blancs — version 0.1.19

L'ancienne planche contenait des marges crème autour des images, ce qui provoquait un quadrillage blanc sur toute la surface de l'étang. L'atlas a été **reconstruit en 16 véritables tuiles jointives de 32 × 32 pixels**, avec eau bleue, berges herbeuses/sableuses, reflets et quelques nénuphars. Aucune case blanche n'est conservée. Le jeu charge les nouvelles données avec le paramètre `v=0.1.19` pour éviter le cache du navigateur. Les collisions de l'eau et des arbres, les maisons, les commandes, le menu et la sauvegarde ne changent pas.

## Vent dans les arbres et hautes herbes — version 0.1.20

Les quatre arbres et les quatre variantes de hautes herbes utilisent désormais un **vent léger non synchronisé** : déplacement horizontal de 1 à 2 px des parties hautes, sommet plus mobile que la base. Les troncs et le pied des touffes restent fixes, les pixels ne sont pas lissés. Les sprites et les maisons ne sont pas remplacés. Le terrain et les maisons restent mis en cache sur des calques statiques ; seul le feuillage visible est redessiné à chaque image. Les collisions n'en dépendent pas : on ne peut pas traverser les arbres. Les anciennes images servent de repli tant que l'atlas de végétation charge.

## Prairie apaisée — version 0.1.21

La prairie utilise les **8 nouvelles tuiles vertes de 32 × 32 pixels** sélectionnées par l'utilisateur (`soft-grass-atlas.png`, planche compacte 256 × 32). La texture se rapproche d'un vert uni avec quelques nuances et rares détails. Les variantes sans brins sont privilégiées. Pour éviter de surcharger le décor, l'affichage des fleurs, petits brins supplémentaires et hautes herbes devient moins fréquent, mais la logique des collisions et de la carte ne change pas. Les chemins de terre, l'étang, les arbres, les maisons, les sauvegardes et l'animation du vent restent conservés. Le sprite se charge indépendamment et la texture précédente sert de repli.
