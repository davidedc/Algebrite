test_printlatex = ->
	run_test [

		"printlatex(pi/2)",
		"\\frac{\\pi}{2}",

		"printlatex(-pi/2)",
		"-\\frac{\\pi}{2}",

		"printlatex(pi/(-2))",
		"-\\frac{\\pi}{2}",

		"printlatex(-pi/(-2))",
		"\\frac{\\pi}{2}",

		"printlatex((1/2)*pi)",
		"\\frac{\\pi}{2}",

		"printlatex((1/(-2))*pi)",
		"-\\frac{\\pi}{2}",

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

		"printlatex([[a]])",
		"\\begin{bmatrix} a \\end{bmatrix}",

		"printlatex([[0],[1]])",
		"\\begin{bmatrix} 0 \\\\ 1 \\end{bmatrix}",

		"printlatex(quote(sum((-1)^k * (1/(2*k + 1)),k,0,100)*4))",
		"\\sum_{k=0}^{100}{\\frac{(-1)^k}{(2k+1)}}4",

		"printlatex(quote(2*product(4*k^2/(4*k^2-1),k,1,100)))",
		"2\\prod_{k=1}^{100}{\\frac{4k^2}{(4k^2-1)}}",

		"printlatex(quote(a==b))",
		"{a} = {b}",

		"printlatex(quote(a<b))",
		"{a} < {b}",

		"printlatex(quote(a<=b))",
		"{a} \\leq {b}",

		"printlatex(quote(a>b))",
		"{a} > {b}",

		"printlatex(quote(a>=b))",
		"{a} \\geq {b}",

		"printlatex(quote(f(x)=test(x<3,-x-4,3<=x,x*x+7,120/x+5)))",
		"f(x)=\\left\\{ \\begin{array}{ll}{-x-4} & if & {x} < {3} \\\\\\\\{xx+7} & if & {3} \\leq {x} \\\\\\\\{\\frac{120}{x}+5} & otherwise  \\end{array} \\right.",

	]
