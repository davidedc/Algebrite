test_mag = ->
	run_test [

		"mag(a+i*b)",
		"(a^2+b^2)^(1/2)",

		"mag(exp(a+i*b))",
		"exp(a)",

		"mag(1)",
		"1",

		"mag(-1)",
		"1",

		"mag(1+exp(i*pi/3))",
		"3^(1/2)",

		"mag((a+i*b)/(c+i*d))",
		"(a^2+b^2)^(1/2)/((c^2+d^2)^(1/2))",

		"mag(exp(i theta))",
		"1",

		"mag(exp(-i theta))",
		"1",

		"mag((-1)^theta)",
		"1",

		"mag((-1)^(-theta))",
		"1",

		"mag(3*(-1)^theta)",
		"3",

		"mag(3*(-1)^(-theta))",
		"3",

		"mag(-3*(-1)^theta)",
		"3",

		"mag(-3*(-1)^(-theta))",
		"3",
	]