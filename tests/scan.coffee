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

		# implicit multiplication is parsed fine in
		# in the obvious cases where the first factor
		# is a "naked" number. Note that
		# (2)(a) doesn't work (yet) instead.
		# In many other cases such as a(b) it's in
		# principle impossible at parse time to turn that
		# into a multiplication because the first factor
		# could be a function, so that'd be a function
		# call.

		"2(a) * 2a",
		"4*a^2",

		"2a3b",
		"2*a3b",

		"2a 3b",
		"6*a*b",

		"2 a 3b",
		"6*a*b",

		"2 a 3 b",
		"6*a*b",

		"2(a)3(b)",
		"6*a*b",

		"2(a)b*3",
		"6*a*b",

		"(a)2 * 2a",
		"4*a^2",

		"3 (2 x^3 + x^2 - 23 x + 20)",
		"6*x^3+3*x^2-69*x+60",

	]

