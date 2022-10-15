let stationInfo = null; 

function sketchLocation(p) {
    let table; 
    let imgStationGreen, imgStationYellow;
    let selectedStation = null;
    const ratio = 0.10;
    let w, h;

    p.preload = function() {
        table = p.loadTable(config.dataPath, "header");
        imgStationGreen = p.loadImage('img/station-location-green.png');
        imgStationYellow = p.loadImage('img/station-location-orange.png');
    }

    p.setup = function () {
        const mapTag = document.getElementById("map");
        p.createCanvas(mapTag.offsetWidth , mapTag.offsetHeight);
        p.frameRate(1);
        w = ratio * imgStationGreen.width;
        h = ratio * imgStationGreen.height;
    }

    p.windowResized = function() {
        const mapTag = document.getElementById("map");
        p.resizeCanvas(mapTag.offsetWidth , mapTag.offsetHeight);
    }

    p.draw = function () {
        p.clear();
        // Affichage des bornes de recharge
        for (let row of table.getRows()) {
            // Projection de [longitude, latitude] vers les pixels de l'écran
            const point = map.project([row.getNum("longitude"), row.getNum("latitude")]);
            const px = point.x; const py = point.y;
            // Si station sélectionnée par l'utilisateur elle apparaît orange
            const img = selectedStation !== null 
                && selectedStation[0] === row.getNum("longitude")
                && selectedStation[1] === row.getNum("latitude") 
                ? imgStationYellow : imgStationGreen;
            p.image(img, px - (w / 2), py - h, w, h);
        }
    }

    p.mouseClicked = function() {
        if (p.mouseButton === p.LEFT) {
            for (let row of table.getRows()) {
                const point = map.project([row.getNum("longitude"), row.getNum("latitude")]);
                // Station sélectionnée par l'utilisateur
                if (point.x - (w / 2) <= p.mouseX 
                    && p.mouseX <= point.x + (w / 2)
                    && point.y - h <= p.mouseY && p.mouseY <= point.y) {
                    // Variable utilisée par draw
                    selectedStation = [row.getNum("longitude"), row.getNum("latitude")];
                    // Récupération des infos de la station et affichage en légende
                    legendLocation(row);
                    break;
                }
            }
        }
    }
}

function legendLocation(row) {
    const cols = [
        ["nom_operateur", "Opérateur"],
        ["contact_operateur", "Mail"],
        ["telephone_operateur", "Téléphone"],
        ["id_station_itinerance", "Id Itinérance"],
        ["id_station_local", "Id Local"],
        ["nom_station", "Nom"],
        ["implantation_station", "Implantation"],
        ["adresse_station", "Adresse"],
        ["nbre_pdc", "Nombre Prises"],
        ["puissance_nominale", "Puissance (kW)"],
        ["tarification", "Tarification"],
        ["condition_acces", "Accès"],
        ["raccordement", "Raccordement"],
        ["num_pdl", "Point Livraison"],
        ["date_mise_en_service", "Mise en Service"]
    ];
    let tableLegend = document.createElement("table");
    for ([colName, thName] of cols) {
        let tr = document.createElement("tr");
        let th = document.createElement("th");
        th.innerHTML = thName;
        let td = document.createElement("td");
        td.innerHTML = row.getString(colName);
        tr.appendChild(th); tr.appendChild(td);
        tableLegend.appendChild(tr);
    }
    const legend = document.getElementById("legend")
    legend.innerHTML = ""; legend.appendChild(tableLegend);
}
