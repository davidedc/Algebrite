test_product = ->
	run_test [
		
		# compute pi using Viete's formula ------------

		# note that this is not an array, this
		# defines a recursive function
		"a(n)=test(n=0,0,sqrt(2+a(n-1)))",
		"",

		# not very efficient because evaluation of
		# a(n) is not memoized, so there
		# is quadratic cost as n increases.
		"float(2*product(k,1,9,2/a(k)))",
		"3.14159",


		"a = quote(a)",
		"",

	]
