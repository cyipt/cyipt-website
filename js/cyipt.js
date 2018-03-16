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
			latitude: 53.690,
			longitude: -2.142,
			zoom: 6
		},
		defaultTileLayer: 'mapnik',

		// Default layer(s) ticked
		defaultLayers: ['schemes'],

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
			weight: 6,
			opacity: 0.7
		},

		// Enable hover
		hover: true,

		// Drawing
		enableDrawing: false,

		// Enable map scale
		enableScale: true,

		// Region switcher
		regionsFile: '/api/v1/ttwa.json?key=c047ed46f7b50b18&zoom=6&bbox=-14.018555,51.658927,8.107910,54.354956',
		regionsField: 'name',

		// Initial view of all regions; will use regionsFile
		initialRegionsView: true,

		// Pages
		pages: [
			'about',
			'contacts',
			'manual'
		],

		// Beta switch
		enableBetaSwitch: 'Alpha',

		// Password protection
		password: false,

		// Show layer errors as non-modal dialog, not modal popup
		errorNonModalDialog: true,

		// Tileserver URLs, each as [path, options, label]
		tileUrls: {
			mapnik: [
				'https://{s}.tile.cyclestreets.net/mapnik/{z}/{x}/{y}.png',
				{maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'},
				'OpenStreetMap style'
			],
			opencyclemap: [
				'https://{s}.tile.cyclestreets.net/opencyclemap/{z}/{x}/{y}@2x.png',
				{maxZoom: 21, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors; <a href="https://www.thunderforest.com/">Thunderforest</a>'},
				'OpenCycleMap'
			],
			grayscale: [
				'https://korona.geog.uni-heidelberg.de/tiles/roadsg/x={x}&y={y}&z={z}',
				{maxZoom: 19, attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'},
				'Grayscale'
			],
			npct: [
				'https://npttile.vs.mythic-beasts.com/olc/{z}/{x}/{-y}.png',
				{maxZoom: 15, attribution: 'Propensity to Cycle Tool &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'},
				'PCT LSOA route network'
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
		}
	};

	// Layer definitions
	var _layerConfig = {
		
		schemes: {
			apiCall: '/v1/schemes.json',
			name: 'Schemes - cost benefit ratio',
			description: 'Our recommendation for schemes, which group the proposals for recommended cycle infrastructure together.',
			lineColourField: 'costbenratio',
			lineColourStops: [	// http://blogs.perl.org/users/ovid/2010/12/perl101-red-to-green-gradient.html
				[100, '#006400'],
				[30, '#008000'],
				[15, '#00ff00'],
				[10, '#7cff00'],
				[5, '#9fff00'],
				[2, '#e5ff00'],
				[1, '#ffd300'],
				[0, '#ff5700']
			],
			'popupLabels': {
				idGlobal: 'unique ID to each scheme',
				cost: 'Cost',
				costperperson: 'Cost per person',
				groupid: 'Unique ID to each scheme',
				region: 'Region name (Travel to Work Area)',
				cost: 'Total cost in £',
				costperperson: 'Cost divided by the number of new cyclists',
				ncyclebefore: 'Number of people cycling through the scheme before',
				ncycleafter: 'Number of people cycling through the scheme after',
				infratype: 'Summary name of infrastructure type (take the most common type of mixed schemes)',
				change: 'Change in the number of cyclists',
				per: 'Percentage change in the number of cyclists',
				length: 'Total length, in metres, of the scheme',
				ndrivebefore: 'Number of people driving through the scheme before',
				ndriveafter: 'Number of people driving through the scheme after',
				carkmbefore: 'Total number of car km driven by people driving through the scheme before',
				carkmafter: 'Total number of car km driven by people driving through the scheme before',
				carkm: 'Change in car km driven',
				absenteeismbenefit: 'Benefit from reducing absenteeism in £',
				healthdeathavoided: 'Reduction in deaths',
				healthbenefit: 'Benefit from improving health in £',
				qualitybenefit: 'Benefit from improving journey quality in £',
				accidentsbenefit: 'Benefit from the reduction in accidents in £',
				co2saved: 'Reduction in CO₂ emissions (+ve means fewer CO₂ emissions)',
				ghgbenefit: 'Benefit from the reduction in GHG emissions in £',
				congestionbenefit: 'Benefit from the reduction in traffic congestion in £',
				totalben: 'Total benefits in £',
				costbenratio: 'Ratio of benefits to costs (high means good)'
			},
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
				['Track', '#0000ff'],
				['Lane', '#009fef'],
				['Bus lane', '#e7e700'],
				['Minor road', '#ff9900'],
				['Major road', '#df0000'],
				['No cycling', '#1f1f1f'],
				['Living street', '#999999']
			],
			intervals: true,
			popupSublayerParameter: 'layer',
			popupHtml: {
				cycleinfrastructure: '<p><a class="edit" target="_blank" href="https://www.openstreetmap.org/way/{properties.osmid}">Edit in OSM</a></p>'
					+ '<table>'
					+ '<tr><td>Name:</td><td><strong>{properties.name}</strong></td></tr>'
					+ '<tr><td>Region:</td><td><strong>{properties.region}</strong></td></tr>'
					+ '<tr><td>Highway type:</td><td><strong>{properties.highway}</strong></td></tr>'
					+ '<tr><td>Existing infrastructure:</td><td><strong>{properties.existing}</strong></td></tr>'
					+ '<tr><td>Cycleway on left?</td><td><strong>{properties.cyclewayleft}</strong></td></tr>'
					+ '<tr><td>Cycleway on right?</td><td><strong>{properties.cyclewayright}</strong></td></tr>'
					+ '</table>',
				speedlimits: '<p><a class="edit" target="_blank" href="https://www.openstreetmap.org/way/{properties.osmid}">Edit in OSM</a></p>'
					+ '<table>'
					+ '<tr><td>Name:</td><td><strong>{properties.name}</strong></td></tr>'
					+ '<tr><td>Region:</td><td><strong>{properties.region}</strong></td></tr>'
					+ '<tr><td>Speed limit:</td><td><strong>{properties.maxspeed}</strong></td></tr>'
					+ '</table>',
				footways: '<p><a class="edit" target="_blank" href="https://www.openstreetmap.org/way/{properties.osmid}">Edit in OSM</a></p>'
					+ '<table>'
					+ '<tr><td>Name:</td><td><strong>{properties.name}</strong></td></tr>'
					+ '<tr><td>Region:</td><td><strong>{properties.region}</strong></td></tr>'
					+ '<tr><td>Footways:</td><td><strong>{properties.sidewalk}</strong></td></tr>'
					+ '</table>'
			}
		},

		width: {
			apiCall: '/v1/width.json',
			name: 'Road widths',
			description: 'Calculations of the width of roads/paths, which helps determine the potential space available for cycle infrastructure.',
			lineColourField: 'width',
			lineColourStops: [
			  ['Missing Width Data', '#e5d0ff'],
			  ['More than sufficient width', '#6dee09'],
			  ['About sufficient width', '#fff966'],
			  ['Width Constrained', '#ff940e'],
			  ['Insufficient width', '#ff0000'],
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
			  ['Missing Width Data', '#e5d0ff'],
			  ['More than sufficient width', '#6dee09'],
			  ['About sufficient width', '#fff966'],
			  ['Width Constrained', '#ff940e'],
			  ['Insufficient width', '#ff0000'],
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

		collisionsroad: {
			apiCall: '/v1/collisionsroad.json',
			name: 'Collisions (Roads)',
			description: 'Collisions mapped to road network',
			lineColourField: 'ncollisions',
			lineColourStops: [
				[10, '#990000'],
				[5, '#ef6548'],
				[3, '#fdbb84'],
				[2, '#fdd49e'],
				[1, '#fef0d9']
			],
			intervals: 'range'
		},

		collisionsjunctions: {
			apiCall: '/v1/collisionsjunctions.json',
			name: 'Collisions (junctions)',
			description: 'Collisions mapped to junctions',
			lineColourField: 'ncollisions',
			lineColourStops: [
				[10, '#990000'],
				[5, '#ef6548'],
				[3, '#fdbb84'],
				[2, '#fdd49e'],
				[1, '#fef0d9']
			],
			intervals: 'range'
		},

		collisions: {
			apiCall: '/v1/collisions.json',
			name: 'Collisions',
			description: 'DfT collision data, from STATS19.',
			iconField: 'severity',
			icons: {
				fatal: '/images/icon_collision_fatal.svg',
				serious: '/images/icon_collision_serious.svg',
				slight: '/images/icon_collision_slight.svg',
			},
			iconSize: [40, 60]
		}
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


		// Accordion UI; does not use jQuery UI accordion, as that is not compatible with workable checkbox handling
		accordion: function ()
		{
			var accordion = $('#sections h3');
			$.each (accordion, function (index, element) {
				$(element).click (function () {
					this.classList.toggle ('active');
					var panel = this.nextElementSibling;
					if (panel.style.maxHeight) {
						panel.style.maxHeight = null;
					} else {
						panel.style.maxHeight = panel.scrollHeight + 'px';
					}
				});
			});
		}
	};

} (jQuery));


