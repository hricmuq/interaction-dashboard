<?php

include 'processargstosql.php';
include 'credentials.php';

date_default_timezone_set('UTC');

#Query Header
$queries = "SELECT
	`proper_response` as `response`,
	COUNT(*) as `number`
FROM
    queries";

$group = " GROUP BY `proper_response`;";

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
  print format_error("Error: could not get response data");
	return;
}


#print $sql;
#var_dump($result);

$rows = array();

while($row = mysqli_fetch_assoc($result))
{
	if($row['response']==0)
	{
		$row['response']='proper';
		
	}
	if($row['response']==1)
	{
		$row['response']='missed';
	}	
	
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
