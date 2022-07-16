// Create the base layers.
var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
})

var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'

});


// Create our map, giving it the streetmap and earthquakes layers to display on load.
var myMap = L.map("map", {
    center: [
        37.09, -95.71
    ],
    zoom: 5,
    layers: [street, topo]
});

// Create a baseMaps object.
var baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
};

let earthquakes = new L.LayerGroup();
let tectonicplates = new L.LayerGroup();

// Create an overlay object to hold our overlay.
var overlayMaps = {
    Earthquakes: earthquakes,
    "Tectonic Plates": tectonicplates
};



// Create a layer control.
// Pass it our baseMaps and overlayMaps.
// Add the layer control to the map.
L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
}).addTo(myMap);

// Store our API endpoint as queryUrl.
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
    function styleInfo(feature) {
        return {
            opacity: 1,
            fillOpacity: 1,
            fillColor: getColor(feature.geometry.coordinates[2]),
            color: "#000000",
            radius: getRadius(feature.properties.mag),
            stroke: true,
            weight: 0.5
        };
    }

    // This function determines the color of the marker based on the magnitude of the earthquake.
    function getColor(depth) {
        switch (true) {
            case depth > 90:
                return "#ea2c2c";
            case depth > 70:
                return "#ea822c";
            case depth > 50:
                return "#ee9c00";
            case depth > 30:
                return "#eecc00";
            case depth > 10:
                return "#d4ee00";
            default:
                return "#98ee00";
        }
    }


    function getRadius(magnitude) {
        if (magnitude === 0) {
            return 1;
        }

        return magnitude * 4;
    }


    L.geoJson(data, {

        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng);
        },

        style: styleInfo,

        onEachFeature: function (feature, layer) {
            layer.bindPopup(
                "Magnitude: "
                + feature.properties.mag
                + "<br>Depth: "
                + feature.geometry.coordinates[2]
                + "<br>Location: "
                + feature.properties.place
            );
        }
    }).addTo(myMap);

    let legend = L.control({
        position: "bottomright"
    });

    legend.onAdd = function () {
        let div = L.DomUtil.create("div", "info legend");

        const magnitudes = [0, 1, 2, 3, 4, 5];
        const colors = [
            "#98ee00",
            "#d4ee00",
            "#eecc00",
            "#ee9c00",
            "#ea822c",
            "#ea2c2c"
        ];


        for (var i = 0; i < magnitudes.length; i++) {
            console.log(colors[i]);
            div.innerHTML +=
                "<i style='background: " + colors[i] + "'></i> " +
                magnitudes[i] + (magnitudes[i + 1] ? "&ndash;" + magnitudes[i + 1] + "<br>" : "+");
        }
        return div;
    };


    legend.addTo(myMap);

});

d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (platedata) {
    L.geoJson(platedata, {
        color: "#ff6500",
        weight: 2
    })
        .addTo(tectonicplates);

    tectonicplates.addTo(myMap);
});

