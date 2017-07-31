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
  console.log(feature);
  var styles = {};
  styles.weight = 3;
  if(feature.properties.roadtype2 == "Cycleway Track Track"){
    styles.color = "green";
  }else if(feature.properties.roadtype2 == "Cycleway None None"){
   styles.color = "blue";
  }else{
    styles.color = "red";
  }
  return styles;
}

//Get maps
var geojsonLayer = new L.GeoJSON.AJAX("http://www.cyipt.bike/geojson/bristol/exist.geojson",{
  onEachFeature:popUp,
  style:style
});


geojsonLayer.addTo(map);


