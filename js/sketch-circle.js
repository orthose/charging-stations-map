function sketchCircle(p) {
    let table;

    p.preload = function() {
        table = p.loadTable(config.dataPath, "header");
    }

    p.setup = function () {
        const mapTag = document.getElementById("map");
        p.createCanvas(mapTag.offsetWidth , mapTag.offsetHeight);
    }

    p.draw = function () {
        p.clear();
        // Affichage des bornes de recharge
        for (let row of table.getRows()) {
            // Projection de [longitude, latitude] vers les pixels de l'écran
            const point = map.project([row.getNum("consolidated_longitude"), row.getNum("consolidated_latitude")]);
            const px = point.x; const py = point.y;
            const puissance = row.getNum("puissance_nominale");
            const nbPdc = row.getNum("nbre_pdc");
            // Couleur des bornes en fonction de la puissance
            p.noStroke();
            if (puissance <= 7) p.fill(100, 255, 100, 75);
            else if (puissance <= 22) p.fill(0, 200, 0, 75);
            else if (puissance <= 50) p.fill(255, 100, 0, 75);
            else if (puissance <= 150) p.fill(255, 150, 0, 75);
            else if (puissance <= 250) p.fill(255, 100, 100, 75);
            else p.fill(255, 0, 0, 75);
            // Taille des bornes en fonction du nombre de prises
            let radius;
            if (nbPdc <= 2) radius = 5.0;
            else if (nbPdc <= 4) radius = 8.0;
            else if (nbPdc <= 8) radius = 12.0;
            else if (nbPdc <= 16) radius = 15.0;
            else radius = 12.0;
            p.circle(px, py, radius);
        }
    }
}
