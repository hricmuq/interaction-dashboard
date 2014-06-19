## Synopsis

The interaction dashboard is an interaction log viewer and visualizer for 
Human-Robot Interaction (HRI) systems. The log visualizer can be used to glean
insights on the interaction data stored within the logs. You can render charts
of interaction type, reponses, and filter down your queries to specific dates,
etc. A live demo is hosted here: http://desertrose.qatar.cmu.edu/Dashboard/

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
This project is in it's first alpha release.

Please consider contributing to this project if you experience with JavaScript,
jQuery, and D3.js.

If you write an ETL script for a popular HRI system, please consider 
contributing.

Additional README files are located in the `www` and `etl` directorories for more
information

## License

Copyright (c) 2012, Carnegie Mellon University. All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution. Neither the name of the Carnegie Mellon University nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission. THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
