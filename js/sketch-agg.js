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
            const point = map.project([cluster.lon, cluster.lat]);
            const px = point.x; const py = point.y;
            p.noStroke(); p.fill(49, 163, 84);
            p.circle(px, py, 25);
            p.fill(255);
            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(9);
            p.text(cluster.sum <= 999 ? cluster.sum : "999+", px, py);
            p.stroke(0); p.noFill();
            p.circle(px, py, 2 * (cluster.distAvg / scaleZoomLevel(map.getZoom())));
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
