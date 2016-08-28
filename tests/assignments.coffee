test_assignments = ->
	run_test [

		"f(x) = x + 1",
		"",

		"g = f",
		"",

		"lookup(f)",
		"function (x) -> x+1",

		"lookup(g)",
		"function (x) -> x+1",

		"f(x,y) = x + 2",
		"",

		"lookup(f)",
		"function (x y) -> x+2",

		"g(3)",
		"4",

		"f(3,0)",
		"5",

		# clean up

		"f=quote(f)",
		"",

		"g=quote(g)",
		"",

	]
