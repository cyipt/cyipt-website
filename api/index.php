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
	$databaseConnection->setAttribute (PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
	print "Error!: " . $e->getMessage ();
	die;
}


/*
$name = (isSet ($_GET['name']) ? $_GET['name'] : '');

if (!$name) {
	$response = array ('error' => "No name was supplied.");
	echo json_encode ($response);
	die;
}
*/

# Construct the query
$query = "
	SELECT
		*,
		ST_AsGeoJSON(geotext) AS geotext
	FROM bristol
	LIMIT 10
;";

# Select the data
$preparedStatement = $databaseConnection->prepare ($query);
//$preparedStatement->bindParam (':name', $name);
$data = array ();
if ($preparedStatement->execute ()) {
	while ($row = $preparedStatement->fetch ()) {
		$data[] = $row;
	}
}

foreach ($data as $index => $row) {
	$data[$index]['geotext'] = json_decode ($row['geotext'], true);
}


header ('Content-Type: application/json');
echo json_encode ($data, JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);


?>
