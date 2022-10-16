let map;
let mainSketch = null;
let legendSketch = null;

window.onload = () => {
    mapboxgl.accessToken = config.mapboxToken;
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [2.6 , 46.333328], // [lng, lat]
        zoom: 5,
        projection: 'globe'
    });
    map.addControl(new mapboxgl.NavigationControl());
    map.on('style.load', () => {
        map.setFog({}); // Set the default atmosphere style

        // Par défaut représentation de la localisation des bornes
        document.getElementById("button-location").className = "selected";
        mainSketch = new p5(sketchLocation, "data");
        
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