//JS for the main map

var map = L.map('map',{
	center: [51.454, -2.588],
	zoom:10,
	minZoom:2,
	maxZoom:18
});

L.tileLayer('http://{s}.tiles.mapbox.com/v3/ianmule.bg2v5cdi/{z}/{x}/{y}.png',{attribution:"Mapbox"}).addTo(map);

//Add some GeoJSON

//Define Popups
function popUp(f,l){
    var out = [];
    if (f.properties){
        for(key in f.properties){
            out.push(key+": "+f.properties[key]);
        }
        l.bindPopup(out.join("<br />"));
    }
}

//Define style
function style(feature){
  consol.log(feature);

}

//Get maps
var geojsonLayer = new L.GeoJSON.AJAX("../geojson/bristol/exist.geojson",{
  onEachFeature:popUp,
  style:style
});


geojsonLayer.addTo(map);

//var district_boundary = new L.geoJson();
//district_boundary.addTo(map);

//$.ajax({
//dataType: "json",
//url: "../geojson/bristol/exist.geojson",
//success: function(data) {
//    $(data.features).each(function(key, data) {
//        district_boundary.addData(data);
//    });
//}
//}).error(function() {});