<?php
include 'credentials.php';

date_default_timezone_set('UTC');

$queries="SELECT
    DATE_FORMAT( `timestamp`, \"%Y-%m-%d %H:00\" ) AS time,
	COUNT(*) AS num_queries FROM queries ";

$where = 0;

$query_timestamp = "";

$group = " GROUP BY
    DATE_FORMAT( `timestamp`, \"%Y-%m-%d %H:00\" );";


$repsonse = "";

if(isset($_GET['meta']))
{
	$meta = "";
}
else 
{
	$meta = " WHERE query_type NOT LIKE \"%meta%\"";
	$where = 1;
	$queries .= $meta;
}

if(isset($_GET['start']))
{
	$time_flag=1;
	
	$start = date('Y-m-d H:i:s',strtotime(urldecode(strval($_GET['start']))));
	
	if(isset($_GET['end']))
		$end = date('Y-m-d H:i:s',strtotime(urldecode(strval($_GET['end']))));
	else #Current Time 
		$end = date('Y-m-d H:i:s', time());
	
	$query_timestamp = " `timestamp` BETWEEN '".$start."' AND '".$end."' ";
	
	if($where=0)
	{
		$queries .= " WHERE " . $query_timestamp;
		$where = 1; 
	}
	
	else
	{
		$queries .= " AND " . $query_timestamp;
	}

	
}


if(isset($_GET['proper']))
{
	$proper = " `proper_response?` IS True ";
	
	if($where = 0)
	{
		$queries .= " WHERE ";
		$where = 1;
	}
	
	else
	{
		$queries .= " AND ";
	}
	
	$queries .= $proper;
}

if(isset($_GET['lang']))
{
	$lang = " `lang` LIKE \'%".strval($_GET['lang'])."%\' ";
	
	if($where = 0)
	{
		$queries .= " WHERE ";
		$where = 1;
	}
	
	else
	{
		$queries .= " AND ";
	}
	
	$queries .= $lang;
}


$con = connectdb();
if (!$con)
  {
  die(format_error('Error: Could not connect: ' . mysqli_error($con)));
  	  }

#Get Aggregated Queries

$sql = $queries.$group;
$result = mysqli_query($con,$sql);

if(empty($result))
{
	print format_error("Error: could not get aggregated queries");
	return;
}

#print $sql;
#print "<br>";

$rows = array();

while($row = mysqli_fetch_assoc($result))
{
	$rows[] = $row;
}

#Print Header
header('Content-Type: application/json');

#Dump JSON
#print "{\"items\" :";
print json_encode($rows);
#print "}";
mysqli_close($con);
?>
