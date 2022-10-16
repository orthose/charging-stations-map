# Projet de visualisation
Projet universitaire de **réprésentation et visualisation de l'information**.
* **Étudiant :** Maxime Vincent
* **Formation :** Master 2 ISD Université Paris-Saclay
* **Enseignant :** [Frédéric Vernier](http://vernier.frederic.free.fr/)

## Consignes
Trouver un jeu de données respectant les caractéristiques suivantes
* Au moins 1000 lignes
* Au moins 5 dimensions
* Complexité des données

Réaliser une application de visualisation comportant au moins :
* Deux visualisations des données
* Des interactions avec l'utilisateur
* Un filtrage des données
* Un lien entre les visualisations

## Données
J'ai choisi le dataset du réseau français de bornes de recharge pour voitures électriques
mis à disposition sur
[data.gouv.fr](https://www.data.gouv.fr/fr/datasets/fichier-consolide-des-bornes-de-recharge-pour-vehicules-electriques/)
par [Etalab](https://www.data.gouv.fr/fr/organizations/etalab/).

Le [schéma](https://schema.data.gouv.fr/etalab/schema-irve/2.0.3/documentation.html)
comporte **39** colonnes et le dataset contient **20569** lignes pour **13 MB**.

## Questions
* Quelle est la répartition des bornes de recharge en France et au cours du temps (date de mise en service) ?
* Est-ce qu'il y a des zones blanches et quelles sont les zones les plus servies ?
* Les petites villes sont-elles désavantagées par rapport aux grandes agglomérations ?
* Quelle est la répartition des puissances de charge ?
* Quels axes autoroutiers sont les mieux dotés en charge rapide ?
* De quelles puissances disposent en majorité les villes ?
* Quelle est la répartition du prix des bornes ?
* Le prix des bornes est-il corrélé à leur puissance ?
* Est-ce qu'il existe des injustices de tarification ?
* Comment les opérateurs se répartissent-ils le territoire ?
* Sur quel marché de puissance se positionnent-ils ?
* Quelle est la répartition du type de prise ?

## Cahier des charges
* Overview avec bornes représentées par texture simple de point géographique.
* Overview des bornes avec cercles dont la taille dépend du nombre de points de charge
et la teinte de la puissance sur échelle logarithmique.
* Overview du prix des bornes avec le texte `€` en jouant sur la police et la puissance
en jouant sur la teinte (même échelle que pour les cercles).
* Overview avec agrégation du nombre de points de charge sous forme de HeatMap pré-calculée.
* Overview de la zone d'influence de chaque borne avec diagramme de Voronoï pré-calculé.
Plus la zone est grande plus elle doit être mise en évidence car c'est une zone blanche.
* Niveau de zoom avec agrégation modifiée vers du ondemand avec bulle d'info pour chaque borne.
* Filtre des bornes par puissance/type de prise avec range slider et cases à cocher.
* Faire varier le temps pour afficher le nombre de bornes (par défaut toutes les bornes).
* Légende claire se mettant à jour automatiquement en fonction de la visualisation.

## Dépendances
La visualisation est une application web réalisé HTML/CSS et [JavaScript](https://developer.mozilla.org/fr/docs/Learn/JavaScript/First_steps/What_is_JavaScript).
Pour l'affichage de la carte de France j'utilise [Mapbox](https://www.mapbox.com/).
Pour l'affichage des données j'utilise [p5.js](https://p5js.org/).
Le pré-traitement des données est réalisé en [Python](https://www.python.org/) 
avec la librairie [Pandas](https://pandas.pydata.org/).

## Mise en production
Copier la configuration par défaut et la modifier en suivant les commentaires.
```shell
cp config-template.js config.js
```

Pour exécuter le script Python de construction des données on utilise un environnement virtuel.
```shell
cd data
python3 -m venv ./venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
python build_data.py
python knn.py
deactivate
```
