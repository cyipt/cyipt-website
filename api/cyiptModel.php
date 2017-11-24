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
}

?>