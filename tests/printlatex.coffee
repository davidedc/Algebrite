test_printlatex = ->
	run_test [

		"printlatex(1/x+x^3+1+1)\nlastlatexprint == \"2+\\frac{1}{x}+x^3\"",
		"1",

		"printlatex(quote(1/x+1+1))\nlastlatexprint == \"\\frac{1}{x}+1+1\"",
		"1",

		"printlatex(quote(defint(a,y,-sqrt(1-x^2),sqrt(1-x^2))))\nlastlatexprint == \"\\int^{\\sqrt{1-x^2}}_{-\\sqrt{1-x^2}}\\!a\\,\\mathrm{d}y\"",
		"1",

		"printlatex(1/(x+1))\nlastlatexprint == \"\\frac{1}{1+x}\"",
		"1",

		"printlatex(1/(x+1)^2)\nlastlatexprint == \"\\frac{1}{(1+x)^2}\"",
		"1",

		"printlatex(quote(1/(2*a*(x+1))))\nlastlatexprint == \"\\frac{1}{2a(x+1)}\"",
		"1",

		"printlatex(j^k^l^m)\nlastlatexprint == \"j^{k^{l^m}}\"",
		"1",

		"printlatex(quote(transpose(transpose(A))))\nlastlatexprint == \"{{A}^T}^T\"",
		"1",


	]
