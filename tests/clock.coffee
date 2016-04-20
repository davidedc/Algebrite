test_clock = ->
	run_test [

		"clock(exp(i pi/3))",
		"(-1)^(1/3)",

		"clock(exp(-i pi/3))",
		"-(-1)^(2/3)",

		"rect(clock(3+4*i))",	# needs sin(arctan(x)) and cos(arctan(x))
		"3+4*i",
	]
