test_real = ->
	run_test [

		"real(a+i*b)",
		"a",

		"real(1+exp(i*pi/3))",
		"3/2",

		"real(i)",
		"0",

		"real((-1)^(1/3))",
		"1/2",
	]
