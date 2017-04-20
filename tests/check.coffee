test_check = ->
	if DEBUG then console.log "test_check ----------------------------"

	run_test [

		# note how check can turn an assignment
		# into a test, so in this case a is not
		# assigned anything

		"check(a=b)",
		"testeq(a,b)",

		"a",
		"a",

		"check(a=a)",
		"1",

		"check(a==a)",
		"1",

		"check(a===a)",
		"check(a=== ? a)\nStop: syntax error",

		"check(a+1=a)",
		"0",

		"check(a+1==a)",
		"0",

		"check(a+1===a)",
		"check(a+1=== ? a)\nStop: syntax error",

		"check(1)",
		"1",

		"check(0)",
		"0",

		"check(and(1,0))",
		"0",

		"check(and(1,1))",
		"1",

		# if not a predicate, just return
		# what passed
		"check(pi)",
		"pi",

	]
