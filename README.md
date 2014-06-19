## Synopsis

The interaction dashboard is an interaction log viewer and visualizer for 
Human-Robot Interaction (HRI) systems. The log visualizer can be used to glean
insights on the interaction data stored within the logs. You can render charts
of interaction type, reponses, and filter down your queries to specific dates,
etc. For Screenshots, please visit: xxxx. A live demo is hosted here: xxxxxx

## Motivation

Most HRI systems log information about the interactions that the system has with
human subjects, but it is pretty difficult to extract out useful infromation
from the logs. Using this dashboard, you can easily locate interactions of 
interest within a particular timespan or using specific filter crietera. We
also support comparisons between multiple points of interest in the data
and an interaction browser to view interactions in the HRI system in 
conversational style. 

## Installation

To install the dashboard:

1) Ensure you have a functioning LAMP stack (Linux/Apache/MySQL/PHP) on your 
   machine. Setup Apache to serve the files located in the WWW folder.
2) Perfom the Extract, Transform and Load (ETL) of your interaction data into
   a MySQL database. Use the instructions in the `etl` folder to proceed. You can
   try the ETL with the sample data located in the `sample` folder.
3) Provide your MySQL credential information in the `php/credentials.php` file
4) Point your browser to the index.php file on your running apache server to 
   view the Interaction Dashboard.


## Contributors
This project is in it's first alpha release. A full roadmap for additional 
features is located at: XXXXXX

Please consider contributing to this project if you experience with JavaScript,
jQuery, and D3.js.

If you write an ETL script for a popular HRI system, please consider 
contributing.

## License

A short snippet describing the license (MIT, Apache, etc.)