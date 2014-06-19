
//Requires the following CSS to render correctly:
// .bar { fill: steelblue; margin-bottom: 15px;}
// .bartext { fill: black;   font-size: 12px; font-family: sans-serif; text-anchor: left; }

//Will render in fixed space, params can include a "limit" parameter to limit 
//the number of queries shown on screen.

function createTopQueryChart(selector, params) {

    d3.json("php/getqueriesjson.php" + params, function(error, data) {
        var topqueries = data.items;
        //Debug
        //console.log(topqueries);
        
        $(selector).html('');
        
        
        if(error){
    		
    		d3.select(selector)
    		  .append("p")
    		  .attr("class","charterror")
    		  .text("Error Loading Top Query Chart");
    		
    		console.error("Error loading Interaction Frequency Chart, check" +
    				"JSON request to php/getlangs.php");
    		return;
    	}
    
        //Set the following parameters as required:
        var w = $(selector).width() - 20,
                h = $(selector).height(),
                barPadding = 5;

        //Clear previous element 
        //d3.select("#topquerychart").remove();

        var svg = d3.select(selector)
                .append("svg")
                .attr("width", w)
                .attr("height", h)
                .attr("id", "topquerychart");

        //Find max dataset
        var max_n = 0;
        for (var d in topqueries) {
            max_n = Math.max(topqueries[d].query_occurrence, max_n);
        }

        //console.log(max_n);

        // Set up an ordinal scale for y - based on the actual order of elements in data
        var yScale = d3.scale.ordinal()
                .domain(d3.range(topqueries.length))
                .rangeRoundBands([0, h], 0.05);

        //Scale x according to the highest data point in the data to the width of the element
        var xScale = d3.scale.linear()
                .domain([0, max_n])
                .range([0, w - 10]); //put 10 pixels worth of padding at the end

        // bars
        var bars = svg.selectAll(".topbar")
                .data(topqueries)
                .enter()
                .append("rect")
                .attr("class", "topbar")
                .attr("x", 0)
                .attr("y", function(d, i) {
                    return yScale(i);
                })
                .attr("width", function(d, i) {
                    return xScale(d.query_occurrence);
                })
                .attr("height", yScale.rangeBand())
                .attr("fill","#999999");
function reverse(s){
    return s.split("").reverse().join("");
}
        // labels
        var text = svg.selectAll("text")
                .data(topqueries)
                .enter()
                .append("text")
                .attr("class", function(d){
                    if(isArabic(d.query_text)) return "arabicText bartext";
                    else return "bartext";
                    return "bartext"
                }).attr("y", function(d, i) {
                    return yScale(i) + yScale.rangeBand() / 2 + 4;
                })
                .style('direction', function(d){
                    if(isArabic(d.query_text)) return 'rtl';
                    else return 'ltr';
                })
                .text(function(d) {
                    return d.query_text + " (" + d.query_occurrence + ")";
                }).attr("x", function(d){
                    if(isArabic(d.query_text)) return this.getBBox().width + 5;//5*d.query_text.length + 30;
                    else return 5;
                });
    });
}


//For testing only:

//var panel = createTopQueryChart("#querychart", "");