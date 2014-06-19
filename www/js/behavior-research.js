
var _allCharts = {};

/**
 * adds a close button to a container
 * @param {jquery} $container
 */
function addCloseBtn($container){
	var $closeBtn = $('<span class="closeBtn ui-icon ui-icon-closethick"></span>');
	$container.append($closeBtn);
	$closeBtn.click(function(){
		var whichChart = $closeBtn.siblings('.chartContainer').attr('data-chart');
		delete _allCharts[whichChart];
		$container.remove();
		dashApp.scrollable_content.refresh();
	});
}

/**
 * adds a chart to a chart container
 * @param {String} whichChart which chart to add
 * @param {jQuery} $chartContainer the chart container
 */
function addChart(whichChart,$chartContainer){
	var randID = 'chart_' + guidSmall();
    var title_height = em(1.2);
    var $titleDiv = $('<div class="chartTitle"/>').html( getChartTitle(whichChart) ).height(title_height);
	var $newDiv = $('<div data-chart="'+whichChart+'" class="chartContainer" id="'+randID+'"/>').width( $chartContainer.width() ).height( $chartContainer.height() - title_height );
	$titleDiv.appendTo($chartContainer);
    $newDiv.appendTo($chartContainer);
	_allCharts[whichChart] = randID;
    addChartToDiv(whichChart,randID);
}

/**
 * primitive function used by addChart and updateCharts
 * @param {String} whichChart
 * @param {String} divID
 */
function addChartToDiv(whichChart,divID){
    var allData = '?'+getFilterDataString();
	switch(whichChart){
		case 'langchart':
			createLangChart({container: '#'+divID, params: allData});
			break;
        case 'qtypechart':
            createQTypeChart('#'+divID,allData);
            break;
        case 'topquerychart':
            createTopQueryChart('#'+divID,allData);
            break;
        case "interactionfrequencychart":
            createInteractionHistogram('#'+divID,allData);
            break;
        case "weekheatmap":
            createWeekHeatmap('#'+divID,allData);
            break;
        case "iduration":
            createIDurationChart('#'+divID, allData);
            break;
        default:
			
			break;
	}
}

/**
 * updates all d3 charts
 */
function updateCharts(){
	//data to be sent to chart
    var randID = 'stats_' + guidSmall();
    $('#aggregatedDataSection .aggregatedDataSeriesContainer').attr('id',randID);
    createSummaryChart2('#'+randID,'?'+getFilterDataString());
    
	$.each( _allCharts, function(chartType, chartID){
		addChartToDiv(chartType,chartID);
	});
	
}

/**
 * exports charts to png
 * @returns {undefined}
 */
function exportCharts(){
    
    //get all charts svg
    var svg = new Array();
    if( $('div.chartContainer').length === 0 ){
        alert("Please add some charts");
        return;
    }
    
    //make sure form exists
    var $exportForm = $('#exportForm');
    var $charts = $('#chartsData');
    if( $exportForm.length === 0 ){
        $exportForm = $('<form id="exportForm" action="php/export.php" method="post"></form>');
        $exportForm.appendTo('body');
    }
    //remove old charts
    $exportForm.html('');
    
    //add all charts
    $('div.chartContainer').each(function(){
        var chart_svg = $(this).html();
        $('<input type="hidden" name="charts[]"/>').val( chart_svg ).appendTo($exportForm);
        
    });
    
    $exportForm.submit();
    /*
    $.ajax({
        url: 'php/export.php',
        type: 'post',
        data: {
            charts: svg
        },
        success: function(data){
            window.location = 'php/'+data;
        }
    });*/
}

applicationReady(function(){
	
	//assign the filter behavior
	assignFilterBehavior( $('body') );
	
    //export charts
    $('#exportCharts').button().click(function(){
        exportCharts();
    });
    
	//adds a chart
	$('#addChart').change(function(){
		var whichChart = $(this).val();
        
        if(whichChart === "") return ;
        
		$('option',$(this)).removeAttr('selected');
		$('option[value=""]',$(this) ).attr({selected: 'selected'});
		var $AddChartContainer = $(this).parent();
		
		//dont add a chart that already exists
		if( _allCharts[whichChart] ){
			alert('That chart is already shown');
			return false;
		}

		//the chart to be insert here is 
		var $newChart = $('<div class="chartBox"></div>');//.width($AddChartContainer.width()).height($AddChartContainer.height());
		$newChart.css({width : chartSizeGetWidth(whichChart) +'em' , height : chartSizeGetHeight(whichChart) + 'em'});
        
        $newChart.insertBefore($AddChartContainer);
		
		addChart(whichChart,$newChart);
		
		assignChartBehavior($newChart);
		
		addCloseBtn($newChart);
		
		//when a chart is added refresh the content
		windowResizeCallbacksExec();
	});
	
    //update charts button
	$('#updateBtn').button().click(function( event ) {
		updateCharts();
	});
    
    //init charts by calling update charts
    updateCharts();

});