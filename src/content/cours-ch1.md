=== id=intro | chap=1 | title=Introduction au traitement de données | desc=Étapes du traitement, Anscombe, statistiques descriptives (position, dispersion, quartiles), tableaux. | themes=stats | deck=stats
# La problématique

Le but : **réussir à extraire des informations d'une grande base de données**.

**1. D'abord, on nettoie** (*data cleansing*) :
- repérer les **données manquantes** ;
- corriger les données **mal orthographiées** ;
- **homogénéiser les formats** (majuscules / minuscules, format des dates, des heures…) ;
- repérer les données **aberrantes** ;
- repérer les données **dupliquées**.

**2. Ensuite** : décider de ce qu'on fait des données « à problème », puis sélectionner les données pertinentes.

**3. Enfin on analyse** : regarder les **corrélations**, extraire des **statistiques**, **interpréter** les résultats.

**Avec quoi ?** Le langage **Python**, le package **pandas**, et des bibliothèques graphiques : **matplotlib, seaborn, plotly, altair**.

# Pourquoi toujours visualiser ? Anscombe & Datasaurus

Le **quartet d'Anscombe (1973)** : 4 jeux de données (x, y) qui ont **exactement les mêmes statistiques** :

| Statistique | Valeur (pour les 4 jeux) |
|---|---|
| Moyenne de x / de y | 9,00 / 7,50 |
| Variance de x / de y | 11,00 / ≈ 4,12 |
| Corrélation | ≈ 0,816 |
| Droite de régression | y = 0,5·x + 3 |

… et pourtant leurs nuages de points sont **complètement différents** (droite, courbe, point aberrant…). Le **Datasaurus Dozen** pousse l'idée plus loin (moyenne X 54,3 · moyenne Y 47,8 · écarts-types 16,8 / 26,9 · corrélation −0,06 : même stats, mais l'un des nuages dessine un dinosaure).

> [!tip] À retenir
> Des statistiques identiques ne garantissent pas des données semblables : **il faut toujours représenter graphiquement les données**.

# Statistiques descriptives : les paramètres de position

| Paramètre | Définition |
|---|---|
| Moyenne arithmétique | x̄ = (1/N) · Σ xₖ |
| Moyenne géométrique | x̄ = (x₁ · x₂ · … · x_N)^(1/N) |
| Moyenne quadratique | x̄ = √( (1/N) · Σ xₖ² ) |
| Médiane | valeur **centrale** de la distribution (50 % au-dessous, 50 % au-dessus) |
| Mode | valeur **la plus fréquente** |

Avec des **valeurs aberrantes** :
- la **médiane** est **moins impactée** que la moyenne arithmétique ;
- la **moyenne géométrique** est moins sensible aux valeurs les plus élevées → meilleure estimation de la tendance centrale.

# Statistiques descriptives : les paramètres de dispersion

| Paramètre | Formule / définition |
|---|---|
| Écart type (population) | σ = √( (1/N) · Σ (xₖ − x̄)² ) |
| Écart type estimé (échantillon) | s = √( (1/(N−1)) · Σ (xₖ − x̄)² ) |
| Variance | V = (1/N) · Σ (xₖ − x̄)² = σ² |
| Étendue | R = x_max − x_min |
| Quartiles | Q1 : 25 % des valeurs en dessous · Q2 = **médiane** (50 %) · Q3 : 75 % en dessous |
| IQR (écart interquartile) | IQR = Q3 − Q1 : contient les **50 % de valeurs centrales** |

> [!info] Le N − 1
> L'estimation d'une population à partir d'un échantillon divise par **N − 1**. Avec pandas, `df["col"].std()` utilise **N − 1** par défaut ; `np.std(...)` utilise **N** par défaut.

# Les tableaux

- **Tableau de fréquences** : soit en **valeur absolue** (comptage des apparitions d'une valeur), soit en **%** du total.
- **Tableau de contingence** : tableau à **deux dimensions** croisant deux variables, pour voir leur **dépendance / corrélation**. Exemple (Titanic) :

| | Sauvé | Non sauvé | Total |
|---|---|---|---|
| Homme | 109 | 468 | 577 |
| Femme | 233 | 81 | 314 |

# Les graphiques de base

Histogrammes, camemberts (*pie charts*), diagrammes en barres (*bar charts*), nuages de points (*scatter plots*)… voir la fiche suivante.

=== id=visu | chap=1 | title=Visualisation des données | desc=Quel graphique pour quel message : distributions, comparaisons, temps, proportions, cartes. | themes=visu | deck=stats
# Les distributions

| Graphique | Ce qu'il montre |
|---|---|
| **Pyramide des âges** | distribution par tranche d'âge, deux populations face à face (hommes / femmes) |
| **Histogramme** | répartition des valeurs par classes ; avec **courbe cumulative**, le niveau 50 % donne la **médiane** |
| **Box plot** (boîte à moustaches) | médiane, quartiles, étendue, valeurs extrêmes |
| **Histogramme horizontal avec barres d'erreur** | moyenne + incertitude (ex. du 1er au 3e quartile) |
| **Beeswarm** (essaim) | chaque point visible : distribution, catégorisation par tranche, nombre de points par catégorie, centrage vertical |

**Lire un box plot** :
- le **trait** dans la boîte = la **médiane** ; la **croix** = la **moyenne** ;
- **haut de la boîte = Q3 (75 %)**, **bas de la boîte = Q1 (25 %)** ;
- les **moustaches** (*whiskers*) : sous **Excel** = minimum et maximum ; sous **Plotly** (Python) = jusqu'à **1,5 × IQR**.

> [!trap] Box plot
> Le trait central est la **médiane**, pas la moyenne. Et la hauteur de la boîte, c'est l'**IQR** (Q3 − Q1).

# Les comparaisons (magnitude)

- **Colonnes (column)** : la façon standard de comparer des tailles ; l'axe doit **commencer à 0**.
- **Barres horizontales (bar)** : idem, pratiques quand les **libellés sont longs** et que ce n'est pas une série temporelle.
- **Paired column / bar** : plusieurs séries côte à côte (difficile au-delà de 2-3 séries).
- **Lollipop** : attire l'attention sur la valeur, peut ne pas partir de 0.
- **Radar** : plusieurs variables sur un même graphique (ordre des axes à soigner).
- **Isotype (pictogrammes)** : nombres **entiers** uniquement (« on ne coupe pas un bras »).
- **Proportional symbol** : quand les écarts sont grands et la précision peu importante.
- **Waffle** (*unit chart*) : carré **10 × 10**, chaque case = 1 %.
- **Bullet** : une mesure par rapport à une cible.
- **Marimekko** : taille **et** proportion à la fois.

**Écarts (deviation)** : *diverging bar* (valeurs positives / négatives), *diverging stacked bar* (idéal pour les **sondages** : pas d'accord … tout à fait d'accord), *spine*, *surplus/deficit*.

**Classements (ranking)** : barres / colonnes **ordonnées**, lollipop, *slope*, *bump* (évolution des rangs), *dot strip plot*.

# Les corrélations

- **Scatterplot (nuage de points)** : la façon standard de montrer la relation entre **deux variables continues**.
- **Bubble** : nuage de points + une **3e variable** codée par la **taille** des bulles.
- **Connected scatterplot** : évolution de la relation entre 2 variables dans le temps.
- **Column + line timeline** : une quantité (colonnes) et un taux (ligne).
- **XY heatmap** : motifs entre 2 catégories, via la couleur.

> [!warn] Corrélation ≠ causalité
> Un nuage de points montre une relation, pas une cause : beaucoup de lecteurs supposent à tort que l'une cause l'autre.

# Le temps

**Line** (la façon standard pour une série temporelle), **column**, **slope** (mettre en évidence des **tendances** entre 2 ou 3 dates), **area / stacked area** (selon ce qu'on veut voir), candlestick, fan chart (projections), calendar heatmap, streamgraph…

# Les proportions (part-to-whole)

**Pie** (camembert — difficile de comparer précisément les parts), **donut** (le centre peut afficher le total), **treemap** (données **hiérarchiques**), **stacked column**, **waterfall**, **arc** (hémicycle de l'Assemblée), **gridplot**, **Venn**, **Voronoi**, **Marimekko**.

# Les cartes

- Choisir la **résolution** : échelle **continue** ou **par catégories** de valeurs.
- **Carte choroplèthe** : régions colorées selon une valeur (ex. population par région) — à utiliser de préférence avec des **taux / ratios** plutôt que des totaux.
- **Proportional symbol** pour des totaux, *flow map* pour des flux, *dot density*, *heat map*, cartogrammes.

=== id=env | chap=1 | title=Python : environnement & bonnes pratiques | desc=Origine, modules, conventions de nommage, Anaconda/Spyder, pip/conda, débogage. | themes=bases
# Python en bref

- Langage de programmation **de haut niveau**, créé **fin des années 1980** par **Guido van Rossum** (Pays-Bas).
- Maintenu par une **communauté** : énormément de modules (bibliothèques).

| Module | Rôle |
|---|---|
| `numpy` | calcul scientifique (tableaux, algèbre) |
| `math` | fonctions mathématiques (trigonométrie…) |
| `scipy` | algorithmes : optimisation, intégration, interpolation, statistiques, FFT… |
| `pandas` | **traitement des données** |
| `matplotlib`, `plotly`, `seaborn` | graphiques |

# Bonnes pratiques

- Noms de **variables et fonctions en minuscules** : `valeur_x`, `valeur_y` (*snake_case*).
- Noms de **constantes en MAJUSCULES**.
- Des noms **qui ont du sens**.
- Lignes pas trop longues (**79 caractères**) ; `\` pour continuer à la ligne suivante.
- Code **commenté** avec `#`.
- **Indentation de 4 espaces** à respecter.

**Structure d'un script** : 1) les **imports** (`import xxx as yyy`) → 2) la **définition des fonctions** → 3) le code principal.

# Outils

- Éditeur de texte, ou **IDE** : **Spyder** (dans la suite **Anaconda**), notebooks **Jupyter** / **Google Colab**.
- Exécuter un script dans un terminal : `python nom_fichier.py`.
- Installer un package : `conda install xxx` (Anaconda prompt) ou `pip install xxx`.
- `pip list` : liste des packages installés ; `python -V` (ou `--version`) : version de Python.
- `import sys` puis `print(sys.executable)` : chemin de l'interpréteur utilisé.
- **Spyder** : éditeur, console, explorateur de variables et de graphiques, **débogage pas à pas** avec **points d'arrêt**.

=== id=bases | chap=1 | title=Variables, nombres, chaînes & print | desc=Opérateurs, types, piège des float, indexation des chaînes, méthodes de str, f-strings et formats. | themes=bases | deck=bases
# Python calculatrice

| Opération | Syntaxe | Exemple | Résultat |
|---|---|---|---|
| Division | `/` | `7 / 2` | `3.5` (toujours un **float**) |
| Division entière | `//` | `7 // 2` | `3` |
| Reste (modulo) | `%` | `7 % 2` | `1` |
| Puissance | `**` | `2 ** 3` | `8` |

> [!trap] `^` n'est pas la puissance
> En Python, `^` est le **OU exclusif bit à bit** : `2 ^ 2` vaut `0`, `3 ^ 2` vaut `1`. Pour une puissance, toujours `**`. (Le cours contient d'ailleurs un exemple `x^2` qui ne calcule **pas** un carré !)

# Variables et types

- Une variable = un **espace mémoire** ; son nom est son adresse.
- Nom : en **minuscules**, commence par une **lettre**, contient lettres, chiffres et `_`, **pas d'accent**, et veut dire quelque chose.
- `type(variable)` donne son type : `int`, `float`, `str`, `bool`, `list`…

```python
a = 10          # int
nom = 'Philippe'  # str
val = 8.83      # float
val2 = 1e3      # float : 1000.0
print(type(val2))
```

> [!trap] Les float sont arrondis
> `0.1` n'est pas représentable exactement en binaire : `3 * 0.1 == 0.3` vaut **False** (`3*0.1` = 0.30000000000000004). On peut voir plus de chiffres avec `format(b, '.30f')`.

# Les chaînes de caractères (str)

- Entre `'...'` ou `"..."` ; sur plusieurs lignes : `"""..."""`.
- Concaténation avec `+` : `nom1 + " et " + nom2`.
- **Indexation à partir de 0** : `nom1[3]`.
- **Tranche** `s[i:j]` : les caractères d'indice **i à j−1**, soit **j − i** caractères.
- Indices négatifs : `s[-1]` = dernier caractère, `s[-2]` = avant-dernier.

```python
nom1 = "Philippe"
print(nom1[3])        # l   (P=0, h=1, i=2, l=3)
print(nom1[0:5])      # Phili  (5 caractères : indices 0 à 4)
mot = "apprenti"
print(mot[2], mot[-2], mot[2:], mot[:4], mot[3:7])
# p t prenti appr rent
```

**Méthodes utiles** (elles renvoient une **nouvelle** chaîne, l'originale ne change pas) :

| Méthode | Effet | `"bonjour LE monde"` devient |
|---|---|---|
| `.upper()` | tout en majuscules | `BONJOUR LE MONDE` |
| `.lower()` | tout en minuscules | `bonjour le monde` |
| `.capitalize()` | 1re lettre de la **chaîne** en majuscule, **le reste en minuscules** | `Bonjour le monde` |
| `.title()` | 1re lettre de **chaque mot** en majuscule | `Bonjour Le Monde` |
| `.count("o")` | nombre d'occurrences | `3` |

Autres : `.replace(a, b)`, `.split(sep)`, `.strip()`, `len(s)`.

# print et les f-strings

- `print(val1, val2, val3)` affiche les valeurs **séparées par un espace**.
- **f-string** (Python ≥ 3.6) : `print(f"Premier nom : {nom1}, second nom : {nom2}")`.
- On peut appeler des méthodes dedans : `f"{nom1.upper()}"`.

**Caractères spéciaux** : `\n` retour à la ligne · `\t` tabulation · `\'` apostrophe échappée · `\uXXXX` caractère Unicode · `\b` efface un caractère · `\r` retour en début de ligne.

# Formater les nombres

| Format | Signification | Exemple | Résultat |
|---|---|---|---|
| `.2f` | 2 chiffres après la virgule | `f"{3.14159:.2f}"` | `3.14` |
| `.2e` / `.5E` | notation scientifique | `f"{1.27893e7:.2e}"` | `1.28e+07` |
| `g` | format « le plus approprié » | `format(123.5647, 'g')` | `123.565` |
| `3d` | entier sur 3 caractères (espaces devant) | `format(10, '3d')` | `' 10'` |
| `04d` | entier sur 4 chiffres (zéros devant) | `format(10, '04d')` | `0010` |
| `b` | binaire | `format(140, 'b')` | `10001100` |

```python
from math import pi
print(f"{pi:.2f}")                        # 3.14
print('Valeur :', format(pi, '.3f'))      # Valeur : 3.142
print(format(10, 'b'), bin(10))           # 1010 0b1010
```

> [!trap] round() arrondit « au pair »
> `round(2.5)` donne **2** et `round(3.5)` donne **4** (arrondi bancaire). Et `round(154 / 60)` donne **3**, pas 2 ! Pour une division entière, utiliser `//`.

=== id=listes | chap=1 | title=Les listes | desc=Indexation, tranches, append/insert, del/remove/pop, tri, range, copie. | themes=listes | deck=listes
# Créer et lire une liste

```python
liste_1 = [1, 2, 7, 10]
liste_2 = ['Bleu', 'Rouge', 'Vert', 'Jaune']
liste_3 = [1, 2, 7, 10, 'Bleu', 'Rouge', 'Vert', 'Jaune']   # types mélangés autorisés
```

Accès avec **`[i:j:pas]`**, en partant de l'indice **0** : on obtient les éléments **i à j−1** (donc **j − i** éléments).

| Expression | Résultat sur `liste_3` |
|---|---|
| `liste_3[0]` | `1` |
| `liste_3[2:5]` | `[7, 10, 'Bleu']` |
| `liste_3[3:]` | `[10, 'Bleu', 'Rouge', 'Vert', 'Jaune']` |
| `liste_3[:4]` | `[1, 2, 7, 10]` |
| `liste_3[0:8:3]` | `[1, 10, 'Vert']` (un élément sur 3) |
| `liste_3[-1]` | `'Jaune'` (dernier) |
| `liste_3[-2]` | `'Vert'` (avant-dernier) |
| `liste_3[::-1]` | la liste à l'envers |

# Ajouter des éléments

| Instruction | Effet |
|---|---|
| `l1 + l2` | **concaténation** → nouvelle liste |
| `l.append(v)` | ajoute `v` **à la fin** |
| `l.insert(pos, v)` | insère `v` **à la position** `pos` (les suivants sont décalés) |

# Supprimer des éléments

| Instruction | Effet | Renvoie |
|---|---|---|
| `del l[i]` | supprime **par position** | — |
| `l.remove(v)` | supprime **la 1re occurrence de la valeur** `v` (erreur si absente) | `None` |
| `l.pop(i)` | supprime l'élément d'indice `i` **et le renvoie** | l'élément supprimé |
| `l.pop()` | sans argument : supprime et renvoie **le dernier** | le dernier élément |
| `list(set(l))` | supprime les **doublons** (l'ordre n'est pas garanti) | nouvelle liste |

```python
liste_3 = [1, 2, 7, 10, 'Bleu', 'Rouge', 'Vert', 'Jaune']
val1 = liste_3.pop()     # 'Jaune' ; liste_3 n'a plus que 7 éléments
val2 = liste_3.pop(0)    # 1
print(val1, val2, liste_3)
```

> [!info] set
> Un `set` est une collection d'éléments **non ordonnés** et **uniques**.

# Trier

| Instruction | Modifie la liste ? | Renvoie |
|---|---|---|
| `l.sort()` | **oui** (en place) | `None` |
| `l.sort(reverse=True)` | oui, ordre **décroissant** | `None` |
| `sorted(l)` / `sorted(l, reverse=True)` | **non** | une **nouvelle** liste triée |

```python
liste_2 = ['Bleu', 'Rouge', 'Vert', 'Jaune']
print(sorted(liste_2, reverse=True))   # ['Vert', 'Rouge', 'Jaune', 'Bleu']
print(liste_2)                         # inchangée : ['Bleu', 'Rouge', 'Vert', 'Jaune']
```

> [!trap] Pièges de tri
> - `ma_liste = ma_liste.sort()` met **None** dans `ma_liste` !
> - Les chaînes sont triées par ordre alphabétique **en tenant compte de la casse** : les majuscules passent avant les minuscules (`'Zèbre' < 'abeille'`).

# Fonctions utiles

`min(l)`, `max(l)`, `sum(l)`, `len(l)`, `l.copy()`, `l.count(v)`, `l.index(v)`.

**`range(i, j, pas)`** génère les entiers de i à **j − 1** :
- `range(0, 4)` → 0, 1, 2, 3 · `range(0, 4, 2)` → 0, 2
- `range(4, 0, -1)` → 4, 3, 2, 1 · `range(len(liste))` → 0 … len(liste) − 1
- `list(range(0, 10))` crée une vraie liste.

# Copier une liste

```python
liste1 = [1, 2, 3]
liste2 = liste1          # PAS une copie : les deux noms désignent la même liste
liste2.append(4)
print(liste1)            # [1, 2, 3, 4]  ← liste1 a aussi changé !

liste3 = liste1.copy()   # vraie copie indépendante
liste3.append(5)
print(liste1, liste3)    # [1, 2, 3, 4] [1, 2, 3, 4, 5]
```

> [!trap] `=` ne copie pas
> Avec `=`, on recopie seulement **l'adresse** : modifier l'une modifie l'autre. Seule `.copy()` crée une copie. C'est **la même chose pour les DataFrames pandas**.

=== id=controle | chap=1 | title=Conditions & boucles | desc=if/elif/else, opérateurs logiques, for, while, break et continue. | themes=controle | deck=controle
# if / elif / else

```python
val1, val2, val3 = 5, 10, 4
if val3 > 5:
    print(val3)
elif val1 < val2 and val2 > val3:
    print(val2 + val3)      # c'est cette branche qui s'exécute : 14
else:
    print(val1)
```

- « si condition1 alors… sinon si condition2 alors… sinon… » : **une seule** branche s'exécute, la **première** dont la condition est vraie.
- Les `:` et l'**indentation (4 espaces)** sont obligatoires.

**Comparaisons** : `==` (égal), `!=` (différent), `>`, `<`, `>=`, `<=`. Le résultat est un booléen `True` / `False`.

**Opérateurs logiques** :

| A | B | `A and B` | `A or B` |
|---|---|---|---|
| False | False | False | False |
| False | True | False | True |
| True | False | False | True |
| True | True | True | True |

`not True` → `False` ; `not False` → `True`.

# La boucle for

On itère sur un `range`, une liste, une chaîne…

```python
for i in range(0, 10):
    print(2 * i)            # 0, 2, 4, …, 18

liste_2 = ['Bleu', 'Rouge', 'Vert', 'Jaune']
for i in range(len(liste_2)):
    print(liste_2[i])       # parcours par indice
for couleur in liste_2:
    print(couleur)          # parcours direct des éléments
```

# La boucle while

On ne connaît pas le nombre d'itérations : la boucle tourne **tant que** la condition est vraie.

```python
i = 1
while i < 10:
    i = 2 * i
    print(i)                # 2, 4, 8, 16
```

> [!trap] 16 est affiché
> La condition est testée **avant** chaque tour : quand `i` vaut 8, on rentre, `i` devient 16 et on l'affiche. Au test suivant (16 < 10 est faux) on sort.

# break et continue

- **`continue`** : passe **directement à l'itération suivante** (la fin du bloc est sautée).
- **`break`** : **arrête complètement** la boucle.

```python
i = 0
while i < 15:
    i = i + 1
    if i == 8:
        continue        # 8 n'est pas affiché
    print(i)
    if i == 11:
        break           # on s'arrête après avoir affiché 11
# affiche 1 2 3 4 5 6 7 9 10 11
```

> [!exam] Annale 2025
> Dans une boucle `for`, un `continue` placé **avant** les `print` empêche tout affichage pour cette itération ; le remplacer par `break` arrête la boucle et **plus rien n'est traité ensuite**.

=== id=comprehension | chap=1 | title=List comprehensions | desc=Créer des listes en une ligne : transformation, filtre, conditions en cascade. | themes=comprehension | deck=controle
# Les trois formes à connaître

```pseudo
nouvelle = [expression for x in liste]                          # transformer
filtree  = [expression for x in liste if condition]             # filtrer
cascade  = [a if c1 else b if c2 else c for x in liste]          # choisir la valeur
```

> [!trap] Où placer le if ?
> - **Filtre** (on garde ou non l'élément) : le `if` est **après** le `for`, **sans** `else`.
> - **Choix de valeur** (tous les éléments sont gardés) : `if ... else ...` est **avant** le `for`.

# Exemple du cours

```python
note1 = [5.0, 4.0, 8, 2.0]
note3 = [x + 5 for x in note1]                 # [10.0, 9.0, 13, 7.0]
note4 = [x for x in note1 if x < 5]            # [4.0, 2.0]
note5 = [x*1.5 if x < 5 else x*1.2 if x < 10 else x+2 for x in note1]
print(note5)                                   # [6.0, 6.0, 9.6, 3.0]
```

Lecture de `note5` pour chaque x : si x < 5 → x × 1,5 ; sinon si x < 10 → x × 1,2 ; sinon → x + 2.

# Autres exemples typiques

```python
[x.lower() for x in "Hello"]          # ['h', 'e', 'l', 'l', 'o']  (on itère sur les lettres)
[x**2 for x in range(5)]              # [0, 1, 4, 9, 16]
[x for x in range(9) if x % 2]        # [1, 3, 5, 7]   (x % 2 vaut 1 → vrai pour les impairs)
[x for x in range(1, 101) if x % 3 != 0]   # entiers de 1 à 100 non divisibles par 3
```

> [!trap] range(9) s'arrête à 8
> `[x for x in range(9) if x % 2]` donne `[1, 3, 5, 7]` et **pas** `[1, 3, 5, 7, 9]`.

# Dictionnaire en compréhension

Même principe avec des accolades :

```python
capitales = {'France': 'Paris', 'Espagne': 'Madrid'}
capitales2 = {cle: 'Capitale : ' + valeur for cle, valeur in capitales.items()}
print(capitales2)   # {'France': 'Capitale : Paris', 'Espagne': 'Capitale : Madrid'}
```

=== id=fonctions | chap=1 | title=Les fonctions | desc=def, return de plusieurs valeurs, arguments nommés, lambda. | themes=fonctions | deck=fonctions
# Définir et appeler

```pseudo
def ma_fonction(argument1, argument2, argument3):
    # instructions
    return valeur1, valeur2       # plusieurs valeurs → renvoyées sous forme de tuple

a, b = ma_fonction(c, d, e)                                   # par position
a, b = ma_fonction(argument2=d, argument3=e, argument1=c)     # par nom : ordre libre
```

- Utile pour tout ce qui est **répété** dans le code.
- Une fonction **sans `return`** renvoie **`None`**.
- Une fonction peut ne prendre **aucun argument** : `def quelleheure():` puis `quelleheure()`.

# Exemple du cours

```python
def carre_cube(lcarre, lcube):
    liste1 = [x**2 for x in lcarre]
    liste2 = [x**3 for x in lcube]
    return liste1, liste2

val1 = [3, 4, 5, 7]
val2 = [2, 6, 9]
val_carre, val_cube = carre_cube(lcube=val2, lcarre=val1)
print(val_carre, val_cube)   # [9, 16, 25, 49] [8, 216, 729]
```

> [!trap] `x^2` dans le cours
> La fonction `carre` du cours écrit `[x^2 for x in liste]` : avec `[2, 8, 6, 7, 2]` cela donne `[0, 10, 4, 5, 0]` (OU exclusif), pas des carrés. Le carré s'écrit `x**2`.

# Fonction sans argument (modules datetime et pytz)

```python
import datetime as dt
import pytz

def quelleheure():
    tz = pytz.timezone('Europe/Paris')
    jour = dt.date.today()
    heure = dt.datetime.now().astimezone(tz)
    print('Nous sommes le :', jour.strftime('%A %d/%m/%Y'), 'et il est :', heure.strftime('%X'))

quelleheure()
```

`strftime` formate une date : `%d` jour, `%m` mois, `%Y` année sur 4 chiffres, `%A` nom du jour, `%X` heure.

# Les fonctions lambda

Une fonction anonyme écrite en une ligne, très utilisée avec pandas (`map`, `apply`) :

```python
ajoute4 = lambda x: x + 4
print(ajoute4(10))                 # 14
print(list(map(lambda x: x * 2, [1, 2, 3])))   # [2, 4, 6]
```

=== id=structures | chap=1 | title=Tuples, listes de listes, dictionnaires | desc=Collections non modifiables, doubles indices, accès par clé, items/pop/clear. | themes=structures | deck=structures
# Les tuples

- Collection **ordonnée** d'éléments **non modifiable** (immuable).
- Construction avec des **parenthèses** : `mon_tuple = ('Pomme', 2, 'Pink Lady')`.
- Accès comme une liste : `mon_tuple[0]`, tranches, `len`, boucle `for`.
- `mon_tuple[0] = 'Poire'` → **TypeError** (pas d'`append`, pas de `remove`…).

```python
mon_tuple = ('Pomme', 2, 'Pink Lady')
for i in range(len(mon_tuple)):
    print(f"Val à l'indice {i} : {mon_tuple[i]}")
```

> [!exam] Annale 2025
> `ma_var = ("Pommes", 10, "Bananes", 3, "Dattes", 5, "Figue", 8)` est un **tuple** (parenthèses), même s'il « ressemble » à des couples clé/valeur. Un dictionnaire s'écrit avec `{clé: valeur}`, une liste avec `[ ]`.

# Les listes de listes

```python
liste = [['Paul', 23], ['Emmanuelle', 35], ['Thibault', 18], ['Lola', 28]]
print(liste[0])       # ['Paul', 23]       → la 1re sous-liste
print(liste[1:3])     # [['Emmanuelle', 35], ['Thibault', 18]]
print(liste[3][0])    # Lola               → ligne 3, élément 0

for nom, age in liste:              # « déballage » de chaque sous-liste
    print(f'Nom : {nom}, Age : {age}')

for ligne in liste:                 # boucles imbriquées
    for valeur in ligne:
        print(valeur)
```

`liste[i]` = la i-ème sous-liste ; `liste[i][j]` = le j-ième élément de la i-ème sous-liste.

# Les dictionnaires

Structure indexée par des **clés** : `{'clé1': valeur1, 'clé2': valeur2}`.

```python
capitales = {'France': 'Paris', 'Espagne': 'Madrid', 'Portugal': 'Lisbonne'}
print(capitales['France'])      # Paris (accès par la clé, pas par un indice)
capitales['Italie'] = 'Rome'    # ajout (ou modification si la clé existe)
vide = {}                       # dictionnaire vide
```

| Instruction | Effet |
|---|---|
| `d.items()` | les couples (clé, valeur) |
| `d.keys()` / `d.values()` | les clés / les valeurs |
| `for cle in d:` | itère sur les **clés** |
| `for cle, val in d.items():` | itère sur les couples |
| `d.pop('Espagne')` | supprime la clé (et renvoie sa valeur) |
| `d.clear()` | **vide** le dictionnaire |
| `del d` | **supprime** complètement la variable |
| `d['Inconnue']` | **KeyError** si la clé n'existe pas |

> [!trap] Pas d'indice numérique
> `capitales[0]` ne donne pas le premier élément : c'est une **KeyError** (sauf si 0 est une clé).

=== id=numpy | chap=1 | title=NumPy & valeurs NaN | desc=array, arange, linspace, produit matriciel vs terme à terme, NaN. | themes=numpy | deck=numpy
# Les tableaux numpy (array)

```python
import numpy as np
tab = np.array([1, 2, 12, 20])
print(type(tab))              # <class 'numpy.ndarray'>
tab1 = np.array([[2, 5, 12], [4, 2, 91]])    # matrice 2 lignes × 3 colonnes
print(tab[0])                 # 1
print(tab1[1][0])             # 4   (ligne 1, colonne 0 ; s'écrit aussi tab1[1, 0])
```

# Fonctions à connaître

| Fonction | Exemple | Résultat |
|---|---|---|
| `np.arange(début, fin, pas)` | `np.arange(2, 15, 3)` | `[ 2  5  8 11 14]` (fin **exclue**) |
| `np.linspace(début, fin, nb)` | `np.linspace(1, 10, 5)` | `[ 1.  3.25  5.5  7.75 10.]` (fin **incluse**, nb valeurs) |
| `np.cos(tab)`, `np.sin`, `np.sqrt`… | `np.cos(np.array([0]))` | appliqué **à chaque élément** |
| `np.dot(A, B)` | produit **matriciel** | (2×3)·(3×2) → (2×2) |
| `A * B` | produit **terme à terme** | A et B de **même forme** |

```python
tab1 = np.array([[2, 5, 12], [4, 2, 91]])
tab2 = np.array([[1, 2], [3, 1], [2, 4]])
print(np.dot(tab1, tab2))     # [[ 41  57]
                              #  [192 374]]
tab3 = np.array([[1, 2, 1], [3, 1, 2]])
print(tab1 * tab3)            # [[  2  10  12]
                              #  [ 12   2 182]]
```

> [!trap] `*` ≠ produit matriciel
> Sur des arrays, `*` multiplie **case par case**. Le produit matriciel, c'est `np.dot(A, B)` (ou `A @ B`) : le nombre de **colonnes de A** doit égaler le nombre de **lignes de B**.

# NaN : Not a Number

- `np.nan` représente une valeur **manquante** (c'est un `float`).
- Tester : `math.isnan(a)` (module `math`), `np.isnan(a)`, ou avec pandas `pd.isna(a)`.
- `np.nan == np.nan` vaut **False** : on ne teste jamais un NaN avec `==`.

```python
import math
import numpy as np
a = np.nan
print(math.isnan(a))    # True
print(a == a)           # False
```

=== id=csv | chap=1 | title=Les fichiers CSV | desc=Délimiteurs, encodage, DictReader / DictWriter, reader / writer, conversion des nombres. | themes=csv | deck=numpy
# Formats

| | Délimiteur | Particularités |
|---|---|---|
| Fichiers anglo-saxons | **virgule** `,` | pas d'accents, point décimal |
| Fichiers français | **point-virgule** `;` | accents, virgule décimale, encodage **utf-8** |

Si un fichier n'est pas en utf-8 : vérifier l'encodage (ex. avec Notepad) et le réenregistrer.

# Lire un fichier avec en-tête : DictReader

```pseudo
import csv
file = open('nom_fichier.csv', mode='r')
fichier = csv.DictReader(file)      # chaque ligne lue est un DICTIONNAIRE
donnee = []                         # (clés = noms des colonnes de l'en-tête)
for ligne in fichier:
    print(ligne)
    donnee.append(ligne)            # → une liste de dictionnaires
file.close()                        # on ferme le fichier
```

# Écrire un fichier avec en-tête : DictWriter

```python
import csv
capitale_europe = [{'Pays': 'France', 'Capitale': 'Paris'},
                   {'Pays': 'Italie', 'Capitale': 'Rome'}]
file_w = open('exemple.csv', mode='w', newline='')
fichier_w = csv.DictWriter(file_w, fieldnames=['Pays', 'Capitale'], delimiter=';')
fichier_w.writeheader()             # écrit la ligne d'en-tête
for ligne in capitale_europe:
    fichier_w.writerow(ligne)       # chaque ligne est un dictionnaire
file_w.close()
```

# Sans en-tête : reader / writer

Même principe avec `csv.reader` et `csv.writer` : chaque ligne est une **liste de valeurs**.

> [!trap] Tout est lu comme du texte
> Avec le module `csv`, les nombres sont lus en **str** : il faut les convertir (`float(valeur)`, `int(valeur)`). C'est pour cela qu'on préfère **pandas** (`pd.read_csv`) pour les données numériques.

=== id=regex | chap=1 | title=Expressions régulières | desc=Métacaractères, classes \d \w \s, findall / search / match / sub / split, groupes de capture. | themes=regex | deck=regex
# Principe

Une **expression régulière** (regex) est un motif de caractères pour **rechercher** des termes ou **vérifier** qu'une chaîne a une structure donnée. Module standard : `import re`. On écrit les motifs avec le préfixe **`r"..."`** (*raw string*) pour que les `\` soient gardés tels quels.

```python
import re
txt = "Quel beau temps"
x = re.search("^Quel.*temps$", txt)    # commence par « Quel », finit par « temps »
print('Trouvé' if x else 'Non trouvé')  # Trouvé
```

# Métacaractères

| Caractère | Sens | Exemple |
|---|---|---|
| `[]` | un caractère parmi une série | `[0-9]` : un chiffre de 0 à 9 |
| `^` | **commence par** | `^Groupe` |
| `$` | **finit par** | `[0-9]$` |
| `*` | **0 ou plusieurs** fois le caractère précédent | `[0-9]*` |
| `+` | **1 ou plusieurs** fois | `[0-9]+` : au moins un chiffre |
| `?` | **0 ou 1** fois | `[0-9]?` |
| `{n}` | **exactement n** fois | `[0-9]{5}` : 5 chiffres |
| `\|` | **ou** | `(1\|3)$` : finit par 1 ou 3 |
| `.` | **n'importe quel** caractère (sauf retour à la ligne) | `..[0-9]` |
| `\` | échappe un caractère spécial | `\.` : un vrai point |

> [!info] Gourmand ou paresseux
> `.*` prend **le plus possible** (gourmand). `.*?` ou `+?` (mode *lazy*) s'arrêtent **à la première possibilité** qui permet de continuer le motif.

# Classes de caractères

| Classe | Signification |
|---|---|
| `\d` / `\D` | un chiffre / tout sauf un chiffre |
| `\w` / `\W` | un caractère de mot (lettre, chiffre, `_`) / tout le reste (ponctuation, espace…) |
| `\s` / `\S` | un blanc (espace, `\t`, `\n`, `\r`, `\f`, `\v`) / tout sauf un blanc |
| `\A` / `\Z` | début / fin de la chaîne |
| `\n` `\r` `\f` `\v` | retour à la ligne, retour chariot, saut de page, espace vertical |

# Les fonctions du module re

| Fonction | Renvoie |
|---|---|
| `re.findall(motif, texte)` | une **liste** de toutes les correspondances (si le motif a des groupes : liste de **tuples** de groupes) |
| `re.search(motif, texte)` | un objet *match* pour la **première** correspondance **n'importe où**, sinon `None` |
| `re.match(motif, texte)` | un objet *match* seulement si la correspondance est **au début** de la chaîne |
| `re.sub(motif, remplacement, texte)` | le texte avec les correspondances **remplacées** |
| `re.split(motif, texte)` | une **liste** des morceaux découpés |

Sur un objet match : `.group()` (texte trouvé), `.start()`, `.end()`, `.span()` (indices), `.group(1)`, `.group("nom")`.

```python
texte = "Pierre vient d'avoir 28 ans à Biarritz et son copain André 32 ans à Paris"
print(re.findall(r"(\d+)\s*ans\s*.*?à\s*([A-Z]\w+)", texte))
# [('28', 'Biarritz'), ('32', 'Paris')]

rep = re.search(r"(?P<Age>\d+)\s*ans.*?à\s(?P<Ville>\w+)", texte)
print(rep.group("Age"), rep.group("Ville"))      # 28 Biarritz

print(re.sub("Biarritz", "Lacanau", texte))      # remplacement simple
print(re.split(r"[.]", "Phrase un. Phrase deux."))   # ['Phrase un', ' Phrase deux', '']
```

# Groupes de capture

- `( ... )` crée un **groupe de capture** ; `(?P<nom>...)` lui donne un **nom**.
- Dans `re.sub`, on rappelle les groupes par `\1`, `\2`… ou par leur nom `\g<nom>`.

```python
texte = "Pierre vient d'avoir 28 ans à Biarritz et son copain André 32 ans à Paris"
texte2 = re.sub(r"(?P<A1>\d+)(\s*ans.*?)(?P<A2>\d+)(\s*ans)", r"\g<A2>\2\g<A1>\4", texte)
print(texte2)   # les deux âges sont échangés : … 32 ans à Biarritz … André 28 ans …
```

# Exemples classiques (TD)

```python
import re
def est_code_postal(s):
    return re.fullmatch(r"\d{5}", s) is not None      # ou re.search(r"^\d{5}$", s)

print(est_code_postal("93160"), est_code_postal("9316A"), est_code_postal("93 160"))  # True False False
print(re.sub(r"\s+", " ", "Les E4FE   sont \t en cours").strip())   # espaces multiples → un seul
print(re.sub(r"(\d{4})-(\d{2})-(\d{2})", r"\3/\2/\1", "2026-09-25"))  # 25/09/2026
```

> [!trap] `[1|3]` dans le cours
> Entre crochets, `|` est un caractère **ordinaire** : `[1|3]` accepte « 1 », « | » ou « 3 ». Pour « 1 ou 3 », écrire `[13]` ou `(1|3)`.

=== id=erreurs | chap=1 | title=Classes & gestion des erreurs | desc=class, __init__, self, attributs ; try / except / else / finally et exceptions courantes. | themes=erreurs | deck=structures
# Les classes (version rapide)

Python est un langage **objet** : classes, **attributs**, **méthodes**.

```python
class E4FE:
    def __init__(self, nom, prenom, groupe):     # le constructeur
        self.nom = nom                            # attributs
        self.prenom = prenom
        self.groupe = groupe

    def note(self, note):                         # une méthode
        self.note_finale = note

E1 = E4FE('Potiron', 'Paul', 1)      # création d'un objet (instance)
print(E1.nom, E1.prenom, E1.groupe)  # Potiron Paul 1
E1.note(12)
print(E1.note_finale)                # 12
```

- `__init__` est appelé automatiquement à la création de l'objet.
- `self` désigne l'objet lui-même (premier paramètre de chaque méthode).
- Importer une classe d'un autre fichier : `from nom_fichier import nom_classe`.

# try / except / else / finally

```pseudo
try:
    nombre = int(input("Entrez un nombre entier : "))
except ValueError:
    print("ce n'est pas un nombre entier")
else:
    print(f"Le nombre est {nombre}")      # seulement s'il n'y a PAS eu d'erreur
finally:
    print("Le script est terminé")        # dans TOUS les cas
```

| Exception | Quand ? | Exemple |
|---|---|---|
| `NameError` | variable inexistante | `print(variable_jamais_definie)` |
| `ZeroDivisionError` | division par zéro | `1 / 0` |
| `TypeError` | opération sur un mauvais type | `"a" + 1`, `mon_tuple[0] = 3` |
| `ValueError` | bon type mais valeur invalide | `int("abc")` |
| `IndexError` | indice hors de la liste | `[1, 2][5]` |
| `KeyError` | clé absente d'un dictionnaire (ou colonne absente en pandas) | `d['inconnue']` |
| `AttributeError` | méthode / attribut inexistant | `df.unique()` sur un DataFrame |
| `ImportError` | import impossible | `from math import inconnu` |
