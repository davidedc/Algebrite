test_float = ->
	run_test [
		"float(x)",
		"x",

		"float(1/2)",
		"0.5",

		"float(pi)",
		"3.14159",

		"float(exp(1))",
		"2.71828",

		"x=(1/2,1/4)",
		"",

		"float(x)",
		"(0.5,0.25)",

		"x",
		"(1/2,1/4)",

		"x=quote(x)",
		"",
	]

