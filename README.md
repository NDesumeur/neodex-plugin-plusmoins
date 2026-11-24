# Plus ou Moins

Un jeu de culture en pixel art : la carte de gauche montre son chiffre, à toi de deviner si celle de droite est plus haute ou plus basse.

*English version: [README.en.md](README.en.md)*

## Six catégories et le partage (nouveau en 1.3.0)

Six nouvelles catégories (constructions, histoire, langues, lacs, chutes d’eau, départements) et un bouton PARTAGER qui copie le score.

## Commandes

- **↑** ou **clic sur PLUS** : la carte de droite est plus haute.
- **↓** ou **clic sur MOINS** : elle est plus basse.
- **Espace** : rejouer après une erreur.

## Comment ça marche

- Une bonne réponse, la carte de droite passe à gauche et une nouvelle arrive. Une erreur, et la série s'arrête.
- **Vingt catégories** de vrais chiffres arrondis : population et superficie des pays, altitude des montagnes, longueur des fleuves, poids, vitesse et longévité des animaux, hauteur des monuments, taille des astres, année des inventions, habitants des villes de France, calories des aliments, naissance de personnages célèbres, sortie des jeux vidéo, année des grandes constructions, dates de l’histoire, locuteurs des langues, profondeur des lacs, hauteur des chutes d’eau et habitants des départements.
- **Tout mélangé** change de catégorie toutes les 5 bonnes réponses.
- Deux cartes trop proches ne tombent jamais ensemble : il y a toujours une vraie différence.
- **PARTAGER** copie ton score (catégorie, série et réponses en flèches, sans les noms) pour le coller où tu veux.

## Les cartes

Chaque carte a sa petite image en pixel art : le **drapeau** du pays, le profil de la **montagne** (avec son cratère pour les volcans), le **fleuve** qui serpente, l'**animal**, le **monument** ou l'**astre**. Les autres catégories gardent leur icône. L'image ne dit jamais la réponse.

Quand la partie est perdue, le résultat s'affiche dans un bandeau sous les cartes : les deux cartes et leurs valeurs restent lisibles.

## Plein écran

Le bouton **Plein écran** agrandit les cartes à tout l'écran (Échap pour en sortir). Hors plein écran, le jeu prend toute la hauteur que laisse la fenêtre.

## Statistiques

Le panneau Records garde ta **meilleure série** dans chaque catégorie, le nombre de **parties** et de **bonnes réponses**.

## Données et synchronisation

Tes records et tes totaux sont enregistrés par NeoDex, sauvegardés et synchronisés entre tes PC si la synchro est activée.

## Installer

Dans NeoDex : **NeoStore → À découvrir → Plus ou Moins → Installer**.

Développer un plugin : voir le [SDK NeoDex](https://github.com/NDesumeur/neodex-sdk).
