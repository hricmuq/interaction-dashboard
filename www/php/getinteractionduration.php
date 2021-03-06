<?php

include 'processargstosql.php';
include 'credentials.php';

date_default_timezone_set('UTC');
header('Content-Type: application/json');

#Query Header
$queries = "SELECT begin_timestamp, num_queries FROM interactions INNER JOIN queries ON interactions.id = queries.interaction_id";

$group = " ORDER BY begin_timestamp;";

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
#$return_object = new StdClass();
#$return_object->items = $rows;
#Print Header

#Dump JSON
echo json_encode($rows);

mysqli_close($con);
?>
