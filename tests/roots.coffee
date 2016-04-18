test_roots = ->
	run_test [
		"roots(x)",
		"0",

		"roots(x^2)",
		"0",

		"roots(x^3)",
		"0",

		"roots(2 x)",
		"0",

		"roots(2 x^2)",
		"0",

		"roots(2 x^3)",
		"0",

		"roots(6+11*x+6*x^2+x^3)",
		"(-3,-2,-1)",

		"roots(a*x^2+b*x+c)",
		"(-b/(2*a)-(-4*a*c+b^2)^(1/2)/(2*a),-b/(2*a)+(-4*a*c+b^2)^(1/2)/(2*a))",

		"roots(3+7*x+5*x^2+x^3)",
		"(-3,-1)",

		"roots(x^3+x^2+x+1)",
		"(-1,-i,i)",

		"roots(x^4+1)",
		"Stop: roots: the polynomial is not factorable, try nroots",

		"roots(x^2==1)",
		"(-1,1)",

		"roots(3 x + 12 == 24)",
		"4",

		"y=roots(x^2+b*x+c/k)[1]",
		"",

		"y^2+b*y+c/k",
		"0",

		"y=roots(x^2+b*x+c/k)[2]",
		"",

		"y^2+b*y+c/k",
		"0",

		"y=roots(a*x^2+b*x+c/4)[1]",
		"",

		"a*y^2+b*y+c/4",
		"0",

		"y=roots(a*x^2+b*x+c/4)[2]",
		"",

		"a*y^2+b*y+c/4",
		"0",

		"y=quote(y)",
		"",
	]