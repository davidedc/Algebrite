test_arg = ->
	run_test [

		"arg(1+i)",
		"1/4*pi",

		"arg(1-i)",
		"-1/4*pi",

		"arg(-1+i)",
		"3/4*pi",

		"arg(-1-i)",
		"-3/4*pi",

		"arg((-1)^(1/3))",
		"1/3*pi",

		"arg(1+exp(i*pi/3))",
		"1/6*pi",

		"arg((-1)^(1/6)*exp(i*pi/6))",
		"1/3*pi",

		"arg(a)",
		"0",

		"arg(a*exp(b+i*pi/5))",
		"1/5*pi",

		"arg(-1)",
		"-pi",

		"arg(a)",
		"0",

		"arg(-a)",
		"-pi",

		"arg(-(-1)^(1/3))",
		"-2/3*pi",

		"arg(-exp(i*pi/3))",
		"-2/3*pi",

		"arg(-i)",
		"-1/2*pi",

		"arg((a+b*i)/(c+d*i))",
		"arctan(b/a)-arctan(d/c)",
	]