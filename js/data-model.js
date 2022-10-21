// En raison de problèmes avec this dans la Promise
// Je préfère utiliser un objet global plutôt qu'une classe
const data = {
    rawTable: [], // Table à laquelle accède les sketchs
    privateRawTable: [], // Table de référence à ne pas lire
    stations: [], // [{lon:, lat:, nrow:}...]
    clusters: [], // [{lng:,lat:,sum:,distMin:,distMax:,distAvg:,distStd:}...]
    stationsVoronoi: [], // [{px:,py:,nrow:}...]
    voronoiPolygons: [], // [[[px1, py2], [px2, py2]...]...]
    mainOperators: [], // ["IONITY"...]
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

                // Chargement des opérateurs principaux
                p.loadJSON(config.mainOperatorsPath, function(json) {
                    data.mainOperators = json;
                    p.remove(); resolve();
                });
            });
        });
    });
}

data.loadStations = function() {
    data.stations = [];
    const seen = new Set();
    const longitude = data.rawTable.map(x => x.longitude);
    const latitude = data.rawTable.map(x => x.latitude);
    for (let i = 0; i < data.rawTable.length; i++) {
        const coord = [longitude[i], latitude[i]].toString();
        // Suppression des coordonnées dupliquées
        if (!seen.has(coord)) {
            seen.add(coord);
            // nrow permet de joindre la station avec rawTable
            data.stations.push({lon: longitude[i], lat: latitude[i], nrow: i});
        }
    }
}

// Découpage des clusters pré-calculés en fonction de distMax
// et calcul des centroïdes selon la moyenne des clusters
data.computeClusters = function(distMax=100_000) {
    const stations = data.stations.map(station => [station.lon, station.lat]);
    // Utilisation d'un thread séparé pour éviter de geler l'interface
    if (window.Worker) {
        let worker = new Worker("js/worker-compute-clusters.js");
        worker.postMessage([stations, distMax]);
        worker.onmessage = function(msg) {
            data.clusters = msg.data;
        }
    } else {
        data.clusters = computeClusters(stations, distMax);
    }
}

data.computeVoronoi = function() {
    // Projection des [longitude, latitude] vers l'espace des pixels
    const stationsVoronoi = data.stations.map(station => {
        const point = map.project([station.lon, station.lat]);
        return {px: point.x, py: point.y, nrow: station.nrow};
    });
    // Suppression des outliers en dehors de l'écran
    const mapTag = document.getElementById("map");
    const width = mapTag.offsetWidth;
    const height = mapTag.offsetHeight;
    data.stationsVoronoi = stationsVoronoi.filter(station => 
        0 <= station.px && station.px <= width
        && 0 <= station.py && station.py <= height
    );
    const delaunay = d3.Delaunay.from(data.stationsVoronoi.map(station => [station.px, station.py]));
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
