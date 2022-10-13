function sketchCircle(p) {
    let table;

    p.preload = function() {
        table = p.loadTable(config.dataPath, "header");
    }

    p.setup = function () {
        const mapTag = document.getElementById("map");
        p.createCanvas(mapTag.offsetWidth , mapTag.offsetHeight);
    }

    p.windowResized = function() {
        const mapTag = document.getElementById("map");
        p.resizeCanvas(mapTag.offsetWidth , mapTag.offsetHeight);
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
            // Charge lente basse puissance en AC
            if (puissance <= 22) p.fill(116,196,118, 100);
            // Charge moyenne puissante en DC
            else if (puissance <= 50) p.fill(49,163,84);
            // Au-delà de 50 kW on se bat pour quelques minutes
            // Charge rapide voire ultra-rapide en DC
            else p.fill(0,109,44);
            // Taille des bornes en fonction du nombre de prises
            let radius;
            if (nbPdc <= 2) radius = 5.0;
            else if (nbPdc <= 4) radius = 8.0;
            else if (nbPdc <= 8) radius = 12.0;
            else if (nbPdc <= 16) radius = 15.0;
            else radius = 17.0;
            p.circle(px, py, radius);
        }
    }
}
