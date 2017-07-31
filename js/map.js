var cyipt = (function ($) {
    'use strict';
    // Internal class properties
	  var _settings = {};

	  return{
      //Function 1
      initialise: function (){
        //Set up map
        var map = L.map('map',{
      	  center: [51.454, -2.588],
      	  zoom:12,
      	  minZoom:2,
      	  maxZoom:18
        });
        //Get base map
        //L.tileLayer('http://{s}.tiles.mapbox.com/v3/ianmule.bg2v5cdi/{z}/{x}/{y}.png',{attribution:"Mapbox"}).addTo(map);


        //Alterative base map
        L.tileLayer.provider('OpenMapSurfer.Grayscale').addTo(map);

        //get data
        var url = "https://api.cyclestreets.net/v2/trafficcounts.locations?key=eeb13e5103b09f19&groupyears=1&bbox=-2.647190%2C51.406166%2C-2.490635%2C51.502973";
        var geojsonLayer = new L.GeoJSON.AJAX(url,{
            onEachFeature: cyipt.popUp,
            style: cyipt.style
        });
        //add data to map
        geojsonLayer.addTo(map);
      },

      //Function 2: Define Popups
      //Loop though variaibles and add them to the popup
      popUp: function (f,l){
          var out = [];
          if (f.properties){
              for(var key in f.properties){
                  out.push(key+": "+f.properties[key]);
              }
              l.bindPopup(out.join("<br />"));
          }
      },

      //Function 3: Define style
      style: function (feature){
        //console.log(feature.properties.car_pcu);
        //console.log(feature.geometry.coordinates);
        var value = feature.properties.car_pcu;
        var styles = {};
        //console.log(value);
        styles.weight = 3;
        //styles.color = "red";
        if(value > 10000){
          styles.color = "green";
        }else if(value > 1000){
          styles.color = "blue";
        }else{
          styles.color = "red";
        }
        //console.log(styles.color);
        return styles;

      }

    //End of return
	  };

//end of var cyipt
}(jQuery));





