// URL for the GeoJSON data
const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

// Add a Leaflet tile layer.
let streets = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// Create a Leaflet map object.
var myMap = L.map("map", {
    center: [37.70, -124.71],
    zoom: 3,
    layers: [streets]
});


//Define basemaps as the streetmap
let baseMaps = {
    "streets": streets
};

//Define the earthquake layergroup and tectonic plate layergroups for the map
let earthquake_data = new L.LayerGroup();
let tectonics_data = new L.LayerGroup();

//define the overlays and link the layergroups to separate overlays
let overlays = {
    "Earthquakes": earthquake_data,
    "Tectonic Plates": tectonics_data
};

//Add a control layer and pass in baseMaps and overlays
L.control.layers(baseMaps, overlays).addTo(myMap);

//StyleInfo function will dictate the styling for all of the earthquake points on the map from JSON file
//Sets radius based on magnitude 
//Sets fillColor based on the depth of the earthquake
function styleInfo(feature) {
    return {
        color: chooseColor(feature.geometry.coordinates[2]),
        radius: chooseRadius(feature.properties.mag), 
        fillColor: chooseColor(feature.geometry.coordinates[2]) 
    }
};

//Define a function to choose the fillColor based on earthquake depth
function chooseColor(depth) {
    if (depth <= 10) return "green";
    else if (depth > 10 & depth <= 25) return "rgb(223, 255, 0)";
    else if (depth > 25 & depth <= 40) return "rgb(236, 255, 220)";
    else if (depth > 40 & depth <= 55) return "yellow";
    else if (depth > 55 & depth <= 70) return "orange";
    else return "red";
};

//Define a function to determine the radius of each earthquake marker
function chooseRadius(magnitude) {
    return magnitude*5;
};

//Pull the earthquake JSON data with d3
//Point to layer function that takes a feature and lat/lon
//Function creates a circleMarker at lat/lon and binds a popup with the earthquake id
//Style the CircleMarker with the styleInfo function as defined above
//Add the earthquake data to the earthquake_data layergroup / overlay
d3.json(url).then(function (data) { 
    L.geoJson(data, {
        pointToLayer: function (feature, latlon) {  
            return L.circleMarker(latlon).bindPopup(feature.id); 
        },
        style: styleInfo 
    }).addTo(earthquake_data); 
    earthquake_data.addTo(myMap);

    //Function pulls the tectonic plate data and draws a purple line over the plates
    //Sets the line color
    //Add the tectonic data to the tectonic layergroup / overlay
    //Pulls tectonic data with d3.json
    d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (data) { 
        L.geoJson(data, {
            color: "orange",  
            weight: 1
        }).addTo(tectonics_data); 
        tectonics_data.addTo(myMap);
    });


});
//Create legend with https://codepen.io/haakseth/pen/KQbjdO --  structure is referenced in style.css
var legend = L.control({ position: "bottomright" });
legend.onAdd = function(myMap) {
    var div = L.DomUtil.create("div", "legend");
       div.innerHTML += "<h4>Depth Color Legend</h4>";
       div.innerHTML += '<i style="background: green"></i><span>(Depth < 10)</span><br>';
       div.innerHTML += '<i style="background: rgb(223, 255, 0)"></i><span>(10 < Depth <= 25)</span><br>';
       div.innerHTML += '<i style="background: rgb(236, 255, 220)"></i><span>(25 < Depth <= 40)</span><br>';
       div.innerHTML += '<i style="background: yellow"></i><span>(40 < Depth <= 55)</span><br>';
       div.innerHTML += '<i style="background: orange"></i><span>(55 < Depth <= 70)</span><br>';
       div.innerHTML += '<i style="background: red"></i><span>(Depth > 70)</span><br>';
  
    return div;
  };
  //Add the legend to the map
  legend.addTo(myMap);


