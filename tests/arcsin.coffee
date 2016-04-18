test_arcsin = ->
	run_test [
		"arcsin(-1)",
		"-1/2*pi",

		"arcsin(-1/2)",
		"-1/6*pi",

		"arcsin(0)",
		"0",

		"arcsin(1/2)",
		"1/6*pi",

		"arcsin(1)",
		"1/2*pi",

		"arcsin(sin(-1/2*pi))",
		"-1/2*pi",

		"arcsin(sin(-1/6*pi))",
		"-1/6*pi",

		"arcsin(sin(0))",
		"0",

		"arcsin(sin(1/6*pi))",
		"1/6*pi",

		"arcsin(sin(1/2*pi))",
		"1/2*pi",

		"arcsin(sin(x))",
		"x",

		"arcsin(1/sqrt(2))",
		"1/4*pi",

		"arcsin(-1/sqrt(2))",
		"-1/4*pi",

		"arcsin(sin(1/4*pi))",
		"1/4*pi",

		"arcsin(sin(-1/4*pi))",
		"-1/4*pi",
	]

	
