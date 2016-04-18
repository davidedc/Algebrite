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
	]
