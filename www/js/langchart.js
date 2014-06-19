
/**
 * creates a language chart given the options
 * @param {Object} inOptions. options include:<br/>
 * container: {String} CSS selector for chart container<br/>
 * params: {String} params to send to server<br/>
 * legend: {true|false} print legend<br/>
 */
function createLangChart(options) {

    //Assuming Margins are set in CSS for the element described by "Selector"
    //
    //Remove existing charts, if any.
    //d3.select(selector).remove();

    options = $.extend({
        printChart: true,
        printLegend: true,
        params: '',
        container: ''
    }, options);

    var container = options.container;
    var params = options.params;

    //Following Code is to set dimensions from CSS: for Final Use
    //var containerID = 'time' + guid().split('-')[0];
    var $container = $(container);

    var xAxisHeight = 0;
    var yAxisOffset = 0;
    //TODO: Set Width and Height Elements from CSS:
    var width = $container.outerWidth(false) - yAxisOffset;
    var height = $container.outerHeight(false) - xAxisHeight;

    //Pre-set dimensions for testing:
    //var width = 200;
    //var height = 200;
    //JSON Load Data using supplied parameters
    d3.json("php/getlangs.php" + params, function(error,data) {
    	
    	//no need to remove. assume container is empty
        //d3.select("#langpie").remove();
        //d3.selectAll("#lang-legend").remove();
        //in fact just empty it here
        $(container).html('');
        
        if(error){
    		
    		d3.select(selector)
    		  .append("p")
    		  .attr("class","charterror")
    		  .text("Error Loading Language Chart");
    		
    		console.error("Error loading Language Chart, check" +
    				"JSON request to php/getlangs.php");
    		return;
    	}
    	
        var langs = data.items;

        var radius = Math.min(width/4, height/2);
        var remainingWidth = width - radius*2 - 10;
                
        chartLabelInit('lang',d3.scale.category10());
        var color = d3.scale.category10();
        
        if(options.printChart){
            var pie = d3.layout.pie()
                .value(function(d) {
                    return d.number;
                })
                .sort(null);
        
            var arc = d3.svg.arc()
                    .innerRadius(radius - radius * 0.25)
                    .outerRadius(radius - radius * 0.10);

            //Change the Container Reference here:
            var svg = d3.select(container).append("svg")
                    .attr("width", radius*2 )
                    .attr("height", radius*2 )
                    //.attr("id", "langpie")
                    .append("g")
                    .attr("transform", "translate(" + radius + "," + radius + ")");

            var path = svg.datum(langs).selectAll("path")
                    .data(pie)
                    .enter().append("path")
                    .attr("fill", function(d, i) {
                        return chartLabelColor(langs[i].language );
                    })
                    .attr("d", arc)
                    .each(function(d) {
                        this._selected = d;
                    });  // store the initial angles
        }
        
        if (options.printLegend) {
            var legend = d3.select(container).append("svg")
                    //.data(color.domain().slice())
                    //.attr("id", "lang-legend")
                    .attr("class", "vertical-legend")
                    .attr("width", remainingWidth)
                    .attr("height", height)
                    .selectAll("g")
                    .data(langs)
                    .enter()
                    .append("g")
                    .attr("transform", function(d, i) {
                        return "translate(10, " + (i * 30 + 10) + ")";
                    });

            legend.append("rect")
                    .attr("width", 18)
                    .attr("height", 18)
                    .style("fill", function(d,i){
                        return chartLabelColor(langs[i].language);
                    });

            legend.append("text")
                    .attr("x", 24)
                    .attr("y", 9)
                    .attr("dy", ".35em")
                    .text(function(d,i) {
                        return langs[i].language + ' (' + langs[i].number + ')';
                    });

            function change(langs) {
                svg.datum(langs);
                path = path.data(pie); // compute the new angles
                path.transition().duration(500).attrTween("d", arcTween); // redraw the arcs
                legend.select('text').text(function(d,i) {
                    return langs[i].language + ' (' + langs[i].number + ')';
                });
            }

            function arcTween(a) {
                var i = d3.interpolate(this._selected, a);
                this._selected = i(0);
                return function(t) {
                    return arc(i(t));
                };
            }

            return {
                change: change
            };

        }
    });
}

//Following Line is for Testing Only:

//var panel = createLangChart("#langchart", "");