test_tanh = ->
	run_test [
		"tanh(x)",
		"tanh(x)",

		"tanh(0)",
		"0",

		"tanh(arctanh(x))",
		"x",
	]
