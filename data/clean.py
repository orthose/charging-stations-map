# python3 clean.py

# Nettoyage du fichier des bornes de recharge

import pandas as pd

df = pd.read_csv("consolidation-etalab-schema-irve-v-2.0.3-20220928.csv", sep=",")

# Sélection des colonnes intéressantes
df = df[
    ["consolidated_longitude", "consolidated_latitude",
    "nom_operateur", "contact_operateur", "telephone_operateur", "id_station_itinerance", "id_station_local",
    "nom_station", "implantation_station", "adresse_station", "nbre_pdc", "puissance_nominale",
    "prise_type_ef", "prise_type_2", "prise_type_combo_ccs", "prise_type_chademo", "prise_type_autre",
    "gratuit", "tarification", "condition_acces", "reservation", "raccordement", "num_pdl", "date_mise_en_service"]
]

# Conversion éventuelle des W en kW
df["puissance_nominale"] = list(map(lambda x: int(x) if x <= 1000. else int(x / 1000.), df["puissance_nominale"]))

df.to_csv("bornes-recharge.csv", sep=",", index=False)