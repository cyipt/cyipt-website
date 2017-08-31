var cyipt = (function ($) {
    'use strict';
    // Internal class properties
	  var _settings = {};
	  var _map = {};
	  //_map = new L.Map('map');
	  var _layerID = {};
	  var _layers = new Array("","","","","","","","");

	  // Layer definitions
	  var _layerConfig = {
       	'traffic': {
       	  'layerNumber' : 3,
       	  'apiCall': 'https://api.cyclestreets.net/v2/trafficcounts.locations',
       	  'styles' : {
         	    'weight' : '8'
       	  },
       	  'colours' : {
       	    'ColourField': 'car_pcu',
         	  'ColourStops': [
      			        { "min": 40000, "max": 9999999999999, "col": '#b2182b' },
            				{ "min": 20000, "max": 40000,  "col": '#ef8a62' },
            				{ "min": 10000, "max": 20000,  "col": '#fddbc7' },
            				{ "min": 5000,  "max": 10000,  "col": '#d1e5f0' },
            				{ "min": 2000,  "max": 5000,   "col": '#67a9cf' },
            				{ "min": 0,     "max": 2000,   "col": '#2166ac' },
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
          },
          'styles' : {
         	    'color' : '#d6fe7f'
       	  }
       	},
       	'groups': {
       	  'layerNumber' : 0,
       	  'apiCall': 'https://www.cyclescape.org/api/groups.json',
       	  'data' : {}
       	},
       	'pct': {
       	  'layerNumber' : 6,
       	  'apiCall': 'http://www.cyipt.bike/api/pct/index.php',
       	  'styles' : {
       	      'weight' : '8',
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
        _map = L.map('map',{
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
        //console.log('In style');
        //console.log(feature);
        //Give up an hard code layer checks
        if(feature.properties.car_pcu){
          //Traffic Layer
          styles = _layerConfig.traffic.styles;
          styles.color = cyipt.getcolour(parseInt(feature['properties'][_layerConfig.traffic.colours.ColourField], 10),'traffic')
        }else if(feature.properties.ncycles){
          //PCT Layer
          styles = _layerConfig.pct.styles;
          styles.color = cyipt.getcolour(feature['properties'][_layerConfig.pct.colours.ColourField],'pct')
        }else{
          //Otherwise get use defualt style
          styles.weight = 3;
          styles.color = "red";
        }

        //if(_layerConfig[_layerID]['colours']){
        //  styles.color = cyipt.getcolour(parseInt(feature['properties'][_layerConfig[_layerID]['colours']['ColourField']]),10)
        //}else{
          //DO nothing
       // }
        //console.log(styles)
        return styles;
      },


      getcolour: function(val,lyr){
          //console.log('In get colour');
          //console.log(_layerID);
          var colours = _layerConfig[lyr]['colours']['ColourStops']
          var arrayLength = colours.length;
          var res = '#000';  //If not match then black
          for (var i = 0; i < arrayLength; i++) {
              if(colours[i]['min'] <= val && colours[i]['max'] >= val){
                  res = colours[i]['col'];
              }
          }
          return(res);
      },

      fetchdata: function(lyr, data){
        //_layerID = lyr;
        //console.log('In fetch data');
        //console.log(_layerID);
        $.ajax({
            url: _layerConfig[lyr]['apiCall'],
            data: data ,
            error: function (jqXHR, error, exception) {
              console.log(error);
            },
            success: function (data, textStatus, jqXHR) {
              //Remove Old layer
              _map.removeLayer(_layers[_layerConfig[lyr]['layerNumber']]);
              //style data
              _layers[_layerConfig[lyr]['layerNumber']] = L.geoJSON(data,{
                onEachFeature: cyipt.popUp,
                style: cyipt.style
              });
              //Add to map
              _layers[_layerConfig[lyr]['layerNumber']].addTo(_map);
            }

            })
      },


      //Function 4: Get data
      getdata: function (_map){

        //console.log('In get data');
        //console.log(_layerID);
        //Get Dynamic Values from HTML such as controls and Bounding boxes
        var htmlVars = {
           	'traffic': {
           	  'show' : document.getElementById("data-traffic").checked,
           	  'parameters' :{
           	    'bbox' : _map.getBounds().toBBoxString()
           	  }
           	},
           	'collisions': {
           	  'show' : document.getElementById("data-collisions").checked,
           	  'parameters' :{
           	    'bbox' : _map.getBounds().toBBoxString(),
           	    'zoom' : _map.getZoom()
           	  }
           	},
           	'groups': {
           	  //'show' : $('#data-group').find(":selected").val(),
           	  'show' : document.getElementById("data-group").checked,
           	  'parameters' :{
           	    'national' : $('#national').find(":selected").val(),
           	    'bbox' : _map.getBounds().toBBoxString()
           	  }

           	},
           	'pct': {
           	  'show' : document.getElementById("data-pct").checked,
           	  'parameters' :{
           	    'pctlayer' : $('#pctlayer').find(":selected").val(),
           	    'bbox' : _map.getBounds().toBBoxString(),
           	    'zoom' : _map.getZoom()
           	  }

           	}

        };

        // Loop through each defined layer
        for(var _layer in _layerConfig){
          _layerID = _layer ;
          //console.log('In get data for loop');
          //console.log(_layerID);
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
          //If layer active get data
          if(htmlVars[_layerID]['show'] == 1){
            //console.log('In htmlVars')
            //console.log(_layerID)
            //console.log(htmlVars[_layerID]['show'])
            cyipt.fetchdata(_layerID, data)
          }else{
            _map.removeLayer(_layers[_layerConfig[_layerID]['layerNumber']]);
          }
        //End of For Loop
        }
        //_layerID = "NULL"

      },

    //End of return
	  };

//end of var cyipt
}(jQuery));
