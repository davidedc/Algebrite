test_bake = ->
	run_test [

		"(x+3)^3",
		"x^3+9*x^2+27*x+27",

		"factor",
		"(x+3)^3",
	]
