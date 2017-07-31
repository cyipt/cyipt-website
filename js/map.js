var cyipt = (function ($) {
    'use strict';
    // Internal class properties
	  var _settings = {};

	  return{
      //Function 1
      initialise: function (){

        //Get base map
        var grayscale = new L.tileLayer.provider('OpenMapSurfer.Grayscale'), cyclemap = new L.tileLayer.provider('OpenStreetMap.Mapnik');

        //Set up map
        var map = L.map('map',{
      	  center: [51.454, -2.588],
      	  zoom:12,
      	  minZoom:2,
      	  maxZoom:18,
      	  layers: [grayscale]
        });



        //get data
        var url = "https://api.cyclestreets.net/v2/trafficcounts.locations?key=eeb13e5103b09f19&groupyears=1&bbox=-2.647190%2C51.406166%2C-2.490635%2C51.502973";
        var geojsonLayer = new L.GeoJSON.AJAX(url,{
            onEachFeature: cyipt.popUp,
            style: cyipt.style
        });





        //get data
        var url2 = "https://api.cyclestreets.net/v2/mapdata?key=eeb13e5103b09f19&limit=400&types=way&zoom=17&bbox=-2.594340%2C51.451647%2C-2.584523%2C51.458025";
        var geojsonLayer2 = new L.GeoJSON.AJAX(url2,{
            onEachFeature: cyipt.popUp,
            style: cyipt.style
        });

        geojsonLayer.addTo(map);


        //Define groups
        var baseLayers = {
		      "Grayscale": grayscale,
		      "Open Cycle Map": cyclemap
	      };

        var overlays = {
		      "Trafic Counts": geojsonLayer,
		      "Cycle Scores": geojsonLayer2
	      };




        //map.setZoom(12);

        L.control.layers(baseLayers, overlays).addTo(map);

        //Fetch data based on map location
        var apiData = {
          key: "eeb13e5103b09f19",
          groupyears: "1",
          bbox: map.getBounds().toBBoxString()
        };

        var data = $.ajax({
          url: "https://api.cyclestreets.net/v2/trafficcounts.locations",
          data: apiData ,
          error: function (jqXHR, error, exception) {
            console.log(error);
          },
          success: function (data, textStatus, jqXHR) {
            console.log(data);
          }

        });

        //CHange the url as the map moves
        var allMapLayers = {'base_layer_name': grayscale,
                            'base_layer_name2': cyclemap,
                            'overlay_name': geojsonLayer,
                            'overlay_name2': geojsonLayer2};
        new L.Hash(map, allMapLayers);


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





