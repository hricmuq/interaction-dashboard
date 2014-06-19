'''
etl.load_hala_logs -- Program to load Hala 1 native logs to a MySQL DB

etl.opt_test is a description

It defines classes_and_methods

@author:     Suhail Rehman suhailr

@copyright:  2014 Carnegie Mellon University in Qatar. All rights reserved.

@license:    Proprietary

@contact:    suhailr@qatar.cmu.edu
@deffield    updated: 3/4/2014
'''

import sys
import glob
import arabictools

import os.path
from collections import deque, namedtuple
import logging
from datetime import datetime

import pymysql


from optparse import OptionParser

logging.basicConfig(level=logging.DEBUG)


__all__ = []
__version__ = 0.1
__date__ = '2014-03-04'
__updated__ = '2014-03-04'

DEBUG = 0
TESTRUN = 0
DRYRUN = 0
PROFILE = 0

languages = {"DB90STYLEEN" : "en", "DB90STYLEARABIFY" : "3ar", "DB90STYLEAR" : "ar", "90STYLEAR" : "ar", "90STYLEARABIFY" : "3ar"}

query_insert_statement = '''INSERT INTO `queries` (`timestamp`, `query_text`, `response_text`, `lang`, `query_type`, `proper_response?`, `interaction_id`) VALUES (%s, %s, %s,%s, %s, %s, %s);'''
interaction_insert_statement = '''INSERT INTO `interactions` (`begin_timestamp`, `end_timestamp`, `num_queries`) VALUES (%s, %s, %s);'''    

errorfile = None

# Function to determine if a response is proper or not.
def isproper(text):
    # All the missed responses. Ideally this should be loaded from a text file.
    MISSED_RESPONSE_INDICATORS = frozenset([
    "I didn't understand. Can you ask me differently?",
    "Can you please rephrase that?",
    "I don't have an answer. I still have a lot to learn",
    "I don't have that information. Ask me something else.",
    "I don't know much about this topic. Let's talk about something else?",
    "I do not understand. Can you express it differently?",
    "Please reword what you just said.",
    "Can you help me understand by putting things differently?",
    "Can you rephrase what you said?",
    "I can't make sense of what you said.",
    "I couldn't grasp the meaning of what you said.",
    "I didn't get that. Try to reword it.",
    "I'm not sure what you are talking about. Please put it in other words.",
    "What do you mean?",
    "I don't know what you mean. I'll give it another try if you rephrase it!",
    "I'm sorry. I didn't get that.",
    "Please reword that. Understanding human language is quite a challenge.",
    "I can't figure out what you said. Can you help me?",
    "I didn't get that.",
    "I didn't understand, can you put things in a different way ?",
    "I do not understand you. Can you please ask again ?",
    "I'm sorry, I am confused by your input. Can you please try asking it in a different way ?",
    "Your last phrase has me baffled. Perhaps you can rephrase the sentence and ask me again.",
    "Please rephrase it.",
    "Input does not compute !",
    "I didn't understand, I'm still a trainee.",
    "I am not understanding you, please talk more clearly.",
    "0AZ000AZ240AZ29 0AZ230AZ020AZ000AZ110AZ190AZ28^L 0AZ220AZ23 0AZ000AZ190AZ250AZ23 0AZ110AZ320AZ290AZ220AZ480AZ210AZ23.",
    "0AZ000AZ270AZ230AZ510AZ210AZ240AZ470AZ210AZ470AZ23 0AZ300AZ170AZ290AZ070AZ280AZ47 0AZ130AZ270AZ290AZ180AZ280AZ49 0AZ080AZ220AZ210AZ54",
    "0AZ220AZ270AZ11 0AZ220AZ070AZ270AZ520AZ48 0AZ300AZ040AZ290AZ010AZ28. 0AZ220AZ29 0AZ100AZ290AZ22 0AZ000AZ230AZ290AZ230AZ49 0AZ290AZ220AZ210AZ030AZ270AZ090AZ47 0AZ220AZ000AZ020AZ170AZ220AZ480AZ230AZ480AZ250AZ47!",
    "0AZ220AZ29 0AZ000AZ230AZ220AZ21 0AZ290AZ220AZ230AZ170AZ220AZ260AZ230AZ290AZ02 0AZ290AZ220AZ020AZ27 0AZ020AZ150AZ220AZ010AZ260AZ24. 0AZ290AZ110AZ000AZ220AZ260AZ29 0AZ120AZ270AZ340AZ290AZ35 0AZ230AZ060AZ020AZ220AZ490AZ190AZ290AZ350AZ54",
    "0AZ220AZ29 0AZ000AZ170AZ090AZ190AZ47 0AZ290AZ220AZ210AZ030AZ270AZ090AZ48 0AZ170AZ24 0AZ250AZ080AZ29 0AZ290AZ220AZ230AZ260AZ140AZ260AZ17.",
    "0AZ220AZ23 0AZ000AZ190AZ250AZ23 0AZ200AZ130AZ070AZ480AZ210AZ23. 0AZ290AZ110AZ000AZ220AZ260AZ240AZ27 0AZ010AZ150AZ090AZ270AZ200AZ280AZ53 0AZ000AZ060AZ090AZ36.",
    "0AZ220AZ110AZ020AZ47 0AZ000AZ210AZ270AZ070AZ280AZ35 0AZ230AZ230AZ29 0AZ020AZ200AZ260AZ220AZ260AZ24. 0AZ250AZ220AZ29 0AZ110AZ290AZ170AZ070AZ020AZ230AZ260AZ240AZ270AZ54",
    "0AZ230AZ290AZ080AZ29 0AZ020AZ170AZ240AZ260AZ240AZ54",
    "0AZ220AZ23 0AZ000AZ190AZ250AZ23. 0AZ300AZ110AZ000AZ220AZ260AZ240AZ27 0AZ010AZ150AZ090AZ270AZ200AZ280AZ53 0AZ000AZ060AZ090AZ36.",
    "0AZ230AZ24 0AZ190AZ140AZ220AZ490AZ210AZ470AZ23 0AZ000AZ480AZ170AZ270AZ070AZ260AZ29 0AZ130AZ270AZ290AZ180AZ480AZ280AZ48 0AZ040AZ470AZ230AZ220AZ480AZ020AZ490AZ210AZ470AZ23.",
    "0AZ220AZ110AZ020AZ47 0AZ000AZ210AZ270AZ070AZ280AZ35 0AZ230AZ230AZ29 0AZ020AZ170AZ240AZ260AZ24. 0AZ250AZ220AZ29 0AZ190AZ110AZ520AZ480AZ090AZ020AZ470AZ23 0AZ080AZ220AZ210AZ54",
    "0AZ000AZ240AZ29 0AZ000AZ480AZ170AZ020AZ080AZ490AZ090AZ47. 0AZ220AZ29 0AZ000AZ170AZ090AZ19 0AZ230AZ290AZ080AZ29 0AZ020AZ200AZ130AZ070AZ260AZ24.",
    "0AZ220AZ23 0AZ000AZ190AZ250AZ23^L 0AZ220AZ210AZ240AZ240AZ27 0AZ230AZ110AZ020AZ170AZ070AZ280AZ50 0AZ220AZ220AZ230AZ050AZ290AZ260AZ220AZ28 0AZ230AZ24 0AZ040AZ070AZ270AZ07 0AZ300AZ080AZ29 0AZ000AZ480AZ170AZ480AZ070AZ510AZ020AZ470AZ23 0AZ130AZ270AZ290AZ180AZ28 0AZ290AZ220AZ040AZ230AZ220AZ28!",
    "0AZ000AZ270AZ230AZ210AZ240AZ210AZ23 0AZ000AZ24 0AZ020AZ210AZ090AZ090AZ260AZ29 0AZ200AZ260AZ220AZ480AZ210AZ23 0AZ010AZ170AZ010AZ290AZ090AZ290AZ020AZ53 0AZ000AZ060AZ090AZ360AZ54",
    "0AZ000AZ060AZ120AZ36 0AZ000AZ240AZ240AZ27 0AZ220AZ23 0AZ000AZ190AZ250AZ23 0AZ200AZ130AZ070AZ480AZ210AZ470AZ23.",
    "0AZ220AZ110AZ020AZ47 0AZ000AZ210AZ270AZ070AZ280AZ35 0AZ230AZ24 0AZ230AZ29 0AZ020AZ050AZ290AZ260AZ220AZ260AZ24 0AZ200AZ260AZ220AZ480AZ25.",
    "0AZ290AZ110AZ020AZ480AZ060AZ070AZ490AZ230AZ260AZ29 0AZ170AZ010AZ290AZ090AZ290AZ020AZ53 0AZ000AZ060AZ090AZ36 0AZ170AZ480AZ220AZ520AZ480AZ240AZ490AZ27 0AZ000AZ190AZ250AZ230AZ210AZ23 0AZ010AZ120AZ210AZ220AZ53 0AZ000AZ190AZ140AZ22",
    "0AZ290AZ110AZ020AZ480AZ060AZ070AZ490AZ230AZ260AZ29 0AZ040AZ470AZ230AZ480AZ220AZ290AZ35 0AZ010AZ110AZ270AZ150AZ480AZ280AZ35 0AZ300AZ08 0AZ230AZ24 0AZ290AZ220AZ130AZ170AZ010AZ49 0AZ170AZ220AZ270AZ520AZ48 0AZ000AZ24 0AZ000AZ190AZ250AZ480AZ230AZ48 0AZ220AZ180AZ480AZ280AZ48 0AZ290AZ220AZ010AZ120AZ480AZ090AZ49.",
    "0AZ250AZ22 0AZ270AZ470AZ230AZ510AZ210AZ490AZ240AZ470AZ210AZ23 0AZ000AZ24 0AZ020AZ110AZ000AZ220AZ260AZ240AZ27 0AZ010AZ150AZ090AZ270AZ200AZ480AZ280AZ53 0AZ000AZ060AZ090AZ360AZ54",
    "0AZ220AZ29 0AZ000AZ170AZ090AZ19 0AZ230AZ290AZ080AZ29 0AZ020AZ200AZ130AZ070AZ260AZ24.",
    "0AZ220AZ23 0AZ000AZ190AZ250AZ23. 0AZ050AZ290AZ260AZ22 0AZ000AZ24 0AZ020AZ170AZ270AZ07 0AZ130AZ270AZ290AZ180AZ28 0AZ29    0AZ220AZ040AZ230AZ220AZ28.",
    "0AZ220AZ23 0AZ000AZ190AZ250AZ23. 0AZ290AZ220AZ090AZ040AZ290AZ33 0AZ290AZ110AZ290AZ220AZ240AZ27 0AZ010AZ150AZ090AZ270AZ200AZ28 0AZ000AZ060AZ090AZ36.",
    ])

    if text in MISSED_RESPONSE_INDICATORS:
        return False
    else:
        return True
    
# TODO: Incorporate smarter query parsing here.    
def determine_query_type(text):
    '''Currently determines if a query is a meta-query or a general query'''
    
    METAQUERIES = frozenset(['<policy-file-request/>'])
    
    if text in languages:
        return "meta:lang"
    elif text in METAQUERIES:
        return "meta:init"
    elif any(substring in text for substring in languages):  # Mix of Button Symbols
        return "meta:buttonmash"
    else:    
        return "general"



def timeconvert(inputTime):
    '''Convert Hala Log Time Data into MySQL standard DATETIME format'''
    try:
        outputTime = str(datetime.strptime(inputTime, "%m/%d/%Y %H:%M:%S"))
    except Exception:
        # import pdb
        # pdb.pm()
        # print e
            # logging.error("Time conversion error: "+str(inputTime))
        # raise Exception
        return None   
    return outputTime

def parse_logs(infile, cursor):
    '''parse logs, requires an input directory of logs, an output error file and a cursor.\n
    A None cursor automatically is treated as a dry run'''

    ''' Typical Hala1 Interaction Log:
    10/20/2013 12:38:54 : Start interaction
    10/20/2013 12:38:54 : Input started
    
    10/20/2013 12:38:54 : *****ASCIIFIED INPUT: what is the weather for todayXYZ9988
    10/20/2013 12:38:54 : User input: what is the weather for today
    10/20/2013 12:38:54 : Vaine output: ~W DOHA TODAY ~W
    10/20/2013 12:39:01 : weatherReport: Sunny:92:74
    10/20/2013 12:39:02 : Chat response: segue_help speak("The weather today in DOHA will be Sunny,") speak("with a temperature between 23 and 33 degrees celcius")
    10/20/2013 12:39:34 : Set time
    10/20/2013 12:39:36 : Response Completed*****
    
    10/20/2013 12:40:22 : End interaction
    10/20/2013 12:40:34 : Interaction ended
    '''
    
    # print "Parsing Started..."
    
    openfile = open(infile)
    line = openfile.readline()
    linecounter = 1
    
    # print "File Open"
    
    global errorfile
 
    # My plan is to store in a list all the queries of a single interation,
    # as soon as an interaction ends, I shall store the data into MySQL
    
    # Flags Setting Area
    
    inputStarted = ""
    responseCompleted = ""
    queryCounter = 0 
    interactionFlag = False
    inputTaken = False
    current_lang = "en"
 
    query_tuple = namedtuple('query', 'queryText, timestamp, responseText, lang, proper, queryType')
    interactionUnit = []
    interaction_query_list = deque() 
    
    # Main Loop
    while line:
        # Update line counter
        linecounter += 1
        
        # Removing unwanted punctuation
        line = line.replace("'", "'")
        line = line.replace("\\", "")
        line = line.replace(")", "")
        line = line.replace('speak("', "")
        line = line.replace('"', "")

        # This is a new Input - the same as an interaction start
        if "Input started" in line:
            # split it to get the time stamp
            splittedLine = line.split()
            if (len(splittedLine) > 3):
                timestamp = " ".join(splittedLine[0:2])
                inputStarted = timestamp
        #End Input Started    
        
        
        # Start of Interaction                
        elif "Start interaction" in line:
            # check if there was already an interaction running
            # if yes, then this is an error and remove all what have been 
            # saved in the previous interaction
            if (interactionFlag == True):
                query_tuple = namedtuple('query', 'queryText, timestamp, responseText, lang, proper, queryType')
                queryCounter = 0
                interactionUnit = []
                errorfile.write("In " + str(infile))
                errorfile.write("\nInteraction Error in line " + str(linecounter) + " : " + line + "\n\n")
            else:  # there was no end interaction                        
                # to get the date and time of the beginning of interaction
                splittedLine = line.split()
                interactionFlag = True                
                timestamp = " ".join(splittedLine[0:2])   
                interactionTimestamp = timestamp         
                if "/" not in timestamp:
                    timestamp = inputStarted
            
            interaction_query_list = deque()    
            interactionUnit.append(timestamp)
        #End Interaction Start
        
        # Parse User Input
        elif "User input" in line:
            query_line = line.split()  # split the line to get the info from it
    
            if "User" in query_line[0]:
                input_query = " ".join(query_line[1:])
            else:
                input_query = " ".join(query_line[5:])
    
            
            # TODO: Add filtering rules to remove/classify certain types of meta-queries
            
            # check if it changing language
            if input_query in languages :
                current_lang = languages[input_query]
                query_tuple.lang = current_lang
                    
            # Check if the previous query got a response
            if inputTaken == True :
                errorfile.write("In " + str(infile))
                errorfile.write("\nNo response for previous query in line " + str(linecounter) + " : " + line + "\n\n")
                line = openfile.readline()
                linecounter += 1
                continue
    
            # check if the input is after an interaction started
            if interactionFlag != True:
                errorfile.write("In " + str(infile))
                errorfile.write("\nQuery without an interaction : " + str(linecounter) + " : " + line + "\n\n") 
                line = openfile.readline()
                linecounter += 1
                continue                
    
            elif "User" in query_line[0]:
                query_tuple.timestamp = inputStarted
                input_query = " ".join(query_line[1:])
                query_tuple.queryText = input_query 
                
            else:
                query_tuple.timestamp = " ".join(query_line[0:2])            
                input_query = " ".join(query_line[5:])
                
                # Convert ASCII text to UTF-8, if exists
                if(arabictools.isascii(input_query)):
                    query_tuple.queryText = arabictools.ascii2arabic(input_query)                
                else:
                    query_tuple.queryText = input_query 
    
            inputTaken = True
            queryCounter = queryCounter + 1
    
    
            query_tuple.lang = current_lang 
            query_tuple.queryType = determine_query_type(input_query)
        #End elif "User Input"
        
        #Check vaine output to categorize the query
        elif "Vaine output" in line:
            if query_tuple.queryType == "general":
                if "~W" in line:
                    query_tuple.queryType = "weather"
                elif "~D" in line:
                    query_tuple.queryType = "directions"    
                elif "~T" in line:
                    query_tuple.queryType = "translate"
                elif "~Q" in line:
                    query_tuple.queryType = "time"
                elif "~C" in line:
                    query_tuple.queryType = "chat"
                else:
                    query_tuple.queryType = "unclassified"
                    
                    
        # Chat Response            
        elif "Chat response" in line:
            if interactionFlag == False or inputTaken == False:
                line = openfile.readline()
                linecounter += 1
                continue
            inputTaken = False
            
            if (query_tuple.timestamp == None):
                query_tuple = namedtuple('query', 'queryText, timestamp, responseText, lang, proper, queryType')
                line = openfile.readline()
                linecounter += 1
                continue


            response_line = line.split()
            response = " ".join(response_line[5:])
            # Convert ASCII text to UTF-8, if exists
            if(arabictools.isascii(response)):
                query_tuple.responseText = arabictools.ascii2arabic(response)                
            else:
                query_tuple.responseText = response
                
            query_tuple.proper = isproper(response)
            interaction_query_list.append(query_tuple)
            query_tuple = namedtuple('query', 'queryText, timestamp, responseText, lang, proper, queryType')
        #End elif "Chat response"    
            
        # This is the end of a Query                        
        elif "Response completed" in line :
            splittedLine = line.split()
            if(len(splittedLine) > 3):
                timestamp = " ".join(splittedLine[0:2])
                responseCompleted = timestamp
        
        # End of Interaction, we should have all our data to import now.                
        elif "End interaction" in line:
            splittedLine = line.split()
         
            #Ensure we had an interaction that started and get the end timestamp.
            if interactionFlag == True:
                if ':' in line:
                    timeStamp = " ".join(splittedLine[0:2])
                elif responseCompleted != '':
                    timeStamp = responseCompleted
                else:
                    timeStamp = query_tuple.timestamp
                
                #get the end timestamp.
                interactionEnd = timeStamp
    
                # Not Interested in Interaction Language Just yet.
                # checking for mixed language
                # for ind in range(1 , queryCounter):
                #    if (query_language[-1 * ind] != query_language[(-1 * ind) -1] ):
                #            interactionUnit.append('mix')
                #            language_changed = True
                #            break

                # if (len(query_language) > 0 and language_changed == False):
                #    interactionUnit.append(query_language[-1])
                # elif (len(query_language) == 0 and language_changed == False):
                #    interactionUnit.append("ERR")
                # else:
                #    language_changed = False
                
            
            
                #########INSERT INTERACTION INTO DB    
                   
                # Format Dates properly.
                intime = timeconvert(interactionTimestamp)
                endtime = timeconvert(interactionEnd)
                if(intime == None or endtime == None):
                    errorfile.write("Time Conversion error in line" + str(linecounter) + "\n\n")
                    continue
                interaction_params = (intime, endtime, queryCounter)
                interaction_insert = interaction_insert_statement % interaction_params
                
                if DRYRUN:
                        print interaction_insert
                        interaction_id = "1" 
                else: 
                    try:
                        cursor.execute(interaction_insert_statement , interaction_params)
                        interaction_id = cursor.lastrowid
                    except Exception, e:
                        errorfile.write("SQL Exception " + repr(e))
                        errorfile.write("In " + str(infile))
                        errorfile.write("\nCould not insert SQL statement from line" + str(linecounter) + " : " + interaction_insert + "\n\n")
                        continue
                # Empty Interaction
            
                ###########INSERT QUERIES INTO DB
                # Check for empty interaction
                # if interaction_query_list:
                    # q = interaction_query_list.popleft()
                    # # Fix the SQL formatting for the final version
                    # intime = timeconvert(q.timestamp)
                    # if(intime == None):
                        # errorfile.write("Time Conversion error in line" + str(linecounter) + " : " + str(q) + "\n\n")
                        # continue
                    # query_params = (intime, q.queryText, q.responseText, q.lang, q.queryType, q.proper)
                    # query_insert = query_insert_statement % query_params
                    
                    # if DRYRUN:
                        # print query_insert
                        # first_query_id = "1" 
                    # else: 
                        # try:
                            # cursor.execute(query_insert_statement , query_params)
                            # first_query_id = cursor.lastrowid
                        # except Exception, e:
                            # errorfile.write("SQL Exception " + repr(e))
                            # errorfile.write("In " + str(infile))
                            # errorfile.write("\nCould not insert SQL statement from line" + str(linecounter) + " : " + query_insert + "\n\n")
                            # continue
                        
                while interaction_query_list:
                    q = interaction_query_list.popleft()
                    # Fix the SQL formatting for the final version
                    intime = timeconvert(q.timestamp)
                    if(intime == None):
                        errorfile.write("Time Conversion error in line" + str(linecounter) + " : " + str(q) + "\n\n")
                        continue
                    query_params = (intime, q.queryText, q.responseText, q.lang, q.queryType, q.proper, interaction_id)
                    query_insert = query_insert_statement % query_params
                    
                    if DRYRUN:
                        print query_insert
                    else: 
                        try:
                            cursor.execute(query_insert_statement, query_params)
                        except Exception, e:
                            errorfile.write("SQL Exception " + repr(e))
                            errorfile.write("In " + str(infile))
                            errorfile.write("\nCould not insert SQL statement from line" + str(linecounter) + " : " + query_insert + "\n\n")
                            continue
                ###########END INSERT QUERIES INTO DB
                    
                    
                    
                else:
                    errorfile.write("In " + str(infile))
                    errorfile.write("\nInteraction without consitutent queries " + str(linecounter) + " : " + line + "\n\n")
            
            # Interaction Ended before it started
            # if interactionFlag == False:
            else:
                errorfile.write("In " + str(infile))
                errorfile.write("\nInteraction ended before it started in line " + str(linecounter) + " : " + line + "\n\n")
                
                
            query_tuple = namedtuple('query', 'queryText, timestamp, responseText, lang, proper, queryType')
            queryCounter = 0
            interaction_id = 0
            interactionUnit = []
            interactionFlag = False
            interaction_query_list.clear() 
            
        line = openfile.readline()
        

def main(argv=None):
    '''Parses Command line options.'''

    program_name = os.path.basename(sys.argv[0])
    program_version = "v0.1"
    program_build_date = "%s" % __updated__

    program_version_string = '%%prog %s (%s)' % (program_version, program_build_date)
    # program_usage = '''usage: spam two eggs''' # optional - will be autogenerated by optparse
    program_longdesc = ''''''  # optional - give further explanation about what the program does
    program_license = "Copyright 2014 suhailr (Carnegie Mellon University in Qatar)"
    
    global DRYRUN, errorfile
    
    if argv is None:
        argv = sys.argv[1:]
    try:
        # setup option parser
        parser = OptionParser(version=program_version_string, epilog=program_longdesc, description=program_license)
        parser.add_option("-i", "--in", dest="indir", help="set input directory of log files [default: %default]", metavar="FILE")
        parser.add_option("-e", "--error", dest="errorfile", help="set output error log files [default: %default]", metavar="FILE")
        parser.add_option("-v", "--verbose", dest="verbose", action="count", help="set verbosity level [default: %default]")
        parser.add_option("-s", "--server", dest="server", help="set MySQL server address [default: %default]")
        parser.add_option("-P", "--port", dest="port", help="set MySQL server port [default: %default]")
        parser.add_option("-u", "--user", dest="user", help="set MySQL server user [default: %default]")
        parser.add_option("-p", "--password", dest="password", help="set MySQL server password [default: %default]")
        parser.add_option("-d", "--database", dest="db", help="set MySQL database to import to [default: %default]")
        parser.add_option("-D", "--dryrun", dest="dryrun", action="store_true", help="dry run (do not connect to MySQL) [default: %default]")
        # set defaults
        
        parser.set_defaults(error="../errors.txt", indir="../sample/", server="localhost", port="3306", db="hala", user='root', password="1234", dryrun=False)

        # process options
        (opts, args) = parser.parse_args(argv)



        # Print Program Header
        print " ".join([program_name, program_version, "Build", program_build_date])
        print program_license + "\n"
        print "Configuration:\n=============="
        if opts.verbose > 0:
            print("Verbosity Level = %d" % opts.verbose)
        if opts.indir:
            print("Input = %s" % opts.indir)
        if opts.error:
            print("Error File = %s" % opts.error)
        if opts.server:
            print("MySQL connection = %s@%s:%s" % (opts.user, opts.server, opts.port))
        if opts.db:
            print("Database = %s" % opts.db)    
        if opts.dryrun:
            print("Running in DRY-RUN mode\n")
            DRYRUN = 1
        print "Starting Log Processing\n"
        
        if not DRYRUN:
            db = pymysql.connect(host=opts.server, port=int(opts.port), user=opts.user, passwd=opts.password, db=opts.db, charset='utf8')
            cursor = db.cursor()
        else:
            cursor = None
            print "DRY-RUN SQL Output:\n==================="
        
        
        if os.path.exists(opts.indir):
            if os.path.isdir(opts.indir):
                opts.indir += '/*'
                fileList = glob.glob(opts.indir)

        else :
            raise Exception("Input path %s does not exist", opts.indir)

        errorfile = open(opts.error, 'w')

        for logfile in fileList:
            parse_logs(logfile, cursor)
            
        # Commit changes if not DRYRUN
        if not DRYRUN:
            db.commit()
        
        print "Log Processing Complete!\n" 

    except Exception:
        logging.exception("ERROR")
        return 2


if __name__ == "__main__":
    if DEBUG:
        sys.argv.append("-h")
    if TESTRUN:
        import doctest
        doctest.testmod()
    if PROFILE:
        import cProfile
        import pstats
        profile_filename = 'etl.opt_test_profile.txt'
        cProfile.run('main()', profile_filename)
        statsfile = open("profile_stats.txt", "wb")
        p = pstats.Stats(profile_filename, stream=statsfile)
        stats = p.strip_dirs().sort_stats('cumulative')
        stats.print_stats()
        statsfile.close()
        sys.exit(0)
    sys.exit(main())       
    

