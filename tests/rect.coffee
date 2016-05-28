test_rect = ->
	run_test [

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

		"rect(exp(-1/4*i*pi))"
		"1/2*2^(1/2)-1/2*i*2^(1/2)",

		"rect(exp(-2/4*i*pi))"
		"-i",

		"rect(exp(-3/4*i*pi))"
		"-1/2*2^(1/2)-1/2*i*2^(1/2)",

		"rect(exp(-4/4*i*pi))"
		"-1",

	]
