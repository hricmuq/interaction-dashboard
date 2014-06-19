<?php

include 'processargstosql.php';
include 'credentials.php';

date_default_timezone_set('UTC');

$num_queries="SELECT COUNT(*)
AS `total_queries` FROM `queries`";

$num_inter="SELECT COUNT(*) AS total_interactions FROM 
(SELECT DISTINCT(`interaction_id`) FROM `interactions`
		INNER JOIN queries ON interactions.id = queries.interaction_id  ";

$avg_queries="SELECT AVG(num_queries) as `avg_queries` FROM
(SELECT DISTINCT(interaction_id), num_queries
 FROM `interactions`
		INNER JOIN queries ON interactions.id = queries.interaction_id ";

$char_queries = "SELECT AVG(CHAR_LENGTH(query_text))
		AS avg_query_length FROM `queries`";


$where = 0;
$and = 1;

$query_timestamp = "";
$inter_timestamp = "";


$arguments = processArgsToSql($_GET);

#TODO: Better handling of interaction arguments, possibly through new SQL.

/*if(isset($_GET['date_start']))
{
	
	$start = date('Y-m-d H:i:s',strtotime(urldecode(strval($_GET['date_start']))));
	
	if(isset($_GET['date_end']))
		$end = date('Y-m-d H:i:s',strtotime(urldecode(strval($_GET['date_end']))));
	else #Current Time 
		$end = date('Y-m-d H:i:s', time());
	
	$inter_timestamp = " `begin_timestamp` BETWEEN '".$start."' AND '".$end."' ";
	
	$num_inter .= " WHERE " . $inter_timestamp;
	$avg_queries .= " WHERE " . $inter_timestamp;
	
	
}*/


$con = connectdb();
if (!$con)
  {
  die(format_error('Error: Could not connect: ' . mysqli_error($con)));
  	  }



#Get Number of Queries

$sql = $num_queries.$arguments." ;";
$result = mysqli_query($con,$sql);

#print $sql;
#print "<br>";

#$rows = array();

if(empty($result))
{
  print format_error("Error: could not get statistics data");
	return;
}


$row=mysqli_fetch_assoc($result);
$total_queries = $row['total_queries'];

#Get Number of Interactions
$sql = $num_inter.$arguments." ) AS INNER_QUERY ;";
$result = mysqli_query($con,$sql);
#print $sql;
if(empty($result))
{
	print "[2]";
	print $sql;
	return;
}

$row=mysqli_fetch_assoc($result);
$total_interactions = $row['total_interactions'];

/*
#Get Average of Interactions
$sql = $avg_queries.$arguments.") AS INNER_QUERY ;";
$result = mysqli_query($con,$sql);
#print $sql;
if(empty($result))
{
	print "[3]";
	print $sql;
	return;
}

$row=mysqli_fetch_assoc($result);
*/

$avg_queries = round(floatval($total_queries) / $total_interactions, 3);

#Get Average Query Length
$sql = $char_queries.$arguments." ;";
$result = mysqli_query($con,$sql);

#print $sql;
#print "<br>";

#$rows = array();

if(empty($result))
{
	print "[4]";
	return;
}


$row=mysqli_fetch_assoc($result);
$char_queries=$row['avg_query_length'];

$return_object = (object) array('total_queries' => $total_queries, 'total_interactions' => $total_interactions, 'avg_queries' => $avg_queries, 'avg_query_length' => $char_queries);

#Print Header
header('Content-Type: application/json');

#Dump JSON
#print "{\"items\" :";
print json_encode($return_object);
#print "}";
mysqli_close($con);
?>
