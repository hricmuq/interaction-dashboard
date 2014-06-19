//Required CSS Properties for this function to work:
//.stat { width: 135px; display: inline; float:left; margin-top: 10px;}
//.stat_number_large { font-size: 30px; font-family: 'Ruda', sans-serif; color: black; font-weight : bold; text-align: center;}
// .stat_description { font-size: 15px; font-family: 'Segoe UI Light', 'Helvetica Neue Light', 'Segoe UI', 'Helvetica Neue', 'Trebuchet MS', Verdana; color: black; display: block; text-align: center;}

function createSummaryChart2(selector, params) {

    d3.json("php/getstatsjson.php" + params, function(error,data) {

        $(selector).html('');
        
        //no need to remove. assume container is empty
        //d3.select("#langpie").remove();
        //d3.selectAll("#lang-legend").remove();
        //in fact just empty it here
        
        if(error){
    		
    		d3.select(selector)
    		  .append("p")
    		  .attr("class","charterror")
    		  .text("Error Loading Statistics");
    		
    		console.error("Error loading Statistics, check" +
    				"JSON request to php/getstatsjson.php");
    		return;
    	}

        var stats = data;

        seriesAdd({
            title: '',
            data: [{
                    caption: 'Total queries',
                    value: stats.total_queries
                }, {
                    caption: 'Interactions',
                    value: stats.total_interactions
                }, {
                    caption: 'Average queries per interaction',
                    value: stats.avg_queries
                }, {
                    caption: 'Average characters per query',
                    value: stats.avg_query_length
                }
            ]
        });

    });
    
}
