<?php



# Define the settings, using the credentials above
$settings = array (
	'hostname' => 'localhost',
	'username' => 'cyipt',
	'password' => trim (file_get_contents('/tmp/cyipt-password.txt')),
	'database' => 'cyipt',
);


# Connect to the database
# We use the PDO database abstraction library, and provide a DSN connection string in this format: 'pgsql:host=localhost;dbname=example'
try {
	$databaseConnection = new PDO ("pgsql:host={$settings['hostname']};dbname={$settings['database']}", $settings['username'], $settings['password']);
	$databaseConnection->setAttribute (PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	$databaseConnection->setAttribute (PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
	print "Error!: " . $e->getMessage ();
	die;
}


$bbox = (isSet ($_GET['bbox']) ? $_GET['bbox'] : '');

if (!$bbox) {
	$response = array ('error' => "No bbox was supplied.");
	echo json_encode ($response);
	die;
}


list ($w, $s, $e, $n) = explode (',', $bbox);




# Construct the query
$query = "
	SELECT
		*,
		ST_AsGeoJSON(geotext) AS geotext
	FROM bristol
	WHERE geotext && ST_MakeEnvelope(:w, :s, :e, :n, 4326)
	LIMIT 100
;";

# Select the data
$preparedStatement = $databaseConnection->prepare ($query);
$preparedStatement->bindParam (':w', $w);
$preparedStatement->bindParam (':s', $s);
$preparedStatement->bindParam (':e', $e);
$preparedStatement->bindParam (':n', $n);
$data = array ();
if ($preparedStatement->execute ()) {
	while ($row = $preparedStatement->fetch ()) {
		$data[] = $row;
	}
}

foreach ($data as $index => $row) {
	$data[$index]['geotext'] = json_decode ($row['geotext'], true);
}


$geojson = array ();
$geojson['type'] = 'FeatureCollection';
$geojson['features'] = array ();
foreach ($data as $row) {
	$properties = $row;
	unset ($properties['geotext']);
	$geojson['features'][] = array (
		'type' => 'Feature',
		'geometry' => $row['geotext'],
		'properties' => $properties,
	);
}


header ('Content-Type: application/json');
echo json_encode ($geojson, JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);


?>
