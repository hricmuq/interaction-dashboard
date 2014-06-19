Interaction Logs ETL
====================

The Interaction Log visualizer requires that you perform an Extract-Transform-
Load (ETL) of your log data into a MySQL database. The location and credentials 
of the Database should be stored in www/php/credentials.php file.

Overall Design
==============
The log visualizer assumes the following about the interaction system:

1) The single smallest unit of communication between the interaction
   system and the user is a `query`.
2) A query consists of a single back-and-forth communication: The query text is  
   the question posed to the system and the response is the answer given back 
   to the user.
3) A query has, at minimum, a timestamp of when the query was posed to the 
   system, a language in which the query was given, a flag to indicate if the 
   system gave a "proper response".
4) Every query is contained within an `interaction`. Queries cannot happen 
   without the context of an interaction.
5) An interaction consists of 1 or more queries and has a specific start 
   and end time.

The database schema reflected below will take these assumptions into account.

Database Schema
===============

Create a Database in MySQL for your Project, for e.g. 'Hala'. You can now 
execute the create_schema.sql file on this Database. The following tables
will be populated:

interactions
------------
Each row in this table contains information about a single interaction:

| Column          | Description                           | Type     |
| --------------- |:--------------------------------------|:--------:|
| id              | Auto-incremented integer id           | int      |
| begin_timestamp | Start of Interaction                  | DATETIME |
| end_timestamp   | End of Interaction                    | DATETIME |
| num_queries     | Number of Queries in this interaction | int      |

queries
-------
Each row in this table contains information about a single query.

| Column          | Description                           | Type         |
| --------------- |:--------------------------------------|:------------:|
| id              | Auto-incremented integer id           | int          |
| timestamp       | Timestamp of the query                | DATETIME     |
| query_text      | String containing query text          | VARCHAR(500) |
| response_text   | String containing response text       | VARCHAR(500) |
| lang            | Lookup string for language            | VARCHAR(45)  | 
| query_type      | Lookup string for query_type          | VARCHAR(45)  |
| proper_response | Boolean - was the response proper?    | tinyint(1)   |
| sensor_data     | Optional Binary data from sensors     | blob         |
| misc            | Optional Binary data                  | blob         |
| interaction_id  | Foreign Key-Associated interaction id | int          |
  
`interaction_id` must be a valid id contained within the `interactions` table. 
`lang` and `query_type` are string lookup values for descriptions mentioned in
the `lang_lookup` and `qtype_lookup` tables respectively.

lang_lookup
-----------
Each row in this table contains information for a language used in the queries:

| Column          | Description                           | Type        |
| --------------- |:--------------------------------------|:-----------:|
| id              | Auto-incremented integer id           | int         |
| lang_string     | Lookup string for a language          | VARCHAR(45) |
| lang_dec        | String description of that language   | VARCHAR(45) |

qtype_lookup
-----------
Each row in this table contains information for a query_type used in the 
queries:

| Column          | Description                           | Type        |
| --------------- |:--------------------------------------|:-----------:|
| id              | Auto-incremented integer id           | int         |
| qtype_string    | Lookup string for a query type        | VARCHAR(45) |
| qtype_desc      | String description of that query type | VARCHAR(45) |


Writing your own ETL script
===========================

First, populate the lang_lookup and qtype_lookup tables with all the languages
and query types that you will be encountering in your interaction log data. 
Here are the ones we used for our system:

lang_lookup
------------

| id | lang_string | lang_desc              |
|:---|-------------|------------------------|
| 1  |en           | English                |
| 2  |ar           | Arabic                 |
| 3  |3ar          | Arabic (Transliterated)|


qtype_lookup
------------

| id | lang_string | lang_desc                         |
|:---|-------------|-----------------------------------|
| 1  |meta:lang    | Meta Query: Language Selection    |
| 2  |meta:init    | Meta Query: System Initialization |
| 3  |weather      | Weather                           |
| 4  |time         | Time of Day                       |
| 5  |directions   | Directions                        |

Once that is done, write a program/script to parse the logs files and populate
the `interaction` and `query` tables. Remember that every single query needs
to be linked to an interaction via an `interaction_id` key. Our approach
was to insert an interaction first and retrieve the auto-generated `id` key.
This key will then be used as the `interaction_id` with every query inserted for
that interaction.

The logic used to determine the metadata related to a query such as the 
language, query_type and proper_response can vary from system to system. This 
logic will have to be implemented in the ETL while inserting the data into the 
Database.
 
Sample ETL
==========

You can use the load_hala_logs.py with the sample ETL file located in the sample
directory to see the ETL system in action. 
