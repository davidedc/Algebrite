
# The C library function int isspace(int c) checks
# whether the passed character is white-space.

strcmp = (str1, str2) ->
  # http://kevin.vanzonneveld.net
  # +   original by: Waldo Malqui Silva
  # +      input by: Steve Hilder
  # +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  # +    revised by: gorthaur
  # *     example 1: strcmp( 'waldo', 'owald' )
  # *     returns 1: 1
  # *     example 2: strcmp( 'owald', 'waldo' )
  # *     returns 2: -1
  if str1 == str2 then 0 else if str1 > str2 then 1 else -1


# does the equivalent of printf %g
# the parseFloat piece is needed to
# remove insignificant trailing zeroes
# (beyond the decimal point)
doubleToReasonableString = (d) ->
	return parseFloat(d.toPrecision(6))

# does nothing
clear_term = ->

# s is a string here anyways
isspace = (s) ->
	if !s? then return false
	return s == ' ' or s == '\t' or s == '\n' or s == '\v' or s == '\f' or s == '\r'

isdigit = (str) ->
	if !str? then return false
	return /^\d+$/.test(str)

isalpha = (str) ->
	if !str? then return false
	#Check for non-alphabetic characters and space
	if !str? then debugger
	return (str.search(/[^A-Za-z]/) == -1)

isalnum = (str) ->
	if !str? then return false
	return (isalpha(str) or isdigit(str))
