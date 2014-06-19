
//Requires the following CSS to render correctly:
// .bar { fill: steelblue; margin-bottom: 15px;}
// .bartext { fill: black;   font-size: 12px; font-family: sans-serif; text-anchor: left; }

//Will render in fixed space, params can include a "limit" parameter to limit 
//the number of queries shown on screen.

//Params are not defined for this argument as we can have N number of parameters
//, one for each series.
function createTopQueryComparisonChart(selector,args) {

    //Grab all passed params
    //var args = Array.prototype.slice.call(arguments, 1);
    var numSeries = args.length;
    
    var topQueryArray = new Array();
    for (i in args)  ///Iterate through passed params
    {
        $.ajax({
            url: "php/getqueriesjson.php" + args[i],
            success: function(data){
                topQueryArray.push(data.items);
            },
            failure: function(){
            		d3.select(selector)
            		  .append("p")
            		  .attr("class","charterror")
            		  .text("Error Loading Comparison Chart");
            		
            		console.error("Error loading Compare Chart, check" +
            				"JSON request to php/getqueriesjson.php");
            		return;
            },
            async: false
        });
        /*
        d3.json("php/getqueriesjson.php" + args[i], function(data) {
            
            console.log('loop ' + loop);
            topQueryArray[loop] = data.items;
            done++;
            //Render chart if the last series was pulled
            //I'm doing it this way since parent function (d3.json) is asynch
            if (done === numSeries)
                renderTopQueryComparisonChart(selector, topQueryArray);
        });*/
    }
    renderTopQueryComparisonChart(selector, topQueryArray);

}

function renderTopQueryComparisonChart(selector, data) {

    // This is a reimplementation of the Grouped Bar Chart by Mike Bostock
    // (http://bl.ocks.org/882152). Although useful, I found the original's
    // minimal comments and inverted axes hard to follow, so I created the
    // version you see here.
    
    $(selector).html('');
    
    // First, we define sizes and colours...
    var outerH = $(selector).height() - 40; // outer width
    var outerW = $(selector).width(); // outer height
    var padding = {t: 0, r: 30, b: 25, l: 20};
    var w = outerW - padding.l - padding.r; // inner width
    var h = outerH - padding.t - padding.b; // inner height
    
    //TODO: Implement Chart Label Coloring using chartLabelColor
    var c = ["#E41A1C", "#377EB8", "#4DAF4A", "yellow", "purple"]; // ColorBrewer Set 1

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Second, we define our data...
    // Create a two-dimensional array.
    // The first dimension has as many Array elements as there are series.
    // The second dimension has as many Number elements as there are groups.
    // It looks something like this...
    //  var data = [
    //    [ {number: 0.10, text:"Hello There!"},  {number: 0.10, text:"Hello There!"}, ... ], // series 1
    //    [ {number: 0.10, text:"Hello There!"},  {number: 0.10, text:"Hello There!"}, ... ], // series 2
    //    [ {number: 0.10, text:"Hello There!"},  {number: 0.10, text:"Hello There!"}, ... ]  // series 3
    //  ];

    var max_n = 0;
    var max_groups = 0;

    for (i in data) {

        for (j in data[i])
        {
            max_n = Math.max(data[i][j].query_occurrence, max_n);
        }
        max_groups = Math.max(j, max_groups);
    }

    var numberGroups = max_groups + 1; // groups
    var numberSeries = data.length;  // series in each group
    //console.log(numberGroups);
    //Randomly generated data
    /*var data = d3.range(numberSeries).map(function () { return d3.range(numberGroups).map(
     function(){ var object={};
     object.number= Math.random()
     object.text= randomTexts[getRandomInt(0,randomTexts.length-1)];
     return object; })});*/

    // Third, we define our scales...
    // Groups scale, y axis
    var y0 = d3.scale.ordinal()
            .domain(d3.range(numberGroups))
            .rangeBands([0, h], 0.2);

    // Series scale, y axis
    // It might help to think of the series scale as a child of the groups scale
    var y1 = d3.scale.ordinal()
            .domain(d3.range(numberSeries))
            .rangeBands([0, y0.rangeBand()]);

// Values scale, x axis
    var x = d3.scale.linear()
            .domain([0, max_n]) // Because Math.random returns numbers between 0 and 1
            .range([0, w]);

    // Visualisation selection
    var vis = d3.select(selector)
            .append("svg:svg")
            .attr("class", "plot")
            .attr("width", outerW)
            .attr("height", outerH);

    // Series selection
    // We place each series into its own SVG group element. In other words,
    // each SVG group element contains one series (i.e. bars of the same colour).
    // It might be helpful to think of each SVG group element as containing one bar chart.
    var series = vis.selectAll("g.series")
            .data(data)
            .enter().append("svg:g")
            .attr("class", "series") // Not strictly necessary, but helpful when inspecting the DOM
            .attr("fill", function(d, i) {
                return c[i];
            })
            .attr("transform", function(d, i) {
                return "translate(0," + y1(i) + ")";
            });



    // Groups selection
    var groups = series.selectAll("rect")
            .data(Object) // The second dimension in the two-dimensional data array
            .enter().append("svg:rect")
            .attr("x", 0 + padding.l)//function (d) { return w-x(d); })
            .attr("y", 0) //function (d) { return y0(d); })
            .attr("width", function(d, i) {
                return x(d.query_occurrence);
            })
            .attr("height", y1.rangeBand())
            .attr("transform", function(d, i) {
                return "translate( 0, " + y0(i) + ")";
            });

    //TODO: Arabic Text Adjustment for barText labels:
    var barText = groups.select("rect")
            .data(Object)
            .enter()
            .append("text")
            .attr("class", function(d){
                if(isArabic(d.query_text)) return "arabicText bartext2";
                else return "bartext2";
            })
            .attr("y", y1.rangeBand() / 2)
            .style("alignment-baseline", "middle")
            .style('direction', function(d){
                if(isArabic(d.query_text)) return 'rtl';
                else return 'ltr';
            })
            .text(function(d, i) {
                return d.query_text + " (" + d.query_occurrence + ")";
            })
            .attr("x", function(d) {
                //return padding.l;
                if(isArabic(d.query_text)) return this.getBBox().width + padding.l;//5*d.query_text.length + 30;
                else return padding.l;
            })
            .attr("transform", function(d, i) {
                return "translate( 0, " + y0(i) + ")";
            });


    var axisText = vis.selectAll("svg")
            .data(d3.range(0, numberGroups))
            .enter()
            .append("text")
            .attr("class", "bartext")
            .attr("y", function(d, i) {
                return (y0(i) + y1.rangeBand());
            })
            .text(function(d, i) {
                return i + 1;
            })
            .attr("x", 0)
            .style("alignment-baseline", "middle");


    //TODO: CSS Styling for Legend Text
    var legend = d3.select(selector).append("svg")
            //.data(color.domain().slice())
            //.attr("id", "lang-legend")
            .attr("class", "horizontal-legend")
            .attr("width", w)
            .attr("height", padding.b)
            .selectAll("g")
            .data(data)
            .enter()
            .append("g")
            .attr("transform", function(d, i) {
                return "translate(" + i * 100 + ",0)";
            });

    legend.append("rect")
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", function(d, i) {
                return c[i];
            });

    legend.append("text")
            .attr("x", 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .text(function(d, i) {
                return "Series " + (i + 1);
            });



}



//For testing only:
//var panel = createTopQueryComparisonChart("#comparison", "?date_start=2013-01-01+00%3A00%3A00&date_end=2014-01-01+00%3A00%3A00&lang%5B%5D=en&response%5B%5D=proper&qtype%5B%5D=weather&query_contains=&response_contains=","?date_start=2013-01-01+00%3A00%3A00&date_end=2014-01-01+00%3A00%3A00&lang%5B%5D=en&response%5B%5D=proper&qtype%5B%5D=translate&query_contains=&response_contains=");