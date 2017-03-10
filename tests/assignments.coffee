test_assignments = ->
	run_test [

		# it used to return exp(1)
		"e",
		"e",

		# degenerate assignments give an error ----

		"0=0",
		"Stop: symbol assignment: error in symbol",

		"1=2",
		"Stop: symbol assignment: error in symbol",

		"3=a",
		"Stop: symbol assignment: error in symbol",

		# ------------------------------------------

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

		# a function returning a function

		"f(x) = x + 1",
		"",

		"g(x) = f",
		"",

		"g()(2)",
		"3",

		# passing functions as parameters

		"f(x) = x + 1",
		"",

		"g(x) = x * x",
		"",

		"h(l, x) = l(x)",
		"",

		"h(f, 2)",
		"3",

		"h(g, 3)",
		"9",


		# passing function as parameter
		# but doing nothing with it because
		# the function in the body is already
		# defined

		"f(x) = x + 1",
		"",

		"g(x) = x * x",
		"",

		"h(l, x) = f(x)",
		"",

		"h(f, 2)",
		"3",

		"h(g, 3)",
		"4",


		# clean up -----------------

		"f=quote(f)",
		"",

		"g=quote(g)",
		"",

		"h=quote(h)",
		"",

		# ----------------------
		"a = a+1",
		"",

		"a",
		"Stop: recursive evaluation of symbols: a -> a",

		# ----------------------
		"a := b",
		"",

		"b := c",
		"",

		"c := a",
		"",

		"b",
		"Stop: recursive evaluation of symbols: b -> c -> a -> b",

		# ----------------------
		# note how this case actually doesn't generate a recursion
		# as in Algebrite it's not a problem when a variable
		# just contain itself, actually that's the default of
		# unassigned variables.

		"a = b",
		"",

		"b = a",
		"",

		"a",
		"b",

		"b",
		"b",

		# ----------------------
		# note how these assignments actually don't generate
		# a recursion as in Algebrite it's not a problem when
		# a variable just contain itself, actually that's the
		# default for unassigned variables.

		"a=a",
		"",

		"a := a",
		"",

		"a",
		"a",

		# clean up -----------------

		"clearall",
		"",


	]
