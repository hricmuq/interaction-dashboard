<?php

include 'processargstosql.php';
include 'credentials.php';

date_default_timezone_set('UTC');

#Query Header
$queries = "SELECT DATE_FORMAT(`timestamp`,\"%w\") AS `day`, 
		DATE_FORMAT(`timestamp`,\"%H\") AS `hour`, 
		COUNT(*) AS value 
		FROM Hala1.queries ";

$group = " GROUP BY DATE_FORMAT(`timestamp`,\"%w %H\");";

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
    print format_error("Error: could not get heatmap data");
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
header('Content-Type: application/json');

#Dump JSON
echo json_encode($rows);

mysqli_close($con);
?>
