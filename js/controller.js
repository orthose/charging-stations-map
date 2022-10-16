let map;
let mainSketch = null;
let legendSketch = null;

// Montluçon comme ville de référence car au centre de la France
const referenceTown = [2.6 , 46.333328];

// Échelle en mètres par pixel selon la latitude et le niveau de zoom
// https://docs.mapbox.com/help/glossary/zoom-level/#zoom-levels-and-geographical-distance
// https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Resolution_and_Scale
// https://wiki.openstreetmap.org/wiki/Zoom_levels
function scaleZoomLevel(zoomLevel, latitude=referenceTown[1]) {
    return 156543.03 * Math.cos(radians(latitude)) / Math.pow(2, zoomLevel+1);
}

window.onload = () => {
    mapboxgl.accessToken = config.mapboxToken;
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: referenceTown, // [lng, lat]
        zoom: 5,
        projection: 'globe'
    });
    map.addControl(new mapboxgl.NavigationControl());
    const scale = new mapboxgl.ScaleControl({
        maxWidth: 80,
        unit: 'metric'
    });
    map.addControl(scale);
    map.on('style.load', () => {
        map.setFog({}); // Set the default atmosphere style

        // Par défaut représentation de la localisation des bornes
        document.getElementById("button-location").className = "selected";
        mainSketch = new p5(sketchLocation, "data");

        // Si on zoom il faut recalculer les clusters pour l'agrégation
        map.on("zoom", () => {
            console.log(map.getZoom());
        });
        
        // Contrôleur pour l'interaction utilisateur
        document.getElementById("controller").addEventListener("click", function(event) {
            const currentId = document.getElementsByClassName("selected")[0].id;
            if (event.target.tagName === "BUTTON" && event.target.id !== currentId) {
                // Libération de la représentation précédente
                document.getElementsByClassName("selected")[0].className = "";
                document.getElementById(event.target.id).className = "selected";
                if (mainSketch !== null) mainSketch.remove();
                if (legendSketch !== null) legendSketch.remove();
                document.getElementById("legend").innerHTML = "";
                
                // Changement de représentation
                if (event.target.id === "button-location") {
                    mainSketch = new p5(sketchLocation, "data");
                    legendSketch = null;
                }
                else if (event.target.id === "button-circle") {
                    mainSketch = new p5(sketchCircle, "data");
                    legendSketch = new p5(sketchLegendCircle, "legend");
                }
                else if (event.target.id === "button-agg") {
                    mainSketch = new p5(sketchAgg, "data");
                    legendSketch = null;
                }
            }
        });
    });
}