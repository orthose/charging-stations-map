from tqdm import tqdm
import pandas as pd
import math
import json

# Distance sphérique en mètres entre coordonnées GPS
# https://janakiev.com/blog/gps-points-distance-python/
def haversine(lon1, lat1, lon2, lat2):
    R = 6372800  # Earth radius in meters
    
    phi1, phi2 = math.radians(lat1), math.radians(lat2) 
    dphi       = math.radians(lat2 - lat1)
    dlambda    = math.radians(lon2 - lon1)
    
    a = math.sin(dphi/2)**2 + \
        math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    
    return 2*R*math.atan2(math.sqrt(a), math.sqrt(1 - a))


def compute_knn_clusters(df, k=None, dist_max=100_000):
    """
    Algorithme de calcul des plus proches voisins adapté pour 
    pré-calculer les clusters de station à la maille de 100 km
    Complexité quadratique O(n^2) dans le pire des cas

    :param df: Dataframe contenant les colonnes latitude et longitude
    :param k: Nombre maximum de voisins
    :dist_max: Distance maximale entre 2 bornes (en mètres)

    :return: [{'lng':, 'lat':, 'neighbors': [{'lng':, 'lat':, 'dist':}, ...]}, ...]
    """
    assert k is None or k > 0
    assert dist_max is None or dist_max > 0
    latitude = df["latitude"].tolist()
    longitude = df["longitude"].tolist()
    res = []; seen = set()

    for i in tqdm(range(len(latitude))):
        # Une station ne peut appartenir qu'à un seul cluster
        if (longitude[i], latitude[i]) in seen: continue
        seen.add((longitude[i], latitude[i]))

        # Borne courante pour laquelle on cherche des voisins
        res.append({"lng": longitude[i], "lat": latitude[i], "neighbors": []})

        for j in range(i + 1, len(latitude)):
            # Une station ne peut appartenir qu'à un seul cluster
            if (longitude[j], latitude[j]) in seen: continue

            # Calcul de la distance sphérique
            distance = haversine(longitude[i], latitude[i], longitude[j], latitude[j])
            
            # Enregistrement du voisin si assez proche
            if dist_max is not None and 0 < distance <= dist_max:
                seen.add((longitude[j], latitude[j]))
                res[len(res)-1]["neighbors"].append({"lng": longitude[j], "lat": latitude[j], "dist": distance})

        # Tri croissant selon la distance
        res[len(res)-1]["neighbors"].sort(key=lambda x: x["dist"])

        # On garde les k plus proches voisins
        if k is not None:
            res[len(res)-1]["neighbors"] = res[len(res)-1]["neighbors"][0:k]

    return res


# Calcul des plus proches voisins
df = pd.read_csv("bornes-recharge.csv", sep=",")
knn = compute_knn_clusters(df)

with open("bornes-voisines.json", 'w') as f:
    json.dump(knn, f)