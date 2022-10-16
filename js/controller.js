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
        let lastZoom = 5;
        let sketchLocationIsLoaded = false;

        function zoomCallback(enforce=false) {
            const sketchAggIsSelected = document.getElementById("button-agg").className === "selected";
            let currentZoom = map.getZoom();
            // Calcul des clusters par rapport au zoom avec un pas de 1
            if ((sketchAggIsSelected && (lastZoom+1 <= currentZoom || currentZoom <= lastZoom)) || enforce) {
                // On a suffisamment dézoomé pour afficher l'agrégation
                if (currentZoom <= lastZoom && lastZoom >= 8) {
                    sketchLocationIsLoaded = false;
                    mainSketch.remove();
                    mainSketch = new p5(sketchAgg, "data");
                }
                currentZoom = Math.floor(currentZoom);
                let distMax = 100_000;
                if (currentZoom === 5) distMax = 100_000;
                else if (currentZoom === 6) distMax = 50_000;
                else if (currentZoom === 7) distMax = 30_000;
                // Afficher la localisation des bornes au-delà du niveau de zoom 8
                else if (currentZoom >= 8 && !sketchLocationIsLoaded) {
                    sketchLocationIsLoaded = true;
                    mainSketch.remove();
                    mainSketch = new p5(sketchLocation, "data");
                }
                if (currentZoom < 8) computeClusters(distMax=distMax);
                lastZoom = currentZoom;
            }
        }
        map.on("zoom", zoomCallback);
        
        // Choix de l'onglet de visualisation
        document.getElementById("visu-choice").addEventListener("click", function(event) {
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
                    sketchLocationIsLoaded = false;
                    zoomCallback(enforce=true);
                    legendSketch = null;
                }
            }
        });

        // Contrôles pour les filtres
        let dates = data.rawTable.map(x => x.date_mise_en_service);
        dates = dates.sort((x, y) => {
            const t1 = new Date(x).getTime();
            const t2 = new Date(y).getTime();
            if (t1 > t2) return 1;
            else if (t2 < t2) return - 1;
            else return 0;
        });
        const minYear = (new Date(dates[0])).getFullYear();
        const maxYear = (new Date(dates[dates.length-1])).getFullYear();

        // https://refreshless.com/nouislider/
        let dateSlider = document.getElementById('slider-date');
        dateSlider.style.margin = "40px 23px 10px 23px";
        noUiSlider.create(dateSlider, {
            // Create two timestamps to define a range.
            range: {
                min: minYear,
                max: maxYear
            },
            // Couleur entre les curseurs
            connect: true,
            // Pas de une année
            step: 1,
            // Two more timestamps indicate the handle starting positions.
            start: [minYear, maxYear],
            // Indicateur de l'année sélectionnée
            tooltips: true,
            // Pas de décimales
            format: {
                to: (v) => v | 0,
                from: (v) => v | 0
            }
        });
        dateSlider.noUiSlider.on("update", function(values, handle) {
            filterYear(values[0], values[1]);
        });
    });
}
