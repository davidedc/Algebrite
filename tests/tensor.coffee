test_tensor = ->
	run_test [

		"a=(1,2,3)",
		"",

		"b=(4,5,6)",
		"",

		"c=(7,8,9)",
		"",

		"rank((a,b,c))",
		"2",

		"(a,b,c)",
		"((1,2,3),(4,5,6),(7,8,9))",

		# check tensor promotion

		"((1,0),(0,0))",
		"((1,0),(0,0))",

		"a=quote(a)",
		"",

		"b=quote(b)",
		"",

		"c=quote(c)",
		"",
	]