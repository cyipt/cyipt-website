var cyipt = (function ($) {
    'use strict';
    // Internal class properties
	  var _settings = {};
	  var _map = {};
	  var _layer = {};
	  var _layers = new Array("","","","","","","","");

	  // Layer definitions
	  var _layerConfig = {
       	'traffic': {
       		'apiCall': 'https://api.cyclestreets.net/v2/trafficcounts.locations',
       	},
       	'collisions': {
       		'apiCall': 'https://api.cyclestreets.net/v2/collisions.locations'
       	},
       	'groups': {
       	  'apiCall': 'https://www.cyclescape.org/api/groups.json'
       	}
       	// etc.
    };


	  return{
	    //Function 1
      initialise: function (){

        //Get base map
        var grayscale = new L.tileLayer.provider('OpenMapSurfer.Grayscale');
        var openmap = new L.tileLayer.provider('OpenStreetMap.Mapnik');
        var satelite  = new L.tileLayer.provider('Esri.WorldImagery') ;

        var cyclemap = L.tileLayer('http://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey={apikey}', {
	          attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
	          apikey: 'bf09fff64f1443028994661047c077f5',
	          maxZoom: 22
        });



        //Set up map
        var _map = L.map('map',{
      	  center: [51.454, -2.588],
      	  zoom:12,
      	  minZoom:2,
      	  maxZoom:18,
      	  layers: [grayscale]
        });

        //CHange the url as the map moves
        var allMapLayers = {'grayscale': grayscale,
                            'osm': openmap,
                            'ocm': cyclemap,
                            'satelite' : satelite
                            //'overlay_name': data
                            //'overlay_name2': geojsonLayer2
                            };
        new L.Hash(_map, allMapLayers);

        //Define groups
        var baseLayers = {
		      "Grayscale": grayscale,
		      "Open Street Map": openmap,
		      "Open Cycle Map":cyclemap,
		      "Satelite": satelite
	      };

        // Watch for changes in the map
	      _map.on('moveend', function() {
          cyipt.getdata(_map);
        });

        //need watcher for changing menus


        L.control.layers(baseLayers).addTo(_map);

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
        }else if(value > 5000){
          styles.color = "blue";
        }else{
          styles.color = "red";
        }
        //console.log(styles.color);
        return styles;

      },

      //Function 4: Get data
      getdata: function (_map){
        //Fetch data based on map location

        //get settings from the html
        var nat = $('#national').find(":selected").val();
        var datagroup = $('#data-group').find(":selected").val();
        var dataexist = $('#data-exist').find(":selected").val();
        var datarec = $('#data-rec').find(":selected").val();
        var datatraffic = $('#data-traffic').find(":selected").val();
        var datacol = $('#data-col').find(":selected").val();

        //variable for api calls
        var trafficVars = {
          key: "eeb13e5103b09f19",
          groupyears: "1"
        };

        var groupVars = {
          national: nat,
          bbox: _map.getBounds().toBBoxString()
        };

        var colVars = {
          key: "eeb13e5103b09f19",
          jitter: 1,
          zoom: _map.getZoom(),
          bbox: _map.getBounds().toBBoxString(),
          //casualties: "Cyclist",
          //involved: "Driver"

        };

        //Cycling Groups from API
        var layerId = 'groups';
        if(datagroup == 1){
          $.ajax({
          url: _layerConfig[layerId]['apiCall'],
          data: groupVars ,
          error: function (jqXHR, error, exception) {
            console.log(error);
          },
          success: function (data, textStatus, jqXHR) {
            _map.removeLayer(_layers[0]);
            _layers[0] = L.geoJSON(data,{
              onEachFeature: cyipt.popUp,
              style: cyipt.style
            });
            _layers[0].addTo(_map);
          }

          });
        }else{
          _map.removeLayer(_layers[0]);
        }

        //Traffic from API
        var layerId = 'traffic';
	var data = trafficVars;
	data.bbox = _map.getBounds().toBBoxString();
        if(datatraffic == 1){
          $.ajax({
          url: _layerConfig[layerId]['apiCall'],
          data: data,
          error: function (jqXHR, error, exception) {
            console.log(error);
          },
          success: function (data, textStatus, jqXHR) {
            _map.removeLayer(_layers[3]);
            _layers[3] = L.geoJSON(data,{
              onEachFeature: cyipt.popUp,
              style: cyipt.style
            });
            _layers[3].addTo(_map);
          }

          });
        }else{
          _map.removeLayer(_layers[3]);
        }

        //Collisions from API
        var layerId = 'collisions';
        if(datacol == 1){
          $.ajax({
          url: _layerConfig[layerId]['apiCall'],
          //url: _layerConfig['collisions']['apiCall'], //Martin example repace with dot notation
          data: colVars ,
          error: function (jqXHR, error, exception) {
            console.log(error);
          },
          success: function (data, textStatus, jqXHR) {
            _map.removeLayer(_layers[4]);
            _layers[4] = L.geoJSON(data,{
              onEachFeature: cyipt.popUp,
              //style: cyipt.style
            });
            _layers[4].addTo(_map);
          }

          });
        }else{
          _map.removeLayer(_layers[4]);
        }


        // existing infrastrucutre from geojson
        if(dataexist == 1){
          //check if data already downloaded
          console.log(_layers[1]);
          if(_layers[1] === ""){
            //get data
            var url = "http://www.cyipt.bike/geojson/bristol/exist.geojson";
            _layers[1] = new L.GeoJSON.AJAX(url,{
              onEachFeature: cyipt.popUp,
              style: cyipt.style
            });
            _layers[1].addTo(_map);
          }else{
            //otherwise just re-add to map
            _layers[1].addTo(_map);
          }
        }else{
          _map.removeLayer(_layers[1]);
        }


        // recommended  infrastrucutre from geojson
        if(datarec == 1){
          //check if data already downloaded
          console.log(_layers[2]);
          if(_layers[2] === ""){
            //get data
            var url2 = "http://www.cyipt.bike/geojson/bristol/proposed.geojson";
            _layers[2] = new L.GeoJSON.AJAX(url2,{
              onEachFeature: cyipt.popUp,
              style: cyipt.style
            });
            _layers[2].addTo(_map);
          }else{
            //otherwise just re-add to map
            _layers[2].addTo(_map);
          }
        }else{
          _map.removeLayer(_layers[2]);
        }


        // OLD METHOD FOR REFERENCE

        //get data
        //var url = "https://api.cyclestreets.net/v2/trafficcounts.locations?key=eeb13e5103b09f19&groupyears=1&bbox=-2.647190%2C51.406166%2C-2.490635%2C51.502973";
        //var geojsonLayer = new L.GeoJSON(url,{
        //    onEachFeature: cyipt.popUp,
        //    style: cyipt.style
        //});

        //get data
        //var url2 = "https://api.cyclestreets.net/v2/mapdata?key=eeb13e5103b09f19&limit=400&types=way&zoom=17&bbox=-2.594340%2C51.451647%2C-2.584523%2C51.458025";
        //var geojsonLayer2 = new L.GeoJSON.AJAX(url2,{
        //    onEachFeature: cyipt.popUp,
        //    style: cyipt.style
        //});

        //geojsonLayer.addTo(_map);


      },

    //End of return
	  };

//end of var cyipt
}(jQuery));





