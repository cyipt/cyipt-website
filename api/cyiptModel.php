<?php

# CyIPT model
class cyiptModel
{
	# Constructor
	public function __construct ($bbox, $zoom, $get)
	{
		# Set values provided by the API
		$this->bbox = $bbox;	// Validated
		$this->zoom = $zoom;	// Validated
		$this->get = $get;		// Unvalidated contents of $_GET, i.e. query string values
		
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
			'id',
			'Recommended',
		);
		$constraints = array (
			'geotext && ST_MakeEnvelope(:w, :s, :e, :n, 4326)',
			"Recommended != 'None'",
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
			'table' => 'roads',
			'fields' => $fields,
			'constraints' => $constraints,
			'parameters' => $parameters,
			'limit' => $limit,
		);
	}
	
	
	# Schemes
	public function schemesModel (&$error = false)
	{
		# Show nothing if too zoomed out
		if ($this->zoom < 15) {
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
			'idGlobal',
			'schtype',
			'cost',
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
			'table' => 'schemes',
			'fields' => $fields,
			'constraints' => $constraints,
			'parameters' => $parameters,
			'limit' => $limit,
		);
	}
	
	
	# Existing infrastructure
	public function existingModel (&$error = false)
	{
		# Base values
		$fields = array (
			'roads.id',
			"CONCAT(roadtypes.cyclewayleft,' ',roadtypes.cyclewayright) AS existing",
		);
		$constraints = array (
			'roads.geotext && ST_MakeEnvelope(:w, :s, :e, :n, 4326)',
			"(
				NOT (roadtypes.cyclewayleft = 'no' AND roadtypes.cyclewayright = 'no')
			  	    OR roadtypes.roadtype = 'Cycleway'
			  	    OR roadtypes.roadtype = 'Living Street'
			  	    OR roadtypes.roadtype = 'Segregated Cycleway'
			  	    OR roadtypes.roadtype = 'Segregated Shared Path'
			  	    OR roadtypes.roadtype = 'Shared Path'
			 )",
		);
		$parameters = $this->bbox;
		$limit = false;
		
		# Set filters based on zoom
		switch (true) {
			
			# Near
			case ($this->zoom >= 16):
				$fields[] = 'ST_AsGeoJSON(roads.geotext) AS geometry';
				$limit = 2000;
				break;
				
			# Far
			case ($this->zoom >= 11 && $this->zoom <= 15):
				$fields[] = 'ST_AsGeoJSON(ST_Simplify(roads.geotext, 0.3)) AS geometry';
				$limit = 5000;
				break;
				
			# Show nothing if too zoomed out
			default:
				$error = 'Please zoom in.';
				return false;
		}
		
		# Return the model
		return array (
			'table' => 'roads INNER JOIN roadtypes ON roads.rtid = roadtypes.rtid',
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
			),
		);
	}
	
	
	# Road widths
	public function widthModel (&$error = false)
	{
		# Base values
		$fields = array (
			'id',
		);
		$constraints = array (
			'geotext && ST_MakeEnvelope(:w, :s, :e, :n, 4326)',
		);
		$parameters = $this->bbox;
		$limit = false;
		
		# Layer
		$layers = array (
			'road' => 'width',
			'path' => 'widthpath',
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
			'table' => 'roads',
			'fields' => $fields,
			'constraints' => $constraints,
			'parameters' => $parameters,
			'limit' => $limit,
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
			'id',
			"{$layer} AS ncycles"
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
			'table' => 'roads',
			'fields' => $fields,
			'constraints' => $constraints,
			'parameters' => $parameters,
			'limit' => $limit,
		);
	}
	
	
	# Traffic data
	public function trafficModel (&$error = false)
	{
		# Base values
		$fields = array (
			'id',
			'aadt',
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
			'table' => 'roads',
			'fields' => $fields,
			'constraints' => $constraints,
			'parameters' => $parameters,
			'limit' => $limit,
		);
	}
	
	
	# Collisions
	public function collisionsModel (&$error = false)
	{
		# Show nothing if too zoomed out
		if ($this->zoom < 15) {
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
		if (!isSet ($this->get['severity']) || !is_numeric ($this->get['severity']) || !in_array ($this->get['severity'], array (1, 2, 3), true)) {
			$error = 'A valid severity value must be supplied.';
			return false;
		}
		
		# Base values
		$fields = array (
			'AccRefGlobal',
			'DateTime',
			'severity',
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
		$parameters['severity'] = $this->get['severity'];
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
}

?>