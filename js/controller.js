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

    // Chargement de la carte
    map.on('style.load', () => {
        map.setFog({}); // Set the default atmosphere style
        // Chargement des données
        data.loadData().then(_ => {
            // Par défaut représentation de la localisation des bornes
            document.getElementById("button-location").className = "selected";
            mainSketch = new p5(sketchLocation, "data");

            // Si on zoom il faut recalculer les clusters pour l'agrégation
            let lastZoom = 5;
            let sketchLocationIsLoaded = false;

            function zoomCallback(enforce=false) {
                // Si on zoom il faut recalculer le diagramme de Voronoï
                // car la projection des longitudes, latitudes change
                if (document.getElementById("button-voronoi").className === "selected") {
                    data.computeVoronoi();
                }
                else if (document.getElementById("button-agg").className === "selected") {   
                    let currentZoom = map.getZoom();
                    // Calcul des clusters par rapport au zoom avec un pas de 1
                    if ((lastZoom+1 <= currentZoom || currentZoom <= lastZoom) || enforce) {
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
                        if (currentZoom < 8) {data.computeClusters(distMax=distMax);}
                        lastZoom = currentZoom;
                    }
                }
            }
            map.on("zoom", function() {zoomCallback();});
            map.on("mouseup", function() {
                if (document.getElementById("button-voronoi").className === "selected") {
                    data.computeVoronoi();
                }
            })

            function removeLegend() {
                if (legendSketch !== null) legendSketch.remove();
                document.getElementById("legend").innerHTML = "";
            }
            
            // Choix de l'onglet de visualisation
            document.getElementById("visu-choice").addEventListener("click", function(event) {
                const currentId = document.getElementsByClassName("selected")[0].id;
                if (event.target.tagName === "BUTTON" && event.target.id !== currentId) {
                    // Libération de la représentation précédente
                    document.getElementsByClassName("selected")[0].className = "";
                    document.getElementById(event.target.id).className = "selected";
                    if (mainSketch !== null) mainSketch.remove();
                    document.getElementById("visu-tools").innerHTML = "";
                    removeLegend();
                    
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
                        // Affichage des outils de personnalisation de la visualisation
                        [["slider-avg", "MOYENNE", (v) => {showAvg = v[0] === 1;}],
                        ["slider-std", "ÉCART-TYPE", (v) => {showStd = v[0] === 1;}],
                        ["slider-min", "MINIMUM", (v) => {showMin = v[0] === 1;}],
                        ["slider-max", "MAXIMUM", (v) => {showMax = v[0] === 1;}]]
                        .forEach(([sliderId, labelName, callback]) => {
                            let sliderCheckbox = document.createElement("div");
                            sliderCheckbox.id = sliderId; sliderCheckbox.className = "slider-checkbox";
                            const label = document.createElement("label");
                            label.appendChild(sliderCheckbox); label.innerHTML += labelName;
                            document.getElementById("visu-tools").appendChild(label);
                            sliderCheckbox = document.getElementById(sliderId);
                            sliderCheckbox.style.margin = "3px 35px 10px 23px";
                            sliderCheckbox.style.width = "25%";
                            noUiSlider.create(sliderCheckbox, {
                                start: 0, range: {min: 0, max: 1},step: 1, snap: true, 
                                connect: "lower", tooltips: false,
                                format: {to: (v) => v | 0, from: (v) => v | 0}
                            });
                            sliderCheckbox.noUiSlider.on("update", callback);
                        });
                        mainSketch = new p5(sketchAgg, "data");
                        sketchLocationIsLoaded = false;
                        // Calcul des clusters en fonction du niveau de zoom actuel
                        zoomCallback(enforce=true);
                        legendSketch = new p5(sketchLegendAgg, "legend");
                    }
                    else if (event.target.id === "button-voronoi") {
                        // Calcul du diagramme de Voronoï
                        data.computeVoronoi();
                        // Affichage des outils de personnalisation de la visualisation
                        const sliders = [["slider-station", "STATION", (v) => {showStation = v[0] === 1;}],
                        ["slider-power", "PUISSANCE", (v) => {
                            if (v[0] === 1) document.getElementById("slider-operator").noUiSlider.set(0);
                            showPower = v[0] === 1;
                            if (showPower) {
                                removeLegend();
                                legendSketch = new p5(sketchLegendVoronoiPower, "legend");
                            }
                        }],
                        ["slider-operator", "OPÉRATEUR", (v) => {
                            if (v[0] === 1) document.getElementById("slider-power").noUiSlider.set(0);
                            showOperator = v[0] === 1;
                            if (showOperator) {
                                removeLegend();
                                legendSketch = new p5(sketchLegendVoronoiOperator, "legend");
                            }
                        }]];
                        sliders.forEach(([sliderId, labelName, _]) => {
                            let sliderCheckbox = document.createElement("div");
                            sliderCheckbox.id = sliderId; sliderCheckbox.className = "slider-checkbox";
                            const label = document.createElement("label");
                            label.appendChild(sliderCheckbox); label.innerHTML += labelName;
                            document.getElementById("visu-tools").appendChild(label);
                            sliderCheckbox = document.getElementById(sliderId);
                            sliderCheckbox.style.margin = "3px 35px 10px 23px";
                            sliderCheckbox.style.width = "25%";
                            noUiSlider.create(sliderCheckbox, {
                                start: 0, range: {min: 0, max: 1},step: 1, snap: true, 
                                connect: "lower", tooltips: false,
                                format: {to: (v) => v | 0, from: (v) => v | 0}
                            });   
                        });
                        // Comme on utilise l'event update on est obligés de créer les sliders avant
                        sliders.forEach(([sliderId, _, callback]) => {
                            document.getElementById(sliderId).noUiSlider.on("update", callback);
                        });
                        mainSketch = new p5(sketchVoronoi, "data");
                    }
                }
            });

            // Contrôles pour les filtres
            // https://refreshless.com/nouislider/
            const dateSlider = document.getElementById("slider-date");
            dateSlider.style.margin = "28px 35px 10px 23px";
            noUiSlider.create(dateSlider, {
                // Create two timestamps to define a range.
                range: {
                    min: data.filters.startYear,
                    max: data.filters.stopYear,
                    "10%": 2000,
                    "20%": 2015
                },
                // Couleur entre les curseurs
                connect: true,
                // Pas de 1 an
                step: 1,
                start: [data.filters.startYear, data.filters.stopYear],
                // Indicateur de l'année sélectionnée
                tooltips: true,
                // Pas de décimales
                format: {
                    to: (v) => v | 0,
                    from: (v) => v | 0
                }
            });
            dateSlider.noUiSlider.on("change", function(values, _) {
                data.filters.startYear = values[0];
                data.filters.stopYear = values[1];
                data.applyFilters();
            });

            const puissanceSlider = document.getElementById("slider-puissance");
            puissanceSlider.style.margin = "32px 35px 10px 23px";
            noUiSlider.create(puissanceSlider, {
                start: [data.filters.startPuissance, data.filters.stopPuissance],
                range: {"min": data.filters.startPuissance, "max": data.filters.stopPuissance,
                    "10%":3, "20%":7, "30%":11, "40%":22, "50%":50, "60%":100, "70%":150, "80%":250, "90%":350},
                connect: true, snap: true, // Faire des sauts entre valeur  
                tooltips: {to: x => x + " kW", from: x => Number(x.split(" ")[0])},
                format: {to: (v) => v | 0, from: (v) => v | 0}
            });
            puissanceSlider.noUiSlider.on("change", function(values, _) {
                data.filters.startPuissance = values[0];
                data.filters.stopPuissance = values[1];
                data.applyFilters();
            });

            const sliderTypeEF = document.getElementById("slider-type-ef");
            sliderTypeEF.style.margin = "36px 35px 10px 23px";
            sliderTypeEF.style.width = "45%";
            noUiSlider.create(sliderTypeEF, {
                start: 2,
                range: {min: 0, max: 2},
                step: 1, connect: "lower",  
                tooltips: false,
                // Affichage des valeurs FAUX, VRAI, N/A
                pips: {mode: "count", values: 3, format: {
                    to: x => {
                        if (x === 0) return "FAUX";
                        else if (x === 1) return "VRAI";
                        else if (x === 2) return "N/A";    
                    }, from : x => {
                        if (x === "FAUX") return 0;
                        else if (x === "VRAI") return 1;
                        else if (x === "N/A") return 2;
                    }
                }},
                format: {to: (v) => v | 0, from: (v) => v | 0}
            });
            // Suppression de la barre de graduation
            document.querySelectorAll("div.noUi-marker.noUi-marker-horizontal.noUi-marker-normal")
            .forEach(x => x.remove());
            sliderTypeEF.noUiSlider.on("change", function(values, _) {
                data.filters.typeEF = values[0]; data.applyFilters();
            });

            [["slider-type-2", (cond) => {data.filters.type2 = cond;}], 
            ["slider-combo-ccs", (cond) => {data.filters.typeComboCCS = cond;}], 
            ["slider-chademo", (cond) => {data.filters.typeChademo = cond;}], 
            ["slider-gratuit", (cond) => {data.filters.gratuit = cond;}]].forEach(([sliderId, filterFun]) => {
                const sliderCheckbox = document.getElementById(sliderId);
                sliderCheckbox.style.margin = "3px 35px 10px 23px";
                sliderCheckbox.style.width = "45%";
                noUiSlider.create(sliderCheckbox, {
                    start: 2, range: {min: 0, max: 2},step: 1, connect: "lower", tooltips: false,
                    format: {to: (v) => v | 0, from: (v) => v | 0}});
                sliderCheckbox.noUiSlider.on("change", function(values, _) {
                    filterFun(values[0]); data.applyFilters();
                });
            });

            // Remise à zéro des sliders
            document.getElementById("button-reset").addEventListener("click", function() {
                document.querySelectorAll(".noUi-target").forEach(slider => {
                    slider.noUiSlider.reset();
                });
                // Les sliders dans filters ne réagissent pas car il n'attendent pas d'event update
                const [startYear, stopYear] = document.getElementById("slider-date").noUiSlider.get();
                data.filters.startYear = startYear;
                data.filters.stopYear = stopYear;
                const [startPuissance, stopPuissance] = document.getElementById("slider-puissance").noUiSlider.get();
                data.filters.startPuissance = startPuissance;
                data.filters.stopPuissance = stopPuissance;
                data.filters.typeEF = document.getElementById("slider-type-ef").noUiSlider.get();
                data.filters.type2 = document.getElementById("slider-type-2").noUiSlider.get();
                data.filters.typeComboCCS = document.getElementById("slider-combo-ccs").noUiSlider.get();
                data.filters.typeChademo = document.getElementById("slider-chademo").noUiSlider.get();
                data.filters.gratuit = document.getElementById("slider-gratuit").noUiSlider.get();
                data.applyFilters();
            });
        });
    });
}
