<?php


function connectdb()
{
//Enter your MySQL Credentials Here:
$host = "";
$user = "";
$pass = "";
$db = "";

$con = mysqli_connect($host,$user,$pass,$db);

mysqli_set_charset($con, 'utf8');
mysqli_select_db($con,$db);



return $con;
}

?>
