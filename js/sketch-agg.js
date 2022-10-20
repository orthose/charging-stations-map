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
                const pmin = map.project([cluster.min.lon, cluster.min.lat]);
                p.stroke(0, 0, 255);
                p.line(px, py, pmin.x, pmin.y)
            }
            if (showMax) {
                const pmax = map.project([cluster.max.lon, cluster.max.lat]);
                p.stroke(255, 0, 0);
                p.line(px, py, pmax.x, pmax.y)
            }
        }
    }
}

function sketchLegendAgg(p) {
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
        const radius = 0.12 * p.height / 2;
        const cx = (0.10 * p.width) + radius;
        const marginLeft = (0.10 * p.width);
        const beginLegendText = (0.20 * p.width) + 2 * radius;
        let dy = 1.5 * radius;
        
        p.noStroke(); p.fill(49, 163, 84); p.circle(cx, dy, 2 * radius);
        p.fill(255); p.textAlign(p.CENTER, p.CENTER); p.textSize(20); p.text("1", cx, dy);
        p.fill(0); p.textAlign(p.LEFT, p.CENTER); p.text("NOMBRE DE STATIONS", beginLegendText, dy);

        dy += 2 * radius;
        p.stroke(0); p.fill(0); p.textAlign(p.LEFT, p.TOP);
        p.text("DISTANCE AU CENTROÏDE", marginLeft, dy);

        dy += 2.5 * radius;
        p.textAlign(p.LEFT, p.CENTER);
        p.stroke(0); p.noFill(); p.circle(cx, dy, 2 * radius); 
        p.noStroke(); p.fill(0); p.text("MOYENNE", beginLegendText, dy);

        dy += 2.5 * radius;
        p.stroke(0); p.noFill();
        const deltaPoints = 5; 
        if (radius > 0 && deltaPoints <= 2 * radius) {
            let deltaAngle = 2 * Math.asin(deltaPoints / (2 * radius));
            for(let angle = 0; angle < p.TWO_PI; angle += deltaAngle) {
                p.circle(cx + radius * p.cos(angle), dy + radius * p.sin(angle), 1);
            }
        }
        p.noStroke(); p.fill(0); p.text("ÉCART-TYPE", beginLegendText, dy);

        [["#0000ff", "MINIMUM"], ["#ff0000", "MAXIMUM"]].forEach(([color, legendText]) => {
            p.stroke(color); p.strokeWeight(2); dy += 2 * radius; 
            p.line(0.10 * p.width, dy, marginLeft + (2 * radius), dy);
            p.noStroke(); p.strokeWeight(1); p.fill(0); p.text(legendText, beginLegendText, dy);
        });    
    }
}
