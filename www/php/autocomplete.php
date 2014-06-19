<?php
# Autocomplete PHP script. 
# Requires two input feilds:
# type: query_text or response_text
# term: search term required.

include 'credentials.php';

date_default_timezone_set('UTC');


$con = connectdb();
if (!$con)
  {
  die('Could not connect: ' . mysqli_error($con));
  }



$sql = "SELECT ".$_REQUEST['type']
	." FROM queries "
	."WHERE ".$_REQUEST['type']." LIKE '".$_REQUEST['term']."%' 
	GROUP BY ".$_REQUEST['type']." ORDER BY COUNT(*) LIMIT 10";
 

$query = mysqli_query($con, $sql);

$results = array();


while($row = mysqli_fetch_array($query))
{
	$results[] = array('label' => $row[$_REQUEST['type']]);
}

#echo $sql;
header('Content-Type: application/json');
echo json_encode($results);

mysqli_close($con);
?>
