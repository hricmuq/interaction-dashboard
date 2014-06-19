//Requires the following CSS:
/*rect.bordered {
 stroke: #E6E6E6;
 stroke-width:2px;   
 }
 
 text.mono {
 font-size: 9pt;
 font-family: Consolas, courier;
 fill: #aaa;
 }
 
 text.axis-workweek {
 fill: #000;
 }
 
 text.axis-worktime {
 fill: #000;
 }*/


//Positioning in this chart is absolute - difficult to adjust. 
//This function requires a contain with minimum size of 500 x 175 px.

function createWeekHeatmap(selector, params) {

    var margin = {top: 10, right: 0, bottom: 30, left: 20},
    width = $(selector).width() - margin.left - margin.right,
            height = $(selector).height() - margin.top - margin.bottom,
            gridSize = Math.min(Math.floor(width / 25), Math.floor(height / 9));
    var legendElementWidth = gridSize * 2.5,
            buckets = 9,
            colors = ["#ffffd9", "#edf8b1", "#c7e9b4", "#7fcdbb", "#41b6c4", "#1d91c0", "#225ea8", "#253494", "#081d58"], // alternatively colorbrewer.YlGnBu[9]
            days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
            times = ["1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a", "12a", "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p", "12p"],
            tooltipDay = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            tooltipTime = ["1am", "2am", "3am", "4am", "5am", "6am", "7am", "8am", "9am", "10am", "11am", "12am", "1pm", "2pm", "3pm", "4pm", "5pm", "6pm", "7pm", "8pm", "9pm", "10pm", "11pm", "12pm"];

    d3.json("php/getweekheatmap.php" + params, function(error, data) {

        $(selector).html("");
        
        if(error){
    		
    		d3.select(selector)
    		  .append("p")
    		  .attr("class","charterror")
    		  .text("Error Loading Heatmap");
    		
    		console.error("Error loading Heatmap, check" +
    				"JSON request to php/getweeklyheatmap.php");
    		return;
    	}

        var max_n = 0;
        for (var d in data) {
            max_n = Math.max(data[d].value, max_n);
        }
        var colorScale = d3.scale.quantile()
                .domain([0, buckets - 1, max_n])
                .range(colors);

        var svg = d3.select(selector).append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var dayLabels = svg.selectAll(".dayLabel")
                .data(days)
                .enter().append("text")
                .text(function(d) {
                    return d;
                })
                .attr("x", 5)
                .attr("y", function(d, i) {
                    return (i * gridSize) + em(0.8) + 15
                })
                .style("text-anchor", "end")
                .attr("transform", "translate(0, 0)")
                .attr("class", "dayLabel mono axis");

        var timeLabels = svg.selectAll(".timeLabel")
                .data(times)
                .enter().append("text")
                .text(function(d) {
                    return d;
                })
                .attr("x", function(d, i) {
                    return i * gridSize + em(1.2) + 10
                })
                .attr("y", 5)
                .style("text-anchor", "middle")
                .attr("transform", "translate(0, 0)")
                .attr("class", "timeLabel mono axis");

        var heatMap = svg.selectAll(".hour")
                .data(data)
                .enter().append("rect")
                .attr("x", function(d) {
                    return d.hour * gridSize + em(1.2);
                })
                .attr("y", function(d) {
                    return d.day * gridSize + em(0.8);
                })
                .attr("rx", 4)
                .attr("ry", 4)
                .attr("class", "hour bordered")
                .attr("width", gridSize)
                .attr("height", gridSize)
                .style("fill", colors[0]);

        heatMap.transition().duration(1000)
                .style("fill", function(d) {
                    return colorScale(d.value);
                });

        heatMap.append("title").text(function(d) {
            return tooltipDay[d.day] + "/" + tooltipTime[parseInt(d.hour, 10)] + " Number of Queries: " + d.value;
        });

        var legend = svg.selectAll(".legend")
                .data([0].concat(colorScale.quantiles()), function(d) {
                    return d;
                })
                .enter().append("g")
                .attr("class", "legend");

        legend.append("rect")
                .attr("x", function(d, i) {
                    return legendElementWidth * i;
                })
                .attr("y", height)
                .attr("width", legendElementWidth)
                .attr("height", gridSize / 2)
                .style("fill", function(d, i) {
                    return colors[i];
                });

        legend.append("text")
                .attr("class", "mono")
                .text(function(d) {
                    return "≥ " + Math.round(d);
                })
                .attr("x", function(d, i) {
                    return legendElementWidth * i;
                })
                .attr("y", height + gridSize * 1.1);

        legend.append("text")
                .attr("class", "mono")
                .text("Number of Queries")
                .attr("transform", "translate(0," + (height - 5) + ")");



    });
}

//For testing only:
//var panel = createWeekHeatmap("#heatmap",""); 