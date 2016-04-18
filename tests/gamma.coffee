test_gamma = ->
	run_test [
		"Gamma(a)",
		"Gamma(a)",

		#	"float(gamma(10))",
		#	"362880",

		"Gamma(x+1)",
		"x*Gamma(x)",
		
		"Gamma(1/2)",
		"pi^(1/2)",
		
		"Gamma(x-1)-Gamma(x)/(-1+x)",
		"0",

		"Gamma(-x)",
		"-pi/(x*Gamma(x)*sin(pi*x))",
		
	]
