<?php
	//TODO move these to seperate file once directory structure has been finalised
	$view = isset($_GET['view']) ? $_GET['view'] : 'research';
	
	/**
	 * returns the view
	 * @global string $view
	 * @return string
	 */
	function viewGet(){
		global $view;
		return $view;
	}
	
?>
<html>
	<head>
		<link href='http://fonts.googleapis.com/css?family=PT+Sans|Open+Sans|Inconsolata' rel='stylesheet' type='text/css'>
		<link type="text/css" href="css/smoothness/jquery-ui-1.10.4.custom.css" rel="stylesheet"/>
		<link type="text/css" href="css/dynatree.css" rel="stylesheet"/>
		<link type="text/css" href="css/tablet.css?x=4" rel="stylesheet"/>
		<link type="text/css" href="css/timeline.css" rel="stylesheet"/>
		<meta name="viewport" content="width=device-width, user-scalable=no">
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	</head>
	<body>
		<div id="leftMenu">
			<div class="modal"></div>
			<div class="content">
				<a class="contentLink" href="?view=research">Research View</a>
				 <!-- <a class="contentLink" href="?view=content">Content Developer View</a> -->
				<a class="contentLink" href="?view=interaction">Interaction Debugging View</a>
				<a class="contentLink" href="?view=comparison">Comparison View</a>
			</div>
		</div>
		<div id="leftMenuBtn">
			
		</div>
		<div id="mainBody">
			<div id="mainBodyContent">
				<?php
					if($view == "research"){
						include('tpl/filter_time.php');
						include('tpl/filter_query.php');
					}else if($view == "comparison"){
						?>
							<div id="tabs">
								<ul>
									<li><a href="#tabs-1">Series 1</a> </li>
									<li class="tabAddIcon">+</li>
								</ul>
								<div id="tabs-1">
									<?php
										include('tpl/filter_time.php');
										include('tpl/filter_query.php');
									?>
								</div>
							</div>
				
						<?php
					}else if($view == "content"){
						
					}else if($view == "interaction"){
						include('tpl/filter_time.php');
						include('tpl/filter_query.php');
					}else{
						echo "unkown view";
					}
				?>
				
				<?php
					if( in_array($view, array('research','comparison'))){
						include('tpl/charts.php');
					}else if( $view == "interaction"){
						include('tpl/interactions.php');
					}else if( $view == "content"){
						echo "content view";
					}
				?>
				
			</div>
			<div id="contentScrollbar">
			</div>
		</div>
		<script type="text/javascript" src="lib/jquery.js"></script>
		<script type="text/javascript" src="lib/jquery-ui-1.10.4.custom.js"></script>
		<script type="text/javascript" src="lib/jquery.serializeObject.js"></script>
		<script type="text/javascript" src="lib/jquery-ui-timepicker-addon.js"></script>
		<script type="text/javascript" src="lib/jquery.touchSwipe.js"></script>
		<script type="text/javascript" src="lib/jquery.smartresize.js"></script>
		<script type="text/javascript" src="lib/touchpunch.js"></script>
		<script type="text/javascript" src="lib/jquery.mousewheel.js"></script>
		<script type="text/javascript" src="lib/moment-with-langs.js"></script>
		<script type="text/javascript" src="js/jquery.specialDrag.js"></script>
		<script type="text/javascript" src="js/jquery.borderfy.js"></script>
		<script type="text/javascript" src="js/dashApp-layout.js"></script>
		<script type="text/javascript" src="js/behavior-main.js"></script>
        <script type="text/javascript" src="js/chart-display.js"></script>
		
		<!-- for interaction -->
		<script type="text/javascript" src="lib/jquery.dynatree.js"></script>
		
		<!-- charts -->
		<script src="lib/d3.js"></script>
		<script src="js/timelinepanel.js"></script>
		<script src="js/langchart.js"></script>
        <script src="js/topquerychart.js"></script>
        <script src="js/qtypechart.js"></script>
        <script src="js/statistics.js"></script>
        <script src="js/statistics2.js"></script>
        <script src="js/idurationchart.js"></script>
        <script src="js/interactionfrequencychart.js"></script>
        <script src="js/weekheatmap.js"></script>
        <script src="js/topquerycomparisonchart.js"></script>

		<!--specific view -->
		<script type="text/javascript" src="js/behavior-<?php echo $view ?>.js"></script>
	</body>
</html>

