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

        // Tracé des polygones
        data.voronoiPolygons.forEach(polygon => {
            p.stroke("#787878"); p.strokeWeight(1); p.noFill(); 
            p.beginShape();
            polygon.forEach(point => {
                p.vertex(point[0], point[1])
            });
            p.endShape();
            
        });
        // Placement des stations
        data.stations.forEach(station => {
            const point = map.project(station);
            p.noStroke(); p.fill(49, 163, 84); p.circle(point.x, point.y, 4);
        });
    }
}