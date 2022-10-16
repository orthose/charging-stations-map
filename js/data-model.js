// En raison de problèmes avec this dans la Promise
// Je préfère utiliser un objet global plutôt qu'une classe
const data = {
    rawTable: null,
    knnArray: [],
    clusters: [],
};

// Chargement asynchrone des données
function loadData() {
    new p5(function(p) {
        new Promise((resolve, _) => {
            p.loadTable(config.dataPathRawTable, "csv", "header", function(rawTable) {
                console.log("rawTable loaded");
                data.rawTable = rawTable; resolve();
            });
        }).then(_ => {
            p.loadTable(config.dataPathKNNTable, "csv", "header", function(knnTable) {
                p.remove();
                data.knnArray = knnTable.getArray();
                console.log("knnArray loaded");
                computeClusters();
                console.log("clusters computed")
            });
        });
    });
}

function computeClusters(distMax=50_000) {
    data.clusters = [];
    const seenStations = new Set();
    let currentStation = [data.knnArray[0][0], data.knnArray[0][1]];
    seenStations.add(currentStation.toString());
    let currentCluster = [[...currentStation]];

    data.knnArray.forEach(function([longitude, latitude, 
        neighborLongitude, neighborLatitude, distance]) {
        distance = parseFloat(distance);
        
        // Est-ce que l'on change de station ? 
        if (!(currentStation[0] === longitude && currentStation[1] === latitude)) {
            currentStation = [longitude, latitude];
            seenStations.add(currentStation.toString());
            // Le centroïde du cluster sera la moyenne des stations
            const cluster = currentCluster.reduce(function(acc, x) {
                acc.longitude += parseFloat(x[0]);
                acc.latitude += parseFloat(x[1]);
                acc.sum += 1; 
                return acc;
            }, {longitude: 0, latitude: 0, sum: 0});
            cluster.longitude /= cluster.sum;
            cluster.latitude /= cluster.sum;
            data.clusters.push(cluster);
            currentCluster = [[...currentStation]];
        }

        // Est-ce qu'on a le droit d'ajouter cette station au cluster courant ?
        if (distance <= distMax && !seenStations.has([neighborLongitude, neighborLatitude].toString())) {
            currentCluster.push([neighborLongitude, neighborLatitude]);
        }
    });
}

loadData();
