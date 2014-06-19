#!/usr/bin/env python
# -*- coding: utf-8 -*-

'''
Created on Mar 4, 2014

@author: suhailr
'''
import re

arabic_map = {
    0 : 'أ',
    1  : 'ب',
    2  : 'ت',
    3  : 'ث',
    4  : 'ج',
    5  : 'ح',
    6  : 'خ',
    7  : 'د',
    8  : 'ذ',
    9  : 'ر',
    10  : 'ز',
    11  : 'س',
    12  : 'ش',
    13  : 'ص',
    14  : 'ض',
    15  : 'ط',
    16  : 'ظ',
    17  : 'ع',
    18  : 'غ',
    19  : 'ف',
    20  : 'ق',
    21  : 'ك',
    22  : 'ل',
    23  : 'م',
    24  : 'ن',
    25  : 'ه',
    26  : 'و',
    27  : 'ي',
    28  : 'ة',
    29  : 'ا',
    30  : 'إ',
    31  : 'آ',
    32  : 'ؤ',
    33  : 'ء',
    34  : 'ئ',
    35  : 'ً',
    36  : 'ى',
    37  : '٠',
    38  : '١',
    39  : '٢',
    40  : '٣',
    41  : '٤',
    42  : '٥',
    43  : '٦',
    44  : '٧',
    45  : '٨',
    46  : '٩',
    47  : 'ُ',
    48  : 'َ',
    49  : 'ِ',
    50  : 'ٌ',
    51  : 'ْ',
    52  : 'ّ',
    53  : 'ٍ',
    54  : '؟'
}

#Works only on Python 2.7
#ascii_map = {v:k for k, v in arabic_map.items()}

ascii_map = dict((v,k) for k, v in arabic_map.iteritems())

def utf8repl(match):
    value = int(match.group('num'))
    return arabic_map[value]

def ascii2arabic(text):
    #print "DEBUG: Input: "+text
    p = re.compile(r'0AZ(?P<num>\d\d)')
    return p.sub(utf8repl,text)

def isascii(text):
    result = re.match(r'0AZ(?P<num>\d\d)', text)
    if result is None:
        return False
    else:
        return True 
    
# Needs debugging.  
def arabic2ascii(text):
    output = ''
    for char in text:
        if(char in ascii_map):
            output += "0AZ"+ascii_map[char]
        else:
            output += char
    return output

def print_usage():
    print "Usage: "+sys.argv[0]+" [arabic|ascii] <text_to_convert>"
    
if __name__ == "__main__":
    import sys

    if(len(sys.argv)<3):
        print "Not enough arguments\n"
        print_usage()
        sys.exit(1)
    
    prog_flag = sys.argv[1]
    #print "DEBUG: Prog Flag: " + prog_flag
    if(prog_flag.strip() == 'arabic'):
        print ascii2arabic(" ".join(sys.argv[2:]))
    elif(prog_flag.strip() == "ascii"):
        print arabic2ascii(" ".join(sys.argv[2:]))
    else:
        print "Invalid Language Flag"
        print_usage()
        sys.exit(1)
