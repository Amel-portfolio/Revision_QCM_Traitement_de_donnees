# Stratégie pour le QCM

- **Lis le symbole ♣** : zéro, une ou plusieurs bonnes réponses. Sans ♣ : **une seule** bonne réponse.
- Évalue **chaque proposition indépendamment**, sur l'objet d'origine (sauf indication contraire).
- Pour un code : fais une **trace** (un tableau des valeurs des variables à chaque tour de boucle).
- Méfie-toi des **coquilles volontaires** : `loc[11:'A':'B']` (deux-points au lieu de virgule), `iloc[4, 'col']`, `df.unique()`, `pd.Dataframe`…
- Repère les mots qui piègent : « en **début** de liste », « **aléatoirement** », « la **troisième colonne** », « **automatiquement** », « la **partie entière** », « **et** » (qui se code parfois `|`).

# Indexation : la règle d'or

| Outil | Départ | Borne de fin | Exemple |
|---|---|---|---|
| chaîne `s[i:j]` | 0 | **exclue** | `"Philippe"[0:5]` → `"Phili"` |
| liste `l[i:j]` | 0 | **exclue** | `l[1:3]` → éléments 1 et 2 |
| `range(i, j)` | i | **exclue** | `range(9)` → 0…8 |
| `np.arange(i, j, p)` | i | **exclue** | `np.arange(2, 15, 3)` → 2 5 8 11 14 |
| `np.linspace(a, b, n)` | a | **incluse** | `np.linspace(1, 10, 5)` → 1 … 10 |
| `df.iloc[i:j]` | position 0 | **exclue** | `iloc[2:4]` → 2 lignes |
| `df.loc['a':'c']` | étiquette | **incluse** | `loc[2:4]` → 3 lignes |

Indices négatifs : `[-1]` = dernier, `[-2]` = avant-dernier. « Le n-ième élément » = indice **n − 1**.

# Listes : modifie ? renvoie ?

| Instruction | Modifie la liste | Renvoie |
|---|---|---|
| `l.append(v)` | oui (ajout **à la fin**) | `None` |
| `l.insert(i, v)` | oui (ajout **à l'indice i**) | `None` |
| `l.remove(v)` | oui (1re occurrence de la **valeur**) | `None` |
| `l.pop(i)` / `l.pop()` | oui | **l'élément supprimé** (le dernier par défaut) |
| `del l[i]` | oui (par **position**) | — |
| `l.sort()` | oui | `None` |
| `sorted(l)` | **non** | une nouvelle liste |
| `l + l2` | **non** | une nouvelle liste |
| `l.copy()` | non | une copie indépendante |
| `l2 = l` | — | **pas de copie** : même objet |

# Méthodes de chaînes

| `"bonjour LE monde"` | Résultat |
|---|---|
| `.upper()` | `BONJOUR LE MONDE` |
| `.lower()` | `bonjour le monde` |
| `.capitalize()` | `Bonjour le monde` (**le reste passe en minuscules**) |
| `.title()` | `Bonjour Le Monde` |

Elles **renvoient** une nouvelle chaîne : `texte.upper()` seul ne change pas `texte`.

# loc vs iloc

| | `loc` | `iloc` |
|---|---|---|
| Désigne par | **étiquette** (nom d'index, nom de colonne) | **position** entière |
| Borne de fin d'une tranche | **incluse** | **exclue** |
| Une valeur | `df.loc[3, 'Titre']` | `df.iloc[3, 0]` |
| Une ligne | `df.loc[3]` ou `df.loc[3, :]` | `df.iloc[3]` |
| Une colonne | `df.loc[:, 'Titre']` (ou `df['Titre']`) | `df.iloc[:, 0]` |
| Colonnes contiguës | `df.loc[:, 'A':'C']` (A, B, C) | `df.iloc[:, 0:3]` |
| Erreur typique | étiquette inexistante → KeyError | un nom → erreur |

Après `read_csv`, l'index vaut 0, 1, 2… : `loc[2]` = `iloc[2]`. **Ce n'est plus vrai** après un tri, un filtre, un `drop` ou un `set_index`.

# axis = 0 ou axis = 1 ?

| Méthode | `axis=0` (défaut) | `axis=1` |
|---|---|---|
| `drop` | supprime des **lignes** | supprime des **colonnes** |
| `dropna` | supprime des **lignes** | supprime des **colonnes** |
| `sum`, `mean`, `max`… | un résultat **par colonne** | un résultat **par ligne** |
| `apply(f)` | f reçoit chaque **colonne** | f reçoit chaque **ligne** |
| `sort_index` | trie les **lignes** (index) | trie les **colonnes** (noms) |
| `pd.concat` | empile les **lignes** | met les **colonnes** côte à côte |

Moyen mnémotechnique : avec `axis=1`, on travaille « dans le sens des colonnes », donc **ligne par ligne**.

# inplace, affectation et copies

| Écriture | Effet |
|---|---|
| `df = df.dropna()` | ✅ df remplacé par le résultat |
| `df.dropna(inplace=True)` | ✅ df modifié directement |
| `df.dropna()` | ❌ résultat calculé puis **perdu** |
| `df = df.dropna(inplace=True)` | ❌ df vaut **None** |
| `df2 = df` | ❌ pas de copie : même objet |
| `df2 = df.copy()` | ✅ copie indépendante |
| `df.assign(c=...)` | renvoie un **nouveau** DataFrame |
| `df.insert(0, 'c', ...)` | modifie df, renvoie None |

Même logique pour `fillna`, `drop`, `rename`, `sort_values`, `set_index`, `astype`, `str.lower()`… : **sans affectation (ou `inplace=True`), rien n'est modifié**.

# Attributs (sans parenthèses) ou méthodes ?

| Attributs | Méthodes |
|---|---|
| `df.shape`, `df.size`, `df.dtypes`, `df.columns`, `df.index`, `df.values`, `df.axes` | `df.head()`, `df.tail()`, `df.sample()`, `df.info()`, `df.describe()`, `df.isna()`, `df.copy()` |

`df.shape()` → TypeError (« 'tuple' object is not callable »).

# Ce qui n'existe que sur une Series (une colonne)

`unique()`, `nunique()`, `value_counts()`, `map()`, `tolist()`, l'accesseur `.str` (`.str.lower()`, `.str.startswith()`…). Sur un DataFrame → **AttributeError**.

# Filtrer avec pandas

| Je veux | J'écris |
|---|---|
| ET | `df[(cond1) & (cond2)]` |
| OU | `df[(cond1) \| (cond2)]` |
| NON | `df[~(cond)]` |
| Une valeur parmi une liste | `df[df['c'].isin([v1, v2])]` |
| Puis une colonne | `df[cond]['col']` ou `df.loc[cond, 'col']` |
| Plusieurs colonnes | `df[cond][['c1', 'c2']]` (doubles crochets) |

Jamais `and` / `or` entre Series (ValueError), et toujours des **parenthèses** autour de chaque condition.

# Formats d'affichage

| Format | Exemple | Résultat |
|---|---|---|
| `.2f` | `f"{3.14159:.2f}"` | `3.14` |
| `.2e` | `f"{123.5647:.2e}"` | `1.24e+02` |
| `g` | `format(123.5647, 'g')` | `123.565` |
| `3d` | `format(10, '3d')` | `' 10'` |
| `04d` | `format(10, '04d')` | `0010` |
| `02d` | `f"{5:02d}"` | `05` |
| `b` | `format(140, 'b')` | `10001100` |

# Opérateurs à ne pas confondre

| Écriture | Sens |
|---|---|
| `/` | division (toujours float) |
| `//` | division entière |
| `%` | reste (modulo) : `x % 2 == 0` ⇔ x pair |
| `**` | puissance |
| `^` | OU exclusif bit à bit (**pas** une puissance) |
| `=` | affectation |
| `==` | comparaison |
| `&`, `\|`, `~` | et, ou, non **entre Series pandas** |
| `and`, `or`, `not` | et, ou, non **entre booléens Python** |

# Regex express

| Symbole | Sens | Symbole | Sens |
|---|---|---|---|
| `^` | commence par | `$` | finit par |
| `.` | n'importe quel caractère | `\|` | ou |
| `*` | 0 ou plus | `+` | 1 ou plus |
| `?` | 0 ou 1 | `{n}` | exactement n |
| `\d` | chiffre | `\D` | non-chiffre |
| `\w` | lettre, chiffre, _ | `\W` | le reste |
| `\s` | blanc | `\S` | non-blanc |
| `( )` | groupe de capture | `(?P<nom>…)` | groupe nommé |

`findall` → liste (de chaînes ou de tuples) · `search` → 1re correspondance n'importe où ou None · `match` → seulement au début · `sub` → remplace · `split` → découpe.

# Les 30 pièges du QCM

1. `pd.Dataframe` n'existe pas : c'est **`pd.DataFrame`**.
2. `("a", 1, "b", 2)` est un **tuple**, pas un dictionnaire.
3. `l.pop(3)` renvoie l'élément d'**indice 3** (le 4e).
4. `remove` renvoie **None** ; `pop` renvoie l'élément.
5. `append` ajoute **à la fin** ; au début → `insert(0, v)`.
6. `sorted(l, reverse=True)` → ordre **décroissant**.
7. `l.sort()` renvoie **None**.
8. `range(9)` s'arrête à **8**.
9. `x ^ 2` n'est **pas** un carré.
10. `3 * 0.1 == 0.3` vaut **False**.
11. `round(2.5)` vaut **2** ; `round(154/60)` vaut **3**.
12. `.capitalize()` met le **reste en minuscules**.
13. `print(a, b)` sépare par un **espace**.
14. `continue` placé avant un `print` : **rien** n'est affiché pour ce tour.
15. `break` : la boucle s'arrête, **plus rien** n'est traité.
16. `if / elif / else` : une moyenne < 10 teste le **elif** avant le else.
17. Filtre `[x for x in l if c]` vs choix `[a if c else b for x in l]`.
18. `l2 = l` et `df2 = df` ne **copient pas**.
19. `iloc` : **positions**, fin **exclue** ; `loc` : **étiquettes**, fin **incluse**.
20. `df.loc[2, :]` est une **ligne**, pas la 3e colonne.
21. `df.loc[11:'A':'B']` est une **erreur** : il faut une virgule.
22. `df.iloc[4, 'col']` est une **erreur**.
23. `tail(n)` = n **dernières** lignes ; l'aléatoire, c'est `sample(n)`.
24. « 1994 et 1999 » → `|` ; `&` donnerait un résultat **vide**.
25. `df.size` = lignes × colonnes ; `df.shape` = (lignes, colonnes).
26. `df.unique()` → **AttributeError**.
27. `fillna(df['c'].mode())` : mode ≠ moyenne, et mode() est une **Series**.
28. `dropna(how='any')` supprime trop ; `subset=[...], how='all'` cible.
29. `sort_index(axis=1)` trie les **noms de colonnes**, pas les valeurs.
30. `groupby(...)` renvoie une valeur **par groupe** ; pour un seul groupe, on **filtre**.
