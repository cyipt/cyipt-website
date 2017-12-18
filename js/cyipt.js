// CyIPT implementation code

/*jslint browser: true, white: true, single: true, for: true */
/*global $, alert, console, window */

var cyipt = (function ($) {
	
	'use strict';
	
	// Settings defaults
	var _settings = {
		
		// API
		apiBaseUrl: '/api',
		apiKey: false,
		
		// Initial lat/lon/zoom of map and tile layer
		defaultLocation: {
			latitude: 51.4573,
			longitude: -2.5738,
			zoom: 13
		},
		defaultTileLayer: 'grayscale',
		
		// Default layers ticked
		defaultLayers: ['recommended'],
		
		// Send zoom for all API calls
		sendZoom: true,
		
		// Geocoder API URL; re-use of settings values represented as placeholders {%apiBaseUrl}, {%apiKey}, {%autocompleteBbox}, are supported
		geocoderApiUrl: 'https://api.cyclestreets.net/v2/geocoder?key=c047ed46f7b50b18&bounded=1&bbox={%autocompleteBbox}',
		
		// First-run welcome message
		firstRunMessageHtml: '<p>Welcome to CyIPT.</p>'
			+ '<p>CyIPT is a tool which aims to provide an evidence-base for prioritisation of transport infrastructure that will get more people cycling.</p>'
			+ '<p>Please note that this site is work-in-progress beta.</p>',
		
		// Standard styling
		style: {
			weight: 6
		},
		
		// Drawing
		enableDrawing: false,
		
		// Region switcher
		regionsFile: '/regions.geojson',
		regionsField: 'region_name',
		
		// Pages
		pages: [
			'about',
			'contacts'
		],
		
		// Tileserver URLs, each as [path, options, label]
		tileUrls: {
			grayscale: [
				'https://korona.geog.uni-heidelberg.de/tiles/roadsg/x={x}&y={y}&z={z}',
				{maxZoom: 19, attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'},
				'Grayscale'
			],
			opencyclemap: [
				'https://{s}.tile.cyclestreets.net/opencyclemap/{z}/{x}/{y}@2x.png',
				{maxZoom: 21, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors; <a href="https://www.thunderforest.com/">Thunderforest</a>'},
				'OpenCycleMap'
			],
			mapnik: [
				'https://{s}.tile.cyclestreets.net/mapnik/{z}/{x}/{y}.png',
				{maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'},
				'OpenStreetMap style'
			],
			osopendata: [
				'https://{s}.tile.cyclestreets.net/osopendata/{z}/{x}/{y}.png',
				{maxZoom: 19, attribution: 'Contains Ordnance Survey data &copy; Crown copyright and database right 2010'},
				'OS Open Data'
			],
			satellite: [
				'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
				{maxZoom: 19, attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'},
				'Satellite'
			]
		},
	};
	
	// Layer definitions
	var _layerConfig = {
		
		schemes: {
			apiCall: '/v1/schemes.json',
			name: 'Schemes',
			description: 'Our recommendation for schemes, which group the proposals for recommended cycle infrastructure together.',
			lineColourField: 'type',
			lineColourStops: [
				['Cycle Lanes', '#ff0000'],
				['Cycle Lanes with light segregation', '#7f7ffe'],
				['Cycle Street', '#7fe500'],
				['Cycle Lane on Path', '#96d6fd'],
				['Stepped Cycle Tracks', '#fade5b'],
				['Segregated Cycle Track on Path', '#a020f0'],
				['Segregated Cycle Track', '#ffc400'],
				['None', '#cdcdcd']
			],
			intervals: true
		},
		
		recommended: {
			apiCall: '/v1/recommended.json',
			name: 'Recommended infrastructure',
			description: 'Recommended cycle infrastructure, based on our analysis of all the other factors listed.',
			lineColourField: 'recommended',
			lineColourStops: [
				['Cycle Lanes', '#ff0000'],
				['Cycle Lanes with light segregation', '#7f7ffe'],
				['Cycle Street', '#7fe500'],
				['Cycle Lane on Path', '#96d6fd'],
				['Stepped Cycle Tracks', '#fade5b'],
				['Segregated Cycle Track on Path', '#a020f0'],
				['Segregated Cycle Track', '#ffc400'],
				['None', '#cdcdcd']
			],
			intervals: true
		},
		
		existing: {
			apiCall: '/v1/existing.json',
			name: 'Existing infrastructure',
			description: 'Existing cycle infrastructure, providing a baseline for improvement.',
			lineColourField: 'existing',
			lineColourStops: [
				['no lane', '#fdae61'],
				['share_busway no', '#96d6fd'],
				['lane no', '#fdae61'],
				['share_busway lane', '#f46d43'],
				['lane lane', '#ff0000'],
				['track track', '#ffc400'],
				['no share_busway', '#96d6fd'],
				['no track', '#fee090'],
				['track no', '#fee090'],
				['lane share_busway', '#f46d43'],
				['track share_busway', '#fade5b'],
				['share_busway share_busway', '#7f7ffe'],
				['share_busway track', '#fade5b'],
				['track lane', '#fade5b'],
				['lane track', '#fade5b'],
				['no no', '#215cd2'],
				['Not Applicable no', '#215cd2']
			],
			intervals: true
		},
		
		width: {
			apiCall: '/v1/width.json',
			name: 'Road widths',
			description: 'Calculations of the width of roads/paths, which helps determine the potential space available for cycle infrastructure.',
			lineColourField: 'width',
			lineColourStops: [
				[14, '#4575b4'],
				[12, '#74add1'],
				[10, '#abd9e9'],
				[8, '#e0f3f8'],
				[6, '#fee090'],
				[4, '#fdae61'],
				[2, '#f46d43'],
				[0, '#d73027'],
			],
			intervals: [
				['14+ m', '#4575b4'],
				['12-14 m', '#74add1'],
				['10-12 m', '#abd9e9'],
				['8-10 m', '#e0f3f8'],
				['6-8 m', '#fee090'],
				['4-6 m ', '#fdae61'],
				['2-4 m', '#f46d43'],
				['0-2 m', '#d73027'],
			]
		},
		
		pct: {
			apiCall: '/v1/pct.json',
			name: 'Propensity to Cycle Tool',
			description: 'Data from the DfT-funded Propensity to Cycle Tool (pct.bike).',
			lineColourField: 'cycles',
			lineColourStops: [
				[2000, '#fe7fe1'],
				[1000, '#7f7ffe'],
				[500, '#95adfd'],
				[250, '#96d6fd'],
				[100, '#7efefd'],
				[50, '#d6fe7f'],
				[10, '#fefe94'],
				[0, '#cdcdcd']
			],
			intervals: 'range'
		},
		
		traffic: {
			apiCall: '/v1/traffic.json',
			name: 'Traffic counts',
			description: 'Traffic counts, from official DfT statistics, allocated to each road.',
			lineColourField: 'daily_total',
			lineColourStops: [
				[40000, '#b2182b'],
				[20000, '#ef8a62'],
				[10000, '#fddbc7'],
				[5000, '#d1e5f0'],
				[2000, '#67a9cf'],
				[0, '#2166ac']
			],
			intervals: 'range'
		},
		
		collisions: {
			apiCall: '/v1/collisions.json',
			name: 'Collisions',
			description: 'DfT collision data, from STATS19.'
			/*
			iconField: 'severity',
			icons: {
				fatal: '/js/lib/leaflet-1.2.0/images/marker-icon.png',	// #!# Should be redIcon
				serious: '/js/lib/leaflet-1.2.0/images/marker-icon.png',	// #!# Should be orangeIcon
				slight: '/js/lib/leaflet-1.2.0/images/marker-icon.png',	// #!# Should be yellowIcon
			},
			iconSize: [25, 41]
			*/
		},
	};
	
	
	return {
		
	// Public functions
		
		// Main function
		initialise: function (config)
		{
			// Merge the configuration into the settings
			$.each (_settings, function (setting, value) {
				if (config.hasOwnProperty(setting)) {
					_settings[setting] = config[setting];
				}
			});
			
			// Enable accordion
			cyipt.accordion ();
			
			// Run the layerviewer for these settings and layers
			layerviewer.initialise (_settings, _layerConfig);
		},
		
		
		// Accordion UI
		accordion: function ()
		{
/*
			$('#accordion').accordion({
				collapsible: true,
				active: false,
				icons: false
			});
			
			$('#accordion').find('input[type="checkbox"]').on('click', function(e) {
				setTimeout (function() {
					this.checked = !this.checked;
				}.bind(this), 100);
				e.preventDefault();
			});
			
			return;
*/
			
			var acc = document.getElementsByClassName('accordion');
			var i;
			for (i = 0; i < acc.length; i++) {
				acc[i].onclick = function () {
					this.classList.toggle ('active');
					var panel = this.nextElementSibling;
					if (panel.style.maxHeight) {
						panel.style.maxHeight = null;
					} else {
						panel.style.maxHeight = panel.scrollHeight + 'px';
					}
					
					// Stop propagation
					$('form#data input[type="checkbox"]').click(function(e) {
						e.stopPropagation();
					});
				}
			}
		}
	};
	
} (jQuery));

