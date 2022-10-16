// En raison de problèmes avec this dans la Promise
// Je préfère utiliser un objet global plutôt qu'une classe
const data = {
    rawTable: null,
    stations: [],
    clusters: [],
};

// Chargement asynchrone des données
function loadData() {
    new p5(function(p) {
        p.loadTable(config.dataPath, "csv", "header", function(rawTable) {
            data.rawTable = rawTable;
            const longitude = rawTable.getColumn("longitude").map(x => parseFloat(x));
            const latitude = rawTable.getColumn("latitude").map(x => parseFloat(x));
            for (let i = 0; i < rawTable.getRowCount(); i++) {
                data.stations.push([longitude[i], latitude[i]]);
            }
            computeClusters();
            p.remove();
        });
    });
}

// Découpage des clusters pré-calculés en fonction de distMax
// et calcul des centroïdes selon la moyenne des clusters
function computeClusters(distMax=100_000) {
    // Calcul des clusters selon l'algorithme des plus proches voisins
    const knnClusters = computeKNNClusters(data.stations, distMax=distMax);

    // Ensemble des stations associées à chaque cluster
    const clustersStations = knnClusters.map(function(station) {
        const cluster = [[station.lon, station.lat]]
            .concat(station.neighbors.map(
                neighbor => [neighbor.lon, neighbor.lat]));
        return cluster;
    });

    // Calcul des centroïdes selon la moyenne des clusters
    let clustersCenter = clustersStations.map(function(cluster) {
        const center = cluster.reduce(function(acc, x) {
            acc.lon += x[0];
            acc.lat += x[1];
            return acc;
        }, {lon: 0, lat: 0});
        center.sum = cluster.length;
        center.lon /= cluster.length;
        center.lat /= cluster.length;
        return center;
    });

    // Calcul des distances par rapport au centroïde
    clustersCenter = clustersCenter.map(function(cluster, i) {
        const distances = clustersStations[i].map(station => 
            haversine(cluster.lon, cluster.lat, station[0], station[1]));
        // Distance minimale
        cluster.distMin = Math.min(...distances);
        // Distance maximale
        cluster.distMax = Math.max(...distances);
        // Distance moyenne
        cluster.distAvg = distances.reduce((acc, x) => acc + x, 0) / distances.length;
        // Calcul de l'écart-type
        cluster.distStd = Math.sqrt((1 / distances.length) 
            * distances.reduce((acc, x) => acc + Math.pow(x - cluster.distAvg, 2), 0)
        );
        return cluster;
    });

    data.clusters = clustersCenter;
}

loadData();
