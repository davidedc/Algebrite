
# The C library function int isspace(int c) checks
# whether the passed character is white-space.

# s is a string here anyways
isspace = (s) ->
	return s == ' ' or s == '\t' or s == '\n' or s == '\v' or s == '\f' or s == '\r'

isdigit = (str) ->
	return /^\d+$/.test(str);

isalpha = (str) ->
	#Check for non-alphabetic characters and space
	if !str? then debugger
	return (str.search(/[^A-Za-z\s]/) == -1)

isalnum = (str) ->
	return (isalpha(str) or isdigit(str))
