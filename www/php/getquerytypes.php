<?php

include 'processargstosql.php';
include 'credentials.php';

date_default_timezone_set('UTC');

$queries="SELECT lang, COUNT(*) as number FROM queries";

#TODO: Investigate why PHP refuses to work with the following inner-join statement.
$queries = "SELECT
	qtype_lookup.qtype_desc as `query_type`,
	COUNT(*) as `number`
FROM
    queries
INNER JOIN qtype_lookup ON
	qtype_lookup.qtype_string = queries.query_type ";


$group = " GROUP BY qtype_lookup.qtype_desc ;";


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
	print format_error("Error: could not get aggregated queries");
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

?>
