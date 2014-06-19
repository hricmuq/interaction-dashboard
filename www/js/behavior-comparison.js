
/**
 * @type jQuery
 */
var $tabsObj;
var _tabCounter = 1;

/**
 * gets an array of tab ids
 * @returns {Array}
 */
function currentTabsGet(){
    var tabLoop = 0;
    var alltabs  = new Array();
    while(tabLoop < 100){
        if( $('#tabs-' + tabLoop).length !== 0){
            alltabs.push(tabLoop);
        }
        tabLoop++;
    }
    return alltabs;
}

/**
 * gets the count of current tabs
 * @returns {integer}
 */
function currentTabsCountGet(){
   return currentTabsGet().length;
}

/**
 * fix tab names so they are in order
 */
function fixTabNames(){
    $('#tabs ul li').each(function(i,v){
        $('.ui-tabs-anchor',$(this)).html('Series ' + (i + 1) );
    });    
}

/**
 * add a tab
 */
function addTab() {
    var tabTemplate = "<li><a href='#{href}'>#{label}</a> <span class='tabCloseIcon'>X</span></li>";
    var label = "Series " + (_tabCounter + 1);
    var id = "tabs-" + (_tabCounter + 1);
    var li = $(tabTemplate.replace(/#\{href\}/g, "#" + id).replace(/#\{label\}/g, label));

    _tabCounter++;

    var $newFilters = $('#tabs-1').clone();

    $newFilters.attr('id', id);

    assignFilterBehavior($newFilters);

    $tabsObj.append($newFilters);

    $('li.tabAddIcon').before(li);
    $tabsObj.tabs("refresh");
    
    fixTabNames();
}


var _allCharts = {};

/**
 * adds a close button to a container
 * @param {jquery} $container
 */
function addCloseBtn($container){
	var $closeBtn = $('<div class="closeBtn ui-icon ui-icon-closethick"></div>');
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
	_allCharts[whichChart] = randID;
    var tabLoop = 1;
    var allTabs = currentTabsGet();
    var tabsCount = allTabs.length;
    var title_height = em(1.2);
    var $titleDiv = $('<div class="chartTitle"/>').html( getChartTitle(whichChart) ).height(title_height);
	$titleDiv.appendTo($chartContainer);
    while(tabLoop <= tabsCount ){
        var $newDiv;
        if( chartSizeGetStack(whichChart) === chartStack.HORIZONTAL )
            $newDiv = $('<div data-chart="'+whichChart+'" style="float:left" class="chartContainer" id="'+randID+"-"+tabLoop+'"/>').width( parseInt($chartContainer.width()/tabsCount) ).height( $chartContainer.height() - title_height );
        else if (chartSizeGetStack(whichChart) === chartStack.VERTICAL )
            $newDiv = $('<div data-chart="'+whichChart+'" class="chartContainer" id="'+randID+"-"+tabLoop+'"/>').width( $chartContainer.width() ).height( parseInt($chartContainer.height()/tabsCount) - title_height );
        $newDiv.appendTo($chartContainer);
        tabLoop++;
    }
    
    //top query chart needs special treatment since even though it is a comparison chart it only has one container
    if(whichChart === "topquerycomparisonchart"){
        var $newDiv = $('<div data-chart="'+whichChart+'" class="chartContainer" id="'+randID+'"/>').width( $chartContainer.width() ).height( parseInt($chartContainer.height()) );
        $chartContainer.html( $newDiv  );
    }
    
    addChartToDiv(whichChart,randID);
}

function updateContainerDimensions($container,whichChart){
    var stacking = chartSizeGetStack(whichChart);
    var nCharts = currentTabsCountGet();
    var multiW,multiH;
    multiW = chartSizeGetWidth(whichChart);
    multiH = chartSizeGetHeight(whichChart);
    if( stacking === chartStack.HORIZONTAL  ){
        multiW *= nCharts;
    }else if( stacking === chartStack.VERTICAL  ){
        multiH *= nCharts;
    }
    $container.css({width : multiW +'em' , height : multiH + 'em'});
}

function updateChartSeries(){
    
    $.each( _allCharts, function(chartType, chartID){
		var $container = $('#' + chartID + '-1').parent();
        
        if( chartType === "topquerycomparisonchart" ){
           $container = $('#' + chartID).parent();
        }
        
        //fix chart dimensions
        var whichChart = $('.chartContainer',$container).attr('data-chart');
        updateContainerDimensions($container,whichChart);
		
        //empty container to redraw later
        $container.html('');
        
        //add clsoe button to container
        addCloseBtn($container);
        
        //add the charts
        addChart(chartType,$container);
	});
}

/**
 * primitive function used by addChart and updateCharts
 * @param {String} whichChart what type of chart
 * @param {String} divIDOrig which div to add the chart to
 */
function addChartToDiv(whichChart,divIDOrig){
    var tabLoop = 1;
    var allTabs = currentTabsGet();
    var tabsCount = allTabs.length;
    var dataArr = new Array();
    while(tabLoop <= tabsCount){
        var divID = divIDOrig + "-" + tabLoop;
        var allData = '?'+getFilterDataString( $('#tabs-'+allTabs[tabLoop-1]) );
        switch(whichChart){
            case 'langchart':
                createLangChart({container: '#'+divID, params: allData });
                break;
            case 'qtypechart':
                createQTypeChart('#'+divID,allData);
                break;
            case 'topquerychart':
                createTopQueryChart('#'+divID,allData);
                break;
            case "iduration":
                createIDurationChart('#'+divID,allData);
                break;
            case "interactionfrequencychart":
                createInteractionHistogram('#'+divID,allData);
                break;
            case "weekheatmap":
                createWeekHeatmap('#'+divID,allData);
                break;
            case "topquerycomparisonchart":
                dataArr.push(allData);
                break;
            default:

                break;
        }
        tabLoop++;
    }
    
    if( whichChart === "topquerycomparisonchart" ){
        createTopQueryComparisonChart('#'+divIDOrig,dataArr);
    }
}

/**
 * updates all d3 charts
 */
function updateCharts() {
    
    
    //update statistics
    $('#aggregatedDataSection div.aggregatedDataSeriesContainer').html('');
    var allTabs = currentTabsGet();
    var tabsCount = allTabs.length;
    var tabLoop = 1;
    while(tabLoop <= tabsCount){
        var allData = '?'+getFilterDataString( $('#tabs-'+allTabs[tabLoop-1]) );
        var randID = 'stats_' + guidSmall();
        $('#aggregatedDataSection div.aggregatedDataSeriesContainer').height((tabsCount * chartSizeGetHeight('series')) + 'em' )
        $('<div id="'+randID+'"></div>').appendTo($('#aggregatedDataSection div.aggregatedDataSeriesContainer'));
        createSummaryChart2('#'+randID,allData);
        tabLoop++;
    }
    
    updateChartSeries();
    
	$.each( _allCharts, function(chartType, chartID){
		addChartToDiv(chartType,chartID);
	});
    
    //when the charts are updated  resize content
    windowResizeCallbacksExec();
    
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
    
    //add all charts but try to keep horizontal charts horizontal instead of vertical
    //this would happen if we use the same code here as in behavior-research.js
    var whichChart = null;
    var previousChart = null;
    var chartStacking;
    var charts = "";
    var totalCharts = $('div.chartContainer').length;
    $('div.chartContainer').each(function(iteration){
        whichChart = $(this).attr('data-chart');
        chartStacking = chartSizeGetStack(whichChart);
        
        if(previousChart == null) previousChart = whichChart;
        
        //if charts are stacked vertically then add now
        //or if new chart type
        if( (chartStacking === chartStack.VERTICAL) 
            ||
            ((chartStacking === chartStack.HORIZONTAL) && (previousChart !== whichChart))
            
            ){
            if( charts.length !== 0){
                $('<input type="hidden" name="charts[]"/>').val( charts ).appendTo($exportForm);
                charts = "";
                previousChart = whichChart;
            }
        }
        
        charts += $(this).html();
        
        if(iteration === totalCharts - 1){
            $('<input type="hidden" name="charts[]"/>').val( charts ).appendTo($exportForm);
        }
        
    });
    
    //remaining charts
    if(charts.length !== 0){
        
    }
    
    
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

applicationReady(function() {

    //tabify
    $tabsObj = $("#tabs").tabs({
        activate: function(event, ui) {
            var $container = $('.filterTimeDiv', ui.newPanel);
            refreshPanel($container);
            $('div.filtersDiv', ui.newPanel).borderfy('refresh');
        }
    });

    //asign filter behavior for first tab
    assignFilterBehavior($('#tabs-1'));
    
    //export charts
    $('#exportCharts').button().click(function(){
        exportCharts();
    });

    //close tab button
    $tabsObj.delegate("span.tabCloseIcon", "click", function() {
        var panelId = $(this).closest("li").remove().attr("aria-controls");
        $("#" + panelId).remove();
        $tabsObj.tabs("refresh");
        fixTabNames();
    });

    //add new tab buttn
    $('.tabAddIcon').click(function() {
        addTab();
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
		
        updateContainerDimensions($newChart,whichChart);
        //$newChart.css({width : chartSizeGetWidth(whichChart) +'em' , height : chartSizeGetHeight(whichChart) + 'em'});
		
		$newChart.insertBefore($AddChartContainer);
		
		addChart(whichChart,$newChart);
		
		assignChartBehavior($newChart);
		
		addCloseBtn($newChart);
		
		//when a chart is added refresh the content
		windowResizeCallbacksExec();
	});


    //updates all charts
    $('#updateBtn').button().click(function(event) {
        updateCharts();
    });
    
    //init charts
    updateCharts();

});