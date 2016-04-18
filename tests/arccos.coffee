test_arccos = ->
	run_test [

		"arccos(1)",
		"0",

		"arccos(1/2)",
		"1/3*pi",

		"arccos(0)",
		"1/2*pi",

		"arccos(-1/2)",
		"2/3*pi",

		"arccos(-1)",
		"pi",

		"arccos(cos(0))",
		"0",

		"arccos(cos(1/3*pi))",
		"1/3*pi",

		"arccos(cos(1/2*pi))",
		"1/2*pi",

		"arccos(cos(2/3*pi))",
		"2/3*pi",

		"arccos(cos(pi))",
		"pi",

		"arccos(cos(x))",
		"x",

		"arccos(1/sqrt(2))",
		"1/4*pi",

		"arccos(-1/sqrt(2))",
		"3/4*pi",

		"arccos(cos(1/4*pi))",
		"1/4*pi",

		"arccos(cos(3/4*pi))",
		"3/4*pi",
	]

	
