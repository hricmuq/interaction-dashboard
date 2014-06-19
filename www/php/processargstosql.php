<?php

function processArgsToSql($arg_array)
{

$where = 0;

$sql_arguments= "";

/*if(isset($arg_array['meta']))
{
	$meta = "";
}

else 
{
	$meta = " WHERE query_type NOT LIKE \"%meta%\"";
	$where = 1;
	$sql_arguments .= $meta;
}
*/

if(isset($arg_array['qtype']))
{
	$qtype_query = " `query_type` IN ('".implode("','",$_GET['qtype'])."') ";
	if($where==0)
	{
		$qtype = " WHERE " . $qtype_query;
		$where =1;
	}
		
	else {
		$qtype = " AND " . $qtype_query;
	}
	
	$sql_arguments .=$qtype;
}


if(isset($arg_array['date_start']))
{
	$time_flag=1;
	
	$start = date('Y-m-d H:i:s',strtotime(urldecode(strval($arg_array['date_start']))));
	
	if(isset($arg_array['date_end']))
		$end = date('Y-m-d H:i:s',strtotime(urldecode(strval($arg_array['date_end']))));
	else #Current Time 
		$end = date('Y-m-d H:i:s', time());
	
	$query_timestamp = " `timestamp` BETWEEN '".$start."' AND '".$end."' ";
	
	if($where==0)
	{
		$sql_arguments .= " WHERE " . $query_timestamp;
		$where = 1; 
	}
	
	else
	{
		$sql_arguments .= " AND " . $query_timestamp;
	}

}

if(isset($arg_array['response'])  )
{
	
	$proper_where = array();
		
	if( in_array("proper", $arg_array['response']) )
	{
		$proper_where[] = " `proper_response` IS True ";
		
	}
	
	if(  in_array("missed", $arg_array['response']) )
	{
		$proper_where[] = " `proper_response` IS False ";
	}
	
	if( count($proper_where) != 0 ){
		$proper_where = '(' . implode(' OR ', $proper_where) . ')';
	
		if($where == 0)
		{
			$sql_arguments .= " WHERE ";
			$where = 1;
		}

		else
		{
			$sql_arguments .= " AND ";
		}

		$sql_arguments .= $proper_where;
	}
	
}


if(isset($arg_array['lang']))
{
	$lang = " `lang` IN ('".implode("','",$_GET['lang'])."') ";
	
	if($where == 0)
	{
		$sql_arguments .= " WHERE ";
		$where = 1;
	}
	
	else
	{
		$sql_arguments .= " AND ";
	}
	
	$sql_arguments .= $lang;
}

if(isset($arg_array['query_contains']) && strlen($arg_array['query_contains'])!=0)
{
	if( isset($arg_array['query_regex']) )
        $query_c = " `query_text` REGEXP '{$_GET['query_contains']}'";
    else
        $query_c = " LOWER(`query_text`) LIKE '%".strtolower($_GET['query_contains'])."%'";

	if($where == 0)
	{
		$sql_arguments .= " WHERE ";
		$where = 1;
	}

	else
	{
		$sql_arguments .= " AND ";
	}

	$sql_arguments .= $query_c;
}

if(isset($arg_array['response_contains']) && strlen($arg_array['response_contains'])!=0)
{
    if( isset($arg_array['response_regex']) )
        $response_c = " `response_text` REGEXP '{$_GET['response_contains']}'";
    else    
        $response_c = "LOWER(`response_text`) LIKE '%".strtolower($_GET['response_contains'])."%'";

	if($where == 0)
	{
		$sql_arguments .= " WHERE ";
		$where = 1;
	}

	else
	{
		$sql_arguments .= " AND ";
	}

	$sql_arguments .= $response_c;
}

if(isset($arg_array['limit']))
{
	$limit = intval($arg_array['limit']);
}
else
{
	$limit=20;
}




return $sql_arguments;

}

function format_error($error_string)
{
	$return_object= array();
	$return_object['error']=$error_string;
	header('HTTP/1.0 404 Not Found');
	return json_encode($return_object);
}

?>
