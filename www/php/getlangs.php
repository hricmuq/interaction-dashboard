<?php

include 'processargstosql.php';
include 'credentials.php';


date_default_timezone_set('UTC');

$queries="SELECT lang, COUNT(*) as number FROM queries";

#Query Header
$queries = "SELECT
	lang_lookup.lang_desc as `language`,
	COUNT(*) as `number`
FROM
    queries
INNER JOIN lang_lookup ON
	lang_lookup.lang_string = queries.lang ";

$group = " GROUP BY lang_lookup.lang_desc;";

$arguments = processArgsToSql($_GET);

$con = connectdb();
if (!$con)
  {
  die(format_error('Error: Could not connect: ' . mysqli_error($con)));
 	}

#Get Aggregated Queries

$sql = $queries.$arguments.$group;
$result = mysqli_query($con,$sql);

#print $sql;

if(empty($result))
{
	print format_error("Error: could not get language data");
	return;
}


#print $sql;
#var_dump($result);

$rows = array();

while($row = mysqli_fetch_assoc($result))
{
	$rows[] = $row;
	#print $row;
}

#print $rows;
$return_object = new StdClass();
$return_object->items = $rows;
#Print Header
header('Content-Type: application/json');

#Dump JSON
echo json_encode($return_object);

mysqli_close($con);
?>
