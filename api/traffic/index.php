<?php

#Allow development on a local machine
header ('Access-Control-Allow-Origin: *');

#Api Call to get traffic data
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
	$databaseConnection->setAttribute (PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION, PDO::FETCH_ASSOC);
	$databaseConnection->setAttribute (PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
	print "Error!: " . $e->getMessage ();
	die;
}

#Get Variables
$bbox = (isSet ($_GET['bbox']) ? $_GET['bbox'] : '');
$zoom = (isSet ($_GET['zoom']) ? $_GET['zoom'] : '');


#Check BBOX is Provided
if (!$bbox) {
	$response = array ('error' => "No bbox was supplied.");
	echo json_encode ($response);
	die;
}

#Check BBOX is valid
list ($w, $s, $e, $n) = explode (',', $bbox);

if(!(is_numeric($w) && is_numeric($s) && is_numeric($e) && is_numeric($n) )){
  $response = array ('error' => "BBox was invalid");
	echo json_encode ($response);
	die;
}

#Check Zoom is Provided
if (!$zoom) {
	$response = array ('error' => "No zoom was supplied.");
	echo json_encode ($response);
	die;
}

#Check Zoom is valid
if(!(is_numeric($zoom))){
  $response = array ('error' => "Zoom was invalid");
	echo json_encode ($response);
	die;
}



# Construct the query
# show nothin if too zoomed out

if($zoom >= 11 && $zoom <= 12){
  $query = "
  	SELECT
  		id, aadt,
  		ST_AsGeoJSON(ST_Simplify(geotext, 0.2))  AS geotext
  	FROM roads
  	WHERE geotext && ST_MakeEnvelope(:w, :s, :e, :n, 4326)
  	AND aadt IS NOT NULL
  	LIMIT 10000
    ;";
}else if($zoom >= 13){
  $query = "
  	SELECT
  		id, aadt,
  		ST_AsGeoJSON(geotext)  AS geotext
  	FROM roads
  	WHERE geotext && ST_MakeEnvelope(:w, :s, :e, :n, 4326)
  	AND aadt IS NOT NULL
  	LIMIT 5000
    ;";
}else{
  $response = array ('error' => "Too far zoomed out");
	echo json_encode ($response);
	die;
}

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

#Format the output as GeoJSON
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
echo json_encode ($geojson, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);


?>