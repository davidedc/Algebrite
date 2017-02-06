test_rect = ->
	run_test [

		# check when not assuming real variables ----------
		"assumeRealVariables = 0",
		"",

		"rect(a)",
		"rect(a)",

		# same as rect(a) + i*rect(b)
		# where rect(b) is abs(b)*(cos(arg(b)) + i*sin(arg(b)))
		"rect(a+i*b)",
		"rect(a)-abs(b)*sin(arg(b))+i*abs(b)*cos(arg(b))",

		"assumeRealVariables = 1",
		"",
		# --------------------------------------------------

		"rect(a)",
		"a",

		"rect(a+i*b)",
		"a+i*b",

		"rect(exp(a+i*b))",
		"i*exp(a)*sin(b)+exp(a)*cos(b)",

		"rect(1+exp(i*pi/3))",
		"3/2+1/2*i*3^(1/2)",

		"z=(a+b*i)/(c+d*i)",
		"",

		"rect(z)-real(z)-i*imag(z)",
		"0",

		"z=quote(z)",
		"",

		"rect((-1)^(2/3))",
		"-1/2+1/2*i*3^(1/2)",

		"rect(exp(-3/4*i*pi))",
		"-1/2*2^(1/2)-1/2*i*2^(1/2)",

		"rect(exp(-1/4*i*pi))",
		"1/2*2^(1/2)-1/2*i*2^(1/2)",

		"rect(exp(-2/4*i*pi))",
		"-i",

		"rect(exp(-3/4*i*pi))",
		"-1/2*2^(1/2)-1/2*i*2^(1/2)",

		"rect(exp(-4/4*i*pi))",
		"-1",

		"rect(((-1)^(1/2)/(3^(1/2)))^(1/2))",
		"i*2^(1/2)/(2*3^(1/4))+2^(1/2)/(2*3^(1/4))",

		"rect((-1)^(1/6) - (-1)^(5/6))",
		"3^(1/2)",

	]
