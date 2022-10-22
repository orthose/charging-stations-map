// Variables pour la modification de la visualisation
let showStation = false;
let showPower = false;
let showOperator = false;

function sketchVoronoi(p) {
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
        // Attention: data.computeVoronoi applique un filtre pour n'afficher
        // que les stations visibles en fonction du niveau de zoom
        data.voronoiPolygons.forEach((polygon, i) => {
            p.stroke("#787878"); p.strokeWeight(1);
            // Affichage des niveaux de puissance
            if (showPower) {
                const puissance = data.rawTable[data.stationsVoronoi[i].nrow].puissance_nominale;
                // Charge lente basse puissance en AC
                if (puissance <= 22) p.fill(116, 196, 118, 200);
                // Charge moyenne puissante en DC
                else if (puissance <= 50) p.fill(49, 163, 84, 200);
                // Au-delà de 50 kW on se bat pour quelques minutes
                // Charge rapide voire ultra-rapide en DC
                else p.fill(0, 109, 44, 200);

            } else if (showOperator) {
                p.fill(255, 255, 255, 200); // Remplissage par défaut
                const currentOperator = data.rawTable[data.stationsVoronoi[i].nrow].nom_operateur;
                for (let [operator, color] of data.mainOperators) {
                    if (currentOperator === operator) {
                        p.fill(color+"c8"); break;
                    }
                }
            } else {p.noFill();} 
            // Tracé des polygones
            p.beginShape();
            polygon.forEach(point => {
                p.vertex(point[0], point[1])
            });
            p.endShape();

            // Placement des stations
            if (showStation) {
                const station = data.stationsVoronoi[i];
                let diameter = 4;
                if (showPower || showOperator) { 
                    p.fill(0); diameter = 2;
                }
                else p.fill(49, 163, 84);
                p.noStroke(); p.circle(station.px, station.py, diameter);
            }
        });  
    }
}

function sketchLegendVoronoiPower(p) {
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
        p.stroke(0); p.fill(0); p.textSize(20); p.textAlign(p.LEFT, p.TOP);
        p.text("PUISSANCE", 0.10 * p.width, 0.05 * p.height);
        p.textAlign(p.LEFT, p.CENTER);
        let legend = [["≤ 22 kW", "#74c476"], ["≤ 50 kW", "#31a354"], ["> 50 kW", "#006d2c"]];
        let offset = 1.5;
        for (let [text, color] of legend) {
            p.noStroke(); p.fill(color);
            p.rect(0.10 * p.width, offset * 0.10 * p.height, 0.10 * p.width, 0.10 * p.height);
            p.noStroke(); p.fill(0); 
            p.text(text, 3 * 0.10 * p.width, (offset + 0.5) * 0.10 * p.height);
            offset += 1;
        }
    }
}

function sketchLegendVoronoiOperator(p) {
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
        let px = 0.10 * p.width;
        let dy = 0.025 * p.height;
        const rectWidth = px;
        const rectHeight = 0.05 * p.height;
        p.stroke(0); p.fill(0); p.textSize(20); p.textAlign(p.LEFT, p.TOP);
        p.text("OPÉRATEUR", px, dy);
        p.textAlign(p.LEFT, p.CENTER); dy += 0.025 * p.height;
        data.mainOperators.forEach(([operator, color]) => {
            dy += 0.05 * p.height;
            p.noStroke(); p.fill(color+"c8");
            p.rect(px, dy, rectWidth, rectHeight);
            p.noStroke(); p.fill(0); 
            p.text(operator, 2 * px + rectWidth, dy + (rectHeight / 2));
            dy += 0.025 * p.height;
        });
    }
}
