=== id=td1 | title=TD chapitre I — Python
# Exercice 1 (slide 46) : variables, format, chaînes

1. Créer des variables valant 120.03526, 3,786·10⁵ et 12 ; les afficher avec 2 et 4 chiffres après la virgule, la 2e en notation exponentielle, la 3e en binaire (et vérifier).
2. Créer trois variables : cahier, stylo, gomme.
3. Créer une phrase par concaténation avec ces trois mots.
4. Avec une f-string, afficher les prix (cahier 2.50 €, stylo 0.95 €, gomme 1.43 €) avec un saut de ligne entre chaque.
5. Pour le mot « apprenti » : 3e caractère, avant-dernier, à partir du 3e, jusqu'au 4e, du 4e au 7e.

:::solution
```python
a = 120.03526
b = 3.786e5          # 3,786 × 10^5
c = 12
print(f"{a:.2f}", f"{a:.4f}")      # 120.04 120.0353
print(f"{b:.2e}", f"{b:.4e}")      # 3.79e+05 3.7860e+05
print(format(c, 'b'))              # 1100
print(int('1100', 2))              # vérification : 12  (1×8 + 1×4 + 0×2 + 0×1)

mot1, mot2, mot3 = "cahier", "stylo", "gomme"
phrase = "Dans mon sac il y a un " + mot1 + ", un " + mot2 + " et une " + mot3 + "."
print(phrase)

print(f"{mot1} : {2.50:.2f} €\n{mot2} : {0.95:.2f} €\n{mot3} : {1.43:.2f} €")

mot = "apprenti"
print(mot[2])      # 3e caractère (indice 2) : p
print(mot[-2])     # avant-dernier : t
print(mot[2:])     # à partir du 3e : prenti
print(mot[:4])     # jusqu'au 4e : appr
print(mot[3:7])    # du 4e au 7e : rent
```
> [!tip] Méthode
> « Le n-ième caractère » est à l'indice **n − 1**. « Du 4e au 7e » → indices 3 à 6 → `[3:7]`.
:::

# Exercice 2 (slide 54) : listes

1. Créer `liste1` : voiture, vélo, trottinette, roller, avion, gyroroue, hoverboard, skateboard.
2. Nombre d'éléments ; 3. le 3e élément ; 4. du 4e au 7e ; 5. le 2e en partant de la fin.
6. Ajouter « poussette » en fin de liste ; 7. « train » en 2e position.
8. `liste2` : navire, moto, scooter, bus ; 9. concaténer en `liste3`.
10. Enlever le 8e élément ; 11. puis le mot « navire ».
12-14. Copier une liste avec `=` puis avec `.copy()` : que constate-t-on ?

:::solution
```python
liste1 = ["voiture", "vélo", "trottinette", "roller", "avion", "gyroroue", "hoverboard", "skateboard"]
print(len(liste1))         # 8
print(liste1[2])           # trottinette
print(liste1[3:7])         # ['roller', 'avion', 'gyroroue', 'hoverboard']
print(liste1[-2])          # hoverboard
liste1.append("poussette")
liste1.insert(1, "train")  # 2e position = indice 1
liste2 = ["navire", "moto", "scooter", "bus"]
liste3 = liste1 + liste2
del liste3[7]              # 8e élément (indice 7) : hoverboard
liste3.remove("navire")
print(liste3)

nombres1 = [1, 2, 3]
nombres2 = nombres1        # simple « = »
nombres2.append(4)
print(nombres1, nombres2)  # [1, 2, 3, 4] [1, 2, 3, 4]  → les DEUX ont changé

nombres1 = [1, 2, 3]
nombres2 = nombres1.copy()
nombres2.append(4)
print(nombres1, nombres2)  # [1, 2, 3] [1, 2, 3, 4]     → copie indépendante
```
> [!warn] Ce qu'il faut constater
> Avec `=`, les deux noms pointent vers **la même liste en mémoire**. Seule `.copy()` crée une nouvelle liste. Même comportement avec les DataFrames.
:::

# Exercice 3 (slide 64) : structures de contrôle

1. Fonction de note finale à 3 modalités (moyenne ≥ 10 ; sinon `(n1+n2+2*n3)/4` si n1 < 10, n2 < 10 et n3 > 10 ; sinon `/2.5`). Tester (10, 8, 12), (8, 6, 11), (5, 5, 8).
2. Compter les « i » de « Les apprentis inscrits à ESIEE Paris sont sérieux et attentifs » (vérifier avec `count`).
3. Liste de 1 à 100 : mettre à 0 les multiples de 3, puis lister les valeurs non nulles.
4. Afficher les 20 premières valeurs divisibles par 7.
5. Liste de 10 valeurs → liste des carrés par list comprehension.
6. List comprehension : valeurs jusqu'à 100 non divisibles par 3.

:::solution
```python
def note_finale(note1, note2, note3):
    moyenne = (note1 + note2 + note3) / 3
    if moyenne >= 10:
        return moyenne, "modalité 1"
    elif note1 < 10 and note2 < 10 and note3 > 10:
        return (note1 + note2 + 2 * note3) / 4, "modalité 2"
    else:
        return (note1 + note2 + note3) / 2.5, "modalité 3"

for n1, n2, n3 in [(10, 8, 12), (8, 6, 11), (5, 5, 8)]:
    note, modalite = note_finale(n1, n2, n3)
    print(f"Notes : {n1}, {n2}, {n3} → note finale : {note:.2f} ({modalite})")
# 10.00 (modalité 1) · 9.00 (modalité 2) · 7.20 (modalité 3)
```

```python
texte = "Les apprentis inscrits à ESIEE Paris sont sérieux et attentifs"
compteur = 0
for lettre in texte:
    if lettre == "i":
        compteur += 1
print(compteur, texte.count("i"))   # 6 6  (les « I » majuscules d'ESIEE ne comptent pas)
```

```python
nombres = list(range(1, 101))
for i in range(len(nombres)):
    if nombres[i] % 3 == 0:          # divisible par 3 : reste nul
        nombres[i] = 0
non_nuls = [x for x in nombres if x != 0]
print(len(non_nuls))                 # 67

multiples_7 = []
n = 1
while len(multiples_7) < 20:
    if n % 7 == 0:
        multiples_7.append(n)
    n += 1
print(multiples_7)                   # [7, 14, …, 140]  (ou : [7 * k for k in range(1, 21)])

valeurs = [3, 7, 1, 9, 4, 6, 2, 8, 5, 10]
carres = [v ** 2 for v in valeurs]   # ** et non ^ !
print(carres)

sans_multiples_3 = [x for x in range(1, 101) if x % 3 != 0]
print(sans_multiples_3[:10])         # [1, 2, 4, 5, 7, 8, 10, 11, 13, 14]
```
:::

# Exercice 4 (slide 89) : expressions régulières

1. Fonction qui vérifie qu'une chaîne est un code postal de 5 chiffres, sans lettre ni espace.
2. Extraire les adresses mail et leur domaine du texte des responsables de la filière FE.
3. Nettoyer une phrase contenant des espaces multiples et des tabulations.
4. Convertir des dates américaines (2026-09-25) au format français (25/09/2026).

:::solution
```python
import re

def est_code_postal(chaine):
    return re.fullmatch(r"\d{5}", chaine) is not None    # ou : re.search(r"^\d{5}$", chaine)

for test in ["93160", "9316", "93 160", "9316A", "931600"]:
    print(test, est_code_postal(test))   # seul 93160 est valide
```

```python
import re
texte = ("les responsables de la filière FE ont les mails suivants : corinne.berland@esiee.fr et "
         "damien.masson@esiee.fr . L'assistance de scolarité est Julie Chenu et son mail est julie.chenu@esiee.fr")
print(re.findall(r"[\w.]+@[\w.]+\.\w+", texte))
for identifiant, domaine in re.findall(r"([\w.]+)@([\w.]+\.\w+)", texte):   # 2 groupes → tuples
    print(identifiant, "→ domaine :", domaine)
```

```python
import re
phrase = "Les E4FE   sont en    périodes académiques. \t Ils ne    doivent pas manquer les cours !"
propre = re.sub(r"\s+", " ", phrase).strip()   # tout groupe de blancs → un seul espace
print(propre)
```

```python
import re
date_us = "2026-09-25"
print(re.sub(r"(\d{4})-(\d{2})-(\d{2})", r"\3/\2/\1", date_us))                      # 25/09/2026
print(re.sub(r"(?P<a>\d{4})-(?P<m>\d{2})-(?P<j>\d{2})", r"\g<j>/\g<m>/\g<a>", date_us))  # avec des noms
```
:::

=== id=td2 | title=TD chapitre II — pandas
# Exercices 1 et 2 (slides 8 et 12) : créer et décrire un DataFrame

Créer un DataFrame vide (Ville, Département, Région, POP_21), ajouter Paris, Lyon, Marseille avec un index numérique, puis une colonne POP_15. Afficher toutes ses informations.

:::solution
```python
import pandas as pd

villes = pd.DataFrame(columns=['Ville', 'Département', 'Région', 'POP_21'])
villes.loc[0] = ['Paris', 'Paris', 'Île-de-France', 2133111]
villes.loc[1] = ['Lyon', 'Rhône', 'Auvergne-Rhône-Alpes', 513275]
villes.loc[2] = ['Marseille', 'Bouches-du-Rhône', "Provence-Alpes-Côte d'Azur", 861635]
villes['POP_15'] = [2206488, 505275, 892045]
villes['POP_21'] = villes['POP_21'].astype(int)   # créée vide, la colonne était de type object

print(villes)
print(villes.shape, villes.size)     # (3, 5) 15
print(villes.dtypes)
print(villes.columns.tolist(), villes.index.tolist())
villes.info()
```
> [!info] Pourquoi astype(int) ?
> Un DataFrame créé vide puis rempli ligne à ligne avec `.loc` garde des colonnes de type `object`. Les calculs marchent quand même, mais il est plus propre de convertir.
:::

# Exercice 3 (slide 16) : loc et iloc

Ligne d'index 2 · lignes 0 et 1 · colonne Région · colonnes Ville et Département · colonnes Ville et Région · région de la ligne 2.

:::solution
```python
import pandas as pd
villes = pd.DataFrame({'Ville': ['Paris', 'Lyon', 'Marseille'],
                       'Département': ['Paris', 'Rhône', 'Bouches-du-Rhône'],
                       'Région': ['Île-de-France', 'Auvergne-Rhône-Alpes', "Provence-Alpes-Côte d'Azur"],
                       'POP_21': [2133111, 513275, 861635],
                       'POP_15': [2206488, 505275, 892045]})

print(villes.loc[2]);                        print(villes.iloc[2])
print(villes.loc[0:1]);                      print(villes.iloc[0:2])       # loc : fin incluse / iloc : exclue
print(villes.loc[:, 'Région']);              print(villes.iloc[:, 2])
print(villes.loc[:, 'Ville':'Département']); print(villes.iloc[:, 0:2])
print(villes.loc[:, ['Ville', 'Région']]);   print(villes.iloc[:, [0, 2]])
print(villes.loc[2, 'Région']);              print(villes.iloc[2, 2])
```
:::

# Exercice 4 (slide 20) : itérations

:::solution
```python
import pandas as pd
villes = pd.DataFrame({'Ville': ['Paris', 'Lyon', 'Marseille'],
                       'Département': ['Paris', 'Rhône', 'Bouches-du-Rhône'],
                       'Région': ['Île-de-France', 'Auvergne-Rhône-Alpes', "Provence-Alpes-Côte d'Azur"],
                       'POP_21': [2133111, 513275, 861635]})

for i in villes:                       # itérer sur le DataFrame → noms des colonnes
    print(i)

for ligne in villes.itertuples():      # ligne[0] = index, ligne[1] = Ville, …
    print(f"Ville : {ligne[1]}, département : {ligne[2]}, région : {ligne[3]}, population en 2021 : {ligne[4]}")

for ind in villes.index:               # avec loc
    print(villes.loc[ind, 'Ville'], villes.loc[ind, 'POP_21'])

for i in range(len(villes)):           # avec iloc
    print(villes.iloc[i, 0], villes.iloc[i, 2])
```
:::

# Exercices 5 à 8 (slides 27, 35, 38, 41) : filtrer, convertir, indexer, trier

5. Villes en hausse (Ville, Département, POP_21) et en baisse (Ville, POP_21, POP_15).
6. DataFrame → liste de listes ; colonne Région → liste.
7. Copie avec les codes département 75, 69, 13 comme index.
8. Trier par index, par nom de colonne, puis par population 2021 décroissante.

:::solution
```python
import pandas as pd
villes = pd.DataFrame({'Ville': ['Paris', 'Lyon', 'Marseille'],
                       'Département': ['Paris', 'Rhône', 'Bouches-du-Rhône'],
                       'Région': ['Île-de-France', 'Auvergne-Rhône-Alpes', "Provence-Alpes-Côte d'Azur"],
                       'POP_21': [2133111, 513275, 861635],
                       'POP_15': [2206488, 505275, 892045]})

hausse = villes[villes['POP_21'] > villes['POP_15']][['Ville', 'Département', 'POP_21']]
baisse = villes[villes['POP_21'] < villes['POP_15']][['Ville', 'POP_21', 'POP_15']]
print(hausse)    # Lyon
print(baisse)    # Paris, Marseille

liste_de_listes = villes.values.tolist()
regions = villes['Région'].tolist()

villes2 = villes.copy()
villes2.index = [75, 69, 13]

villes2 = villes2.sort_index()                      # 13, 69, 75
for ind in villes2.index:
    print(villes2.loc[ind].tolist())

villes3 = villes2.sort_index(axis=1)                # colonnes par ordre alphabétique
for ind in villes3.index:
    print(villes3.loc[ind].tolist())

print(villes2.sort_values(by='POP_21', ascending=False))
```
:::

# Exercice 9 (slide 53) : calculs sur les colonnes

:::solution
```python
import pandas as pd
villes = pd.DataFrame({'Ville': ['Paris', 'Lyon', 'Marseille'],
                       'POP_21': [2133111, 513275, 861635],
                       'POP_15': [2206488, 505275, 892045]})

v = villes.copy()                                         # on garde l'original
total_21 = v['POP_21'].sum()
total_15 = v['POP_15'].sum()
v['%_21'] = [x / total_21 * 100 for x in v['POP_21']]     # list comprehension
v['%_15'] = [x / total_15 * 100 for x in v['POP_15']]
v['Evol_%'] = (v['POP_21'] - v['POP_15']) / v['POP_15'] * 100
print(v.round(2))
```
:::

# Exercices 10 et 11 (slides 56 et 59) : fichiers, concat, merge, groupby

Les fichiers `pop_France_21_15.csv` et `pop_France_10_82.csv` ne sont pas fournis ici : les **noms de colonnes ci-dessous sont supposés**, adapte-les à tes fichiers (regarde `df.columns` après la lecture).

:::solution
```pseudo
import pandas as pd

pop = pd.read_csv('pop_France_21_15.csv', sep=';', encoding='utf-8')
print(pop.dtypes)                  # vérifier que les populations sont bien numériques
# si une colonne de nombres est lue en object :
# pop['POP_2021'] = pd.to_numeric(pop['POP_2021'], errors='coerce')

tout = pd.concat([villes, pop], ignore_index=True)    # concaténation verticale
print(tout)                        # colonnes de noms différents → NaN : à vérifier !

pop2 = pd.read_csv('pop_France_10_82.csv', sep=';', encoding='utf-8')
complet = pd.merge(pop, pop2, left_on='Ville', right_on='Nom_commune')   # noms de colonnes différents
complet = complet.drop(columns=['Nom_commune'])        # colonne en double après le merge
complet = complet.set_index('code_insee')
complet = complet.rename(columns={'POP_2021': '2021', 'POP_2015': '2015'})
complet.to_csv('pop_France_complet.csv', sep=';')

# Exercice 11
idf = complet[complet['Région'] == 'Île-de-France']
annees = ['2021', '2015', '2010']                      # ou complet.columns.tolist()[i:j]
somme_dpt = complet.groupby('Département')[annees].sum()
hausse = complet[complet['2021'] > complet['2010']][['Ville', 'Département', 'Région', '2021', '2010']]
baisse = complet[complet['2021'] < complet['2015']][['Ville', 'Département', 'Région', '2021', '2015']]
```
> [!trap] Les pièges de cet exercice
> - `merge` avec `left_on` / `right_on` **conserve les deux colonnes** de jointure → il faut en supprimer une.
> - Si les deux fichiers ont des colonnes de même nom (hors clé), pandas ajoute les suffixes `_x` et `_y`.
> - `set_index` puis `rename` : sans affectation ni `inplace=True`, rien n'est modifié.
:::
