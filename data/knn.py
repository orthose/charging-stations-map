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


# Algorithme de calcul des plus proches voisins
# Complexité quadratique O(n^2)
def compute_knn(df, k=None, dist_max=100_000):
    """
    :param df: Dataframe contenant les colonnes latitude et longitude
    :param k: Nombre maximum de voisins
    :dist_max: Distance maximale entre 2 bornes (en mètres)

    :return: [{'lng':, 'lat':, 'neighbors': [{'lng':, 'lat':, 'dist':}, ...]}, ...]
    """
    assert k is None or k > 0
    assert dist_max is None or dist_max > 0
    latitude = df["latitude"].tolist()
    longitude = df["longitude"].tolist()
    res = []
    for i in tqdm(range(len(latitude))):

        # Borne courante pour laquelle on cherche des voisins
        res.append({"lng": longitude[i], "lat": latitude[i], "neighbors": []})
        for j in range(i + 1, len(latitude)):

            # Calcul de la distance sphérique
            distance = haversine(longitude[i], latitude[i], longitude[j], latitude[j])
            
            # Enregistrement du voisin si assez proche
            if dist_max is not None and 0 < distance <= dist_max:
                res[i]["neighbors"].append({"lng": longitude[j], "lat": latitude[j], "dist": distance})

        # Tri croissant selon la distance
        res[i]["neighbors"].sort(key=lambda x: x["dist"])

        # On garde les k plus proches voisins
        if k is not None:
            res[i]["neighbors"] = res[i]["neighbors"][0:k]

    return res


# Calcul des plus proches voisins
df = pd.read_csv("bornes-recharge.csv", sep=",")
knn = compute_knn(df)

# Transformation en données tabulaires pour réduire la taille
list_knn = []
for x in knn:
    for y in x["neighbors"]:
        list_knn.append([x["lng"], x["lat"], y["lng"], y["lat"], y["dist"]])

df_knn = pd.DataFrame(list_knn, columns=["longitude", "latitude", "neighbor_longitude", "neighbor_latitude", "distance"])
df_knn.drop_duplicates(inplace=True)
df_knn.to_csv("bornes-voisines.csv", sep=",", index=False)

# Version JSON
"""
list_knn = []
for x in knn:
    last = (x['lng'], x['lat'])
    cluster = [[x["lng"], x["lat"]]]
    for y in x["neighbors"]:
        if last != (y['lng'], y['lat']): 
            cluster.append([y["lng"], y["lat"], y["dist"]])
    list_knn.append(cluster)

with open("bornes-voisines.json", 'w') as f:
    json.dump(list_knn, f)
"""