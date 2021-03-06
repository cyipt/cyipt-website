<?php

# CyIPT model
class cyiptModel
{
	# Class properties
	private $tablePrefix = false;


	# Constructor
	public function __construct ($bbox, $zoom, $get)
	{
		# Set values provided by the API
		$this->bbox = $bbox;	// Validated
		$this->zoom = $zoom;	// Validated
		$this->get = $get;		// Unvalidated contents of $_GET, i.e. query string values

	}


	# Beta mode
	public function enableBetaMode ()
	{
		$this->tablePrefix = 'alt_';
	}


	/*
	# Example model
	public function exampleModel (&$error = false)
	{
		// Logic assembles the values returned below
		// ...

		# Return the model
		return array (
			'table' => 'table',
			'fields' => $fields,			// Fields to retrieve
			'constraints' => $constraints,	// Database constraints
			'parameters' => $parameters,	// Parameters, e.g. :w for bbox west
			'limit' => $limit,				// Limit of data returned
		);
	}
	*/


	# Recommended infrastructure
	public function recommendedModel (&$error = false)
	{
		# Base values
		$fields = array (
			// 'id',
			'recommended',
		);
		$constraints = array (
			'geotext && ST_MakeEnvelope(:w, :s, :e, :n, 4326)',
			"recommended != 'None'",
		);
		$parameters = $this->bbox;
		$limit = false;

		# Set filters based on zoom
		switch (true) {

			# Max Zoomed Out
			case ($this->zoom == 11):
				$fields[] = 'ST_AsGeoJSON(ST_Simplify(geotext, 0.00412 )) AS geometry';
				$limit = 5000;
				break;

			case ($this->zoom == 12):
				$fields[] = 'ST_AsGeoJSON(ST_Simplify(geotext, 0.00206 )) AS geometry';
				$limit = 5000;
				break;

		  case ($this->zoom == 13):
				$fields[] = 'ST_AsGeoJSON(ST_Simplify(geotext, 0.00103 )) AS geometry';
				$limit = 5000;
				break;

			case ($this->zoom == 14):
				$fields[] = 'ST_AsGeoJSON(ST_Simplify(geotext, 0.00052 )) AS geometry';
				$limit = 5000;
				break;

			case ($this->zoom >= 15):
				$fields[] = 'ST_AsGeoJSON(geotext) AS geometry';
				$limit = 5000;
				break;

		  #Max Zoomed In

			# Show nothing if too zoomed out
			default:
				$error = 'Please zoom in.';
				return false;
		}

		# Return the model
		return array (
			'table' => $this->tablePrefix . 'roads',
			'fields' => $fields,
			'constraints' => $constraints,
			'parameters' => $parameters,
			'limit' => $limit,
		);
	}


	# Documentation
	public static function recommendedDocumentation ()
	{
		return array (
			'name' => 'Recommended infrastructure',
			'example' => '/api/v1/recommended.json?bbox=-2.6404,51.4698,-2.5417,51.4926&zoom=15',
			'fields' => array (
				'bbox' => '%bbox',
				'zoom' => '%zoom',
			),
		);
	}


	# Schemes
	public function schemesModel (&$error = false)
	{
		# Show nothing if too zoomed out
		if ($this->zoom < 13) {
			$error = 'Please zoom in.';
			return false;
		}

		# Ensure any supplied fields are numeric
		$numericFields = array ('costto', 'benefitcostfrom', 'benefitfrom');
		foreach ($numericFields as $numericField) {
			if (isSet ($this->get[$numericField])) {
				if (!is_numeric ($this->get[$numericField])) {
					$error = 'The {$numericField} value must be numeric.';
					return false;
				}
			}
		}

		# Base values
		$fields = array (
			// 'idGlobal AS id',
			// 'groupid',
			'region',
			'CAST(cost AS INT)',
			'costBenRatio',		// NB Needs to be renamed to benefitCostRatio, i.e. BCR not CBR)
			'CAST(totalBen AS INT)',
			'CAST(costperperson AS INT)',
			'ncyclebefore',
			'ncycleafter',
			'infratype AS type',
			'change',
			'per',
			'length',
			'ndrivebefore',
			'ndriveafter',
			'CAST(carkmbefore AS INT)',
			'CAST(carkmafter AS INT)',
			'carkm',
			'absenteeismbenefit',
			'healthdeathavoided',
			'healthbenefit',
			'qualitybenefit',
			'accidentsbenefit',
			'co2saved',
			'ghgbenefit',
			'congestionbenefit',
			'ST_AsGeoJSON(geotext) AS geometry',
		);
		$constraints[] = 'geotext && ST_MakeEnvelope(:w, :s, :e, :n, 4326)';
		$parameters = $this->bbox;

		# Add URL parameters
		if (isSet ($this->get['costto'])) {
			$constraints[] = 'cost <= :costto';
			$parameters['costto'] = $this->get['costto'];
		}
		if (isSet ($this->get['benefitcostfrom'])) {
			$constraints[] = 'costBenRatio >= :benefitcostfrom';
			$parameters['benefitcostfrom'] = $this->get['benefitcostfrom'];
		}
		if (isSet ($this->get['benefitfrom'])) {
			$constraints[] = 'totalBen >= :benefitfrom';
			$parameters['benefitfrom'] = $this->get['benefitfrom'];
		}

		# Limit
		$limit = 1000;

		# Set filters based on zoom
		switch (true) {

      # Max Zoomed Out
			case ($this->zoom == 11):
				$fields[] = 'ST_AsGeoJSON(ST_Simplify(geotext, 0.00412 )) AS geometry';
				$limit = 5000;
				break;

			case ($this->zoom == 12):
				$fields[] = 'ST_AsGeoJSON(ST_Simplify(geotext, 0.00206 )) AS geometry';
				$limit = 5000;
				break;

		  case ($this->zoom == 13):
				$fields[] = 'ST_AsGeoJSON(ST_Simplify(geotext, 0.00103 )) AS geometry';
				$limit = 5000;
				break;

			case ($this->zoom == 14):
				$fields[] = 'ST_AsGeoJSON(ST_Simplify(geotext, 0.00052 )) AS geometry';
				$limit = 5000;
				break;

			case ($this->zoom >= 15):
				$fields[] = 'ST_AsGeoJSON(geotext) AS geometry';
				$limit = 5000;
				break;

		  #Max Zoomed In


			# Show nothing if too zoomed out
			default:
				$error = 'Please zoom in.';
				return false;
		}

		# Return the model
		return array (
			'table' => $this->tablePrefix . 'schemes',
			'fields' => $fields,
			'constraints' => $constraints,
			'parameters' => $parameters,
			'limit' => $limit,
		);
	}


	# Documentation
	public static function schemesDocumentation ()
	{
		return array (
			'name' => 'Schemes',
			'example' => '/api/v1/schemes.json?bbox=-2.6404,51.4698,-2.5417,51.4926&zoom=15&costfrom=50000&costto=750000',
			'fields' => array (
				'bbox' => '%bbox',
				'zoom' => '%zoom',
				'costto' => array ('type' => 'int', 'values' => '0-999999999', 'description' => 'Maximum cost', ),
				'benefitcostfrom' => array ('type' => 'int', 'values' => '0-9999', 'description' => 'Benefit-cost ratio (BCR) at least', ),
				'benefitfrom' => array ('type' => 'int', 'values' => '0-999999999', 'description' => 'Benefit (in £) at least', ),
			),
		);
	}


	# Existing infrastructure
	public function existingModel (&$error = false)
	{
		# Layer
		$layers = array (
			'cycleinfrastructure' => array (
				'fields' => array (
					'highway',
					"{$this->tablePrefix}roadtypes.cyclewayleft",
					"{$this->tablePrefix}roadtypes.cyclewayright",
					# This CASE statement broadly implements the spec at: https://github.com/cyipt/cyipt-website/issues/23#issuecomment-361231817
					"CASE
						WHEN (roadtypes.cyclewayleft = 'track' OR roadtypes.cyclewayright = 'track') THEN 'Track'
						WHEN roadtypes.roadtype IN ('Segregated Cycleway', 'Cycleway', 'Segregated Shared Path', 'Shared Path') THEN 'Track'
						WHEN (roadtypes.cyclewayleft = 'lane' OR roadtypes.cyclewayright = 'lane') THEN 'Lane'
						WHEN (roadtypes.cyclewayleft = 'share_busway' OR roadtypes.cyclewayright = 'share_busway') THEN 'Bus lane'
						WHEN roadtypes.roadtype IN ('Minor Road - Cycling Allowed', 'Residential Road - Cycling Allowed') THEN 'Minor road'
						WHEN roadtypes.roadtype = 'Main Road - Cycling Allowed' THEN 'Main road'
						WHEN roadtypes.roadtype LIKE '%Cycling Forbidden%' THEN 'No cycling'
						WHEN roadtypes.roadtype = 'Living Street' THEN 'Living street'
						ELSE 'other'
					END AS existing"
				),
				'constraints' => array (
					"(
					       {$this->tablePrefix}roadtypes.cyclewayleft != 'no'
					    OR {$this->tablePrefix}roadtypes.cyclewayright != 'no'
					    OR {$this->tablePrefix}roadtypes.roadtype IN ('Cycleway', 'Living Street', 'Segregated Cycleway', 'Segregated Shared Path')
					 )",
				),
			),
			'speedlimits' => array (
				'fields' => array (
					'maxspeed',
				),
				'constraints' => array (
				),
			),
			'footways' => array (
				'fields' => array (
					"{$this->tablePrefix}roadtypes.sidewalk",
				),
				'constraints' => array (
				),
			),
		);
		if (!isSet ($this->get['layer']) || !array_key_exists ($this->get['layer'], $layers)) {
			$error = 'A valid layer must be supplied.';
			return false;
		}
		$layer = $this->get['layer'];

		# Base values
		$fields = array (
			'name',
			'region',
		);
		if ($layers[$layer]['fields']) {
			$fields = array_merge ($fields, $layers[$layer]['fields']);
		}
		$fields[] = 'CAST (osmid AS INT)';
		$constraints = array (
			"{$this->tablePrefix}roads.geotext && ST_MakeEnvelope(:w, :s, :e, :n, 4326)",
		);
		if ($layers[$layer]['constraints']) {
			$constraints = array_merge ($constraints, $layers[$layer]['constraints']);
		}
		$parameters = $this->bbox;
		$limit = false;

		# Set filters based on zoom
		switch (true) {

			# Max zoomed out
			case ($this->zoom == 11):
				$fields[] = "ST_AsGeoJSON(ST_Simplify({$this->tablePrefix}roads.geotext, 0.00412 )) AS geometry";
				$limit = 5000;
				break;

			case ($this->zoom == 12):
				$fields[] = "ST_AsGeoJSON(ST_Simplify({$this->tablePrefix}roads.geotext, 0.00206 )) AS geometry";
				$limit = 5000;
				break;

			case ($this->zoom == 13):
				$fields[] = "ST_AsGeoJSON(ST_Simplify({$this->tablePrefix}roads.geotext, 0.00103 )) AS geometry";
				$limit = 5000;
				break;

			case ($this->zoom == 14):
				$fields[] = "ST_AsGeoJSON(ST_Simplify({$this->tablePrefix}roads.geotext, 0.00052 )) AS geometry";
				$limit = 5000;
				break;

			case ($this->zoom >= 15):
				$fields[] = 'ST_AsGeoJSON(geotext) AS geometry';
				$limit = 5000;
				break;

		  #Max Zoomed In


			# Show nothing if too zoomed out
			default:
				$error = 'Please zoom in.';
				return false;
		}

		# Return the model
		return array (
			'table' => "{$this->tablePrefix}roads INNER JOIN {$this->tablePrefix}roadtypes ON roads.rtid = {$this->tablePrefix}roadtypes.rtid",
			'fields' => $fields,
			'constraints' => $constraints,
			'parameters' => $parameters,
			'limit' => $limit,
		);
	}


	# Documentation
	public static function existingDocumentation ()
	{
		return array (
			'name' => 'Existing infrastructure',
			'example' => '/api/v1/existing.json?bbox=-2.6404,51.4698,-2.5417,51.4926&zoom=15',
			'fields' => array (
				'bbox' => '%bbox',
				'zoom' => '%zoom',
				'layer' => array (
					'type' => 'string',
					'values' => 'cycleinfrastructure|speedlimits|footways',
					'description' => 'Map layer type: Cycle infrastructure / Speed limits / Footways',
				),
			),
		);
	}


	# Road widths
	public function widthModel (&$error = false)
	{
		# Base values
		$fields = array (
			// 'id',
			'name',
			'region',
		);
		$constraints = array (
			'geotext && ST_MakeEnvelope(:w, :s, :e, :n, 4326)',
			//"recommended != 'None'",
		);
		$parameters = $this->bbox;
		$limit = false;

		# Layer
		# See: https://github.com/cyipt/cyipt-website/issues/24
		$layers = array (
			'roadwidth' => 'calcwidthnow',
			'widthstatus' => 'widthstatus',
		);
		if (!isSet ($this->get['widthlayer']) || !array_key_exists ($this->get['widthlayer'], $layers)) {
			$error = 'A valid layer must be supplied.';
			return false;
		}
		$layer = $this->get['widthlayer'];
		$field = $layers[$layer];
		$fields[] = "{$field} AS width";
		$constraints[] = "{$field} IS NOT NULL";

		# Set filters based on zoom
		switch (true) {

			# Max Zoomed Out
			case ($this->zoom == 11):
				$fields[] = 'ST_AsGeoJSON(ST_Simplify(geotext, 0.00412 )) AS geometry';
				$limit = 5000;
				break;

			case ($this->zoom == 12):
				$fields[] = 'ST_AsGeoJSON(ST_Simplify(geotext, 0.00206 )) AS geometry';
				$limit = 5000;
				break;

		  case ($this->zoom == 13):
				$fields[] = 'ST_AsGeoJSON(ST_Simplify(geotext, 0.00103 )) AS geometry';
				$limit = 5000;
				break;

			case ($this->zoom == 14):
				$fields[] = 'ST_AsGeoJSON(ST_Simplify(geotext, 0.00052 )) AS geometry';
				$limit = 5000;
				break;

			case ($this->zoom >= 15):
				$fields[] = 'ST_AsGeoJSON(geotext) AS geometry';
				$limit = 5000;
				break;

		  #Max Zoomed In

			# Show nothing if too zoomed out
			default:
				$error = 'Please zoom in.';
				return false;
		}

		# Return the model
		return array (
			'table' => $this->tablePrefix . 'roads',
			'fields' => $fields,
			'constraints' => $constraints,
			'parameters' => $parameters,
			'limit' => $limit,
		);
	}


	# Documentation
	public static function widthDocumentation ()
	{
		return array (
			'name' => 'Road width',
			'example' => '/api/v1/width.json?bbox=-2.6404,51.4698,-2.5417,51.4926&zoom=15&widthlayer=roadwidth',
			'fields' => array (
				'bbox' => '%bbox',
				'zoom' => '%zoom',
				'widthlayer' => array (
					'type' => 'string',
					'values' => 'roadwidth|widthstatus',
					'description' => 'CyIPT layer: road width (Including footway and verges), width status (Is there enough width for proposed infrastructure)',
				),
			),
		);
	}


	# PCT
	public function pctModel (&$error = false)
	{
		# Layer
		$layers = array (
			'pctcensus',
			'pctgov',
			'pctgen',
			'pctdutch',
			'pctebike',
		);
		if (!isSet ($this->get['pctlayer']) || !in_array ($this->get['pctlayer'], $layers)) {
			$error = 'A valid layer must be supplied.';
			return false;
		}
		$layer = $this->get['pctlayer'];

		# Base values
		$fields = array (
			// 'id',
			"{$layer} AS cycles"
		);
		$constraints = array (
			'geotext && ST_MakeEnvelope(:w, :s, :e, :n, 4326)',
		);
		$parameters = $this->bbox;
		$limit = 2000;

		# Set filters based on zoom
		switch (true) {

      # Max Zoomed Out
			case ($this->zoom == 11):
				$fields[] = 'ST_AsGeoJSON(ST_Simplify(geotext, 0.00412 )) AS geometry';
				$limit = 5000;
				$constraints[] = "{$layer} > 250";
				break;

			case ($this->zoom == 12):
				$fields[] = 'ST_AsGeoJSON(ST_Simplify(geotext, 0.00206 )) AS geometry';
				$limit = 5000;
				$constraints[] = "{$layer} > 100";
				break;

		  case ($this->zoom == 13):
				$fields[] = 'ST_AsGeoJSON(ST_Simplify(geotext, 0.00103 )) AS geometry';
				$limit = 5000;
				$constraints[] = "{$layer} > 50";
				break;

			case ($this->zoom == 14):
				$fields[] = 'ST_AsGeoJSON(ST_Simplify(geotext, 0.00052 )) AS geometry';
				$limit = 5000;
				$constraints[] = "{$layer} > 10";
				break;

			case ($this->zoom >= 15):
				$fields[] = 'ST_AsGeoJSON(geotext) AS geometry';
				$limit = 5000;
				$constraints[] = "{$layer} > 0";
				break;

		  #Max Zoomed In

			# Other
			default:
				$error = 'Please zoom in.';
				return false;
		}

		# Return the model
		return array (
			'table' => $this->tablePrefix . 'roads',
			'fields' => $fields,
			'constraints' => $constraints,
			'parameters' => $parameters,
			'limit' => $limit,
		);
	}


	# Documentation
	public static function pctDocumentation ()
	{
		return array (
			'name' => 'Propensity to Cycle Tool',
			'example' => '/api/v1/pct.json?bbox=-2.6404,51.4698,-2.5417,51.4926&zoom=15&pctlayer=pctcensus',
			'fields' => array (
				'bbox' => '%bbox',
				'zoom' => '%zoom',
				'pctlayer' => array ('type' => 'string', 'values' => 'pctcensus|pctgov|pctgen|pctdutch|pctebike', 'description' => 'PCT layer', ),
			),
		);
	}


	# Traffic data
	public function trafficModel (&$error = false)
	{
		# Base values
		$fields = array (
			// 'id',
			'aadt AS daily_total',
		);
		$constraints = array (
			'geotext && ST_MakeEnvelope(:w, :s, :e, :n, 4326)',
			'aadt IS NOT NULL',
		);
		$parameters = $this->bbox;
		$limit = false;

		# Set filters based on zoom
		switch (true) {

			# Max Zoomed Out
			case ($this->zoom == 11):
				$fields[] = 'ST_AsGeoJSON(ST_Simplify(geotext, 0.00412 )) AS geometry';
				$limit = 5000;
				break;

			case ($this->zoom == 12):
				$fields[] = 'ST_AsGeoJSON(ST_Simplify(geotext, 0.00206 )) AS geometry';
				$limit = 5000;
				break;

		  case ($this->zoom == 13):
				$fields[] = 'ST_AsGeoJSON(ST_Simplify(geotext, 0.00103 )) AS geometry';
				$limit = 5000;
				break;

			case ($this->zoom == 14):
				$fields[] = 'ST_AsGeoJSON(ST_Simplify(geotext, 0.00052 )) AS geometry';
				$limit = 5000;
				break;

			case ($this->zoom >= 15):
				$fields[] = 'ST_AsGeoJSON(geotext) AS geometry';
				$limit = 5000;
				break;

		  #Max Zoomed In

			# Show nothing if too zoomed out
			default:
				$error = 'Please zoom in.';
				return false;
		}

		# Return the model
		return array (
			'table' => $this->tablePrefix . 'roads',
			'fields' => $fields,
			'constraints' => $constraints,
			'parameters' => $parameters,
			'limit' => $limit,
		);
	}


	# Documentation
	public static function trafficDocumentation ()
	{
		return array (
			'name' => 'Traffic counts',
			'example' => '/api/v1/traffic.json?bbox=-2.6404,51.4698,-2.5417,51.4926&zoom=15',
			'fields' => array (
				'bbox' => '%bbox',
				'zoom' => '%zoom',
			),
		);
	}

  # Collisions Roads
	public function collisionsroadModel (&$error = false)
	{
		# Layer
		$layers = array (
			'ncollisionsSlight',
			'ncollisionsSerious',
			'ncollisionsFatal',
			'bikeCasSlight',
			'bikeCasSerious',
			'bikeCasFatal'

		);
		if (!isSet ($this->get['collisionsroadlayer']) || !in_array ($this->get['collisionsroadlayer'], $layers)) {
			$error = 'A valid layer must be supplied.';
			return false;
		}
		$layer = $this->get['collisionsroadlayer'];

		# Base values
		$fields = array (
			// 'id',
			"{$layer} AS ncollisions"
		);
		$constraints = array (
			'geotext && ST_MakeEnvelope(:w, :s, :e, :n, 4326)',
		);
		$parameters = $this->bbox;
		$limit = 2000;

		# Set filters based on zoom
		switch (true) {

      # Max Zoomed Out
			case ($this->zoom == 11):
				$fields[] = 'ST_AsGeoJSON(ST_Simplify(geotext, 0.00412 )) AS geometry';
				$limit = 5000;
				$constraints[] = "{$layer} > 0";
				break;

			case ($this->zoom == 12):
				$fields[] = 'ST_AsGeoJSON(ST_Simplify(geotext, 0.00206 )) AS geometry';
				$limit = 5000;
				$constraints[] = "{$layer} > 0";
				break;

		  case ($this->zoom == 13):
				$fields[] = 'ST_AsGeoJSON(ST_Simplify(geotext, 0.00103 )) AS geometry';
				$limit = 5000;
				$constraints[] = "{$layer} > 0";
				break;

			case ($this->zoom == 14):
				$fields[] = 'ST_AsGeoJSON(ST_Simplify(geotext, 0.00052 )) AS geometry';
				$limit = 5000;
				$constraints[] = "{$layer} > 0";
				break;

			case ($this->zoom >= 15):
				$fields[] = 'ST_AsGeoJSON(geotext) AS geometry';
				$limit = 5000;
				$constraints[] = "{$layer} > 0";
				break;

		  #Max Zoomed In

			# Other
			default:
				$error = 'Please zoom in.';
				return false;
		}

		# Return the model
		return array (
			'table' => $this->tablePrefix . 'roads',
			'fields' => $fields,
			'constraints' => $constraints,
			'parameters' => $parameters,
			'limit' => $limit,
		);
	}


	# Documentation
	public static function collisionsroadDocumentation ()
	{
		return array (
			'name' => 'Collisions (Roads)',
			'example' => '/api/v1/collisionsroad.json?bbox=-2.6404,51.4698,-2.5417,51.4926&zoom=15&collisionsroadlayer=ncollisionsSlight',
			'fields' => array (
				'bbox' => '%bbox',
				'zoom' => '%zoom',
				'collisionsroadlayer' => array ('type' => 'string', 'values' => 'ncollisionsSlight|ncollisionsSerious|ncollisionsFatal|bikeCasSlight|bikeCasSerious|bikeCasFatal', 'description' => 'Collisions (Roads)', ),
			),
		);
	}

  # Collisions Junction
	public function collisionsjunctionsModel (&$error = false)
	{
		# Layer
		$layers = array (
			'ncollisionsSlight',
			'ncollisionsSerious',
			'ncollisionsFatal',
			'bikeCasSlight',
			'bikeCasSerious',
			'bikeCasFatal'

		);
		if (!isSet ($this->get['collisionsjunctionslayer']) || !in_array ($this->get['collisionsjunctionslayer'], $layers)) {
			$error = 'A valid layer must be supplied.';
			return false;
		}
		$layer = $this->get['collisionsjunctionslayer'];

		# Base values
		$fields = array (
			// 'id',
			"{$layer} AS ncollisions"
		);
		$constraints = array (
			'geotext && ST_MakeEnvelope(:w, :s, :e, :n, 4326)',
		);
		$parameters = $this->bbox;
		$limit = 2000;

		# Set filters based on zoom
		switch (true) {

			# Nearest
			case ($this->zoom >= 12):
				$fields[] = 'ST_AsGeoJSON(ST_Buffer(geotext, 0.0001)) AS geometry';
				$constraints[] = "{$layer} > 0";
				break;


			# Other
			default:
				$error = 'Please zoom in.';
				return false;
		}

		# Return the model
		return array (
			'table' => $this->tablePrefix . 'junctions',
			'fields' => $fields,
			'constraints' => $constraints,
			'parameters' => $parameters,
			'limit' => $limit,
		);
	}


	# Documentation
	public static function collisionsjunctionsDocumentation ()
	{
		return array (
			'name' => 'Collisions (Roads)',
			'example' => '/api/v1/collisionsjunctions.json?bbox=-2.6404,51.4698,-2.5417,51.4926&zoom=15&collisionsjunctionslayer=ncollisionsSlight',
			'fields' => array (
				'bbox' => '%bbox',
				'zoom' => '%zoom',
				'collisionsjunctionslayer' => array ('type' => 'string', 'values' => 'ncollisionsSlight|ncollisionsSerious|ncollisionsFatal|bikeCasSlight|bikeCasSerious|bikeCasFatal', 'description' => 'Collisions (Junctions)', ),
			),
		);
	}


	# Collisions
	public function collisionsModel (&$error = false)
	{
		# Show nothing if too zoomed out
		if ($this->zoom < 13) {
			$error = 'Please zoom in.';
			return false;
		}

		# URL parameters
		if (!isSet ($this->get['yearfrom']) || !is_numeric ($this->get['yearfrom']) || ($this->get['yearfrom'] < 1985) || ($this->get['yearfrom'] > 2015)) {
			$error = 'A valid start year must be supplied.';
			return false;
		}
		if (!isSet ($this->get['yearto']) || !is_numeric ($this->get['yearto']) || ($this->get['yearto'] < 1985) || ($this->get['yearto'] > 2015)) {
			$error = 'A valid start year must be supplied.';
			return false;
		}
		if ($this->get['yearfrom'] > $this->get['yearto']) {
			$error = 'The start year must not be after the finish year.';
			return false;
		}
		$severityCodes = array ('fatal' => 1, 'serious' => 2, 'slight' => 3);
		if (!isSet ($this->get['severity']) || !array_key_exists ($this->get['severity'], $severityCodes)) {
			$error = 'A valid severity value must be supplied.';
			return false;
		}
		$severity = $severityCodes[$this->get['severity']];

		# Base values
		$fields = array (
			'AccRefGlobal AS id',
			'DateTime AS datetime',
			"(CASE severity WHEN 1 then 'fatal' WHEN 2 then 'serious' WHEN 3 then 'slight' END) AS severity",
			'ST_AsGeoJSON(geotext) AS geometry',
		);
		$constraints = array (
			'geotext && ST_MakeEnvelope(:w, :s, :e, :n, 4326)',
			'severity = :severity',
			'DateTime BETWEEN :yearfrom and :yearto'
		);
		$parameters = $this->bbox;
		$parameters['yearfrom'] = $this->get['yearfrom'] . '-01-01 00:00:00';
		$parameters['yearto']   = $this->get['yearto']   . '-12-31 23:59:59';
		$parameters['severity'] = $severity;
		$limit = 500;

		# Return the model
		return array (
			'table' => 'accidents',
			'fields' => $fields,
			'constraints' => $constraints,
			'parameters' => $parameters,
			'limit' => $limit,
		);
	}


	# Documentation
	public static function collisionsDocumentation ()
	{
		return array (
			'name' => 'Collisions',
			'example' => '/api/v1/collisions.json?bbox=-2.6404,51.4698,-2.5417,51.4926&zoom=15&yearfrom=2013&yearto=2015&severity=fatal',
			'fields' => array (
				'bbox' => '%bbox',
				'zoom' => '%zoom',
				'yearfrom' => array ('type' => 'int', 'values' => '1985-2015', 'description' => 'Start year', ),
				'yearto' => array ('type' => 'int', 'values' => '1985-2015', 'description' => 'Finish year', ),
				'severity' => array ('type' => 'string', 'values' => 'fatal|serious|slight', 'description' => 'Severity, based on STATS19 value', ),
			),
		);
	}


	# Travel to Work Areas; see: https://en.wikipedia.org/wiki/Travel_to_work_area
	public function ttwaModel (&$error = false)
	{
		# Base values
		$fields = array (
			'id',
			'name',
			'code',
			'ST_AsGeoJSON (ST_Simplify (geotext, 0.01, true)) AS geometry',
		);

		# Return the model
		return array (
			'table' => 'ttwa',
			'fields' => $fields,
			'constraints' => array (),
			'parameters' => array (),
			'limit' => false,
		);
	}


	# Documentation
	public static function ttwaDocumentation ()
	{
		return array (
			'name' => 'Travel to Work Areas (TTWA)',
			'example' => '/api/v1/ttwa.json?bbox=-2.6404,51.4698,-2.5417,51.4926&zoom=15',
			'fields' => array (
				'bbox' => '%bbox',	// NB not actually used - added due to API standard
				'zoom' => '%zoom',	// NB not actually used - added due to API standard
			),
		);
	}


	# Status
	public function statusModel (&$error = false)
	{
		# Manual query
		$query = "SELECT
			(SELECT COUNT(*) FROM schemes) AS totalSchemes,
			(SELECT SUM(cost) / 1000000000 FROM schemes) AS totalCostBillion,
			(SELECT (SELECT SUM( CAST (cost AS INT) ) FROM schemes) / (SELECT COUNT(*) FROM schemes)) AS averageCostPerScheme,
			(SELECT SUM( CAST (length AS INT) / 1000 ) FROM schemes) AS totalLengthKm,
			(SELECT ROUND ((SELECT SUM( CAST (length AS INT) / 1000 ) FROM schemes) / (SELECT COUNT(*) FROM schemes), 1)) AS averageLengthKmPerScheme,
			(SELECT SUM(totalBen) / 1000000000 FROM schemes) AS totalBenefitsBillion,
			(SELECT (SELECT SUM( CAST (totalBen AS INT) ) FROM schemes) / (SELECT COUNT(*) FROM schemes) ) AS averageBenefitsPerScheme,
			(SELECT ROUND (CAST (AVG(costBenRatio) AS NUMERIC), 1) FROM schemes) AS averageBenefitCostRatio
		;";

		# Return the model
		return array (
			'query' => $query,
			'singular' => true,
			'format' => 'flatjson',
		);
	}


	# Documentation
	public static function statusDocumentation ()
	{
		return array (
			'name' => 'Status',
			'example' => '/api/v1/status.json?bbox=-2.6404,51.4698,-2.5417,51.4926&zoom=15',
			'fields' => array (
				'bbox' => '%bbox',	// NB not actually used - added due to API standard
				'zoom' => '%zoom',	// NB not actually used - added due to API standard
			),
		);
	}
}

?>
