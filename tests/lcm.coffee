test_lcm = ->
	run_test [

		"lcm(4,6)",
		"12",

		"lcm(4*x,6*x*y)",
		"12*x*y",

		# multiple arguments

		"lcm(2,3,4)",
		"12",
	]
