
/**
 * empties the interaction log
 */
function interactionLogEmpty(){
	var $interactionLog = $('#interactionLog');

	$interactionLog.html('');
	
	$interactionLog.scrollTop(0);
}

/**
 * shows yhe interaction in the interaction log
 * @param {Node} node
 */
function interactionLogAppend(node){
	
	var interaction = node.data.interaction;
	var queries = interaction.queries;

	var interactionID = interaction.id;
	var num = interaction.num_queries;
	var begin_ts = interaction.begin_timestamp;
	var end_ts = interaction.end_timestamp;

	var $interactionLog = $('#interactionLog');

	$interactionLog.append('<div class="interactionTitle centered"> - Interaction '+interactionID+' - </div>');

	$.each(queries,function(i,v){

		var queryLoop = v.query;

		var printTime = moment(queryLoop.timestamp);
		var printTime = printTime.format('DD/MM/YYYY h:mm:ss A');
		var logEntryTemplate = '<div class="interactionEntry"><div class="interactionTime">%time%</div><div class="interactionQuery">%query%</div><br class="clear"/><div class="interactionResponse %responseClass%">%response%</div><br class="clear"/></div>';
		var responseClass = (queryLoop.proper_response === "1") ? 'properResponse' : 'missedResponse';

		var queryText = $('<div/>').text(queryLoop.query_text).html();

		logEntryTemplate = logEntryTemplate.replace('%time%',printTime);
		logEntryTemplate = logEntryTemplate.replace('%query%',queryText);
		logEntryTemplate = logEntryTemplate.replace('%responseClass%',responseClass);
		logEntryTemplate = logEntryTemplate.replace('%response%',queryLoop.response_text);

		var $logEntryTemplate = $(logEntryTemplate);

		if(queryLoop.lang.indexOf("ar") !== -1 ){
			$('.interactionQuery',$logEntryTemplate).css({direction: 'rtl' });
			$('.interactionResponse',$logEntryTemplate).css({direction: 'rtl' });
		}

		$interactionLog.append($logEntryTemplate);

	});

}

/**
 * empties the tree
 * @returns {undefined}
 */
function emptyTree(){
	try{
		$('#tree').dynatree('destroy');
		$('#tree').empty();
	}catch (Ex){
		
	}
}

/**
 * fills the tree
 * @returns {undefined}
 */
function fillTree(){
	//create all months in the tree view given the first/last dates that we have
	/**
	 * @type Date
	 */
	var firstDate = parseTimestamp( $('input[name=date_start]').val() );
	/**
	 * @type Date
	 */
	var lastDate = parseTimestamp( $('input[name=date_end]').val() );
    
    //bugfix. when this function is called the first time the date inputs might not be set
    if(!$('input[name=date_start]').val()) firstDate = parseTimestamp( dashApp.storage.get('minTime') );
    if(!$('input[name=date_end]').val()) lastDate = parseTimestamp( dashApp.storage.get('maxTime') );

    var firstMonth = firstDate.getMonth();
	var firstYear = firstDate.getFullYear();
	
	var lastMonth = lastDate.getMonth();
	var lastYear = lastDate.getFullYear();
	
	var loopMonth = firstMonth;
	var loopYear = firstYear;
	var monthList = new Array();
	var done = false;
	while( !done ){
		
		var monthItem = {
			title : getMonthName(loopMonth)+ ' ' + loopYear,
			isFolder: true,
			isLazy: true,
			month: loopMonth + 1,
			year: loopYear
		}
		
		monthList.push(monthItem);
		
		//next month
		loopMonth++;

		//next year
		if(loopMonth === 12){
			loopMonth = 0;
			loopYear++;
		}
		
		if( (loopYear === lastYear) && (loopMonth > lastMonth) ) done = true;
	}
	
	//[ {"title": "SubItem 1", "isLazy": true }, 	{"title": "SubFolder 2", "isFolder": true, "isLazy": true } ]
	//$('#tree').html();
	
	 $("#tree").dynatree({
		title: "Interactions",
		debugLevel: 0,
		fx: { height: "toggle", duration: 200 },
		autoFocus: false, // Set focus to first child, when expanding or lazy-loading.
		children : monthList ,
		onActivate: function(node) {
			
			if( node.data.isDay ){
				interactionLogEmpty();
				$.each(node.childList,function(i,interactionNode){
					interactionLogAppend(interactionNode);
				});
			}if( node.data.isInteraction ){
				interactionLogEmpty();
				interactionLogAppend(node);
			}
		},
		onLazyRead: function(node){
			
			var day = moment({year: node.data.year, month : node.data.month - 1});
			var firstDay = day.startOf('month').format('YYYY-MM-DD');
			var lastDay = day.endOf('month').format('YYYY-MM-DD');
			
			var data = {
				date_start: firstDay,
				date_end: lastDay,
			};
			
			var allData = getFilterData();
			
			data = $.extend(allData,data);
			
			node.appendAjax({
				url: "php/getqueryinteractionjson.php",
				type: 'get',
				data : data,
				datatype: 'json',
				postProcess: function(data,dataType){
					var daysData = new Array();
					var oldDay = null;
					var monthData = new Array();
					
					var maxNumQueries = 0;
					
					interactionLogEmpty();
					
					$.each(data,function(i,v){
						var momentDate = moment(v.interaction.begin_timestamp);
						var loopDay = momentDate.format('D');
						
						//append month interactions data to log
						interactionLogAppend({
							data: v
						});
						
						//first time entering this loop old is the first day
						if( oldDay === null ){
							oldDay = loopDay;
						}
						
						//new day. save the interactions of the previous day
						if( loopDay !== oldDay  ){
							
							var dayFolder = {
								title: oldDay,
								isFolder: true,
								isLazy : false,
								children: daysData,
								isDay : true
							};
							monthData.push(dayFolder);
							
							daysData = new Array();
							
							oldDay = loopDay;
						}
						
						var momentInteraction = moment(v.interaction.begin_timestamp);
						var interactionTime = momentInteraction.format('hh:mm A');
						
						if( v.interaction.num_queries > maxNumQueries){
							maxNumQueries = v.interaction.num_queries;
						}
						
						var interaction = {
							title: 'interaction ' + v.interaction.id + ' @' + interactionTime,
							isInteraction : true,
							interaction: v.interaction
						};
						
						//for(var k in v.interaction) interaction[k]=v.interaction[k];
					
						daysData.push(interaction);
						
						//last day of this month - save the interactions
						if( i === data.length - 1){
							var dayFolder = {
								title: loopDay,
								isFolder: true,
								isLazy : false,
								children: daysData
							};
							monthData.push(dayFolder);
						}
						
					});
					
					return monthData;
				}
			});
		}
    });

}

/**
 * updates all d3 charts
 */
function updateCharts(){
	//data to be sent to chart
	
    var randID = 'stats_' + guidSmall();
    $('#aggregatedDataSection .aggregatedDataSeriesContainer').attr('id',randID);
    createSummaryChart2('#'+randID,'?'+getFilterDataString());
    
	//emty the interactions tree
	emptyTree();
	
	//fill the interactions tree
	fillTree();
	
	//empty interaction log
	$('#interactionLog').html('');
}

/**
 * resize the tree and log containers to take the max height
 */
function resizeContainers(){	
	
	var $tree = $('#tree');
	var $log = $('#interactionLog');

	var minHeight = 0;
	if( $tree.attr('data-oh') ){
		minHeight = $tree.attr('data-oh');
	}else{
		minHeight = $tree.height();
		$tree.attr('data-oh',minHeight);
	}

	var windowHeight = getDocHeight();
	var treeHeight = $tree.height();
	var treeTop = $tree.offset().top;

	var heightRemaining = windowHeight - treeTop - 20;
	//var hhh = Number(getComputedStyle($tree.parent().get(0), "").fontSize.match(/(\d*(\.\d*)?)px/)[1]);

	if( heightRemaining < minHeight ){
		$tree.height(minHeight);
		$log.height(minHeight);
	}else{
		$tree.height(heightRemaining);
		$log.height(heightRemaining);
	}
}

applicationReady( function(){
	
    //assign the filter behavior
	assignFilterBehavior( $('body') );
	
	$('#tree').specialDraggable({
		//stopPropagation: false,
		preventDefault: false,
		dragmove: function(e) {
			$('#tree .dynatree-container').scrollTop( $('#tree .dynatree-container').scrollTop() - e.tickY  );
			return false;
		}
	});
	
	$('#interactionLog').specialDraggable({
		//stopPropagation: false,
		preventDefault: false,
		dragmove: function(e) {
			$('#interactionLog').scrollTop( $('#interactionLog').scrollTop() - e.tickY  );
			return false;
		}
	});
	
	
	//allow the #tree and #interactionLog to take up whole remaining height
	windowResizeCallbacksAdd({
		name: 'treeHeight',
		priority: 10,
		callback: function(){
			resizeContainers();
		}
	});
	
	$( "#min_duration" ).val( dashApp.storage.get('minInteraction') );
	$( "#max_duration" ).val( dashApp.storage.get('maxInteraction') );
	
	//add setup the duration slider
	 $( "#slider_range" ).slider({
		range: true,
		min: dashApp.storage.get('minInteraction'),
		max: dashApp.storage.get('maxInteraction'),
		values: [ dashApp.storage.get('minInteraction'), dashApp.storage.get('maxInteraction') ],
		slide: function( event, ui ) {
			$( "#min_duration" ).val( ui.values[ 0 ] );
			$( "#max_duration" ).val( ui.values[ 1 ] );
		},
		disabled: true
	});
	
	$('#allInteractions').change(function(){
		if( $(this).is(':checked') ){
			$("#slider_range").slider( "option", "disabled", true );
			$('#min_duration').attr({disabled : 'disabled'});
			$('#max_duration').attr({disabled : 'disabled'});
		}else{
			$("#slider_range").slider( "option", "disabled", false );
			$('#min_duration').removeAttr('disabled');
			$('#max_duration').removeAttr('disabled');
		}
	});
	
	//the slider could change the height
	windowResizeCallbacksExec();
	
	//dynamically change slider values
	//$( "#slider_range" ).slider( "option", "max" , 24 );
	//$( "#slider_range" ).slider( "values" , [0,24] );
	
	$('#updateBtn').button().click(function( event ) {
		if( $('input[name=date_start]').val() === ""){
			alert("please specify start date");
			return false;
		}
		if( $('input[name=date_end]').val() === ""){
			alert("please specify end date");
			return false;
		}
		
		updateCharts();
	});
    
    //init statx
    updateCharts();
});