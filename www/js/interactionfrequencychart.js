//Requires the following CSS:
/*.axis path,
 .axis line {
 fill: none;
 stroke: black;
 shape-rendering: crispEdges;
 }
 
 .axis text {
 font-family: sans-serif;
 font-size: 11px;
 }
 
 .bar { fill: steelblue; margin-bottom: 15px;}
 .bartext { fill: black;   font-size: 0.8em; font-family: sans-serif; text-anchor: left; }
 .bar:hover {
 fill: brown;
 }
 */
function createInteractionHistogram(selector, params)
{
    d3.json("php/getinteractionfrequency.php" + params, function(error,data) {
    	
    	if(error){
    		
    		d3.select(selector)
    		  .append("p")
    		  .attr("class","charterror")
    		  .text("Error Loading Interaction Frequency Chart");
    		
    		console.error("Error loading Interaction Frequency Chart, check" +
    				"JSON request to php/getinteractionfrequency.php");
    		return;
    	}
    	
        $(selector).html('');
        
        var margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = $(selector).width() - margin.left - margin.right,
                height = $(selector).height() - margin.top - margin.bottom;

        //$(selector).html('');
        
        var x = d3.scale.ordinal()
            .rangeRoundBands([0, width], .1);

        var y = d3.scale.linear()
                .range([height, 0]);

        var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom");

        var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left")
                .ticks(5, "");

        var svg = d3.select(selector).append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        
        var max_n = 0;
        for (var d in data) {
            max_n = Math.max(data[d].frequency, max_n);
        }

        x.domain(data.map(function(d) {
            return d.num_queries;
        }));
        y.domain([0, max_n]);

        //console.log(max_n);

        svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

        svg.append("g")
                .attr("class", "axis")
                .append("text")
                .attr("x", width / 2)
                .attr("y", height + margin.bottom)
                .text("Number of Queries");

        svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Frequency");

        svg.selectAll(".bar")
                .data(data)
                .enter().append("rect")
                .attr("class", "bar")
                .attr("x", function(d) {
                    return x(d.num_queries);
                })
                .attr("width", x.rangeBand())
                .attr("y", function(d) {
                    return y(d.frequency);
                })
                .attr("height", function(d) {
                    return height - y(d.frequency);
                })
                .attr('fill','steelblue')
                .append("svg:title") //Simple Browser-Tooltip
                .text(function(d) {
                    return "Number: " + d.num_queries + " ," + "Frequency: " + d.frequency;
                });
        ;
    });


}


//For testing only:
//var panel = createInteractionHistogram("#ihistogram", "");