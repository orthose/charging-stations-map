// En raison de problèmes avec this dans la Promise
// Je préfère utiliser un objet global plutôt qu'une classe
const data = {
    rawTable: [], // Table à laquelle accède les sketchs
    privateRawTable: [], // Table de référence à ne pas lire
    stations: [], // [[longitude, latitude]...]
    clusters: [], // [{lng:,lat:,sum:,distMin:,distMax:,distAvg:,distStd:}...]
    voronoiPolygons: [],
    filters:  {
        startYear: null, stopYear: null,
        startPuissance: null, stopPuissance: null,
        typeEF: 2, type2: 2, 
        typeComboCCS: 2,typeChademo: 2,
        gratuit: 2
    }
};

// Chargement asynchrone des données
data.loadData = function() {
    return new Promise((resolve, reject) => {
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
                
                // Initialisation des filtres
                let dates = data.rawTable.map(x => x.date_mise_en_service);
                dates = dates.sort((x, y) => {
                const t1 = new Date(x).getTime();
                const t2 = new Date(y).getTime();
                    if (t1 > t2) return 1;
                    else if (t2 < t2) return - 1;
                    else return 0;
                });
                data.filters.startYear = (new Date(dates[0])).getFullYear();
                data.filters.stopYear = (new Date(dates[dates.length-1])).getFullYear();

                let puissances = data.rawTable.map(x => x.puissance_nominale);
                data.filters.startPuissance = Math.min(...puissances);
                data.filters.stopPuissance = Math.max(...puissances);
                
                // Table de référence à ne pas modifier
                data.privateRawTable = [...data.rawTable];

                data.loadStations(); 
                data.computeClusters(); 
                data.computeVoronoi();
                p.remove(); resolve();
            });
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

data.computeVoronoi = function() {
    let stationsPixels = data.stations.map(station => {
        const point = map.project([station[0], station[1]]);
        return [point.x, point.y];
    }); console.log(stationsPixels.length)
    // Suppression des outliers en dehors de l'écran
    const mapTag = document.getElementById("map");
    const width = mapTag.offsetWidth;
    const height = mapTag.offsetHeight;
    stationsPixels = stationsPixels.filter(station => 
        0 <= station[0] && station[0] <= width
        && 0 <= station[1] && station[1] <= height
    ); console.log(stationsPixels.length)
    const delaunay = d3.Delaunay.from(stationsPixels);
    // Bordures à spécifier pour éviter les polygones infinis sur les bords de la France
    const voronoi = delaunay.voronoi([0, 0, width, height]);
    data.voronoiPolygons = [...voronoi.cellPolygons()];
}

data.applyFilters = function() {
    const filterBoolCol = function(x, colName, filterCond) {
        return filterCond === 2 || (filterCond === 1 && x[colName] === "true") || (filterCond === 0 && x[colName] === "false");
    }
    data.rawTable = data.privateRawTable.filter(x => {
        const year = parseInt((new Date(x.date_mise_en_service)).getFullYear());
        return data.filters.startYear <= year && year <= data.filters.stopYear
            && data.filters.startPuissance <= x.puissance_nominale && x.puissance_nominale <= data.filters.stopPuissance
            && filterBoolCol(x, "prise_type_ef", data.filters.typeEF) 
            && filterBoolCol(x, "prise_type_2", data.filters.type2) 
            && filterBoolCol(x, "prise_type_combo_ccs", data.filters.typeComboCCS)
            && filterBoolCol(x, "prise_type_chademo", data.filters.typeChademo) 
            && filterBoolCol(x, "gratuit", data.filters.gratuit);
    }); 
    data.loadStations(); 
    data.computeClusters(); 
    data.computeVoronoi();
}
