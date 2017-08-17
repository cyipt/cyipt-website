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
       	  'layerNumber' : 3,
       	  'apiCall': 'https://api.cyclestreets.net/v2/trafficcounts.locations',
       	  'lineColourField': 'car_pcu',
  			  'lineColourStops': [
    				[40000, '#ff0000'],
    				[20000, '#d43131'],
    				[10000, '#e27474'],
    				[5000, '#f6b879'],
    				[2000, '#fce8af'],
    				[0, '#61fa61']
  			    ],
			    'linewidth' : '5',
			    'data' : {
			        'key': "eeb13e5103b09f19",
              'groupyears' : "1"
			      }

       	},
       	'collisions': {
       	  'layerNumber' : 4,
       		'apiCall': 'https://api.cyclestreets.net/v2/collisions.locations' ,
       		'data' : {
              'key': "eeb13e5103b09f19",
              'jitter': "1"
          }
       	},
       	'groups': {
       	  'layerNumber' : 0,
       	  'apiCall': 'https://www.cyclescape.org/api/groups.json',
       	  'data' : {
          }
       	},
       	'apitest': {
       	  'layerNumber' : 5,
       	  'apiCall': 'http://www.cyipt.bike/api/index.php',
       	  'data' : {
          }
       	},
       	'pct': {
       	  'layerNumber' : 6,
       	  'apiCall': 'http://www.cyipt.bike/api/pct/index.php',
       	  'lineColourField': 'pctcensus',
			    'lineColourStops': [
			        [9999999, '#ff0000'],
      				[2000, '#fe7fe1'],
      				[1000, '#7f7ffe'],
      				[500, '#95adfd'],
      				[250, '#96d6fd'],
      				[100, '#7efefd'],
      				[50, '#d6fe7f'],
      				[10, '#fefe94'],
      				[0, '#cdcdcd']
      				],
      		'linewidth' : '5',
      		'data' : {
          }
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
      style: function (feature,layerID){
        //console.log(layerID);
        //console.log(feature.geometry.coordinates);
        //var value = feature.properties.pctcensus;
        var styles = {};
        //console.log(value);
        styles.weight = 3;
        styles.color = "red";
        //if(value > 10000){
        //  styles.color = "green";
        //}else if(value > 5000){
        //  styles.color = "blue";
        //}else{
        //  styles.color = "red";
        //}

        // Set line colour if required
				//if (_layerConfig[layerId].lineColourField && _layerConfig[layerId].lineColourStops) {
				//	styles.color = cyipt.lookupStyleValue (feature.properties[_layerConfig[layerId].lineColourField], _layerConfig[layerId].lineColourStops);
				//}else{
				//  styles.color = "red";
				//}

				// Set line width if required
				//if (_layerConfig[layerId].linewidth) {
				//	styles.weight = _layerConfig[layerId].linewidth ;
				//}else{
				//  styles.weight = 3;
				//}

        //console.log(styles.color);
        return styles;

      },

      //Function 4: Get data
      getdata: function (_map){
        //Fetch data based on map location
        var dataexist = $('#data-exist').find(":selected").val();
        var datarec = $('#data-rec').find(":selected").val();

        //Get Dynamic Values from HTML such as controls and Bounding boxes
        var htmlVars = {
           	'traffic': {
           	  'show' : $('#data-traffic').find(":selected").val(),
           	  'parameters' :{
           	    'bbox' : _map.getBounds().toBBoxString()
           	  }
           	},
           	'collisions': {
           	  'show' : $('#data-col').find(":selected").val(),
           	  'parameters' :{
           	    'bbox' : _map.getBounds().toBBoxString(),
           	    'zoom' : _map.getZoom()
           	  }
           	},
           	'groups': {
           	  'show' : $('#data-group').find(":selected").val(),
           	  'parameters' :{
           	    'national' : $('#national').find(":selected").val(),
           	    'bbox' : _map.getBounds().toBBoxString()
           	  }

           	},
           	'apitest': {
           	  'show' : $('#data-api').find(":selected").val(),
           	  'parameters' :{
           	    'bbox' : _map.getBounds().toBBoxString()
           	  }
           	},
           	'pct': {
           	  'show' : $('#data-pct').find(":selected").val(),
           	  'parameters' :{
           	    'pctlayer' : $('#pctlayer').find(":selected").val(),
           	    'bbox' : _map.getBounds().toBBoxString()
           	  }

           	}

        };

        // Loop through each defined layer
        for(var layerId in _layerConfig){
          //Make Layer from API
          //var layerId = 'groups';
          var data = _layerConfig[layerId]['data'];
          // Check for additonal parameters
          if('parameters' in htmlVars[layerId]){
            var param = htmlVars[layerId]['parameters'];
            //Loop though and add parameters
            for(var key in param) {
              if (param.hasOwnProperty(key)) {
                data[key] = param[key];
              }
            }
          }

          if(htmlVars[layerId]['show'] == 1){
            $.ajax({
            url: _layerConfig[layerId]['apiCall'],
            data: data ,
            error: function (jqXHR, error, exception) {
              console.log(error);
            },
            success: function (data, textStatus, jqXHR) {
              _map.removeLayer(_layers[_layerConfig[layerId]['layerNumber']]);
              _layers[_layerConfig[layerId]['layerNumber']] = L.geoJSON(data,{
                onEachFeature: cyipt.popUp,
                style: cyipt.style
              });
              _layers[_layerConfig[layerId]['layerNumber']].addTo(_map);
            }

            });
          }else{
            _map.removeLayer(_layers[_layerConfig[layerId]['layerNumber']]);
          }
        };


        //////////////////////////////////////////////////////////////////////////////////////////////////////
        // USING GEOJSON DIRECT
        /////////////////////////////////////////////////////////////////////////////////////////////////////
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

      },

    //End of return
	  };

//end of var cyipt
}(jQuery));





