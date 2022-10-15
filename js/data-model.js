class DataModel {
    // Chargement des données brutes
    constructor() {
        const rawData = {};
        new p5(function(p) {
            let table;

            p.preload = function() {
                table = p.loadTable(config.dataPath, "header");
            }
        
            p.setup = function () {
                p.noLoop();
                for (let colName of table.columns) {
                    rawData[colName] = [];
                }
                const numericalCols = ["longitude", "latitude", "puissance_nominale", "nbre_pdc"];
                for (let row of table.getRows()) {
                    for (let colName of numericalCols) {
                        rawData[colName].push(row.getNum(colName));
                    }
                    for (let colName of table.columns) {
                        if (numericalCols.indexOf(colName) === -1) {
                            rawData[colName].push(row.getString(colName));
                        }
                    }
                }
                rawData["numRows"] = rawData["longitude"].length;
                p.remove()
            }
        });
        this.rawData = rawData;
    }
}