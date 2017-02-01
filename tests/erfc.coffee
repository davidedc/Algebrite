test_erfc = ->
	run_test [

		"erfc(a)",
		"erfc(a)",

		"erfc(0.0)",
		"1.0",

		"float(erfc(0))",
		"1.0",
		
	]
