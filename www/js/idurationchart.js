function createIDurationChart(selector, params) {

    d3.json("php/getinteractionduration.php"+params, function(error, data){
        $(selector).html('');
        
        if(error){
    		
    		d3.select(selector)
    		  .append("p")
    		  .attr("class","charterror")
    		  .text("Error Loading Interaction Duration Chart");
    		
    		console.error("Error loading Interaction Duration Chart, check" +
    				"JSON request to php/getinteractionduration.php");
    		return;
    	}
        
    	//Set dimesions based on container size here.
        var margin = {top: 20, right: 20, bottom: 30, left: 50},
        width = $(selector).width() - margin.left - margin.right,
        height = $(selector).height() - margin.top - margin.bottom;
        
        //Date Format: 2011-02-23 06:00:00
        var parseDate = d3.time.format("%Y-%m-%d %H:%M:%S").parse;
        
        var numQueryFn = function(d) { return d.num_queries};
        var dateFn = function(d) {return parseDate(d.begin_timestamp)};
        
        //console.log(numQueryFn(data[0]));
        //console.log(dateFn(data[0]));
        
        var x = d3.time.scale()
            .range([0, width]);

        var y = d3.scale.linear()
            .range([height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

       
        var svg = d3.select(selector).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        
          x.domain(d3.extent(data, dateFn));
          y.domain(d3.extent(data, numQueryFn));

          svg.append("g")
              .attr("class", "axis")
              .attr("transform", "translate(0," + height + ")")
              .call(xAxis);

          svg.append("g")
              .attr("class", "axis")
              .call(yAxis)
            .append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", 6)
              .attr("dy", ".71em")
              .style("text-anchor", "end")
              .text("Number of Queries");
          
          var yMap = function(d) {return y(numQueryFn(d));};
          var xMap = function(d) {return x(dateFn(d));};
            
          svg.selectAll(".dot")
             .data(data)
             .enter().append("circle")
             .attr("class", "dot")
             .attr("r", 2)
             .attr("fill","steelblue") //Replace this line if you have set the fill in CSS.
             .attr("cx", xMap)
             .attr("cy", yMap);
          
          //TODO: Add tooltip code here.
	});
}

//For testing only:
//var panel = createIDurationChart("#durationchart", "");