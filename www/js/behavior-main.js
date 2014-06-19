
/**
 * checks if a text is arabic
 * @param {String} text
 * @returns {Boolean}
 */
function isArabic(text){
    var arabic = /[\u0600-\u06FF]/;
    return arabic.test(text);
}

/**
 * convert em to pixels
 * @param {Integer} input
 * @returns {em.emSize}
 */
function em(input) {
	var emSize = parseFloat($("body").css("font-size"));
	return (emSize * input);
}

/**
 * Generates a random unique ID
 * @returns {String}
 */
function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

/**
 * generates a smaller uid containing only alphanumeric (no dashes)
 * @returns {String}
 */
function guidSmall() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
    }
    return s4() + s4() + s4();
}

/**
 * parses a timestamp
 * @param {String} ts
 * @returns {Date}
 */
function parseTimestamp(ts) {
    return moment(ts, dashApp.MOMENT_TIMESTAMP_FORMAT).toDate();
}

/**
 * formats a date object into a string
 * @param {Date} dateObj
 * @returns {String}
 */
function formatTimestamp(dateObj) {
    return moment(dateObj).format(dashApp.MOMENT_TIMESTAMP_FORMAT);
}

/**
 * gets the name of the month
 * @param {Number} month 0-based month index
 * @returns {String}
 */
function getMonthName(month) {
    return moment({month: month}).format("MMMM");
}

/**
 * returns an object containing all filter data
 * @param {jQuery} $container the container. if not passed just use body
 * @returns {Object}
 */
function getFilterData($container) {
    var allData;
    if(typeof $container === "undefined")
        allData = $('input.datetimepicker,input[name^=response],input[name^=lang],input[name^=qtype],div.querySearchFilter input');
    else
        allData = $('input.datetimepicker,input[name^=response],input[name^=lang],input[name^=qtype],div.querySearchFilter input',$container);
    return allData.serializeObject();
}

/**
 * returns an object containing all filter data
 * @param {jQuery} $container the container. if not passed just use body
 * @returns {String}
 */
function getFilterDataString($container) {
    var allData;
    if(typeof $container === "undefined")
        allData = $('input.datetimepicker,input[name^=response],input[name^=lang],input[name^=qtype],div.querySearchFilter input');
    else
        allData = $('input.datetimepicker,input[name^=response],input[name^=lang],input[name^=qtype],div.querySearchFilter input',$container);
    return allData.serialize();
}

/**
 * gets the title of a chart type
 * @param {String} whichChart
 * @returns {String}
 */
function getChartTitle(whichChart){
    return $('option[value='+whichChart+']').html();
}

/**
 * waits for a variable to become available before executing callback
 * @param {Object} options
 */
function waitForApplicationVariable(options) {
    options = $.extend({
        loop: 0,
        maxWait: 10,
        loopSleep: 100,
        callback: null,
        varName: null
    }, options);

    if (typeof options.callback !== "function") {
        throw "callback must be a function"
    }

    if (typeof options.varName === "undefined") {
        throw "missing varName"
    }

    if (dashApp.storage.isset(options.varName)) {
        options.callback.call();
        return;
    }

    if (options.loop >= options.maxWait) {
        throw "timeout waiting for variable"
        return;
    }

    setTimeout(function() {
        options.loop++;
        waitForApplicationVariable(options);
    }, options.loopSleep);
}

/**
 * calls a function when the applicaition is ready
 * @param {function} func
 */
function applicationReady(func) {
    $(document).ready(function() {
        waitForApplicationVariable({
            maxWait: 20,
            varName: 'minInteraction',
            callback: func
        });
    });
}

/**
 * assigns the behavior for a chart
 * @param {jquery} $newChart the chart that will have its behavior set
 */
function assignChartBehavior($newChart) {
    var dragOriginLeft, dragOriginTop;
    $newChart.mousedown(function() {
        dragHandled(true);
    }).mouseup(function() {
        dragHandled(false);
    }).draggable({
        revert: true,
        start: function(event, ui) {
            var $target = $(event.target);
            dragOriginLeft = $target.offset().left;
            dragOriginTop = $target.offset().left;
        }
    }).droppable({
        drop: function(event, ui) {
            var drop_x = ui.draggable.offset().left + ui.draggable.width() / 2;
            var drop_y = ui.draggable.offset().top + ui.draggable.height() / 2;
            var $targetChartBox = null;
            $('.chartBox').each(function() {
                var loop_top = $(this).offset().top;
                var loop_left = $(this).offset().left;
                var loop_width = $(this).width();
                var loop_height = $(this).height();
                var margin = 5;
                if ($(this)[0] == ui.draggable[0]) {
                    return true;
                }
                //console.log('here ' + loop_top + ' - ' + loop_left + ' - ' + loop_width + ' - ' + loop_height);
                if ((drop_y > loop_top + margin) &&
                        (drop_y < loop_top + loop_height - margin) &&
                        (drop_x > loop_left + margin) &&
                        (drop_x < loop_left + loop_width - margin)
                        ) {
                    $targetChartBox = $(this);
                    return false;
                }
            });

            setTimeout(function() {
                var $next = ui.draggable.next('.chartBox');
                if (($next.length !== 0) && ($next[0] != $targetChartBox[0])) {
                    ui.draggable.detach().insertBefore($targetChartBox);
                    $targetChartBox.detach().insertBefore($next);
                    return true;
                } else if (($next.length !== 0) && ($next[0] == $targetChartBox[0])) {
                    ui.draggable.detach().insertAfter($targetChartBox);
                    return true;
                }

                var $prev = ui.draggable.prev('.chartBox');
                if (($prev.length !== 0) && ($prev[0] != $targetChartBox[0])) {
                    ui.draggable.detach().insertBefore($targetChartBox);
                    $targetChartBox.detach().insertAfter($prev);
                    return true;
                } else if (($prev.length !== 0) && ($prev[0] == $targetChartBox[0])) {
                    ui.draggable.detach().insertBefore($targetChartBox);
                    return true;
                }

                return;

            }, 50);

            event.stopPropagation();
            event.preventDefault();
        }
    });
}

/**
 * assigns the behavior for all components inside a filter container
 * @param {jQuery} $filtersContainer
 */
function assignFilterBehavior($filtersContainer) {

    //capture the drag event

    createPanel($('.filterTimeDiv', $filtersContainer));

    windowResizeCallbacksAdd({
        name: 'timepanel',
        priority: 10,
        callback: function() {

            refreshPanel($('.filterTimeDiv', $filtersContainer));

        }
    });

    /*
     $( $('.filterTimeDiv', $filtersContainer ) ).specialDraggable({
     //stopPropagation: false,
     preventDefault: false,
     dragmove: function(e) {
     return false;
     }
     });
     */

    //datetimepicker format
    $('.datetimepicker', $filtersContainer).removeClass('hasDatepicker').datetimepicker({
        dateFormat: "yy-mm-dd",
        timeFormat: "HH:mm:ss",
        changeYear: true,
        changeMonth: true
    });

    //links the labels and the inputs for the button preset
    $(".presetsBtns label", $filtersContainer).each(function() {
        var rand_input_id = guid();
        $(this).prev().attr({id: rand_input_id});
        $(this).attr({'for': rand_input_id});
    });
    
    //remove the classes associated with jquery-ui buttonset from the radios
    //this way the buttonset in the clone on comparison view can be initialized
    $('.presetsDiv input,span,label', $filtersContainer).removeClass(function(index, css) {
        var classes = css.split(' ');
        var toRemove = new Array();
        $.each(classes, function(i, v) {
            if (v.indexOf('ui-') !== -1)
                toRemove.push(v);
        });
        return toRemove.join(' ');
    }).removeAttr('aria-pressed');

    $(".presetsBtns", $filtersContainer).buttonset();

    //all time
    $('input[name=time_radio]:eq(0)', $filtersContainer).click(function() {
        $('input[name=date_start]', $filtersContainer).val(dashApp.storage.get('minTime'));
        $('input[name=date_end]', $filtersContainer).val(dashApp.storage.get('maxTime'));
        updateTimeSelection($filtersContainer);
    });

    //last year
    $('input[name=time_radio]:eq(1)', $filtersContainer).click(function() {
        var dateObjFrom = new Date();
        dateObjFrom.setFullYear(dateObjFrom.getFullYear() - 1);
        dateObjFrom.setMonth(0);
        dateObjFrom.setDate(1);
        dateObjFrom.setSeconds(0);
        dateObjFrom.setMinutes(0);
        dateObjFrom.setHours(0);
        $('input[name=date_start]', $filtersContainer).val(formatTimestamp(dateObjFrom));
        var dateObjTo = new Date(dateObjFrom);
        dateObjTo.setFullYear(dateObjFrom.getFullYear() + 1);
        $('input[name=date_end]', $filtersContainer).val(formatTimestamp(dateObjTo));

        updateTimeSelection($filtersContainer);
    });

    //last month
    $('input[name=time_radio]:eq(2)', $filtersContainer).click(function() {
        var dateObjFrom = new Date();
        dateObjFrom.setMonth(dateObjFrom.getMonth() - 1);
        dateObjFrom.setDate(1);
        dateObjFrom.setSeconds(0);
        dateObjFrom.setMinutes(0);
        dateObjFrom.setHours(0);
        var dateObjTo = new Date(dateObjFrom);
        dateObjTo.setMonth(dateObjTo.getMonth() + 1);

        $('input[name=date_start]', $filtersContainer).val(formatTimestamp(dateObjFrom));
        $('input[name=date_end]', $filtersContainer).val(formatTimestamp(dateObjTo));

        updateTimeSelection($filtersContainer);
    });

    //last week
    $('input[name=time_radio]:eq(3)', $filtersContainer).click(function() {
        //moment.lang('ar');
        var startOfLastWeek = moment().weekday(-7);
        startOfLastWeek.set('hour', 0).set('minute', 0).set('second', 0);
        var endOfLastWeek = moment(startOfLastWeek).add('days', 7);
        $('input[name=date_start]', $filtersContainer).val(formatTimestamp(startOfLastWeek.toDate()));
        $('input[name=date_end]', $filtersContainer).val(formatTimestamp(endOfLastWeek.toDate()));

        updateTimeSelection($filtersContainer);
    });

    //yesterday
    $('input[name=time_radio]:eq(4)', $filtersContainer).click(function() {
        var today = moment();
        today.set('hour', 0).set('minute', 0).set('second', 0);
        var yesterday = moment(today).subtract('day', 1);
        $('input[name=date_start]', $filtersContainer).val(formatTimestamp(yesterday.toDate()));
        $('input[name=date_end]', $filtersContainer).val(formatTimestamp(today.toDate()));

        updateTimeSelection($filtersContainer);
    });

    //now
    $('input[name=time_radio]:eq(5)', $filtersContainer).click(function() {
        var now = moment();
        var startOfToday = moment().set('hour', 0).set('minute', 0).set('second', 0);
        $('input[name=date_start]', $filtersContainer).val(formatTimestamp(startOfToday.toDate()));
        $('input[name=date_end]', $filtersContainer).val(formatTimestamp(now.toDate()));

        updateTimeSelection($filtersContainer);
    });
    
    //remove the accesibility span added by autocomplete
    $('span[aria-live=polite]', $filtersContainer).remove();

    //autocomplete for the first textbox
    $("input[name=query_contains]", $filtersContainer).autocomplete({
    	source:'php/autocomplete.php?type=query_text'
    });
    
    //autocomplete for the second textbox
    $("input[name=response_contains]", $filtersContainer).autocomplete({
    	source:'php/autocomplete.php?type=response_text'
    });

    //when everything is loaded click the "All Logs" button
    //if the buttons are clicked before the timepanel is fully loaded then the brush won't be selected properly 
    waitForApplicationVariable({
        varName: 'timeinit',
        callback: function() {
            //click the first button
            $('input[name=time_radio]:eq(0)', $filtersContainer).click();
            $('div.presetsBtns label:eq(0)', $filtersContainer).click();
            dashApp.storage.unset('timeinit');
            
            var start_date_obj = new Date();
            var end_date_obj = d3.time.format("%Y-%m-%d %H:%M:%S").parse(dashApp.storage.get('maxTime'));
            start_date_obj.setDate(end_date_obj.getDate() - 365);
            
            d3.selectAll("g.brush").call($('.filterTimeDiv', $filtersContainer).data('brush').extent([start_date_obj ,end_date_obj ]));
        }
    });

    //the borderfy plugin for the filters where the screen can resize
    $('div.filtersDiv', $filtersContainer).borderfy({
        cellCallback: function($cell, position) {
            if (!position.lastCol) {
                $cell.css({'border-right': '1px solid black'});
            } else {
                $cell.css({'border-right': 'none'});
            }
        }
    });

}

/**
 * 
 * @param {object} opt
 */
function queryServer(opt) {
    opt = $.extend({
        what: null,
        async: true,
        callback: null,
        type: 'post',
        data: {}
    }, opt);

    if (opt.what === null) {
        throw "what to query";
    }

    //locally have to go throguh proxy
    //var url = 'php/proxy.php?what=' + opt.what;	
    var url = 'php/' + opt.what + '.php';

    $.ajax({
        url: url,
        async: opt.async,
        type: opt.type,
        data: opt.data,
        dataType: 'json',
        success: function(jsonObj) {
            if (opt.callback !== null) {
                opt.callback(jsonObj);
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            throw "Couldn't query server status: " + textStatus + " error: " + errorThrown;
        }
    });
}

/**
 * adds a series object to the layout
 * @param {Object} seriesObj
 */
function seriesAdd(seriesObj) {
    var $seriesContainer = $('div.aggregatedDataSeriesContainer');
    var $newSeries = $('<div class="aggregatedDataSeries"/>');
    var $seriesTitle = $('<div class="aggregatedSeriesTitle">' + seriesObj.title + '</div>');

    $newSeries.html($seriesTitle);

    $.each(seriesObj.data, function(i, v) {
        var $seriesData = $('<div class="aggregatedData"/>');
        var $dataCaption = $('<div class="aggregatedDataCaption"/>').html(v.caption);
        var $dataValue = $('<div class="aggregatedDataValue"/>').html(v.value);

        $seriesData.append($dataValue).append($dataCaption).appendTo($newSeries);
    });

    $seriesContainer.append($newSeries);
}

/**
 * deletes a sereis by position or by title
 * @param {String|Number} what which series to delete. if Number then starts at '1' not '0'. if String serach series title 
 * @returns {Boolean} if a dereis was deleted or not
 */
function seriesDelete(what) {
    if (parseInt(what) === what) {
        $('div.aggregatedDataSeriesContainer div.aggregatedDataSeries:nth-child(' + what + ')').remove();
        return true;
    }

    var deleted = false;
    $('div.aggregatedDataSeriesContainer div.aggregatedDataSeries div.aggregatedSeriesTitle').each(function() {
        if ($(this).text() === what) {
            deleted = true;
            $(this).parent().remove();
            return false;
        }
    });

    return deleted;
}

/////////////////////////////////////////
//pending functionality

/**
 * updates the d3 time selction
 * @param {jQuery} $filtersContainer the container element
 */
function updateTimeSelection($filtersContainer) {
    var start_date = $('input[name=date_start]', $filtersContainer).val();
    var end_date = $('input[name=date_end]', $filtersContainer).val();

    var start_date_obj = d3.time.format("%Y-%m-%d %H:%M:%S").parse(start_date);
    var end_date_obj = d3.time.format("%Y-%m-%d %H:%M:%S").parse(end_date);

    $('.filterTimeDiv', $filtersContainer).data('extent', [start_date_obj, end_date_obj]);

    if ($filtersContainer.attr('id')) {
        //comparison view
        d3.selectAll('#' + $filtersContainer.attr('id') + " g.brush").call($('.filterTimeDiv', $filtersContainer).data('brush').extent([start_date_obj, end_date_obj]));
    } else {
        //research view so only one timepanel and therefore only one brush
        d3.selectAll("g.brush").call($('.filterTimeDiv', $filtersContainer).data('brush').extent([start_date_obj, end_date_obj]));
    }
    //console.log( '%o %o', start_date_obj,end_date_obj );
}

/**
 * set of window resize callbacks
 * @type Object
 */
var _windowResizeCallbacks = new Array();

/**
 * add a callback to be called on window resize 
 * @param {Object} opts the name/id,priority,callback function of the callback<br/>
 * lower numerical priority means it will execute first 
 */
function windowResizeCallbacksAdd(opts) {
    opts = $.extend({
        name: 'default',
        priority: 10,
        callback: null
    }, opts);

    if (typeof opts.callback !== "function") {
        throw "no callback function specified"
    }

    var insertIndex = 0;
    $.each(_windowResizeCallbacks, function(i, callbackObj) {
        if (opts.priority < callbackObj.priority) {
            insertIndex = i + 1;
        }
    });

    _windowResizeCallbacks.splice(insertIndex, 0, opts);
}

/**
 * calls all window resizecallbacks
 * @returns {undefined}
 */
function windowResizeCallbacksExec() {
    $.each(_windowResizeCallbacks, function(i, callbackObj) {
        callbackObj.callback();
    });
}

/**
 * dumps the call sequesnce for the window resize functions
 * @returns {undefined}
 */
function windowResizeCallbacksDump() {
    $.each(_windowResizeCallbacks, function(i, callbackObj) {
        console.log(callbackObj.name);
    });
}


/**
 * crossplatform gets the html document's height
 * @returns {Number}
 */
function getDocHeight() {
    var doc = document;
    return Math.max(
            Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight),
            Math.max(doc.body.offsetHeight, doc.documentElement.offsetHeight),
            Math.max(doc.body.clientHeight, doc.documentElement.clientHeight)
            );
}


///////////////////////////////////////

//application behavior
$(document).ready(function() {
    //$('#mainBodyContent').height(3000);

    dashApp.storage.init();

    dashApp.scrollable_content.init({
        container: $('#mainBody'),
        content: $('#mainBodyContent'),
        scrollbar: $('#contentScrollbar')
    });

    dashApp.sidebar.init({
        leftMenu: $('#leftMenu'),
        leftMenuBtn: $('#leftMenuBtn')
    });

    //all the resize functions
    $(window).smartresize(function() {
        windowResizeCallbacksExec();
    });

    $('body').mousewheel(function(event) {
        //console.log(event.deltaX, event.deltaY, event.deltaFactor);
        dashApp.scrollable_content.scrollbar.scrollY(-event.deltaY * 10);
        dashApp.scrollable_content.content.percentageY(dashApp.scrollable_content.scrollbar.percentageY());
    });

     $("body").swipe({
        swipeStatus: function(event, phase, direction, distance, duration, fingerCount)
        {
            //Here we can check the:
            //phase : 'start', 'move', 'end', 'cancel'
            //direction : 'left', 'right', 'up', 'down'
            //distance : Distance finger is from initial touch point in px
            //duration : Length of swipe in MS 
            //fingerCount : the number of fingers used

            if (dragHandled())
                return;

            //start showing the sidebar
            if (phase === "move" && direction === "right") {
                dashApp.sidebar.increaseWidth(distance);
            }

            //drag ended before sidebar was shown so now hide
            if (phase === "end" && dashApp.sidebar.status() === dashApp.sidebar.SIDEBAR_SHOWING) {
                dashApp.sidebar.hide();
            }

            //hide sidebar
            if (phase === "move" && direction === "left") {
                dashApp.sidebar.decreaseWidth(distance);
            }

            //scrolldown
            if (phase === "move" && direction === "up") {
                dashApp.scrollable_content.scrollbar.scrollY(-distance);
                dashApp.scrollable_content.content.percentageY(dashApp.scrollable_content.scrollbar.percentageY());
            }

            //scrollup
            if (phase === "move" && direction === "down") {
                dashApp.scrollable_content.scrollbar.scrollY(distance);
                dashApp.scrollable_content.content.percentageY(dashApp.scrollable_content.scrollbar.percentageY());
            }
        },
        threshold: 100,
        maxTimeThreshold: 2500,
        fingers: 'all'
    });
    

    //gets the filter values from the server
    queryServer({
        what: 'gettimeandfilters',
        callback: function(jsonRet) {
            dashApp.storage.set('minTime', jsonRet.minTime);
            dashApp.storage.set('maxTime', jsonRet.maxTime);

            dashApp.storage.set('maxInteraction', jsonRet.maxInteraction);
            dashApp.storage.set('minInteraction', jsonRet.minInteraction);

            $.each(jsonRet.languages, function(i, v) {
                $('<label><input type="checkbox" checked="checked" name="lang[]" value="' + v.id + '"/>' + v.description + '</label>').appendTo($('.languagesFilter'))
                $('.languagesFilter').append('<br/>');
            });

            var $col = $('<div class="queryTypeFilterColumn"/>');
            $.each(jsonRet.queryTypes, function(i, v) {

                if ((i !== 0) && (i % 3 === 0)) {
                    $('.queryTypeFilter').append($col);
                    $col = $('<div class="queryTypeFilterColumn"/>');
                }

                $col.append($('<label><input type="checkbox" checked="checked" name="qtype[]" value="' + v.id + '"/>' + v.description + '</label>'));
                $col.append('<br/>');
            });
            $('.queryTypeFilter').append($col);

        }
    });

    ////////////////////////////
    //used on reseach and comparison view. move there?

    //draggable behavior for the default chartBox
    assignChartBehavior($('.chartBox'));

    //test function to add a series
    
    //export charts
    /*
    $('#exportCharts').change(function() {
        var whichOption = $(this).val();
        $('option', $(this)).removeAttr('selected');
        $('option[value=""]', $(this)).attr({selected: 'selected'});

    });
    */
   
    /*
     //the filters are drawn using masonry
     var $container = $('#container');
     // initialize
     $container.masonry({
     columnWidth: 200,
     itemSelector: '.item'
     });
     */
});
