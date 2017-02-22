test_factor_number = ->
	run_test [

		"factor(0)",
		"0",

		"factor(1)",
		"1",

		"factor(2)",
		"2",

		"factor(3)",
		"3",

		"factor(4)",
		"2^2",

		"factor(5)",
		"5",

		"factor(6)",
		"2*3",

		"factor(7)",
		"7",

		"factor(8)",
		"2^3",

		"factor(9)",
		"3^2",

		"factor(10)",
		"2*5",

		"factor(100!)",
		"2^97*3^48*5^24*7^16*11^9*13^7*17^5*19^5*23^4*29^3*31^3*37^2*41^2*43^2*47^2*53*59*61*67*71*73*79*83*89*97",

		"factor(2*(2^30-35))",
		"2*1073741789",

		# x is the 10,000th prime

		# Prime factors greater than x^2 are found using the Pollard rho method

		"a=104729",
		"",

		"factor(2*(a^2+6))",
		"2*10968163447",

		"factor((a^2+6)^2)",
		"10968163447*10968163447",	# FIXME should be 10968163447^2

		"factor((a^2+6)*(a^2+60))",
		"10968163501*10968163447",	# FIXME sort order

		"f=(x+1)*(x+2)*(y+3)*(y+4)",
		"",

		"factor(f,x,y)",
		"(x+1)*(x+2)*(y+3)*(y+4)",

		"factor(f,y,x)",
		"(x+1)*(x+2)*(y+3)*(y+4)",

		"f=(x+1)*(x+1)*(y+2)*(y+2)",
		"",

		"factor(f,x,y)",
		"(x+1)^2*(y+2)^2",

		"factor(f,y,x)",
		"(x+1)^2*(y+2)^2",

		"factor((x+1)*(-x^2+x+1),x)",
		"-(x^2-x-1)*(x+1)",
			
		"factor((x+1)*(x^2-x-1),x)",
		"(x^2-x-1)*(x+1)",

		"factor(5*x^3-5)",
		"5*(x-1)*(x^2+x+1)",

		"factor((x+1)*(2x+4))",
		"2*(x+1)*(x+2)",

		"factor(x^8 - 1)",
		"(x-1)*(x+1)*(x^2+1)*(x^4+1)",

		"factor((x-1)*(x+1)*(x^2+1)*(2*x^4+2))",
		"2*(x-1)*(x+1)*(x^2+1)*(x^4+1)",

		"factor((x-1)*(x+1)*(2*x^2+2)*(x^4+1))",
		"2*(x-1)*(x+1)*(x^2+1)*(x^4+1)",

		"factor(x^1 - 1)",
		"x-1",

		"factor(x^2 - 1)",
		"(x-1)*(x+1)",

		"factor(x^3 - 1)",
		"(x-1)*(x^2+x+1)",

		"factor(x^4 - 1)",
		"(x-1)*(x+1)*(x^2+1)",

		"factor(x^5 - 1)",
		"(x-1)*(x^4+x^3+x^2+x+1)",

		"factor(x^6 - 1)",
		"(x-1)*(x+1)*(x^2+x+1)*(x^2+1)",

		"factor(x^7 - 1)",
		"(x-1)*(x^6+x^5+x^4+x^3+x^2+x+1)",

		# irreducible in Z
		"factor(1+x+x^2+x^3+x^4)",
		"x^4+x^3+x^2+x+1",

		"factor(x^4 - 1*x^3 + 4*x^2 + 3*x + 5)",
		"(x^2+x+1)*(x^2-2*x+5)",

		# clean up
		"a = quote(a)",
		"",

		"f = quote(f)",
		"",

	]
