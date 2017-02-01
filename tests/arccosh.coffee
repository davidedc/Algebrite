test_arccosh = ->
	run_test [

		"arccosh(1.0)",
		"0.0",

		"arccosh(1)",
		"0",

		"arccosh(cosh(x))",
		"x",
	]


