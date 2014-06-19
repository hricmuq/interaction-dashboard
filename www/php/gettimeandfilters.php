<?php
include 'credentials.php';

date_default_timezone_set('UTC');

$time_range="SELECT MIN(`timestamp`) as minTime, MAX(`timestamp`) as maxTime from queries;";
$languages="SELECT * from lang_lookup;";
$query_types="SELECT * from qtype_lookup;";
$interaction_range="SELECT MIN(num_queries) as minInteraction, MAX(num_queries) as maxInteraction from interactions;";

$con = connectdb();
if (!$con)
  {
  die(format_error('Error: Could not connect: ' . mysqli_error($con)));
  	  }



$sql = $time_range.$interaction_range;
$rows= new StdClass();
if(mysqli_multi_query($con,$sql))
{
	do
	{
		//Store first result set
    if ($result=mysqli_store_result($con))
      {
      while ($row=mysqli_fetch_assoc($result))
        {
        	foreach ($row as $key => $value)
        	{
        			$rows->$key = $value;
        	} 
        }
      mysqli_free_result($result);
      }
    }
  while (mysqli_next_result($con));
}

//print json_encode($rows);

$sql=$languages;

$result=mysqli_query($con,$sql);
//$json_languages=",\"languages\":";
$languages_rows=array();
while ($row=mysqli_fetch_array($result))
{

		$language_row = new StdClass();
  	$language_row->id =$row[1]; 
  	$language_row->description = $row[2];
  	$languages_rows[]=$language_row;
}

$rows->languages=$languages_rows;


$sql=$query_types;

$result=mysqli_query($con,$sql);
//$json_languages=",\"languages\":";
$qtype_rows=array();
while ($row=mysqli_fetch_array($result))
{
		$qtype_row = new StdClass();
  	$qtype_row->id =$row[1]; 
  	$qtype_row->description = $row[2];
  	$qtype_rows[]=$qtype_row;
}

$rows->queryTypes=$qtype_rows;


//header('Content-Type: application/json');
print json_encode($rows);




mysqli_close($con);
?>
