class DataModel {
    // Chargement des données brutes
    constructor() {
        let rawTable;
        new p5(function(p) {
            p.preload = function() {
                const table = p.loadTable(config.dataPath, "header");
                rawTable = table;
                p.remove();
            }
        });
        this.rawTable = rawTable;
    }
}