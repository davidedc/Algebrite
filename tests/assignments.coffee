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

		"f = quote(1+1)",
		"",

		"g = f",
		"",

		"g",
		"2",

		"g = quote(f)",
		"",

		"g",
		"2",

		"lookup(g)",
		"f",

		"g = lookup(f)",
		"",

		"g",
		"2",

		"lookup(g)",
		"1+1",

		# test the abbreviated form :=
		# of assignment with quote
		"f := 1+1",
		"",

		"lookup(f)",
		"1+1",

		# clean up

		"f=quote(f)",
		"",

		"g=quote(g)",
		"",

	]
