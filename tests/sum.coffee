test_sum = ->
	run_test [
		"f=sum(k,0,9,a^k)",
		"",

		"eval(f,a,-1/2)",
		"341/512",


		"f = quote(f)",
		"",

	]
