# This scanner uses the recursive descent method.
#
# The char pointers token_str and scan_str are pointers to the input string as
# in the following example.
#
#	| g | a | m | m | a |   | a | l | p | h | a |
#	  ^                   ^
#	  token_str           scan_str
#
# The char pointer token_buf points to a malloc buffer.
#
#	| g | a | m | m | a | \0 |
#	  ^
#	  token_buf
#
# In the sequence of method invocations for scanning,
# first we do the calls for scanning the operands
# of the operators of least precedence.
# So, since precedence in maths goes something like
# (form high to low) exponents, mult/div, plus/minus
# so we scan first for terms, then factors, then powers.
# That's the general idea, but of course we also have to deal
# with things like parens, non-commutative
# dot (or inner) product, assignments and tests,
# function calls etc.
# Note that a^1/2 is, correctly, a/2, not, incorrectly, sqrt(a),
# see comment in related test in power.coffee for more about this.

#	Notes:
#
#	Formerly add() and multiply() were used to construct expressions but
#	this preevaluation caused problems.
#
#	For example, suppose A has the floating point value inf.
#
#	Before, the expression A/A resulted in 1 because the scanner would
#	divide the symbols.
#
#	After removing add() and multiply(), A/A results in nan which is the
#	correct result.
#
#	The functions negate() and inverse() are used but they do not cause
#	problems with preevaluation of symbols.


T_INTEGER = 1001
T_DOUBLE = 1002
T_SYMBOL = 1003
T_FUNCTION = 1004
T_NEWLINE = 1006
T_STRING = 1007
T_GTEQ = 1008
T_LTEQ = 1009
T_EQ = 1010
T_NEQ = 1011
T_QUOTASSIGN = 1012

token = ""
newline_flag = 0
meta_mode = 0

input_str = 0
scan_str = 0
token_str = 0
token_buf = 0

lastFoundSymbol = null
symbolsRightOfAssignment = null
symbolsLeftOfAssignment = null
isSymbolLeftOfAssignment = null
scanningParameters = null
functionInvokationsScanningStack = null
skipRootVariableToBeSolved = false
assignmentFound = null


# Returns number of chars scanned and expr on stack.

# Returns zero when nothing left to scan.

# takes a string

scanned = ""
scan = (s) ->
	if DEBUG then console.log "#### scanning " + s
	#if s=="y=x"
	#	debugger
	#if s=="y"
	#	debugger
	#if s=="i=sqrt(-1)"
	#	debugger

	lastFoundSymbol = null
	symbolsRightOfAssignment = []
	symbolsLeftOfAssignment = []
	isSymbolLeftOfAssignment = true
	scanningParameters = []
	functionInvokationsScanningStack = [""]
	assignmentFound = false


	scanned = s
	meta_mode = 0
	expanding++
	input_str = 0
	scan_str = 0
	get_next_token()
	if (token == "")
		push(symbol(NIL))
		expanding--
		return 0
	scan_stmt()
	expanding--

	if !assignmentFound
		symbolsInExpressionsWithoutAssignments = symbolsInExpressionsWithoutAssignments.concat symbolsLeftOfAssignment

	return token_str - input_str

# takes a string
scan_meta = (s) ->
	scanned = s
	meta_mode = 1
	expanding++
	input_str = 0
	scan_str = 0
	get_next_token()
	if (token == "")
		push(symbol(NIL))
		expanding--
		return 0
	scan_stmt()
	expanding--
	return token_str - input_str

scan_stmt = ->
	scan_relation()

	assignmentIsOfQuotedType = false

	if token == T_QUOTASSIGN
		assignmentIsOfQuotedType = true

	if (token == T_QUOTASSIGN or token == '=')
		symbolLeftOfAssignment = lastFoundSymbol
		if DEBUG then console.log("assignment!")
		assignmentFound = true
		isSymbolLeftOfAssignment = false

		get_next_token()
		push_symbol(SETQ)
		swap()

		# if it's a := then add a quote
		if (assignmentIsOfQuotedType)
			push_symbol(QUOTE)

		scan_relation()

		# if it's a := then you have to list
		# together the quote and its argument
		if assignmentIsOfQuotedType
			list(2)

		list(3)

		isSymbolLeftOfAssignment = true

		if codeGen

			# in case of re-assignment, the symbol on the
			# left will also be in the set of the symbols
			# on the right. In that case just remove it from
			# the symbols on the right.
			indexOfSymbolLeftOfAssignment = symbolsRightOfAssignment.indexOf(symbolLeftOfAssignment)
			if indexOfSymbolLeftOfAssignment != -1
				symbolsRightOfAssignment.splice(indexOfSymbolLeftOfAssignment, 1)
				symbolsHavingReassignments.push symbolLeftOfAssignment
			
			# print out the immediate dependencies
			if DEBUG
				console.log "locally, " + symbolLeftOfAssignment + " depends on: "
				for i in symbolsRightOfAssignment
					console.log "	" + i

			# ok add the local dependencies to the existing
			# dependencies of this left-value symbol
			
			# create the exiting dependencies list if it doesn't exist
			symbolsDependencies[symbolLeftOfAssignment] ?= []
			existingDependencies = symbolsDependencies[symbolLeftOfAssignment]

			# copy over the new dependencies to the existing
			# dependencies avoiding repetitions
			for i in symbolsRightOfAssignment
				if existingDependencies.indexOf(i) == -1
					existingDependencies.push i

			symbolsRightOfAssignment = []

scan_relation = ->
	scan_expression()
	switch (token)
		when T_EQ
			push_symbol(TESTEQ)
			swap()
			get_next_token()
			scan_expression()
			list(3)
		when T_NEQ
			push_symbol(NOT)
			swap()
			push_symbol(TESTEQ)
			swap()
			get_next_token()
			scan_expression()
			list(3)
			list(2)
		when T_LTEQ
			push_symbol(TESTLE)
			swap()
			get_next_token()
			scan_expression()
			list(3)
		when T_GTEQ
			push_symbol(TESTGE)
			swap()
			get_next_token()
			scan_expression()
			list(3)
		when '<'
			push_symbol(TESTLT)
			swap()
			get_next_token()
			scan_expression()
			list(3)
		when '>'
			push_symbol(TESTGT)
			swap()
			get_next_token()
			scan_expression()
			list(3)

scan_expression = ->
	h = tos
	switch token
		when '+'
			get_next_token()
			scan_term()
		when '-'
			get_next_token()
			scan_term()
			negate()
		else
			scan_term()

	while (newline_flag == 0 && (token == '+' || token == '-'))
		if (token == '+')
			get_next_token()
			scan_term()
		else
			get_next_token()
			scan_term()
			negate()

	if (tos - h > 1)
		list(tos - h)
		push_symbol(ADD)
		swap()
		cons()

is_factor = ->

	if token.charCodeAt?(0) == dotprod_unicode
		return 1

	switch (token)
		when '*', '/'
			return 1
		when '(', T_SYMBOL, T_FUNCTION, T_INTEGER, T_DOUBLE, T_STRING
			if (newline_flag) # implicit mul can't cross line
				scan_str = token_str	# better error display
				return 0
			else
				return 1
	return 0


simplify_1_in_products = (tos,h) ->
	if (tos > h && isrational(stack[tos - 1]) && equaln(stack[tos - 1], 1))
		pop()

# calculate away consecutive constants
multiply_consecutive_constants = (tos,h)->
	if (tos > h + 1 && isnum(stack[tos - 2]) && isnum(stack[tos - 1]))
		multiply()


scan_term = ->
	h = tos

	scan_factor()

	if parse_time_simplifications
		simplify_1_in_products(tos,h)

	while (is_factor())
		if (token == '*')
			get_next_token()
			scan_factor()
		else if (token == '/')
			# in case of 1/... then
			# we scanned the 1, we get rid
			# of it because otherwise it becomes
			# an extra factor that wasn't there and
			# things like
			# 1/(2*a) become 1*(1/(2*a))
			simplify_1_in_products(tos,h)
			get_next_token()
			scan_factor()
			inverse()
		else if (token.charCodeAt?(0) == dotprod_unicode)
			get_next_token()
			push_symbol(INNER)
			swap()
			scan_factor()
			list(3)

		else
			scan_factor()

		if parse_time_simplifications
			multiply_consecutive_constants(tos,h)
			simplify_1_in_products(tos,h)

	if (h == tos)
		push_integer(1)
	else if (tos - h > 1)
		list(tos - h)
		push_symbol(MULTIPLY)
		swap()
		cons()

scan_power = ->
	if (token == '^')
		get_next_token()
		push_symbol(POWER)
		swap()
		scan_factor()
		list(3)

scan_index = (h) ->
	#console.log "[ as index"
	get_next_token()
	push_symbol(INDEX)
	swap()
	scan_expression()
	while (token == ',')
		get_next_token()
		scan_expression()
	if (token != ']')
		scan_error("] expected")
	get_next_token()
	list(tos - h)


scan_factor = ->

	h = tos

	#console.log "scan_factor token: " + token

	firstFactorIsNumber = false

	if (token == '(')
		scan_subexpr()
	else if (token == T_SYMBOL)
		scan_symbol()
	else if (token == T_FUNCTION)
		scan_function_call_with_function_name()
	else if token == '['
		#console.log "[ as tensor"
		#debugger
		scan_tensor()
	else if (token == T_INTEGER)
		firstFactorIsNumber = true
		bignum_scan_integer(token_buf)
		get_next_token()
	else if (token == T_DOUBLE)
		firstFactorIsNumber = true
		bignum_scan_float(token_buf)
		get_next_token()
	else if (token == T_STRING)
		scan_string()
	else
		scan_error("syntax error")


	# after the main initial part of the factor that
	# we just scanned above,
	# we can get an arbitrary about of appendages
	# of the form ...[...](...)...
	# If the main part is not a number, then these are all, respectively,
	#  - index references (as opposed to tensor definition) and
	#  - function calls without an explicit function name
	#    (instead of subexpressions or parameters of function
	#    definitions or function calls with an explicit function
	#    name), respectively
	while token == '[' or token == '(' and newline_flag == 0 and !firstFactorIsNumber
		if token == '['
			scan_index(h)
		else if token == '('
			#console.log "( as function call without function name "
			scan_function_call_without_function_name()



	while (token == '!')
		get_next_token()
		push_symbol(FACTORIAL)
		swap()
		list(2)

	# in theory we could already count the
	# number of transposes and simplify them
	# away, but it's not that clean to have
	# multiple places where that happens, and
	# the parser is not the place.
	while (token.charCodeAt?(0) == transpose_unicode)
		get_next_token()
		push_symbol(TRANSPOSE)
		swap()
		list(2)

	scan_power()


addSymbolRightOfAssignment = (theSymbol) ->
	if predefinedSymbolsInGlobalScope_doNotTrackInDependencies.indexOf(theSymbol) == -1 and
		symbolsRightOfAssignment.indexOf(theSymbol) == -1 and
		symbolsRightOfAssignment.indexOf("'"+theSymbol) == -1 and
		!skipRootVariableToBeSolved
			if DEBUG then console.log("... adding symbol: " + theSymbol + " to the set of the symbols right of assignment")
			prefixVar = ""
			for i in [1...functionInvokationsScanningStack.length]
				if functionInvokationsScanningStack[i] != ""
					prefixVar += functionInvokationsScanningStack[i] + "_" + i + "_"

			theSymbol = prefixVar + theSymbol
			symbolsRightOfAssignment.push theSymbol

addSymbolLeftOfAssignment = (theSymbol) ->
	if predefinedSymbolsInGlobalScope_doNotTrackInDependencies.indexOf(theSymbol) == -1 and
		symbolsLeftOfAssignment.indexOf(theSymbol) == -1 and
		symbolsLeftOfAssignment.indexOf("'"+theSymbol) == -1 and
		!skipRootVariableToBeSolved
			if DEBUG then console.log("... adding symbol: " + theSymbol + " to the set of the symbols left of assignment")
			prefixVar = ""
			for i in [1...functionInvokationsScanningStack.length]
				if functionInvokationsScanningStack[i] != ""
					prefixVar += functionInvokationsScanningStack[i] + "_" + i + "_"

			theSymbol = prefixVar + theSymbol
			symbolsLeftOfAssignment.push theSymbol

scan_symbol = ->
	if (token != T_SYMBOL)
		scan_error("symbol expected")
	if (meta_mode && token_buf.length == 1)
		switch (token_buf[0])
			when 'a'
				push(symbol(METAA))
			when 'b'
				push(symbol(METAB))
			when 'x'
				push(symbol(METAX))
			else
				push(usr_symbol(token_buf))
	else
		push(usr_symbol(token_buf))
	#console.log "found symbol: " + token_buf

	if scanningParameters.length == 0
		if DEBUG then console.log "out of scanning parameters, processing " + token_buf
		lastFoundSymbol = token_buf
		if isSymbolLeftOfAssignment
			addSymbolLeftOfAssignment token_buf
	else
		if DEBUG then console.log "still scanning parameters, skipping " + token_buf
		if isSymbolLeftOfAssignment
			addSymbolRightOfAssignment "'" + token_buf

	if DEBUG then console.log("found symbol: " + token_buf + " left of assignment: " + isSymbolLeftOfAssignment)
	
	# if we were looking at the right part of an assignment while we
	# found the symbol, then add it to the "symbolsRightOfAssignment"
	# set (we check for duplications)
	if !isSymbolLeftOfAssignment
		addSymbolRightOfAssignment token_buf
	get_next_token()

scan_string = ->
	new_string(token_buf)
	get_next_token()

scan_function_call_with_function_name = ->
	if DEBUG then console.log "-- scan_function_call_with_function_name start"
	n = 1 # the parameter number as we scan parameters
	p = new U()
	p = usr_symbol(token_buf)

	push(p)
	get_next_token()	# function name
	functionName = token_buf
	if functionName == "roots" or functionName == "defint" or functionName == "sum" or functionName == "product" or functionName == "for"
		functionInvokationsScanningStack.push token_buf
	lastFoundSymbol = token_buf
	if !isSymbolLeftOfAssignment
		addSymbolRightOfAssignment token_buf

	get_next_token()	# 1st parameter
	scanningParameters.push true
	if (token != ')')
		scan_stmt()
		n++
		while (token == ',')
			get_next_token()
			# roots' disappearing variable, if there, is the second one
			if n == 2 and functionInvokationsScanningStack[functionInvokationsScanningStack.length - 1].indexOf("roots") != -1
				symbolsRightOfAssignment = symbolsRightOfAssignment.filter (x) -> !(new RegExp("roots_" + (functionInvokationsScanningStack.length - 1) + "_" + token_buf)).test(x)
				skipRootVariableToBeSolved = true
			# sums' disappearing variable, is alsways the second one
			if n == 2 and functionInvokationsScanningStack[functionInvokationsScanningStack.length - 1].indexOf("sum") != -1
				symbolsRightOfAssignment = symbolsRightOfAssignment.filter (x) -> !(new RegExp("sum_" + (functionInvokationsScanningStack.length - 1) + "_" + token_buf)).test(x)
				skipRootVariableToBeSolved = true
			# product's disappearing variable, is alsways the second one
			if n == 2 and functionInvokationsScanningStack[functionInvokationsScanningStack.length - 1].indexOf("product") != -1
				symbolsRightOfAssignment = symbolsRightOfAssignment.filter (x) -> !(new RegExp("product_" + (functionInvokationsScanningStack.length - 1) + "_" + token_buf)).test(x)
				skipRootVariableToBeSolved = true
			# for's disappearing variable, is alsways the second one
			if n == 2 and functionInvokationsScanningStack[functionInvokationsScanningStack.length - 1].indexOf("for") != -1
				symbolsRightOfAssignment = symbolsRightOfAssignment.filter (x) -> !(new RegExp("for_" + (functionInvokationsScanningStack.length - 1) + "_" + token_buf)).test(x)
				skipRootVariableToBeSolved = true
			# defint's disappearing variables can be in positions 2,5,8...
			if functionInvokationsScanningStack[functionInvokationsScanningStack.length - 1].indexOf("defint") != -1 and
				(n == 2 or (n>2 and ((n-2) % 3 == 0))) 
					symbolsRightOfAssignment = symbolsRightOfAssignment.filter (x) -> !(new RegExp("defint_" + (functionInvokationsScanningStack.length - 1) + "_" + token_buf)).test(x)
					skipRootVariableToBeSolved = true

			scan_stmt()
			skipRootVariableToBeSolved = false
			n++

		# todo refactor this, there are two copies
		# this catches the case where the "roots" variable is not specified
		if n == 2 and functionInvokationsScanningStack[functionInvokationsScanningStack.length - 1].indexOf("roots") != -1
			symbolsRightOfAssignment = symbolsRightOfAssignment.filter (x) -> !(new RegExp("roots_" + (functionInvokationsScanningStack.length - 1) + "_" + "x")).test(x)

	scanningParameters.pop()

	for i in [0..symbolsRightOfAssignment.length]
		if symbolsRightOfAssignment[i]?
			if functionName == "roots"
				symbolsRightOfAssignment[i] = symbolsRightOfAssignment[i].replace(new RegExp("roots_" + (functionInvokationsScanningStack.length - 1) + "_"),"")
			if functionName == "defint"
				symbolsRightOfAssignment[i] = symbolsRightOfAssignment[i].replace(new RegExp("defint_" + (functionInvokationsScanningStack.length - 1) + "_"),"")
			if functionName == "sum"
				symbolsRightOfAssignment[i] = symbolsRightOfAssignment[i].replace(new RegExp("sum_" + (functionInvokationsScanningStack.length - 1) + "_"),"")
			if functionName == "product"
				symbolsRightOfAssignment[i] = symbolsRightOfAssignment[i].replace(new RegExp("product_" + (functionInvokationsScanningStack.length - 1) + "_"),"")
			if functionName == "for"
				symbolsRightOfAssignment[i] = symbolsRightOfAssignment[i].replace(new RegExp("for_" + (functionInvokationsScanningStack.length - 1) + "_"),"")

	if (token != ')')
		scan_error(") expected")

	get_next_token()
	list(n)
	if functionName == "roots" or functionName == "defint" or functionName == "sum" or functionName == "product" or functionName == "for"
		functionInvokationsScanningStack.pop()
	if functionName == symbol(PATTERN).printname
		patternHasBeenFound = true

	if DEBUG then console.log "-- scan_function_call_with_function_name end"

scan_function_call_without_function_name = ->
	if DEBUG then console.log "-- scan_function_call_without_function_name start"

	# the function will have to be looked up
	# at runtime
	push_symbol(EVAL)
	swap()
	list(2)

	n = 1 # the parameter number as we scan parameters
	get_next_token()	# left paren
	scanningParameters.push true
	if (token != ')')
		scan_stmt()
		n++
		while (token == ',')
			get_next_token()
			scan_stmt()
			n++

	scanningParameters.pop()


	if (token != ')')
		scan_error(") expected")

	get_next_token()
	list(n)

	if DEBUG then console.log "-- scan_function_call_without_function_name end: " + stack[tos-1]

# scan subexpression

scan_subexpr = ->
	n = 0
	if (token != '(')
		scan_error("( expected")
	get_next_token()
	scan_stmt()
	if (token != ')')
		scan_error(") expected")
	get_next_token()

scan_tensor = ->
	n = 0
	if (token != '[')
		scan_error("[ expected")

	get_next_token()

	#console.log "scanning the next statement"
	scan_stmt()

	n = 1
	while (token == ',')
		get_next_token()
		scan_stmt()
		n++

	#console.log "building tensor with elements number: " + n
	build_tensor(n)

	if (token != ']')
		scan_error("] expected")
	get_next_token()

scan_error = (errmsg) ->
	errorMessage = ""

	# try not to put question mark on orphan line

	while (input_str != scan_str)
		if ((scanned[input_str] == '\n' || scanned[input_str] == '\r') && input_str + 1 == scan_str)
			break
		errorMessage += scanned[input_str++]

	errorMessage += " ? "

	while (scanned[input_str] && (scanned[input_str] != '\n' && scanned[input_str] != '\r'))
		errorMessage +=  scanned[input_str++]

	errorMessage +=  '\n'

	stop(errmsg)

# There are n expressions on the stack, possibly tensors.
#
# This function assembles the stack expressions into a single tensor.
#
# For example, at the top level of the expression ((a,b),(c,d)), the vectors
# (a,b) and (c,d) would be on the stack.

# takes an integer
build_tensor = (n) ->
	# int i, j, k, ndim, nelem

	i = 0

	save()

	p2 = alloc_tensor(n)
	p2.tensor.ndim = 1
	p2.tensor.dim[0] = n
	for i in [0...n]
		p2.tensor.elem[i] = stack[tos-n+i]

	check_tensor_dimensions p2

	moveTos tos - n

	push(p2)

	restore()

get_next_token = ->
	newline_flag = 0
	while (1)
		get_token()
		if (token != T_NEWLINE)
			break
		newline_flag = 1
	if DEBUG then console.log "get_next_token token: " + token
	#if token == ')'
	#	debugger

get_token = ->
	# skip spaces
	while (isspace(scanned[scan_str]))
		if (scanned[scan_str] == '\n' || scanned[scan_str] == '\r')
			token = T_NEWLINE
			scan_str++
			return
		scan_str++

	token_str = scan_str

	# end of string?

	if (scan_str == scanned.length)
		token = ""
		return

	# number?

	if (isdigit(scanned[scan_str]) || scanned[scan_str] == '.')
		while (isdigit(scanned[scan_str]))
			scan_str++
		if (scanned[scan_str] == '.')
			scan_str++
			while (isdigit(scanned[scan_str]))
				scan_str++
			if (scanned[scan_str] == 'e' && (scanned[scan_str+1] == '+' || scanned[scan_str+1] == '-' || isdigit(scanned[scan_str+1])))
				scan_str += 2
				while (isdigit(scanned[scan_str]))
					scan_str++
			token = T_DOUBLE
		else
			token = T_INTEGER
		update_token_buf(token_str, scan_str)
		return

	# symbol?

	if (isalpha(scanned[scan_str]))
		while (isalnumorunderscore(scanned[scan_str]))
			scan_str++
		if (scanned[scan_str] == '(')
			token = T_FUNCTION
		else
			token = T_SYMBOL
		update_token_buf(token_str, scan_str)
		return

	# string ?

	if (scanned[scan_str] == '"')
		scan_str++
		while (scanned[scan_str] != '"')
			#if (scan_str == scanned.length || scanned[scan_str] == '\n' || scanned[scan_str] == '\r')
			if (scan_str == scanned.length - 1)
				scan_str++
				scan_error("runaway string")
				scan_str--
			scan_str++
		scan_str++
		token = T_STRING
		update_token_buf(token_str + 1, scan_str - 1)
		return

	# comment?

	if (scanned[scan_str] == '#' || scanned[scan_str] == '-' && scanned[scan_str+1] == '-')
		while (scanned[scan_str] && scanned[scan_str] != '\n' && scanned[scan_str] != '\r')
			scan_str++
		if (scanned[scan_str])
			scan_str++
		token = T_NEWLINE
		return

	# quote-assignment
	if (scanned[scan_str] == ':' && scanned[scan_str+1] == '=')
		scan_str += 2
		token = T_QUOTASSIGN
		return

	# relational operator?
	if (scanned[scan_str] == '=' && scanned[scan_str+1] == '=')
		scan_str += 2
		token = T_EQ
		return

	# != operator. It's a little odd because
	# "!" is not a "not", which would make things consistent.
	# (it's used for factorial).
	# An alternative would be to use "<>" but it's not used
	# a lot in other languages...
	if (scanned[scan_str] == '!' && scanned[scan_str+1] == '=')
		scan_str += 2
		token = T_NEQ
		return

	if (scanned[scan_str] == '<' && scanned[scan_str+1] == '=')
		scan_str += 2
		token = T_LTEQ
		return

	if (scanned[scan_str] == '>' && scanned[scan_str+1] == '=')
		scan_str += 2
		token = T_GTEQ
		return

	# single char token

	token = scanned[scan_str++]

# both strings
update_token_buf = (a,b) ->

	token_buf = scanned.substring(a,b)


$.scan = scan
