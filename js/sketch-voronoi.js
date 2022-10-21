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
        p.clear(); p.stroke(0); let i = 0;
        for (let polygon of data.voronoiPolygons) {
            // Tracé du polygone
            p.noFill(); 
            p.beginShape();
            polygon.forEach(point => {
                p.vertex(point[0], point[1])
            });
            p.endShape();
            // Placement de la station
            const point = map.project(data.stations[i]);
            p.fill(255, 0, 0); p.circle(point.x, point.y, 5);
            i += 1;
        }
    }
}