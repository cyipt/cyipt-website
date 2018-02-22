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

			# Near
			case ($this->zoom >= 16):
				$fields[] = 'ST_AsGeoJSON(geotext) AS geometry';
				$limit = 2000;
				break;

			# Far
			case ($this->zoom >= 11 && $this->zoom <= 15):
				$fields[] = 'ST_AsGeoJSON(ST_Simplify(geotext, 0.3)) AS geometry';
				$limit = 5000;
				break;

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

		# URL parameters
		if (!isSet ($this->get['costfrom']) || !is_numeric ($this->get['costfrom']) || ($this->get['costfrom'] < 0) || ($this->get['costfrom'] > 999999999)) {
			$error = 'A valid start cost must be supplied.';
			return false;
		}
		if (!isSet ($this->get['costto']) || !is_numeric ($this->get['costto']) || ($this->get['costto'] < 0) || ($this->get['costto'] > 999999999)) {
			$error = 'A valid start cost must be supplied.';
			return false;
		}
		if ($this->get['costfrom'] > $this->get['costto']) {
			$error = 'The start cost must not be after the finish cost.';
			return false;
		}

		# Base values
		$fields = array (
			// 'idGlobal AS id',
			'infratype AS type',
			'CAST(cost AS int)',
			'ST_AsGeoJSON(geotext) AS geometry',
		);
		$constraints = array (
			'geotext && ST_MakeEnvelope(:w, :s, :e, :n, 4326)',
			'cost BETWEEN :costfrom and :costto'
		);
		$parameters = $this->bbox;
		$parameters['costfrom'] = $this->get['costfrom'];
		$parameters['costto']   = $this->get['costto'];
		$limit = 1000;

		# Set filters based on zoom
		switch (true) {

			# Near
			case ($this->zoom >= 15):
				$fields[] = 'ST_AsGeoJSON(geotext) AS geometry';
				$limit = 2000;
				break;

			# Far
			case ($this->zoom >= 10 && $this->zoom <= 14):
				$fields[] = 'ST_AsGeoJSON(ST_Simplify(geotext, 0.1)) AS geometry';
				$limit = 5000;
				break;

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
				'costfrom' => array ('type' => 'int', 'values' => '0-999999999', 'description' => 'Start cost', ),
				'costto' => array ('type' => 'int', 'values' => '0-999999999', 'description' => 'Finish cost', ),
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
					"{$this->tablePrefix}roadtypes.cyclewayleft",
					"{$this->tablePrefix}roadtypes.cyclewayright",
					#!# This is used only for colouring - ideally should not expose this
					"CONCAT({$this->tablePrefix}roadtypes.cyclewayleft,' ',{$this->tablePrefix}roadtypes.cyclewayright) AS existing",
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
		$fields[] = 'osmid';
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

			# Near
			case ($this->zoom >= 16):
				$fields[] = "ST_AsGeoJSON({$this->tablePrefix}roads.geotext) AS geometry";
				$limit = 2000;
				break;

			# Far
			case ($this->zoom >= 11 && $this->zoom <= 15):
				$fields[] = "ST_AsGeoJSON(ST_Simplify({$this->tablePrefix}roads.geotext, 0.3)) AS geometry";
				$limit = 5000;
				break;

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
		);
		$parameters = $this->bbox;
		$limit = false;

		# Layer
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

			# Near
			case ($this->zoom >= 17):
				$fields[] = 'ST_AsGeoJSON(geotext) AS geometry';
				$limit = 2000;
				break;

			# Far
			case ($this->zoom >= 15 && $this->zoom <= 16):
				$fields[] = 'ST_AsGeoJSON(ST_Simplify(geotext, 0.3)) AS geometry';
				$limit = 5000;
				break;

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

			# Nearest
			case ($this->zoom >= 17):
				$fields[] = 'ST_AsGeoJSON(geotext) AS geometry';
				$constraints[] = "{$layer} > 0";
				break;

			# Near
			case ($this->zoom >= 14 && $this->zoom <= 16):
				$fields[] = 'ST_AsGeoJSON(ST_Simplify(geotext, 0.1)) AS geometry';
				$constraints[] = "{$layer} > 100";
				break;

			# Nearer
			case ($this->zoom >= 11 && $this->zoom <= 13):
				$fields[] = 'ST_AsGeoJSON(ST_Simplify(geotext, 0.2)) AS geometry';
				$constraints[] = "{$layer} > 500";
				break;

			# Far
			case ($this->zoom <= 10):
				$fields[] = 'ST_AsGeoJSON(ST_Simplify(geotext, 0.3)) AS geometry';
				$constraints[] = "{$layer} > 1000";
				break;

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

			# Near
			case ($this->zoom >= 13):
				$fields[] = 'ST_AsGeoJSON(geotext) AS geometry';
				$limit = 5000;
				break;

			# Far
			case ($this->zoom >= 11 && $this->zoom <= 12):
				$fields[] = 'ST_AsGeoJSON(ST_Simplify(geotext, 0.2)) AS geometry';
				$limit = 10000;
				break;

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

			# Nearest
			case ($this->zoom >= 14):
				$fields[] = 'ST_AsGeoJSON(geotext) AS geometry';
				$constraints[] = "{$layer} > 0";
				break;

			# Near
			case ($this->zoom >= 13 && $this->zoom <= 15):
				$fields[] = 'ST_AsGeoJSON(ST_Simplify(geotext, 0.1)) AS geometry';
				$constraints[] = "{$layer} > 0";
				break;


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
			'ncollisions',
			'bikeCas'

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
				$fields[] = 'ST_AsGeoJSON(ST_Buffer(geotext, 1)) AS geometry';
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
			'example' => '/api/v1/collisions.json?bbox=-2.6404,51.4698,-2.5417,51.4926&zoom=15&yearfrom=2013&yearto=2015&severity=1',
			'fields' => array (
				'bbox' => '%bbox',
				'zoom' => '%zoom',
				'yearfrom' => array ('type' => 'int', 'values' => '1985-2015', 'description' => 'Start year', ),
				'yearto' => array ('type' => 'int', 'values' => '1985-2015', 'description' => 'Finish year', ),
				'severity' => array ('type' => 'int', 'values' => '1|2|3', 'description' => 'Severity: 1 (fatal), 2 (serious), 3 (slight)', ),
			),
		);
	}
}

?>
