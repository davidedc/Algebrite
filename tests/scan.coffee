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

