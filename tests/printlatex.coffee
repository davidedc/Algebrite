test_printlatex = ->
	run_test [

		"printlatex(1/x+x^3+1+1)\nlastlatexprint == \"2+\\frac{1}{x}+x^3\"",
		"1",

	]
