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