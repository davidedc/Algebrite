test_printlatex = ->
	run_test [

		# note that these two are different:
		#    pi^(1/2) != pi^1/2
		"printlatex(pi^(1/2))",
		"\\sqrt{\\pi}",

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

		"printlatex(12x^11)",
		"12x^{11}",

		# tricky when there are two consecutive
		# numbers, can't just leave a space there.
		"printlatex(5^2 * 3^y)",
		"25 \\cdot 3^y",

		"printlatex(5^2 * 3^(1/2))",
		"25\\sqrt{3}",

		"printlatex(5^2 * 3^(2/3))",
		"25\\sqrt[3]{3^2}",

		"printlatex([[0,1],[1,0]])",
		"\\begin{bmatrix} 0 & 1 \\\\ 1 & 0 \\end{bmatrix}",

		"printlatex([0,1])",
		"\\begin{bmatrix} 0 & 1 \\end{bmatrix}",

		"printlatex([[0,1,2],[3,4,5]])",
		"\\begin{bmatrix} 0 & 1 & 2 \\\\ 3 & 4 & 5 \\end{bmatrix}",

		"printlatex([[0],[1]])",
		"\\begin{bmatrix} 0 \\\\ 1 \\end{bmatrix}",

	]
