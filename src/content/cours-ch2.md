=== id=pd-intro | chap=2 | title=pandas : DataFrame et Series | desc=Les deux objets de pandas, installation, import, lien avec les listes de dictionnaires. | themes=pd-base | deck=pd-base
# Deux notions importantes

- **DataFrame** : tableau de données à **2 dimensions** avec des **étiquettes de lignes** (l'**index**) et des **noms de colonnes** (`columns`).
- **Series** : tableau à **une seule dimension** (une colonne, ou une ligne) avec son index.

Un DataFrame ressemble à une **liste de dictionnaires** : les **clés** sont les **noms des colonnes**, chaque dictionnaire est une ligne.

```python
import pandas as pd       # installation : conda install pandas  (ou pip install pandas)

df = pd.DataFrame([{'Pays': 'France', 'Capitale': 'Paris'},
                   {'Pays': 'Italie', 'Capitale': 'Rome'}])
print(df)
print(type(df['Pays']))   # <class 'pandas.core.series.Series'>  : une colonne = une Series
```

```out
     Pays Capitale
0  France    Paris
1  Italie     Rome
```

> [!trap] DataFrame s'écrit avec deux majuscules
> Les diapos écrivent souvent `pd.Dataframe`, mais le vrai nom est **`pd.DataFrame`** (D et F majuscules). `pd.Dataframe(...)` provoque une **AttributeError**.

=== id=pd-creation | chap=2 | title=Créer un DataFrame (et lire un CSV) | desc=DataFrame vide, ajout de lignes avec .loc, de colonnes avec insert / assign, liste de dictionnaires, read_csv / to_csv. | themes=pd-base | deck=pd-base
# DataFrame vide

```python
mes_donnees = pd.DataFrame(columns=['nom_col1', 'nom_col2'])          # colonnes définies
mes_donnees2 = pd.DataFrame(index=['ligne1', 'ligne2', 'ligne3'])     # index défini, pas de colonne
```

# Ajouter des lignes : `.loc[nom_index] = [...]`

```python
inscrits = pd.DataFrame(columns=['Nom', 'Prénom', 'Sexe', 'DNais', 'VNais'])
inscrits.loc[0] = ['Bonnot', 'Arthur', 'M', '20/07/2000', 'Bezon']
inscrits.loc[2] = ['Alberton', 'Paul', 'M', '05/04/2001', 'Nice']
print(inscrits.index.tolist())   # [0, 2]  ← l'index est l'étiquette qu'on a donnée
print(inscrits.dtypes)           # toutes les colonnes sont de type object (texte)
```

Si l'étiquette existe déjà, `.loc[...] = ...` **remplace** la ligne.

# Ajouter des colonnes

| Méthode | Effet |
|---|---|
| `df['nouvelle'] = liste` | ajoute (ou remplace) une colonne à la fin |
| `df.insert(position, 'nom', valeurs, allow_duplicates=False)` | insère **à une position**, **modifie df** (renvoie `None`) ; `allow_duplicates=False` interdit deux colonnes de même nom |
| `df2 = df.assign(Nom=valeurs)` | renvoie un **NOUVEAU** DataFrame avec la colonne en plus ; `df` est inchangé |

```python
dates = ['01/07', '15/07', '01/08', '15/08', '01/09']
reserve = pd.DataFrame(index=dates)
reserve.insert(0, 'Mais', [15, 14, 10, 9, 2], allow_duplicates=False)
reserve.insert(1, 'Thon', [5, 4, 2, 1, 0], allow_duplicates=False)
reserve2 = reserve.assign(Céréales=[12, 11, 10, 9, 8])
print(reserve.columns.tolist(), reserve2.columns.tolist())
# ['Mais', 'Thon'] ['Mais', 'Thon', 'Céréales']
```

# À partir d'une liste de dictionnaires (ou de listes)

```python
dict_capitales = [{'Pays': 'Albania', 'Capitale': 'Tirana'},
                  {'Pays': 'Austria', 'Capitale': 'Vienna'}]
capitales = pd.DataFrame(dict_capitales, index=['Pays1', 'Pays2'])

ll = [['Albania', 'Tirana'], ['Austria', 'Vienna']]
capitales2 = pd.DataFrame(ll, columns=['Pays', 'Capitale'])     # liste de listes → DataFrame

d = {'Ville': ['Paris', 'Lyon'], 'POP_21': [2133111, 513275]}
villes = pd.DataFrame(d)                                        # dictionnaire de listes
```

Dans l'autre sens : `df.to_dict(orient=...)` avec `orient` = `'dict'`, `'list'`, `'series'`, `'split'`, `'tight'`, `'records'` ou `'index'` (le sens dans lequel le dictionnaire est reconstruit).

# À partir d'un fichier (la meilleure solution)

```pseudo
donnee = pd.read_csv('base_cc_comparateur.csv', sep=';', decimal=',', encoding='utf-8')
donnee.to_csv('resultat.csv', index=False)     # index=False : l'index n'est pas exporté en colonne
```

- `sep=';'` (ou `delimiter=';'`) : séparateur de colonnes (fichiers français).
- `decimal=','` : la virgule est le séparateur décimal (sinon `3,5` reste du texte).
- `encoding='utf-8'` : encodage du fichier.
- `dtype='object'` : force la lecture de **toutes** les colonnes en texte.
- À la lecture, l'**index est numérique** : de **0 à nombre de lignes − 1**.

=== id=pd-infos | chap=2 | title=Informations sur un DataFrame | desc=shape, size, dtypes, columns, index, values, head, tail, sample, info. | themes=pd-base | deck=pd-base
# Attributs (sans parenthèses)

| Attribut | Donne | Exemple (10 lignes × 6 colonnes) |
|---|---|---|
| `df.shape` | les dimensions **(lignes, colonnes)** | `(10, 6)` |
| `df.size` | le **nombre d'éléments** = lignes × colonnes | `60` |
| `df.dtypes` | le **type** de chaque colonne | `object`, `int64`, `float64`… |
| `df.columns` | les **noms des colonnes** | `Index(['Titre', …])` |
| `df.index` | les **étiquettes des lignes** | `RangeIndex(start=0, stop=10, step=1)` |
| `df.axes` | les deux axes : `[index, columns]` | |
| `df.values` | les valeurs sous forme de **tableau numpy**, sans noms de colonnes ni index | |
| `len(df)` | le nombre de **lignes** | `10` |

# Méthodes (avec parenthèses)

| Méthode | Effet |
|---|---|
| `df.head(n)` | les **n premières** lignes (5 par défaut) |
| `df.tail(n)` | les **n dernières** lignes |
| `df.sample(n)` | **n lignes au hasard** |
| `df.info()` | résumé détaillé : nombre de lignes (*entries*), colonnes, **nombre de valeurs non nulles** par colonne, **types**, mémoire |
| `df.describe()` | statistiques des colonnes numériques : count, mean, std, min, quartiles, max |

```python
import pandas as pd, numpy as np
df = pd.DataFrame({'Ville': ['Paris', 'Lyon', 'Nice'], 'POP': [2133111, 513275, np.nan]})
print(df.shape, df.size)    # (3, 2) 6
df.info()
```

```out
<class 'pandas.core.frame.DataFrame'>
RangeIndex: 3 entries, 0 to 2
Data columns (total 2 columns):
 #   Column  Non-Null Count  Dtype
---  ------  --------------  -----
 0   Ville   3 non-null      object
 1   POP     2 non-null      float64
dtypes: float64(1), object(1)
```

> [!exam] Annale 2025
> « Nature des données, nombre de lignes, nombre d'éléments par colonne et d'éléments non nuls » → `df.dtypes`, `df.shape` et surtout **`df.info()`** qui donne tout. `df.size` donne le nombre **total** d'éléments, `df.isna()` un tableau de booléens.

> [!trap] Pièges classiques
> - `df.tail(4)` donne les 4 **dernières** lignes, **pas** des lignes aléatoires (c'est `sample`).
> - `df.shape()` avec parenthèses → **TypeError** (shape est un attribut, un tuple).
> - `print(df.info())` affiche le résumé puis `None` (info affiche lui-même et ne renvoie rien).

=== id=pd-acces | chap=2 | title=Accéder aux données : loc, iloc, colonnes | desc=Position vs étiquette, borne de fin exclue ou incluse, Series, erreurs classiques. | themes=pd-acces | deck=pd-acces
# iloc : par POSITION (integer location)

| Besoin | Syntaxe |
|---|---|
| Une ligne | `df.iloc[n]` |
| Plusieurs lignes | `df.iloc[début:fin+1]` — la **fin est EXCLUE** |
| Une valeur | `df.iloc[n_ligne, n_colonne]` |
| Toute une colonne | `df.iloc[:, n_colonne]` |
| Certaines colonnes d'une ligne | `df.iloc[n_ligne, c1:c2+1]` |
| Lignes / colonnes choisies | `df.iloc[[0, 2], [1, 3]]` |

`iloc` n'accepte **que des entiers** (positions) : `df.iloc[4, 'Duree_mn']` → **erreur**.

# loc : par ÉTIQUETTE (noms d'index et de colonnes)

| Besoin | Syntaxe |
|---|---|
| Une ligne | `df.loc['nom_index']` (si l'index est un nombre : `df.loc[2]`, sans guillemets) |
| Plusieurs lignes | `df.loc['début':'fin']` — la **fin est INCLUSE** |
| Une valeur | `df.loc['nom_index', 'nom_colonne']` |
| Plusieurs colonnes contiguës | `df.loc[:, 'col_début':'col_fin']` (incluse) |
| Colonnes non contiguës | `df.loc[:, ['col1', 'col2']]` |
| Bloc | `df.loc['l1':'l3', 'c1':'c3']` |

> [!trap] La différence qui tombe à chaque QCM
> - `df.iloc[2:4]` → positions **2 et 3** (fin exclue, comme les listes).
> - `df.loc[2:4]` → étiquettes **2, 3 et 4** (fin incluse).
> - `df.loc[2, :]` = la **ligne** d'étiquette 2 (toutes ses colonnes) — pas « la troisième colonne ».
> - Une virgule sépare lignes et colonnes : `df.loc[11, 'A':'B']`. Écrire `df.loc[11:'A':'B']` (deux-points au lieu de la virgule) est **une erreur**.

```python
capitales = pd.DataFrame({'Pays': ['Aland Islands', 'Albania', 'Andorra', 'Armenia', 'Austria'],
                          'Capitale': ['Mariehamn', 'Tirana', 'Andorra la Vella', 'Yerevan', 'Vienna']},
                         index=['Pays1', 'Pays2', 'Pays3', 'Pays4', 'Pays5'])
print(capitales.iloc[0])            # ligne Pays1 (une Series)
print(capitales.iloc[2:4])          # Pays3 et Pays4
print(capitales.iloc[3, 1])         # Yerevan
print(capitales.loc['Pays2':'Pays4'])   # Pays2, Pays3 ET Pays4
print(capitales.loc['Pays2', 'Capitale'])   # Tirana
```

# Accéder aux colonnes

| Syntaxe | Résultat |
|---|---|
| `df['col']` (ou `df.col`) | une **Series** |
| `df[['col1', 'col2']]` (doubles crochets) | un **DataFrame** |
| `df.columns` | les noms des colonnes |

Sur une Series : `s['Pays1']` (par étiquette), `s.iloc[0]` (par position), et `for v in s:` parcourt les **valeurs**.

> [!info] Index numérique automatique
> Après un `read_csv`, l'index vaut 0, 1, 2… : `loc[2]` et `iloc[2]` désignent alors la même ligne. Ce n'est plus vrai après un tri, un filtre ou un `set_index` !

=== id=pd-iteration | chap=2 | title=Itérer sur un DataFrame | desc=for sur les colonnes, itertuples, boucles avec loc / iloc. | themes=pd-acces | deck=pd-acces
# Les quatre façons du cours

```python
capitales = pd.DataFrame({'Pays': ['Aland Islands', 'Albania'], 'Capitale': ['Mariehamn', 'Tirana']},
                         index=['Pays1', 'Pays2'])

for i in capitales:                 # itérer sur le DataFrame → les NOMS DES COLONNES
    print(i)                        # Pays, Capitale

for ligne in capitales.itertuples():          # un tuple (nommé) par ligne
    print(ligne)                    # Pandas(Index='Pays1', Pays='Aland Islands', Capitale='Mariehamn')
    print(ligne[0], ligne[1])       # [0] = l'index, [1] = 1re colonne, [2] = 2e colonne…

for ind in capitales.index:         # avec loc : plus lent
    print(capitales.loc[ind, 'Capitale'])

for i in range(len(capitales)):     # avec iloc : plus lent
    print(capitales.iloc[i, 1])

for col in capitales:               # parcourir les colonnes et leurs valeurs
    print(capitales[col])
```

- `itertuples(index=True)` : l'index est le **premier élément** du tuple ; avec `index=False`, il n'y est pas.
- On peut aussi écrire `ligne.Pays` (accès par nom de colonne).

> [!trap] `for x in df`
> Itérer directement sur un DataFrame donne les **noms des colonnes**, pas les lignes. Itérer sur une Series donne ses **valeurs**.

=== id=pd-filtre | chap=2 | title=Filtrer et sélectionner | desc=Masques booléens, & et |, isin, str.startswith, query, np.where, index.tolist, copy. | themes=pd-filtre | deck=pd-filtre
# Sélection de colonnes

```pseudo
donnee_filtree = donnee[['CODGEO', 'P20_POP', 'P14_POP', 'SUPERF']]          # sans recopie
donnee_filtree2 = donnee[['CODGEO', 'P20_POP', 'P14_POP', 'SUPERF']].copy()  # avec recopie
```

# Sélection de lignes selon une condition

`df2 = df1[df1['colonne'] condition valeur]` — la condition crée une Series de booléens (un « masque ») :

```pseudo
grandes = donnee[donnee['P20_POP'] > 100000]                 # villes > 100 000 habitants
manquants = donnee[donnee['P20_POP'].isna() == True].copy()  # lignes où P20_POP manque
paris = donnee[donnee['CODGEO'].str.startswith('75')].copy() # codes commençant par 75
```

# Combiner des conditions

| Logique | Opérateur pandas | Exemple |
|---|---|---|
| ET | `&` | `df[(df['P20_POP'] < 18000) & (df['P20_POP'] > 17800)]` |
| OU | `\|` | `df[(df['CODGEO'] == '1015') \| (df['CODGEO'] == '1012')]` |
| NON | `~` | `df[~(df['Genre'] == 'Drame')]` |
| Appartenance | `.isin([...])` | `df[df['CODGEO'].isin(['1015', '1012'])]` |

> [!trap] Les trois erreurs à éviter
> 1. **Parenthèses obligatoires** autour de chaque condition : `(a == 1) | (b == 2)`.
> 2. Pas de `and` / `or` entre deux Series → **ValueError** (« truth value is ambiguous »).
> 3. « les films sortis en 1994 **et** 1999 » se code avec **`|`** : une même ligne ne peut pas avoir les deux années, donc `&` renverrait un DataFrame **vide**.

# Puis choisir les colonnes

```python
film_df[(film_df["Annee_sortie"] == 1999) | (film_df["Annee_sortie"] == 1994)]["Genre"]   # Series des genres
film_df.loc[film_df["Genre"] == "Thriller", "Duree_mn"].mean()      # forme recommandée avec loc
```

# Retrouver des positions / étiquettes

```pseudo
liste_index = donnee[donnee['P20_POP'] > 100000].index.tolist()   # liste des étiquettes retenues
np.where(donnee['CODGEO'].str.startswith('75'))                  # positions (numpy)
donnee['SUPERF'] = donnee['SUPERF'].astype(float)
donnee.query('SUPERF > 15 and SUPERF < 15.05').index.to_list()   # query : condition en texte
```

Dans `query`, on écrit bien `and` / `or` (c'est une chaîne interprétée par pandas).

> [!info] Pourquoi .copy() ?
> Un filtre peut renvoyer une « vue » sur les données d'origine. Ajouter `.copy()` garantit un DataFrame **indépendant** (et évite le *SettingWithCopyWarning* si on le modifie ensuite).

=== id=pd-suppr | chap=2 | title=Supprimer, copier, convertir | desc=drop, dropna, drop_duplicates, inplace, copy, tolist, Series. | themes=pd-manip,pd-nan | deck=pd-manip
# drop : supprimer des lignes ou des colonnes par leur nom

```pseudo
capitales.drop(['Pays4'], axis=0, inplace=True)       # une ligne (axis=0 = index)
capitales.drop(index='Pays4', inplace=True)           # équivalent
capitales.drop(['Capitale'], axis=1, inplace=True)    # une colonne (axis=1 = colonnes)
capitales.drop(columns='Capitale', inplace=True)      # équivalent
```

# dropna : supprimer les lignes / colonnes contenant des NaN

`df.dropna(axis=0 ou 1, how='any' ou 'all', subset=[...], inplace=True ou False)`

| Paramètre | Effet |
|---|---|
| `how='any'` (défaut) | supprime la ligne s'il y a **au moins un** NaN |
| `how='all'` | supprime la ligne seulement si **toutes** les valeurs (testées) sont NaN |
| `subset=['A', 'B']` | ne regarde que ces colonnes |
| `axis=1` | supprime des **colonnes** au lieu de lignes |

> [!exam] Annale 2025
> « Ne retirer que les lignes où le titre **et** le réalisateur manquent » → `df.dropna(subset=['Titre', 'Realisateur'], how='all')`. Un simple `dropna(how='any')` supprimerait **toute** ligne ayant au moins un NaN (budget, durée…) : trop large.

# drop_duplicates : supprimer les doublons

```pseudo
capitales.drop_duplicates(subset='Pays', keep='first', inplace=True)   # garde la 1re occurrence
```

`keep='last'` garde la dernière ; `keep=False` supprime toutes les occurrences en double.

# inplace

| Écriture | Résultat |
|---|---|
| `df = df.dropna()` | OK : on récupère le nouveau DataFrame |
| `df.dropna(inplace=True)` | OK : df est modifié directement |
| `df = df.dropna(inplace=True)` | **Piège** : avec `inplace=True` la méthode renvoie `None` → df vaut **None** |
| `df.dropna()` seul | ne fait **rien** de visible : le résultat est perdu |

# Copier

Comme pour les listes, `df2 = df` ne copie que **l'adresse** : les deux noms désignent les **mêmes données**. Seule solution : `df2 = df.copy()`.

# Convertir

```pseudo
liste_capitale = capitales.values.tolist()      # DataFrame → liste de listes
liste_pays = capitales['Pays'].tolist()         # une colonne → liste
capitales2 = pd.DataFrame(liste_capitale, columns=['Pays', 'Capitale'])   # retour en DataFrame
```

# Les Series

```python
donnee = pd.Series(['Paris', 'Lyon', 'Rennes', 'Nantes', 'Bordeaux'])
print(donnee[1])           # Lyon
donnee = donnee.drop([1])
print(donnee)              # index 0, 2, 3, 4 : les étiquettes ne sont PAS renumérotées
```

=== id=pd-index | chap=2 | title=Index, noms de colonnes et tri | desc=set_index, reset_index, columns, rename, sort_index, sort_values. | themes=pd-manip | deck=pd-manip
# Refaire l'index

```pseudo
df.set_index('CODGEO', drop=True, inplace=True)   # la colonne devient l'index (et disparaît des colonnes si drop=True)
df.index = ['75', '69', '13']                     # une liste comme index (même longueur !)
df.index = pd.Series([23, 10, 8])                 # une Series comme index
df = df.reset_index(drop=True)                    # index renuméroté 0..n-1 ; drop=False garde l'ancien en colonne
```

# Renommer les colonnes

```pseudo
df.columns = ['Code géographique', 'Population en 2020', 'Population en 2014', 'Superficie']  # toutes, même nombre
df = df.rename(columns={'POP_2021': '2021', 'POP_2015': '2015'})                             # seulement certaines
```

# Trier

| Méthode | Trie selon… |
|---|---|
| `df.sort_index(axis=0, ascending=True)` | les **étiquettes de lignes** (l'index) |
| `df.sort_index(axis=1)` | les **noms des colonnes** (ordre alphabétique des colonnes) |
| `df.sort_values(by='col', ascending=False)` | les **valeurs d'une colonne** (ici décroissant) |
| `df.sort_values(by=['c1', 'c2'])` | plusieurs colonnes |

Sans `inplace=True`, ces méthodes **renvoient un nouveau** DataFrame.

> [!exam] Annale 2025
> « Trier le DataFrame par ordre décroissant de budget » → `film_df.sort_values(by='Budget_M', ascending=False)`. **Pas** `sort_index(axis=1, ascending=False)` qui trie les **noms de colonnes** à l'envers !

# Réordonner les colonnes

```python
film_df = film_df[["Titre", "Realisateur", "Genre", "Annee_sortie", "Duree_mn", "Budget_M"]]
```

=== id=pd-types | chap=2 | title=Types de données et conversions | desc=dtypes, object, int64, float64, astype, to_datetime, lecture en texte. | themes=pd-manip | deck=pd-manip
# Les types (dtypes)

| Type pandas | Contenu |
|---|---|
| `object` | **texte** (chaînes) ou mélange |
| `int64` (`int32`) | entiers ; `uint64` : entiers non signés |
| `float64` | réels (et **toute colonne numérique contenant un NaN**) |
| `bool` | booléens |
| `datetime64[ns]` | dates |

```pseudo
donnee = pd.read_csv('base_cc_comparateur.csv', sep=';', decimal=',', dtype='object')
print(donnee.dtypes)     # tout est object car dtype='object'
```

# Convertir

```pseudo
donnee['SUPERF'] = donnee['SUPERF'].astype(float)          # .astype(type, errors='raise' ou 'ignore')
inscrits['DNais'] = pd.to_datetime(inscrits['DNais'], format='%d/%m/%Y')   # texte → datetime64[ns]
```

> [!trap] Une colonne d'entiers avec un NaN
> Dès qu'une colonne numérique contient un NaN, elle devient `float64` (12 s'affiche 12.0). Et `astype(int)` échoue tant qu'il reste des NaN.

=== id=pd-ops | chap=2 | title=Opérations sur les colonnes : boucle, map, apply | desc=Modifier une colonne, map avec lambda ou dictionnaire, apply sur lignes ou colonnes (axis). | themes=pd-ops | deck=pd-ops
# Quatre façons de modifier une colonne

```python
reserve = pd.DataFrame({'Mais': [15, 14, 10], 'Année': ['2025', '2026', '2027']})

for i in reserve.index:                                  # 1) boucle + loc
    reserve.loc[i, 'Mais'] = reserve.loc[i, 'Mais'] - 4

reserve['Mais'] = reserve['Mais'].map(lambda x: x - 4)   # 2) map + lambda (sur UNE colonne)

reserve['Mais'] = [x - 4 for x in reserve['Mais']]       # 3) list comprehension

reserve['Mais'] = reserve['Mais'] - 4                    # 4) opération vectorisée (la plus simple)
```

# map avec un dictionnaire

```pseudo
modif = {'2025': '2026', '2026': '2031', '2027': '2025'}
reserve['Année'] = reserve['Année'].map(modif)
```

Chaque valeur est remplacée par celle du dictionnaire ; une valeur **absente** du dictionnaire devient **NaN**. `na_action='ignore'` laisse les NaN tels quels sans les passer à la fonction.

# apply

| Appel | Ce que reçoit la fonction |
|---|---|
| `df['col'].apply(f)` | chaque **valeur** de la colonne (comme `map`) |
| `df.apply(f, axis=0)` (défaut) | chaque **colonne** (une Series) |
| `df.apply(f, axis=1)` | chaque **ligne** (une Series : on lit `x['Mais']`) |
| `df.apply(f, args=(1, 2))` | arguments supplémentaires |

```python
reserve = pd.DataFrame({'Mais': [15, 14], 'Thon': [5, 4]}, index=['01/07', '15/07'])
reserve['sous total'] = reserve.apply(lambda x: x['Thon'] + x['Mais'], axis=1)  # par ligne
total_col = reserve.apply(lambda col: col.sum(), axis=0)                        # par colonne
plus2 = reserve.apply(lambda x: x + 2)                                          # +2 partout
```

> [!exam] Annale 2025 : apply avec une fonction personnalisée
> ```pseudo
> def ma_fonction(x):
>     H = round(x / 60)
>     M = round(x % 60)
>     return f"{H}h{M:02d}"
> film_df["Nouvelle_col"] = film_df["Duree_mn"].apply(ma_fonction)
> ```
> Cela **crée une nouvelle colonne** contenant la durée en heures et minutes **sous forme de chaîne**. `apply` accepte parfaitement une fonction personnalisée. (Remarque : `round(x/60)` est une maladresse — pour 154 min on obtient « 3h34 » ; il faudrait `x // 60`.)

# Opérations sur les chaînes : l'accesseur `.str`

`df['col'].str.lower()`, `.str.upper()`, `.str.strip()`, `.str.title()`, `.str.replace('a', 'b')`, `.str.startswith('75')`, `.str.contains('Nolan')`, `.str.isnumeric()`, `.str.isalpha()`, `.str.isalnum()`.

```pseudo
df['Realisateur'] = df['Realisateur'].apply(lambda x: x.lower())   # vu à l'examen
df['Realisateur'] = df['Realisateur'].str.lower()                  # équivalent, et ne plante pas sur NaN
```

=== id=pd-nan | chap=2 | title=Valeurs manquantes et nettoyage | desc=isna / isnull, fillna (moyenne, médiane, mode), homogénéiser, doublons. | themes=pd-nan | deck=pd-nan
# Repérer les NaN

| Instruction | Résultat |
|---|---|
| `df.isna()` ou `df.isnull()` | DataFrame de **True / False** |
| `df['col'].isna()` | Series de booléens |
| `pd.isna(df.iloc[i, j])` / `pd.isna(df.loc[idx, 'col'])` | un booléen |
| `df.isna().sum()` | **nombre** de NaN par colonne |
| `df.notna()` | l'inverse |

# Remplacer les NaN : fillna

```pseudo
df['Budget_M'] = df['Budget_M'].fillna(df['Budget_M'].mean())     # par la moyenne
df['Duree_mn'] = df['Duree_mn'].fillna(df['Duree_mn'].median())   # par la médiane
df['Genre'] = df['Genre'].fillna(df['Genre'].mode()[0])            # par la valeur la plus fréquente
```

> [!trap] mode() renvoie une Series
> `df['col'].mode()` renvoie une **Series** (il peut y avoir plusieurs modes) : il faut prendre `mode()[0]`. Et de toute façon, si l'énoncé demande la **moyenne**, c'est `.mean()` !

# Homogénéiser les catégories

```pseudo
df['Genre'] = df['Genre'].str.strip().str.lower()       # 'Action ', 'action' → 'action'
df['Realisateur'] = df['Realisateur'].str.title()       # 'christopher nolan' → 'Christopher Nolan'
print(df['Genre'].unique())                             # vérifier les valeurs distinctes
```

# Autres tests

`df['col'].str.isnumeric()` (que des chiffres), `.str.isalpha()` (que des lettres), `.str.isalnum()` (lettres ou chiffres), `df.duplicated()` (lignes en double).

# Recette complète de nettoyage

```pseudo
df = df.dropna(subset=['Titre', 'Realisateur'], how='all')      # lignes vraiment inexploitables
df['Budget_M'] = df['Budget_M'].fillna(df['Budget_M'].mean())   # valeurs manquantes
df['Genre'] = df['Genre'].str.strip().str.lower()               # catégories homogènes
df = df.drop_duplicates()                                       # doublons
df = df.sort_values(by='Budget_M', ascending=False)             # tri
```

=== id=pd-agg | chap=2 | title=Calculs, valeurs uniques et groupby | desc=sum/mean avec axis, unique, value_counts, groupby, aggregate. | themes=pd-agg | deck=pd-agg
# Calculs sur un DataFrame

| Instruction | Résultat |
|---|---|
| `df['col'].sum()` | la somme d'une colonne |
| `df.sum(axis=0)` (défaut) | une somme **par colonne** |
| `df.sum(axis=1)` | une somme **par ligne** |
| `df.mean()`, `df.max()`, `df.min()`, `df.median()`, `df.std()`, `df.count()` | idem (`count` = nombre de valeurs **non NaN**) |
| `df['col'].unique()` | les valeurs **distinctes** (un array) |
| `df['col'].nunique()` | le **nombre** de valeurs distinctes |
| `df['col'].value_counts()` | le nombre d'occurrences de chaque valeur (tableau de fréquences) |

> [!trap] unique() n'existe que pour une Series
> `df.unique()` sur un DataFrame → **AttributeError**. Il faut une colonne : `df['Genre'].unique()`.

> [!trap] Moyenne d'un sous-ensemble
> « Durée moyenne des Thrillers » : `df[df['Genre'] == 'Thriller']['Duree_mn'].mean()`. Sans `['Duree_mn']`, on essaie de moyenner toutes les colonnes (y compris du texte → erreur) ; avec `groupby('Genre')` on obtient la moyenne de **chaque** genre, pas seulement des Thrillers.

# groupby : regrouper puis calculer

```pseudo
dpt_pop = donnee.groupby('code_departement')['P20_POP'].sum()           # une valeur par département
dpt_nais = donnee.groupby('code_departement')['NAISD21'].mean()
dpt_region = donnee.groupby(['nom_region', 'code_departement'])['NAISD21'].mean()   # 2 niveaux
dpt = donnee.groupby('code_departement').aggregate({'NAISD21': 'mean', 'P20_POP': 'sum'})  # une opération par colonne
```

Le résultat est indexé par les **groupes** (les valeurs distinctes de la colonne de regroupement). `.agg(...)` est un alias d'`.aggregate(...)`.

```python
notes = pd.DataFrame({'Groupe': [1, 2, 1, 2], 'Note': [12, 8, 16, 10]})
print(notes.groupby('Groupe')['Note'].mean())
```

```out
Groupe
1    14.0
2     9.0
Name: Note, dtype: float64
```

=== id=pd-concat | chap=2 | title=Assembler des DataFrames : concat, merge, join | desc=Empiler (concat), fusionner sur une colonne (merge), joindre sur l'index (join). | themes=pd-concat | deck=pd-concat
# pd.concat : empiler

| Appel | Effet |
|---|---|
| `pd.concat([df1, df2])` | met les lignes **les unes sous les autres** ; les **index sont gardés** (doublons possibles) |
| `pd.concat([df1, df2], ignore_index=True)` | renumérote l'index 0..n-1 |
| colonnes différentes | les cases manquantes sont remplies de **NaN** |
| `join='inner'` | ne garde que les **colonnes communes** |
| `pd.concat([df1, df2], axis=1)` | ajoute des **colonnes** côte à côte (alignement sur l'index) ; on peut y mettre une Series |

```python
a = pd.DataFrame({'Ville': ['Paris', 'Lyon'], 'POP': [2133111, 513275]})
b = pd.DataFrame({'Ville': ['Nice'], 'POP': [348085]})
print(pd.concat([a, b]).index.tolist())                     # [0, 1, 0]
print(pd.concat([a, b], ignore_index=True).index.tolist())  # [0, 1, 2]
```

# pd.merge : fusionner sur une colonne commune (comme une jointure SQL)

```pseudo
pd.merge(df1, df2, on='Ville', how='inner')                       # colonne de même nom
pd.merge(df1, df2, left_on='Ville', right_on='Nom_commune')       # noms différents
pd.merge(df1, df2, on=['Ville', 'Departement'])                   # plusieurs colonnes
```

| `how=` | Lignes gardées |
|---|---|
| `'inner'` (défaut) | seulement les clés **présentes dans les deux** |
| `'left'` / `'right'` | toutes celles de gauche / de droite |
| `'outer'` | toutes, avec des NaN là où il manque |

Avec `left_on` / `right_on`, **les deux colonnes sont conservées** → on supprime ensuite le doublon avec `drop(columns=...)`.

# df1.join(df2) : joindre sur l'INDEX

```pseudo
df1.join(df2, how='inner')                          # ne garde que les index communs
df1.join(df2, lsuffix='_left', rsuffix='_right')    # si des colonnes ont le même nom
```

> [!info] Fautes de frappe des diapos
> Le cours écrit `joint(...)` et `lon=[...]` : les vrais noms sont **`join`** et **`on`**.
