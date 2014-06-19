<?php
include 'processargstosql.php';
include 'credentials.php';

date_default_timezone_set('UTC');

$queries="SELECT `query_text`, COUNT(`query_text`)
AS `query_occurrence` FROM `queries`";

$limit=20;

$arguments = processArgsToSql($_GET);

$con = connectdb();
if (!$con)
  {
  die(format_error('Error: Could not connect: ' . mysqli_error($con)));
  	  }


$group = "GROUP BY `query_text`
  ORDER BY `query_occurrence` DESC
  LIMIT ".$limit.";";
  
$sql = $queries.$arguments.$group;

#echo $sql."<br>";

$result = mysqli_query($con,$sql);

if(empty($result))
{
	print format_error("Error: could not get aggregated queries");
	return;
}

$rows = array();

while($row = mysqli_fetch_assoc($result))
{
	$rows[] = $row;		
}

#Print Header
header('Content-Type: application/json');

#Dump JSON
print "{\"items\":";
print json_encode($rows);
print "}";
mysqli_close($con);
?>
