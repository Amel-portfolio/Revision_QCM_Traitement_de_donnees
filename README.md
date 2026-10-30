# Révision QCM — Traitement et analyse de données

Site de révision pour le QCM « Traitement et analyse de données » (Python de base + pandas).

## Utilisation

Ouvrir `index.html` dans un navigateur (double-clic). Tout fonctionne hors ligne, sauf le bac à sable Python qui télécharge Pyodide (connexion internet requise). La progression est enregistrée dans le navigateur (localStorage).

## Contenu

- Résumés de cours (chapitre I : Python, chapitre II : pandas)
- Notions clés et pièges classiques
- 160 flashcards
- 176 questions de quiz par thème, corrigées et expliquées
- 4 QCM blancs chronométrés + QCM aléatoire
- Annale du 18/11/2025 corrigée
- TD 1 et 2 corrigés
- Bac à sable Python (Pyodide)
- Bouton « Demander à Claude » qui prépare un prompt à copier

## Modifier le contenu

Le contenu est dans `src/content/` (fichiers texte/markdown), le moteur dans `src/app.js`, le style dans `src/style.css`. Après modification :

```bash
python3 build.py
```

Cela régénère `index.html`, un fichier unique et autonome.
