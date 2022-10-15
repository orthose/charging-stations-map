function sketchCircle(p) {
    p.setup = function () {
        const mapTag = document.getElementById("map");
        p.createCanvas(mapTag.offsetWidth , mapTag.offsetHeight);
        p.frameRate(1);
    }

    p.windowResized = function() {
        const mapTag = document.getElementById("map");
        p.resizeCanvas(mapTag.offsetWidth , mapTag.offsetHeight);
    }

    p.draw = function () {
        p.clear();
        // Affichage des bornes de recharge
        for (let row of data.rawTable.getRows()) {
            // Projection de [longitude, latitude] vers les pixels de l'écran
            const point = map.project([row.getNum("longitude"), row.getNum("latitude")]);
            const px = point.x; const py = point.y;
            const puissance = row.getNum("puissance_nominale");
            const nbPdc = row.getNum("nbre_pdc");
            // Couleur des bornes en fonction de la puissance
            p.noStroke();
            // Charge lente basse puissance en AC
            if (puissance <= 22) p.fill(116, 196, 118, 100);
            // Charge moyenne puissante en DC
            else if (puissance <= 50) p.fill(49, 163, 84);
            // Au-delà de 50 kW on se bat pour quelques minutes
            // Charge rapide voire ultra-rapide en DC
            else p.fill(0, 109, 44);
            // Taille des bornes en fonction du nombre de prises
            let radius;
            if (nbPdc <= 2) radius = 4.0;
            else if (nbPdc <= 4) radius = 8.0;
            else if (nbPdc <= 8) radius = 12.0;
            else if (nbPdc <= 16) radius = 16.0;
            else radius = 20.0;
            p.circle(px, py, radius);
        }
    }
}

function sketchLegendCircle(p) {
    p.setup = function () {
        const legendTag = document.getElementById("legend");
        p.createCanvas(legendTag.offsetWidth , legendTag.offsetHeight);
        p.noLoop();
    }
    
    p.windowResized = function() {
        const legendTag = document.getElementById("legend");
        p.resizeCanvas(legendTag.offsetWidth , legendTag.offsetHeight);
    }
    
    p.draw = function () {
        p.stroke(0); p.line(0, 0, p.width, 0);

        // Puissance
        p.stroke(0); p.fill(0); p.textSize(20); p.textAlign(p.LEFT, p.TOP);
        p.text("PUISSANCE", 0.10 * p.width, 0.05 * p.height);

        p.textAlign(p.LEFT, p.CENTER);
        let legend = [["≤ 22 kW", "#74c47663"], ["≤ 50 kW", "#31a354"], ["> 50 kW", "#006d2c"]];
        let offset = 1.5;
        for (let [text, color] of legend) {
            p.noStroke(); p.fill(color);
            p.rect(0.10 * p.width, offset * 0.10 * p.height, 0.10 * p.width, 0.10 * p.height);
            p.stroke(0); p.fill(0); 
            p.text(text, 3 * 0.10 * p.width, (offset + 0.5) * 0.10 * p.height);
            offset += 1;
        }

        // Nombre de prises
        p.stroke(0); p.fill(0); p.textSize(20); p.textAlign(p.LEFT, p.TOP);
        p.text("NOMBRE DE PRISES", 0.10 * p.width, 5 * 0.10 * p.height);

        p.textAlign(p.LEFT, p.CENTER);
        legend = [["≤ 2", 4.0], ["≤ 4", 8.0], ["≤ 8", 12.0]];
        offset = 0;
        for (let [text, radius] of legend) {
            p.stroke(0); p.strokeWeight(1); p.noFill();
            p.circle(0.15 * p.width, (6.25 + offset) * 0.10 * p.height, radius);
            p.fill(0); p.text(text, 3 * 0.10 * p.width, (6.25 + offset) * 0.10 * p.height);
            offset += 1;
        }
        legend = [["≤ 16", 16.0], ["> 16", 20.0]];
        offset = 0;
        for (let [text, radius] of legend) {
            p.stroke(0); p.strokeWeight(1); p.noFill();
            p.circle(0.55 * p.width, (6.25 + offset) * 0.10 * p.height, radius);
            p.fill(0);
            p.text(text, 0.70 * p.width, (6.25 + offset) * 0.10 * p.height);
            offset += 1;
        }
    }
}
