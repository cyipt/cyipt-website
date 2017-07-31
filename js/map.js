//JS for the main map

var map = L.map('map',{
	center: [51.454, -2.588],
	zoom:12,
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
  console.log(feature.properties.roadtype2);
  var roadtype = feature.properties.roadtype2
  var styles = {};
  styles.weight = 3;
  if(roadtype == "Cycleway Track Track"){
    styles.color = "green";
  }else if(roadtype == "Cycleway None None"){
   styles.color = "blue";
  }else{
    styles.color = "red";
  }
  return styles;
}

//Get maps
var url = "https://api.cyclestreets.net/v2/trafficcounts.locations?key=eeb13e5103b09f19&groupyears=1&bbox=-2.647190%2C51.406166%2C-2.490635%2C51.502973"
var geojsonLayer = new L.GeoJSON.AJAX(url,{
  onEachFeature:popUp,
  style:style
});


geojsonLayer.addTo(map);


