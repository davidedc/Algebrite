test_cosh = ->
	run_test [
		"cosh(x)",
		"cosh(x)",

		"cosh(0)",
		"1",

		"cosh(arccosh(x))",
		"x",
	]
