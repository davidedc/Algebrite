test_product = ->
	run_test [
		
		# compute pi using Viete's formula

		"a(n)=test(n=0,0,sqrt(2+a(n-1)))",
		"",

		"float(2*product(k,1,9,2/a(k)))",
		"3.14159",


		"a = quote(a)",
		"",

	]
