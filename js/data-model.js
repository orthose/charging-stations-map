// En raison de problèmes avec this dans la Promise
// Je préfère utiliser un objet global plutôt qu'une classe
const data = {
    rawTable: [], // Table à laquelle accède les sketchs
    privateRawTable: [], // Table de référence à ne pas lire
    stations: [], // [[longitude, latitude]...]
    clusters: [], // [{lng:,lat:,sum:,distMin:,distMax:,distAvg:,distStd:}...]
};

// Chargement asynchrone des données
data.loadData = function() {
    new p5(function(p) {
        p.loadTable(config.dataPath, "csv", "header", function(rawTable) {
            // Il est préférable de se passer de l'interface tabulaire
            // pour réaliser les filtres sur des objets Javascript
            const numericalColumns = ["longitude", "latitude", "puissance_nominale", "nbre_pdc"];
            data.rawTable = rawTable.getArray().map(function(row) {
                const res = {};
                rawTable.columns.forEach(function(colName, i) {
                    if (numericalColumns.indexOf(colName) !== -1) {
                        res[colName] = parseFloat(row[i]);
                    } else {
                        res[colName] = row[i];
                    }
                });
                return res;
            });
            // Table de référence à ne pas modifier
            data.privateRawTable = [...data.rawTable];
            data.loadStations();
            data.computeClusters();
            p.remove();
        });
    });
}

data.loadStations = function() {
    data.stations = [];
    const longitude = data.rawTable.map(x => x.longitude);
    const latitude = data.rawTable.map(x => x.latitude);
    for (let i = 0; i < data.rawTable.length; i++) {
        data.stations.push([longitude[i], latitude[i]]);
    }
}

data.filterYear = function(startYear, stopYear) {
    data.rawTable = data.privateRawTable.filter(x => {
        const year = parseInt((new Date(x.date_mise_en_service)).getFullYear());
        return startYear <= year && year <= stopYear; 
    });
    data.loadStations();
    data.computeClusters();
}

// Découpage des clusters pré-calculés en fonction de distMax
// et calcul des centroïdes selon la moyenne des clusters
data.computeClusters = function(distMax=100_000) {
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

data.loadData();
