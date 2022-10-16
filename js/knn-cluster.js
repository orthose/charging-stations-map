function radians(degrees) {
    return degrees * (Math.PI/180);
}

// Distance sphérique en mètres entre coordonnées GPS
// https://janakiev.com/blog/gps-points-distance-python/
function haversine(lon1, lat1, lon2, lat2) {
    const R = 6372800;  // Earth radius in meters
    
    const phi1 = radians(lat1);
    const phi2 = radians(lat2); 
    const dphi = radians(lat2 - lat1);
    const dlambda = radians(lon2 - lon1);
    
    a = Math.pow(Math.sin(dphi/2),2) 
        + Math.cos(phi1)*Math.cos(phi2)*Math.pow(Math.sin(dlambda/2),2);
    
    return 2*R*Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}


/**
 * Algorithme de calcul des plus proches voisins adapté pour 
 * pré-calculer les clusters de station à la maille de distMax km
 * Complexité quadratique O(n^2) dans le pire des cas
 *
 * @param stations Tableau de [longitude, latitude]
 * @param distMax Distance maximale entre 2 bornes (en mètres) > 0
 * @param k Nombre maximum de voisins > 0
 *
 * @return [{lon:, lat:, neighbors: [{lon:, lat:, dist:}, ...]}, ...]
 **/
function computeKNNClusters(stations, distMax=100_000, k=null) {
    let res = []; const seen = new Set();

    for (let i = 0; i < stations.length; i++) {
        const lon1 = stations[i][0];
        const lat1 = stations[i][1];
        let key = [lon1, lat1].toString();

        // Une station ne peut appartenir qu'à un seul cluster
        if (seen.has(key)) continue;
        seen.add(key);

        // Borne courante pour laquelle on cherche des voisins
        res.push({lon: lon1, lat: lat1, neighbors: []});

        for (let j = i+1; j < stations.length; j++) {
            const lon2 = stations[j][0];
            const lat2 = stations[j][1];
            key = [lon2, lat2].toString();

            // Une station ne peut appartenir qu'à un seul cluster
            if (seen.has(key)) continue;

            // Calcul de la distance sphérique
            const distance = haversine(lon1, lat1, lon2, lat2);

            // Enregistrement du voisin si assez proche
            if (distMax !== null && 0 < distance && distance <= distMax) {
                seen.add(key);
                res[res.length-1].neighbors.push({"lon": lon2, "lat": lat2, "dist": distance});
            }
        }

        // On n'a pas besoin de trier par distance croissante
        // On garde les k plus proches voisins
        if (k !== null) {
            res[res.length-1].neighbors = res[res.length-1].neighbors.slice(0, k);
        }
    }
    
    return res;
}