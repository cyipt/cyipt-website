var cyipt = (function ($) {
    'use strict';
    // Internal class properties
	  var _settings = {};
	  var _map = {};
	  var _layerID = {};
	  var _layers = new Array("","","","","","","","");

	  // Layer definitions
	  var _layerConfig = {
       	'traffic': {
       	  'layerNumber' : 3,
       	  'apiCall': 'https://api.cyclestreets.net/v2/trafficcounts.locations',
       	  'styles' : {
         	    'linewidth' : '5'
       	  },
       	  'colours' : {
       	    'ColourField': 'car_pcu',
         	  'ColourStops': [
      			        { "min": 40000, "max": 9999999999999, "col": '#95adfd' },
            				{ "min": 20000, "max": 20000,  "col": '#96d6fd' },
            				{ "min": 10000, "max": 20000,  "col": '#7efefd' },
            				{ "min": 5000,  "max": 10000,  "col": '#d6fe7f' },
            				{ "min": 2000,  "max": 5000,   "col": '#fefe94' },
            				{ "min": 0,     "max": 2000,   "col": '#cdcdcd' },
            				],
       	  },
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
       	  'data' : {}
       	},
       	'apitest': {
       	  'layerNumber' : 5,
       	  'apiCall': 'http://www.cyipt.bike/api/index.php',
       	  'data' : {}
       	},
       	'pct': {
       	  'layerNumber' : 6,
       	  'apiCall': 'http://www.cyipt.bike/api/pct/index.php',
       	  'styles' : {
       	      'linewidth' : '5',
       	  },
       	  'colours' : {
       	    'ColourField': 'ncycles',
         	  'ColourStops': [
      			        { "min": 2000, "max": 9999999999999, "col": '#fe7fe1' },
            				{ "min": 1000, "max": 2000, "col": '#7f7ffe' },
            				{ "min": 500,  "max": 1000, "col": '#95adfd' },
            				{ "min": 250,  "max": 500,  "col": '#96d6fd' },
            				{ "min": 100,  "max": 250,  "col": '#7efefd' },
            				{ "min": 50,   "max": 100,  "col": '#d6fe7f' },
            				{ "min": 10,   "max": 50,   "col": '#fefe94' },
            				{ "min": 0,    "max": 10,   "col": '#cdcdcd' },
            				],
       	  },
       	  'data' : {}
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
        var styles = {};
        //console.log(_layerID);
        if(_layerConfig[_layerID]['styles']){
          //If style exists get it from the settings
          styles = _layerConfig[_layerID]['styles'];
        }else{
          //Otherwise get use defualt style
          styles.weight = 3;
          styles.color = "red";
        }

        if(_layerConfig[_layerID]['colours']){
          styles.color = cyipt.getcolour(parseInt(feature['properties'][_layerConfig[_layerID]['colours']['ColourField']]),10)
        }else{
          //DO nothing
        }
        return styles;
      },


      getcolour: function(val){
          var colours = _layerConfig[_layerID]['colours']['ColourStops']
          var arrayLength = colours.length;
          var res = 0;
          for (var i = 0; i < arrayLength; i++) {
              if(colours[i]['min'] <= val && colours[i]['max'] >= val){
                  res = colours[i]['col'];
              }else{
                  //Do Nothing
              }

          }
          return(res);
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
           	    'bbox' : _map.getBounds().toBBoxString(),
           	    'zoom' : _map.getZoom()
           	  }

           	}

        };

        // Loop through each defined layer
        for(var _layer in _layerConfig){

          //Make Layer from API
          _layerID = _layer ;
          console.log(_layer);
          console.log(_layerID);
          var data = _layerConfig[_layer]['data'];
          // Check for additonal parameters
          if('parameters' in htmlVars[_layer]){
            var param = htmlVars[_layer]['parameters'];
            //Loop though and add parameters
            for(var key in param) {
              if (param.hasOwnProperty(key)) {
                data[key] = param[key];
              }
            }
          }

          if(htmlVars[_layer]['show'] == 1){
            //console.log(_layer);
            $.ajax({
            url: _layerConfig[_layer]['apiCall'],
            data: data ,
            error: function (jqXHR, error, exception) {
              //console.log(_layer);
              console.log(error);
            },
            success: function (data, textStatus, jqXHR) {
              //console.log(_layer);
              _map.removeLayer(_layers[_layerConfig[_layer]['layerNumber']]);
              _layers[_layerConfig[_layer]['layerNumber']] = L.geoJSON(data,{
                onEachFeature: cyipt.popUp,
                style: cyipt.style
              });
              _layers[_layerConfig[_layer]['layerNumber']].addTo(_map);
            }

            });
            //console.log(_layer);
          }else{
            _map.removeLayer(_layers[_layerConfig[_layer]['layerNumber']]);
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





