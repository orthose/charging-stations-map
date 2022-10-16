function sketchAgg(p) {
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
        for (let cluster of data.clusters) {
            // Projection de [longitude, latitude] vers les pixels de l'écran
            const point = map.project([cluster.longitude, cluster.latitude]);
            const px = point.x; const py = point.y;
            p.stroke(0);
            p.circle(px, py, 5);
            // Afficher somme mettre 100 km de distance
        }
    }
}

/*function sketchLegendAgg(p) {
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
}*/
