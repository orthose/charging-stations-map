let map;
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
        new p5(sketchCircle, "data");
        new p5(sketchLegendCircle, "legend");
    });
}