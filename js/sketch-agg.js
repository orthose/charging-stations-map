// Variables pour la modification de la visualisation
let showAvg = false;
let showStd = false;
let showMin = false;
let showMax = false;

function sketchAgg(p) {
    function radiusZoomLevel(distance) {
        return distance / scaleZoomLevel(map.getZoom());
    }

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
            const point = map.project([cluster.lon, cluster.lat]);
            const px = point.x; const py = point.y;
            p.noStroke(); p.fill(49, 163, 84);
            p.circle(px, py, 25);
            p.fill(255);
            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(9);
            p.text(cluster.sum <= 999 ? cluster.sum : "999+", px, py);
            p.stroke(0); p.noFill();
            if (showAvg) p.circle(px, py, 2 * radiusZoomLevel(cluster.distAvg));
            if (showStd) {
                // On veut tracer deux cercles en pointillés encadrant la moyenne
                const deltaPoints = 5; // Distance entre 2 points du cercle
                [radiusZoomLevel(cluster.distAvg + cluster.distStd),
                radiusZoomLevel(cluster.distAvg - cluster.distStd)].forEach(radiusStd => {
                    if (radiusStd > 0 && deltaPoints <= 2 * radiusStd) {
                        // On veut que l'espacement deltaPoints entre deux points du cercle 
                        // soit constant quelle que soit la taille du rayon
                        // Triangle isocèle avec pour base deltaPoints et comme côtés égaux radiusStd
                        let deltaAngle = 2 * Math.asin(deltaPoints / (2 * radiusStd));
                        for(let angle = 0; angle < p.TWO_PI; angle += deltaAngle) {
                            p.circle(px + radiusStd * p.cos(angle), py + radiusStd * p.sin(angle), 1);
                        }  
                    }
                });
            }
            if (showMin) {
                p.stroke(0, 0, 255);
                p.circle(px, py, 2 * radiusZoomLevel(cluster.distMin));
            }
            if (showMax) {
                p.stroke(255, 0, 0);
                p.circle(px, py, 2 * radiusZoomLevel(cluster.distMax));
            }
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
    }
}*/
