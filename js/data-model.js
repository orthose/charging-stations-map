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

// Découpage des clusters pré-calculés en fonction de distMax
// et calcul des centroïdes selon la moyenne des clusters
data.computeClusters = function(distMax=100_000) {
    // Utilisation d'un thread séparé pour éviter de geler l'interface
    if (window.Worker) {
        let worker = new Worker("js/worker-compute-clusters.js");
        worker.postMessage([data.stations, distMax]);
        worker.onmessage = function(msg) {
            data.clusters = msg.data;
        }
    } else {
        data.clusters = computeClusters(data.stations, distMax);
    }
}

data.filterYear = function(startYear, stopYear) {
    data.rawTable = data.privateRawTable.filter(x => {
        const year = parseInt((new Date(x.date_mise_en_service)).getFullYear());
        return startYear <= year && year <= stopYear; 
    });
    data.loadStations(); data.computeClusters();
}

data.filterPuissance = function(startPuissance, stopPuissance) {
    data.rawTable = data.privateRawTable.filter(x => {
        return startPuissance <= x.puissance_nominale && x.puissance_nominale <= stopPuissance; 
    });
    data.loadStations(); data.computeClusters();
}

data.loadData();
