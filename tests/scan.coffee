test_scan = ->
	if DEBUG then console.log "test_scan ----------------------------"

	run_test [

		"a^^b",
		"a^^ ? b\nStop: syntax error",

		"(a+b",
		"(a+b ? \nStop: ) expected",

		"quote(1/(x*log(a*x)))",	# test case A
		"1/(x*log(a*x))",

		"\"hello",
		"\"hello ? \nStop: runaway string",

		# make sure question mark can appear after newlines

		"a+\nb+\nc+",
		"a+\nb+\nc+ ? \nStop: syntax error",

		# this bug fixed in version 30 (used to give one result, 14)

		"(1+1)",
		"2",

		"2+2\n(3+3)",
		"4\n6",

		# plus and minus cannot cross newline

		"1\n-1",
		"1\n-1",

		"1\n+1",
		"1\n1",
	]



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
