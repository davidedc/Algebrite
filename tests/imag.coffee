test_imag = ->
	run_test [

		"imag(a+i*b)",
		"b",

		"imag(1+exp(i*pi/3))",
		"1/2*3^(1/2)",

		"imag(i)",
		"1",

		"imag((-1)^(1/3))",
		"1/2*3^(1/2)",

		"imag(-i)",
		"-1",
	]
