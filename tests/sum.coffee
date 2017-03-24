test_sum = ->
	run_test [

		# no evaluation in case there are
		# symbolic variables
		"sum(body + k,k,b,c)",
		"sum(body+k,k,b,c)",

		"f=sum(a^k,k,0,9)",
		"",

		"eval(f,a,-1/2)",
		"341/512",

		# Leibniz formula for π as a series
		"sum(float((-1)^k * (1/(2*k + 1))),k,0,100)*4",
		"3.15149",

		"f = quote(f)",
		"",

	]
