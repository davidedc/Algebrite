
# The C library function int isspace(int c) checks
# whether the passed character is white-space.


# does the equivalent of printf %g
# the parseFloat piece is needed to
# remove insignificant trailing zeroes
# (beyond the decimal point)
doubleToReasonableString = (d) ->
	return parseFloat(d.toPrecision(6));

# does nothing
clear_term = ->

# s is a string here anyways
isspace = (s) ->
	if !s? then return false
	return s == ' ' or s == '\t' or s == '\n' or s == '\v' or s == '\f' or s == '\r'

isdigit = (str) ->
	if !str? then return false
	return /^\d+$/.test(str);

isalpha = (str) ->
	if !str? then return false
	#Check for non-alphabetic characters and space
	if !str? then debugger
	return (str.search(/[^A-Za-z]/) == -1)

isalnum = (str) ->
	if !str? then return false
	return (isalpha(str) or isdigit(str))
