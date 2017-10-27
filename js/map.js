var cyipt = (function ($) {
    'use strict';
    // Internal class properties
	  var _settings = {};
	  var _map = {};
	  //_map = new L.Map('map');
	  var _layerID = {};
	  var _layers = new Array("","","","","","","","","","","","");

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
       	'trafficosm': {
       	  'layerNumber' : 2,
       	  'apiCall': 'https://www.cyipt.bike/api/traffic/index.php',
       	  'styles' : {
         	    'weight' : '8'
       	  },
       	  'colours' : {
       	    'ColourField': 'aadt',
         	  'ColourStops': [
      			        { "min": 40000, "max": 9999999999999, "col": '#b2182b' },
            				{ "min": 20000, "max": 40000,  "col": '#ef8a62' },
            				{ "min": 10000, "max": 20000,  "col": '#fddbc7' },
            				{ "min": 5000,  "max": 10000,  "col": '#d1e5f0' },
            				{ "min": 2000,  "max": 5000,   "col": '#67a9cf' },
            				{ "min": 0,     "max": 2000,   "col": '#2166ac' },
            				],
       	  },
       	  'data' : {}

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
       	'collisionscyipt': {
       	  'layerNumber' : 8,
       		'apiCall': 'https://www.cyipt.bike/api/collisions/index.php' ,
       		'data' : {},
          'colours' : {
       	    'ColourField': 'severity',
         	  'ColourStops': [
      			        { "value": 1, "col": 'redIcon' },
            				{ "value": 2, "col": 'orangeIcon' },
            				{ "value": 3, "col": 'yellowIcon' },
            				],
       	  },
       	},
       	'groups': {
       	  'layerNumber' : 0,
       	  'apiCall': 'https://www.cyclescape.org/api/groups.json',
       	  'data' : {}
       	},
       	'pct': {
       	  'layerNumber' : 6,
       	  'apiCall': 'https://www.cyipt.bike/api/pct/index.php',
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
       	},
       	'recommended': {
       	  'layerNumber' : 1,
       	  'apiCall': 'https://www.cyipt.bike/api/recommended/index.php',
       	  'styles' : {
       	      'weight' : '8',
       	  },
       	  'colours' : {
       	    'ColourField': 'recommended',
         	  'ColourStops': [
      			        { "val": "Cycle Lanes",                         "col": '#FF0000' },
            				{ "val": "Cycle Lanes with light segregation",  "col": '#7f7ffe' },
            				{ "val": "Cycle Street",                        "col": '#7FE500' },
            				{ "val": "Cycle Lane on Path",                  "col": '#96d6fd' },
            				{ "val": "Stepped Cycle Tracks",                "col": '#FADE5B' },
            				{ "val": "Segregated Cycle Track on Path",      "col": '#A020F0' },
            				{ "val": "Segregated Cycle Track",              "col": '#FFC400' },
            				{ "val": "None",                                "col": '#cdcdcd' },
            				],
       	  },
       	  'data' : {}
       	},
       	'schemes': {
       	  'layerNumber' : 9,
       	  'apiCall': 'https://www.cyipt.bike/api/schemes/index.php',
       	  'styles' : {
       	     'weight' : '8',

       	  },
       	  'colours' : {
       	    'ColourField': 'schtype',
         	  'ColourStops': [
      			        { "val": "Cycle Lanes",                         "col": '#FF0000' },
            				{ "val": "Cycle Lanes with light segregation",  "col": '#7f7ffe' },
            				{ "val": "Cycle Street",                        "col": '#7FE500' },
            				{ "val": "Cycle Lane on Path",                  "col": '#96d6fd' },
            				{ "val": "Stepped Cycle Tracks",                "col": '#FADE5B' },
            				{ "val": "Segregated Cycle Track on Path",      "col": '#A020F0' },
            				{ "val": "Segregated Cycle Track",              "col": '#FFC400' },
            				{ "val": "None",                                "col": '#cdcdcd' },
            				],
       	  },
       	  'data' : {}
       	},
       	'existing': {
       	  'layerNumber' : 7,
       	  'apiCall': 'https://www.cyipt.bike/api/existing/index.php',
       	  'styles' : {
       	      'weight' : '8',
       	  },
       	  'colours' : {
       	    'ColourField': 'existing',
         	  'ColourStops': [
      			        { "val":	"no lane",	            col: '#fdae61' },
                    { "val":	"share_busway no",	    col: '#96d6fd' },
                    { "val":	"lane no",	            col: '#fdae61' },
                    { "val":	"share_busway lane",	  col: '#f46d43' },
                    { "val":	"lane lane",	          col: '#FF0000' },
                    { "val":	"track track",	        col: '#FFC400' },
                    { "val":	"no share_busway",	    col: '#96d6fd' },
                    { "val":	"no track",	            col: '#fee090' },
                    { "val":	"track no",	            col: '#fee090' },
                    { "val":	"lane share_busway",	  col: '#f46d43' },
                    { "val":	"track share_busway",	  col: '#FADE5B' },
                    { "val":	"share_busway share_busway",	col: '#7f7ffe' },
                    { "val":	"share_busway track",	  col: '#FADE5B' },
                    { "val":	"track lane",	          col: '#FADE5B' },
                    { "val":	"lane track",	          col: '#FADE5B' },
                    { "val":	"no no",	              col: '#215CD2' },
                    { "val":	"Not Applicable no",	  col: '#215CD2' }
            				],
       	  },
       	  'data' : {}
       	},
       	'width': {
       	  'layerNumber' : 5,
       	  'apiCall': 'https://www.cyipt.bike/api/width/index.php',
       	  'styles' : {
       	      'weight' : '8',
       	  },
       	  'colours' : {
       	    'ColourField': 'width',
         	  'ColourStops': [
      			        { "min": 14,  "max": 99999999, "col": '#4575b4' },
            				{ "min": 12,  "max": 14, "col": '#74add1' },
            				{ "min": 10,  "max": 12, "col": '#abd9e9' },
            				{ "min": 8,   "max": 10, "col": '#e0f3f8' },
            				{ "min": 6,   "max": 8,  "col": '#fee090' },
            				{ "min": 4,   "max": 6,  "col": '#fdae61' },
            				{ "min": 2,   "max": 4,  "col": '#f46d43' },
            				{ "min": 0,   "max": 2,  "col": '#d73027' },
            				],
       	  },
       	  'data' : {}
       	}
       	// etc.
    };

    var redIcon = L.icon({
    iconUrl: 'images/marker-red.png',
    iconSize:     [25, 41], // size of the icon
    iconAnchor:   [12, 40], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, 0] // point from which the popup should open relative to the iconAnchor
    });

    var orangeIcon = L.icon({
    iconUrl: 'images/marker-orange.png',
    iconSize:     [25, 41],
    iconAnchor:   [12, 40],
    popupAnchor:  [0, 0]
    });

    var yellowIcon = L.icon({
    iconUrl: 'images/marker-yellow.png',
    iconSize:     [25, 41],
    iconAnchor:   [12, 40],
    popupAnchor:  [0, 0]
    });


	  return{
	    //Function 1
      initialise: function (){
        //Get base map
        var grayscale = new L.tileLayer.provider('OpenMapSurfer.Grayscale');
        var openmap = new L.tileLayer.provider('OpenStreetMap.Mapnik');
        var satelite  = new L.tileLayer.provider('Esri.WorldImagery') ;
        var cyclemap = L.tileLayer('https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey={apikey}', {
	          attribution: '&copy; <a href="https://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
	          apikey: 'bf09fff64f1443028994661047c077f5',
	          maxZoom: 22
        });
        //Set up map
        _map = L.map('map',{
      	  center: [51.454, -2.588],
      	  zoom:12,
      	  minZoom:2,
      	  maxZoom:19,
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
        }else if(feature.properties.recommended){
          //recommended infra
          styles = _layerConfig.recommended.styles;
          styles.color = cyipt.getcolourCat(feature['properties'][_layerConfig.recommended.colours.ColourField],'recommended')
        }else if(feature.properties.schtype){
          //schemes
          styles = _layerConfig.schemes.styles;
          styles.color = cyipt.getcolourCat(feature['properties'][_layerConfig.schemes.colours.ColourField],'schemes')
        }else if(feature.properties.existing){
          //existing infra
          styles = _layerConfig.existing.styles;
          styles.color = cyipt.getcolourCat(feature['properties'][_layerConfig.existing.colours.ColourField],'existing')
        }else if(feature.properties.aadt){
          // OSM Traffic Layer
          styles = _layerConfig.trafficosm.styles;
          styles.color = cyipt.getcolour(feature['properties'][_layerConfig.trafficosm.colours.ColourField],'trafficosm')
        }else if(feature.properties.width){
          //Road width Layer
          styles = _layerConfig.width.styles;
          styles.color = cyipt.getcolour(feature['properties'][_layerConfig.width.colours.ColourField],'width')
        }else if(feature.properties.severity){
          //Collisions CyIPT Points


        }else{
          //Otherwise get use defualt style
          styles.weight = 3;
          styles.color = "red";
        }

        //var highlight = highlightOptions(weight = 5,color = "#666", bringToFront = TRUE);

        //if(_layerConfig[_layerID]['colours']){
        //  styles.color = cyipt.getcolour(parseInt(feature['properties'][_layerConfig[_layerID]['colours']['ColourField']]),10)
        //}else{
          //DO nothing
       // }
        //console.log(styles)
        return styles;
      },


      getcolour: function(val,lyr){

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


      getcolourCat: function(val,lyr){
          var colours = _layerConfig[lyr]['colours']['ColourStops']
          var arrayLength = colours.length;
          var res = '#000';  //If not match then black
          //console.log(val);
          for (var i = 0; i < arrayLength; i++) {
              if(colours[i]['val'] == val){
                  res = colours[i]['col'];
              }
          }
          return(res);
      },





      fetchdata: function(lyr, data){
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
		
                style: cyipt.style,
		
                onEachFeature: function (feature, layer){
		
			// Create popup
			var out = [];
			if (feature.properties){
				for(var key in feature.properties){
					out.push(key+": "+ feature.properties[key]);
				}
				layer.bindPopup(out.join("<br />"));
			}
			
			// Highlight features on hover; see: http://leafletjs.com/examples/choropleth/
			layer.on('mouseover', function () {
				this.setStyle ({
					weight: 20
				});
			});
			layer.on('mouseout', function () {
				_layers[_layerConfig[lyr]['layerNumber']].resetStyle(this);
			});
		},
		
              });
              //Add to map
              _layers[_layerConfig[lyr]['layerNumber']].addTo(_map);
            }

            })
      },


      //Function 4: Get data
      getdata: function (_map){

        //Get Dynamic Values from HTML such as controls and Bounding boxes
        var htmlVars = {
           	'traffic': {
           	  'show' : document.getElementById("data-traffic").checked,
           	  'parameters' :{
           	    'bbox' : _map.getBounds().toBBoxString()
           	  }
           	},
           	'trafficosm': {
           	  'show' : document.getElementById("data-trafficosm").checked,
           	  'parameters' :{
           	    'bbox' : _map.getBounds().toBBoxString(),
           	    'zoom' : _map.getZoom()
           	  }
           	},
           	'collisions': {
           	  'show' : document.getElementById("data-collisions").checked,
           	  'parameters' :{
           	    'bbox' : _map.getBounds().toBBoxString(),
           	    'zoom' : _map.getZoom()
           	  }
           	},
           	'collisionscyipt': {
           	  'show' : document.getElementById("data-collisionscyipt").checked,
           	  'parameters' :{
           	    'yearfrom' : $('#collisions-year-from').find(":selected").val(),
           	    'yearto' : $('#collisions-year-to').find(":selected").val(),
           	    'severity': $('#collisions-severity').find(":selected").val(),
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

           	},
           	'width': {
           	  'show' : document.getElementById("data-width").checked,
           	  'parameters' :{
           	    'widthlayer' : $('#widthlayer').find(":selected").val(),
           	    'bbox' : _map.getBounds().toBBoxString(),
           	    'zoom' : _map.getZoom()
           	  }

           	},
           	'recommended': {
           	  'show' : document.getElementById("data-recommended").checked,
           	  'parameters' :{
           	    'bbox' : _map.getBounds().toBBoxString(),
           	    'zoom' : _map.getZoom()
           	  }

           	},
           	'schemes': {
           	  'show' : document.getElementById("data-schemes").checked,
           	  'parameters' :{
           	    'bbox' : _map.getBounds().toBBoxString(),
           	    'zoom' : _map.getZoom(),
           	    'costfrom' : $('#schemes-cost-from').find(":selected").val(),
           	    'costto' : $('#schemes-cost-to').find(":selected").val(),
           	  }

           	},
           	'existing': {
           	  'show' : document.getElementById("data-existing").checked,
           	  'parameters' :{
           	    'bbox' : _map.getBounds().toBBoxString(),
           	    'zoom' : _map.getZoom()
           	  }

           	}

        };

        // Loop through each defined layer
        for(var _layer in _layerConfig){
          _layerID = _layer ;
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
