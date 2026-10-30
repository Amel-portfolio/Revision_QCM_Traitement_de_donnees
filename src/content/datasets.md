=== id=films | title=Films (reconstitution de l'annale 2025) | var=film_df
Le fichier réel de l'examen n'est pas fourni : ce jeu de données est **reconstitué** pour être cohérent avec l'énoncé (Pulp Fiction dure 154 min, Interstellar est à l'index 11, données « sales » à nettoyer). Ordre des colonnes : Titre, Genre, Annee_sortie, Realisateur, Budget_M (millions $), Duree_mn.

```csv
Titre,Genre,Annee_sortie,Realisateur,Budget_M,Duree_mn
Inception,Science-fiction,2010,Christopher Nolan,160,148
Fight Club,Thriller,1999,David Fincher,63,139
The Dark Knight,Action,2008,christopher nolan,185,152
Forrest Gump,Drame,1994,Robert Zemeckis,55,142
Pulp Fiction,Thriller,1994,Quentin Tarantino,8,154
Matrix,Science-fiction,1999,Lana Wachowski,63,136
Se7en,thriller,1995,DAVID FINCHER,33,127
Le Fabuleux Destin d'Amélie Poulain,Comédie,2001,Jean-Pierre Jeunet,,122
Parasite,Thriller,2019,Bong Joon-ho,11.4,132
,Drame,1997,,200,194
Gladiator,Action,2000,Ridley Scott,103,
Interstellar,Science-fiction,2014,Christopher Nolan,165,169
Intouchables,Comédie,2011,Olivier Nakache,9.5,112
Les Évadés,Drame,1994,Frank Darabont,25,142
```

=== id=communes | title=Grandes communes françaises | var=communes_df
Populations municipales arrondies (d'après l'INSEE), superficie en km². Une valeur manquante.

```csv
Ville,Departement,Region,POP_2021,POP_2015,SUPERF
Paris,Paris,Île-de-France,2133111,2206488,105.4
Marseille,Bouches-du-Rhône,Provence-Alpes-Côte d'Azur,873076,861635,240.6
Lyon,Rhône,Auvergne-Rhône-Alpes,522250,513275,47.9
Toulouse,Haute-Garonne,Occitanie,504078,471941,118.3
Nice,Alpes-Maritimes,Provence-Alpes-Côte d'Azur,348085,342522,71.9
Nantes,Loire-Atlantique,Pays de la Loire,323204,303382,65.2
Montpellier,Hérault,Occitanie,302454,277639,56.9
Strasbourg,Bas-Rhin,Grand Est,291313,279284,78.3
Bordeaux,Gironde,Nouvelle-Aquitaine,261804,252040,49.4
Lille,Nord,Hauts-de-France,236710,232787,34.8
Saint-Denis,Seine-Saint-Denis,Île-de-France,113942,111135,
Mulhouse,Haut-Rhin,Grand Est,105735,110755,22.2
Noisy-le-Grand,Seine-Saint-Denis,Île-de-France,70185,66659,13.0
```

=== id=notes | title=Notes d'une promotion | var=notes_df
Notes de TD et d'examen sur 20, nombre d'absences et option choisie. Un étudiant était absent à l'examen.

```csv
Nom,Prenom,Groupe,Note_TD,Note_Exam,Absences,Option
Martin,Léa,1,14.5,12,0,Data
Bernard,Hugo,2,9,7.5,3,Réseaux
Petit,Emma,1,16,15.5,1,Data
Durand,Lucas,3,11,,5,Data
Leroy,Chloé,2,12.5,13,0,réseaux
Moreau,Nathan,3,7,9,2,Embarqué
Simon,Inès,1,18,17,0,Data
Laurent,Tom,2,10,10,4,Embarqué
Michel,Jade,3,13.5,11,1,Réseaux
Garcia,Louis,1,8.5,6,6,Data
```

=== id=ventes | title=Ventes d'une enseigne informatique | var=ventes_df
Ventes journalières par magasin. Une quantité n'a pas été saisie.

```csv
Date,Magasin,Produit,Quantite,Prix_unitaire,Vendeur
2026-01-05,Paris,Clavier,3,25.0,Alice
2026-01-05,Lyon,Souris,10,12.5,Bruno
2026-01-06,Paris,Écran,2,180.0,alice
2026-01-07,Lille,Clavier,1,25.0,Chloé
2026-01-07,Lyon,Écran,,180.0,Bruno
2026-01-08,Paris,Souris,7,12.5,Alice
2026-01-08,Lille,Casque,4,45.0,Chloé
2026-01-09,Lyon,Clavier,5,25.0,Bruno
2026-01-09,Paris,Casque,2,45.0,Alice
2026-01-10,Lille,Souris,6,12.5,Chloé
```
