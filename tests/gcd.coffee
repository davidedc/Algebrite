test_gcd = ->
	run_test [

		"gcd(30,42)",
		"6",

		"gcd(42,30)",
		"6",

		"gcd(-30,42)",
		"6",

		"gcd(42,-30)",
		"6",

		"gcd(30,-42)",
		"6",

		"gcd(-42,30)",
		"6",

		"gcd(-30,-42)",
		"6",

		"gcd(-42,-30)",
		"6",

		"gcd(x,x)",
		"x",

		"gcd(-x,x)",
		"x",

		"gcd(x,-x)",
		"x",

		"gcd(-x,-x)",
		"-x",

		"gcd(x^2,x^3)",
		"x^2",

		"gcd(x,y)",
		"1",

		"gcd(y,x)",
		"1",

		"gcd(x*y,y)",
		"y",

		"gcd(x*y,y^2)",
		"y",

		"gcd(x^2*y^2,x^3*y^3)",
		"x^2*y^2",

		"gcd(x^2,x^3)",
		"x^2",

		# gcd of expr

		"gcd(x+y,x+z)",
		"1",

		"gcd(x+y,x+y)",
		"x+y",

		"gcd(x+y,2*x+2*y)",
		"x+y",

		"gcd(-x-y,x+y)",
		"x+y",

		"gcd(4*x+4*y,6*x+6*y)",
		"2*x+2*y",

		"gcd(4*x+4*y+4,6*x+6*y+6)",
		"2+2*x+2*y",

		"gcd(4*x+4*y+4,6*x+6*y+12)",
		"1",

		"gcd(27*t^3+y^3+9*t*y^2+27*t^2*y,t+y)",
		"1",

		# gcd expr factor

		"gcd(2*a^2*x^2+a*x+a*b,a)",
		"a",

		"gcd(2*a^2*x^2+a*x+a*b,a^2)",
		"a",

		"gcd(2*a^2*x^2+2*a*x+2*a*b,a)",
		"a",

		# gcd expr term

		"gcd(2*a^2*x^2+2*a*x+2*a*b,2*a)",
		"2*a",

		"gcd(2*a^2*x^2+2*a*x+2*a*b,3*a)",
		"a",

		"gcd(2*a^2*x^2+2*a*x+2*a*b,4*a)",
		"2*a",

		# gcd factor factor

		"gcd(x,x^2)",
		"x",

		"gcd(x,x^a)",
		"1",

		# multiple arguments

		"gcd(12,18,9)",
		"3",
	]
