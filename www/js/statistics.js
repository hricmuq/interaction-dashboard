//Required CSS Properties for this function to work:
//.stat { width: 135px; display: inline; float:left; margin-top: 10px;}
//.stat_number_large { font-size: 30px; font-family: 'Ruda', sans-serif; color: black; font-weight : bold; text-align: center;}
// .stat_description { font-size: 15px; font-family: 'Segoe UI Light', 'Helvetica Neue Light', 'Segoe UI', 'Helvetica Neue', 'Trebuchet MS', Verdana; color: black; display: block; text-align: center;}

function createSummaryChart(selector, params) {

    $(selector).html('');
    
    d3.json("php/getstatsjson.php"+params,function (data){
    
    stats=data;
   
    //Clear Any existing elements
    d3.selectAll(".stat_number_large").remove();		
    d3.selectAll(".stat_description").remove();
    
    
    //Set Width/Height here for container DIV.
    
    d3.select(selector).append("div").attr("id","stat1").attr("class","stat");
    d3.select(selector).append("div").attr("id","stat2").attr("class","stat");
    d3.select(selector).append("div").attr("id","stat3").attr("class","stat");
    d3.select(selector).append("div").attr("id","stat4").attr("class","stat");

    
    d3.select("#stat1")
    .append("div").attr("class","stat_number_large").text(0).transition()
    .duration(1000).tween("text", function() {
        //Interpolate the current value of the text feild to increment until we reach the required value
        var i = d3.interpolate(this.textContent, stats.total_queries);

        return function(t) {
            this.textContent = Math.round(i(t));
        };
    });

    d3.select("#stat1")
    .append("div").attr("class","stat_description").text("Total Queries");

    d3.select("#stat2")
    .append("div").attr("class","stat_number_large").text(0).transition()
    .duration(1000).tween("text", function() {
        //Interpolate the current value of the text feild to increment until we reach the required value
        var i = d3.interpolate(this.textContent, stats.total_interactions);

        return function(t) {
            this.textContent = Math.round(i(t));
        };
    });

    d3.select("#stat2")
    .append("div").attr("class","stat_description").text("Total Interactions");

    d3.select("#stat3")
    .append("div").attr("class","stat_number_large").text(0)
    .transition()
    .duration(1000)
    .tween("text", function() {
        //Interpolate the current value of the text field to increment until we reach the required value
        var i = d3.interpolate(this.textContent, stats.avg_queries),
        prec = (stats.avg_queries + "").split("."),
        round = (prec.length > 1) ? Math.pow(10, prec[1].length) : 1;

        return function(t) {
            this.textContent = Math.round(i(t) * round) / round;
        };
    });

    d3.select("#stat3")
    .append("div").attr("class","stat_description").text("Average Queries per Interaction");
  
    d3.select("#stat4")
    .append("div").attr("class","stat_number_large").text(0)
    .transition()
    .duration(1000)
    .tween("text", function() {
        //Interpolate the current value of the text field to increment until we reach the required value
        var i = d3.interpolate(this.textContent, stats.avg_query_length),
        prec = (stats.avg_query_length + "").split("."),
        round = (prec.length > 1) ? Math.pow(10, prec[1].length) : 1;

        return function(t) {
            this.textContent = Math.round(i(t) * round) / round;
        };
    });

    d3.select("#stat4")
    .append("div").attr("class","stat_description").text("Average Characters per Query");
    
    });
}
    
//var panel = createSummaryChart("#summary","");