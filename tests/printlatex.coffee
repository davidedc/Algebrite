test_printlatex = ->
	run_test [

		"printlatex(1/x+x^3+1+1)",
		"2+\\frac{1}{x}+x^3",

		"lastlatexprint == \"2+\\frac{1}{x}+x^3\"",
		"1",

		"printlatex(quote(1/x+1+1))",
		"\\frac{1}{x}+1+1",

		"printlatex(quote(defint(a,y,-sqrt(1-x^2),sqrt(1-x^2))))",
		"\\int^{\\sqrt{1-x^2} }_{-\\sqrt{1-x^2} } \\! a \\, \\mathrm{d} y",

		"printlatex(1/(x+1))",
		"\\frac{1}{1+x}",

		"printlatex(1/(x+1)^2)",
		"\\frac{1}{(1+x)^2}",

		"printlatex(quote(1/(2*a*(x+1))))",
		"\\frac{1}{2a(x+1)}",

		"printlatex(j^k^l^m)",
		"j^{k^{l^m}}",

		"printlatex(dot(a,b))",
		"a \\cdot b",

		"printlatex(inner(a,b))",
		"a \\cdot b",

		"printlatex(inv(a))",
		"{a}^{-1}",

		"printlatex(inv(a+1))",
		"{(1+a)}^{-1}",

	]
