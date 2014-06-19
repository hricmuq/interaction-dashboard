
function refreshPanel($container) {
    
    if( !dashApp.storage.isset('timePanelData') ) return ;
    
    $container.html('');

    createPanel($container);
}

function createPanel($container) {

    //Assuming Margins are set in CSS for the element described by "Selector"

    //Remove existing charts, if any.
    //d3.select(selector).remove();
    var containerID = 'time' + guid().split('-')[0];
    $container.attr({id: containerID});

    var xAxisHeight = 30;
    var yAxisOffset = 30;
    //TODO: Set Width and Height Elements from CSS:
    var width = $container.outerWidth(false);
    var height = $container.outerHeight(false) - xAxisHeight;

    //Create Date Format to match the one we use:
    var parseDate = d3.time.format("%Y-%m-%d %H:%M").parse;

    ///Setup the required scales based on width and height:
    var x = d3.time.scale().range([0, width - yAxisOffset]),
            y = d3.scale.linear().range([height, 0]);

    //Setup x and y axes    
    var xAxis = d3.svg.axis().scale(x).orient("bottom");
    //var yAxis = d3.svg.axis().scale(y).orient("left");

    //Setup a brush on the X axis
    var brush = d3.svg.brush()
            .x(x)
            .on("brushstart", brushstart)
            .on("brushend", brushed);

    $container.data('brush', brush);

    //Functions to return the required data elements on data item d
    var numQueryFn = function(d) {
        return d.num_queries
    };
    var dateFn = function(d) {
        return parseDate(d.time)
    };

    var area = d3.svg.area()
            //.interpolate("monotone")
            .x(function(d) {
                return x(dateFn(d));
            })
            .y0(height)
            .y1(function(d) {
                return y(numQueryFn(d));
            });

    var svg = d3.select('#' + containerID).append("svg")
            .attr("width", width)
            .attr("height", height + xAxisHeight)
            .attr("transform", "translate( " + yAxisOffset + "," + 0 + ")")


    var context = svg.append("g")
            .attr("class", "context");
    
    if (dashApp.storage.isset('timePanelData')) {
        var data = dashApp.storage.get('timePanelData');

        x.domain(d3.extent(data, dateFn));
        y.domain([0, d3.max(data.map(function(d) {
                return d.num_queries;
            }))]);

        context.append("path")
                .datum(data)
                .attr("class", "area")
                .attr("transform", "translate( " + 0 + "," + 0 + ")")
                .attr("d", area);

        context.append("g")
                .attr("class", "x axis unselectable")
                .attr("transform", "translate( " + 0 + "," + height + ")")
                .call(xAxis);

        context.append("g")
                .attr("class", "x brush")
                .call(brush)
                .selectAll("rect")
                .attr("y", -6)
                .attr("transform", "translate( " + 0 + "," + 0 + ")")
                .attr("height", height + 7);

        if ($container.data('extent')) {
            d3.selectAll('#' + $container.attr('id') + " g.brush").call($container.data('brush').extent($container.data('extent')));
        }

        dashApp.storage.set('timeinit', true);

    } else {
        d3.json("php/getqueriesaggregate.php", function(error, data) {
            //Debug
            //console.log(timeline);
        	           
            if(error){
        		
        		d3.select(selector)
        		  .append("p")
        		  .attr("class","charterror")
        		  .text("Error Loading Timeline");
        		
        		console.error("Error loading Timeline, check" +
        				"JSON request to php/getqueriesaggregate.php");
        		return;
        	}
            
            dashApp.storage.set('timePanelData', data);

            x.domain(d3.extent(data, dateFn));
            y.domain([0, d3.max(data.map(function(d) {
                    return d.num_queries;
                }))]);

            context.append("path")
                    .datum(data)
                    .attr("class", "area")
                    .attr("transform", "translate( " + 0 + "," + 0 + ")")
                    .attr("d", area);

            context.append("g")
                    .attr("class", "x axis unselectable")
                    .attr("transform", "translate( " + 0 + "," + height + ")")
                    .call(xAxis);

            context.append("g")
                    .attr("class", "x brush")
                    .call(brush)
                    .selectAll("rect")
                    .attr("y", -6)
                    .attr("transform", "translate( " + 0 + "," + 0 + ")")
                    .attr("height", height + 7);

            if ($container.data('extent')) {
                d3.selectAll('#' + $container.attr('id') + " g.brush").call($container.data('brush').extent($container.data('extent')));
            }

            dashApp.storage.set('timeinit', true);
        });
    }


    function brushed() {
        var selectedDate = brush.extent();

        $container.data('extent', selectedDate);

        var html5DateFormat = d3.time.format("%Y-%m-%d");
        var startDate = html5DateFormat(selectedDate[0]);
        var endDate = html5DateFormat(selectedDate[1]);

        $("input[name=date_start]", $container.parent()).val(startDate + ' 00:00:00');
        $("input[name=date_end]", $container.parent()).val(endDate + ' 23:59:59');
    }

    function brushstart() {
        //brush.clear();
    }

}
