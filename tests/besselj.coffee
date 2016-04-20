test_besselj = ->
	run_test [

		"besselj(x,n)",
		"besselj(x,n)",

		"besselj(0,0)",
		"1",

		"besselj(0,1)",
		"0",

		"besselj(0,-1)",
		"0",

		"besselj(x,1/2)-sqrt(2/pi/x)*sin(x)",
		"0",

		"besselj(x,-1/2)-sqrt(2/pi/x)*cos(x)",
		"0",

		"besselj(x,3/2)-sqrt(2/pi/x)*(sin(x)/x-cos(x))",
		"0",

		"besselj(x,-3/2)-sqrt(2/pi/x)*(-cos(x)/x-sin(x))",
		"0",

		"besselj(x,5/2)-sqrt(2/pi/x)*((3/x^2-1)*sin(x)-3/x*cos(x))",
		"0",

		"besselj(x,-5/2)-sqrt(2/pi/x)*((3/x^2-1)*cos(x)+3/x*sin(x))",
		"0",

		# From the note above

		"besselj(x,3/2)-(1/x)*besselj(x,1/2)+besselj(x,-1/2)",
		"0",

		"besselj(x,-3/2)+(1/x)*besselj(x,-1/2)+besselj(x,1/2)",
		"0",

		# this should simplify

		"y=besselj(x,5/2)",
		"",

		"x^2*d(y,x,x)+x*d(y,x)+(x^2-(5/2)^2)*y",
		"0",

		"y=quote(y)",
		"",
	]

	
