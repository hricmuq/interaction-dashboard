This README discusses some aspects of the programming with the front end.

#Views

Currently there are 3 views for the dashboard. Each View represents an
interpretation of the same Data in a way that might be more useful depending on
what the user is trying to query from the system.
-Research View is the basic view where the user can view useful charts
-Interaction View allows the user to view individual interactions
-Comparison view allows multiple instances of the charts in Research view to be
compared

#Application Behavior

Programmatically, the view is shown by passing the 'view' GET argument
Behavior common to all view is stored in js/behavior-main.js

An example of common behavior is the time selection filter on the top left.
When the application has queried the server for some basic filter information
using the 'queryServer' function the then the 'createPanel' function is called

Behavior specific to particular views has its logic stored in
js/behavior-{view}.js thats is:
-Research view's logic is stored in js/behavior-research.js
-Interaction view's logic is stored in js/behavior-interactions.js
-Comparison view's logic is stored in js/behavior-comparison.js

Rather than use the jquery document ready function, view specific behavior
should use the 'applicationReady' function which ensures that all filter data
has been loaded from the database. Filter data is loaded from the database using
'php/gettimeandfilters.php'. This can be seen in the first option of the 
'queryServer' function that is being called in js/behavior-main.js
$(document).ready function

#Charts
The list of available charts are in the selectbox #addChart in tpl/charts.php.
To add a new type of chart an option must be added to the selectbox and the
'addChartToDiv' function must be modified to add the case of the new chart.

Each SVG chart is has its functionality in its own javascript file.
Currently the chart functions are:
-Langauge chart in js/langchart.js
-Query tye chart in js/qtypechart.js
-Top Queries chart in js/topquerychart.js and topquerycomparisonchart.js
-Interaction duration chart in js/iduration.js
-Interaction frequency chart in js/interactionfrequencychart.js
-Heatmap chart in js/weekheatmap.js

