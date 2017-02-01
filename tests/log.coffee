test_log = ->
	run_test [

		"log(1)",
		"0",

		"log(exp(1))",
		"1",

		"log(exp(x))",
		"x",

		"exp(log(x))",
		"x",

		"log(x^2)",
		"2*log(x)",

		"log(1/x)",
		"-log(x)",

		"log(a^b)",
		"b*log(a)",

		"log(2)",
		"log(2)",

		"log(2.0)",
		"0.693147",

		"float(log(2))",
		"0.693147",

		"log(a*b)",
		"log(a)+log(b)",

		"log(1/3)+log(3)",
		"0",

		"log(-1)",
		"i*pi",

		"log(-1.0)",
		"3.14159*i",
	]
