<?php

include 'processargstosql.php';
include 'credentials.php';

date_default_timezone_set('UTC');

$queries="SELECT * FROM interactions INNER JOIN queries ON interactions.id = queries.interaction_id ";
$group = " ORDER BY begin_timestamp;";
//WHERE query_type NOT LIKE \"%meta%\"";

$arguments = processArgsToSql($_GET);


$con = connectdb();
if (!$con)
  {
  die(format_error('Error: Could not connect: ' . mysqli_error($con)));
  	  }

	  

$sql = $queries.$arguments.$group;

$result = mysqli_query($con,$sql);

if(empty($result))
{
	print format_error("Error: could not get interactions");
	return;
}

$nested_data = array();
//$interaction = new StdClass();
$last_interaction_id = 0;

while($row = mysqli_fetch_object($result))
{
	//echo json_encode($row);
	if($last_interaction_id!=$row->interaction_id)
	{
		if($last_interaction_id!=0)
		{
			$nested_data[]->interaction = $interaction;
		}
		$interaction=new StdClass();
		$interaction->id=$row->interaction_id;
		$interaction->begin_timestamp=$row->begin_timestamp;
		$interaction->end_timestamp=$row->end_timestamp;
		$interaction->num_queries=$row->num_queries;
		$interaction->queries= array();
		$last_interaction_id=$row->interaction_id;
	}

		$query = new StdClass();
		$query->id = $row->id;
		$query->timestamp = $row->timestamp;
		$query->query_text = $row->query_text;
		$query->response_text = $row->response_text;
		$query->lang = $row->lang;
		$query->query_type = $row->query_type;
		$query->proper_response = $row->proper_response;
		$query->sensor_data = $row->sensor_data;
		$query->misc = $row->misc;
		
		$interaction->queries[]->query=$query;
}

$nested_data[]->interaction = $interaction;


//echo json_encode($result);

#Print Header
header('Content-Type: application/json');

#Dump JSON
echo json_encode($nested_data);

//echo json_encode($final_result);
//print $final_result;

mysqli_close($con);
?>
