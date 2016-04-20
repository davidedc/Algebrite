test_coeff = ->
	run_test [

		"coeff(40*x^3+30*x^2+20*x+10,3)",
		"40",

		"coeff(40*x^3+30*x^2+20*x+10,2)",
		"30",

		"coeff(40*x^3+30*x^2+20*x+10,1)",
		"20",

		"coeff(40*x^3+30*x^2+20*x+10,0)",
		"10",

		"coeff(a*t^3+b*t^2+c*t+d,t,3)",
		"a",

		"coeff(a*t^3+b*t^2+c*t+d,t,2)",
		"b",

		"coeff(a*t^3+b*t^2+c*t+d,t,1)",
		"c",

		"coeff(a*t^3+b*t^2+c*t+d,t,0)",
		"d",
	]
