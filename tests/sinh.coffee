test_sinh = ->
	run_test [
		"sinh(x)",
		"sinh(x)",

		"sinh(0)",
		"0",

		"sinh(arcsinh(x))",
		"x",
	]
