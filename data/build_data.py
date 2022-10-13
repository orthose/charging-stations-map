# python3 build_data.py
# Construction de la base de données

import pandas as pd
import re

# Téléchargement des fichiers CSV
df = pd.read_csv("https://www.data.gouv.fr/fr/datasets/r/8d9398ae-3037-48b2-be19-412c24561fbb", sep=",")
# Les bornes Ionity ne sont pas incluses car le schéma n'est pas encore consolidé
df_ionity = pd.read_csv("https://www.data.gouv.fr/fr/datasets/r/696b4a10-6181-4dcc-b096-c0c824362091", sep=";")

# Parsing des coordonnées GPS
coordinates = []
for coord in df_ionity["coordonneesXY"]:
    m = re.match(r"[ ]*(-?[0-9.,]+)[ ]*,[ ]*(-?[0-9.,]+)[ ]*", coord)
    coordinates.append((m[1].replace(',', '.'), m[2].replace(',', '.')))
df_ionity["consolidated_longitude"] = list(map(lambda x: x[1], coordinates))
df_ionity["consolidated_latitude"] = list(map(lambda x: x[0], coordinates))

# Vérification que les bornes Ionity ne sont pas incluses dans le jeu de données principal
assert (df['id_station_itinerance'].isin(df_ionity['id_station_itinerance'])).sum() == 0

# Sélection des colonnes intéressantes pour la visualisation
cols = [
    "consolidated_longitude", "consolidated_latitude",
    "nom_operateur", "contact_operateur", "telephone_operateur", "id_station_itinerance", "id_station_local",
    "nom_station", "implantation_station", "adresse_station", "nbre_pdc", "puissance_nominale",
    "prise_type_ef", "prise_type_2", "prise_type_combo_ccs", "prise_type_chademo", "prise_type_autre",
    "gratuit", "tarification", "condition_acces", "reservation", "raccordement", "num_pdl", "date_mise_en_service"]

df = df[cols]
df_ionity = df_ionity[cols]

# Renommage des colonnes
rename_cols = {"consolidated_longitude":"longitude", "consolidated_latitude":"latitude"}
df.rename(columns=rename_cols, inplace=True)
df_ionity.rename(columns=rename_cols, inplace=True)

# Nettoyage et uniformisation des valeurs
df_ionity["date_mise_en_service"] = pd.to_datetime(df_ionity["date_mise_en_service"], dayfirst=True).dt.strftime("%Y-%m-%d")
bool_cols = ["prise_type_ef", "prise_type_2", "prise_type_combo_ccs", "prise_type_chademo", "prise_type_autre", "gratuit"]
for col in bool_cols:
    df_ionity[col] = df_ionity[col].apply(lambda x: "true" if x == "VRAI" else "false")
    df[col] = df[col].apply(lambda x: "true" if x in ["true", "True", "TRUE", "1"] else "false")

# Union du dataframe principal avec les bornes Ionity
df = pd.concat([df, df_ionity])

# Conversion éventuelle des W en kW
df["puissance_nominale"] = list(map(lambda x: int(x) if x <= 1000. else int(x / 1000.), df["puissance_nominale"]))

# Suppression des dupliqués
df.drop_duplicates(inplace=True)

# Tri pour affichage sur le dessus des fortes puissances
df.sort_values(by="puissance_nominale", ascending=True, inplace=True)

df.to_csv("bornes-recharge.csv", sep=",", index=False)