test_arctanh = ->
	run_test [
		"arctanh(0.0)",
		"0.0",

		"arctanh(0)",
		"0",

		"arctanh(tanh(x))",
		"x",
	]
