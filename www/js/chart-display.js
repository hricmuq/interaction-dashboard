/* 
 * contains logic for chart colors, labels, and sizes
 */

/**
 * singleton to hold chart info
 * @type Object
 */
var chartLabels = {
    currentChart : '',
    charts : []
};

/**
 * initialize a chart label logic for the given chart type
 * @param {String} chartType
 * @param {function} colors
 */
function chartLabelInit(chartType,colors){
    if( !chartLabels.charts[chartType] ){
        chartLabels.charts[chartType] = {
            colors: colors,
            labels: [],
            colorMax : 0
        };
    }
    chartLabels.currentChart = chartType;
}

/**
 * gets all the chart labels
 * @param {String} chartType
 * @returns {Array}
 */
function chartLabelsGetAll(chartType){
    return chartLabels.charts[chartType].labels;
}

/**
 * get a specific chart label
 * @param {String} chartType
 * @param {Integer} which
 * @returns {Object}
 */
function chartLabelsGetLabel(chartType, which){
    return chartLabels.charts[chartType].labels[which];
}

/**
 * gets the label's color given the label text
 * @param {String} labelText
 * @returns {label.color|String}
 */
function chartLabelColor(labelText){
    var chartStruct = chartLabels.charts[chartLabels.currentChart];
    var labelColor = '';
    
    //search if the label already exists
    $.each(chartStruct.labels,function(labelLoop,label){
        if(label.text === labelText){
            labelColor = label.color;
            return false;
        }
    });
    
    //the label doest exist so add it
    if( labelColor === ''){
        //next available color
        labelColor = chartStruct.colors(chartStruct.colorMax);
        chartStruct.colorMax++;
        chartStruct.labels.push({
           text:  labelText,
           color: labelColor
        });
    }
    
    return labelColor;
}

/**
 * holds some static values for chart stacking
 * @type Object
 */
var chartStack = {
    VERTICAL : 1,
    HORIZONTAL : 2,
    FLOAT : 3 //not implemented yet
};

/**
 * The prefered chart size
 * @type Array
 */
var chartConfig = [
    ['langchart', 35, 15 , chartStack.HORIZONTAL ],
    ['qtypechart',40,15, chartStack.HORIZONTAL],
    ['topquerychart',45,20, chartStack.HORIZONTAL ],
    ['iduration',45,15, chartStack.HORIZONTAL],
    ['interactionfrequencychart',80,15, chartStack.VERTICAL],
    ['weekheatmap',45,20, chartStack.VERTICAL],
    ['topquerycomparisonchart',40,40,chartStack.VERTICAL],
    ['series', null, 2.8,chartStack.VERTICAL]
];

/**
 * Default width of the chart in em
 * @type Number
 */
var DEFAULT_WIDTH = 45;

/**
 * Default height of the chart in em
 * @type Number
 */
var DEFAULT_HEIGHT = 15;

/**
 * returns the charts ideal size as a {width,height} object 
 * @param {String} chartType
 * @returns {Object}
 */
function chartSizeGet(chartType){
    var record = false;
    $.each(chartConfig,function(i,v){
       if( v[0] === chartType ){
           record = v;
           return false;
       }
    });
    if(record === false){
        return {width : DEFAULT_WIDTH, height : DEFAULT_HEIGHT, stack : chartStack.HORIZONTAL};
    }else{
        return {width : record[1], height : record[2] , stack : record[3]};
    }
}

/**
 * gets te ideal width of a chart in em
 * @param {String} chartType
 * @returns {Integer}
 */
function chartSizeGetWidth(chartType){
    return chartSizeGet(chartType).width;
}

/**
 * gets the ideal height of a chart in em
 * @param {String} chartType
 * @returns {Integer}
 */
function chartSizeGetHeight(chartType){
    return chartSizeGet(chartType).height;
}

/**
 * gets the method by which multiple charts are stacked
 * @param {type} chartType
 * @returns {chartStack.HORIZONTAL|chartStack.VERTICAL|...}
 */
function chartSizeGetStack(chartType){
    return chartSizeGet(chartType).stack;
}
