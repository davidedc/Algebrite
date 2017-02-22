test_derivative = ->
	run_test [

		"x=quote(x)",
		"",

		"f=quote(f)",
		"",

		"g=quote(g)",
		"",

		"d(a,x)",
		"0",

		"d(x,x)",
		"1",

		"d(x^2,x)",
		"2*x",

		"d(log(x),x)",
		"1/x",

		"d(exp(x),x)",
		"exp(x)",

		"d(a^x,x)",
		"a^x*log(a)",

		"d(x^x,x)-(x^x+x^x*log(x))",
		"0",

		"d(log(x^2+5),x)-(2*x/(5+x^2))",
		"0",

		"d(d(f(x),x),y)",
		"0",

		"d(d(f(x),y),x)",
		"0",

		"d(d(f(y),x),y)",
		"0",

		"d(d(f(y),y),x)",
		"0",

		"d([x*y*z,y,x+z],[x,y,z])",
		"[[y*z,x*z,x*y],[0,1,0],[1,0,1]]",

		"d(x+z,[x,y,z])",
		"[1,0,1]",

		"d(cos(theta)^2,cos(theta))",
		"2*cos(theta)",

		"d(f())",
		"d(f(),x)",

		"d(x^2)",
		"2*x",

		"d(t^2)",
		"2*t",

		"d(t^2 x^2)",
		"2*t^2*x",

		# trig functions

		"d(sin(x),x)-cos(x)",
		"0",

		"d(cos(x),x)+sin(x)",
		"0",

		"d(tan(x),x)-cos(x)^(-2)",
		"0",

		"d(arcsin(x),x)-1/sqrt(1-x^2)",
		"0",

		"d(arccos(x),x)+1/sqrt(1-x^2)",
		"0",

		"d(arctan(x),x)-1/(1+x^2)",
		"0",

		"d(arctan(y/x),x)",
		"-y/(x^2+y^2)",

		"d(arctan(y/x),y)",
		"x/(x^2+y^2)",

		# hyp functions

		"d(sinh(x),x)-cosh(x)",
		"0",

		"d(cosh(x),x)-sinh(x)",
		"0",

		"d(tanh(x),x)-cosh(x)^(-2)",
		"0",

		"d(arcsinh(x),x)-1/sqrt(x^2+1)",
		"0",

		"d(arccosh(x),x)-1/sqrt(x^2-1)",
		"0",

		"d(arctanh(x),x)-1/(1-x^2)",
		"0",

		"d(sin(cos(x)),x)+cos(cos(x))*sin(x)",
		"0",

		"d(sin(x)^2,x)-2*sin(x)*cos(x)",
		"0",

		"d(sin(cos(x)),cos(x))-cos(cos(x))",
		"0",

		"d(abs(x),x)",
		"sgn(x)",
		
		"d(sgn(x),x)",
		"2*dirac(x)",

		# generic functions

		"d(f(),x)",
		"d(f(),x)",

		"d(f(x),x)",
		"d(f(x),x)",

		"d(f(y),x)",
		"0",

		"d(g(f(x)),f(x))",
		"d(g(f(x)),f(x))",

		"d(g(f(x)),x)",
		"d(g(f(x)),x)",

		# other functions

		"d(erf(x))-2*exp(-x^2)/sqrt(pi)",
		"0",

		# arg lists

		"f=x^5*y^7",
		"",

		"d(f)",
		"5*x^4*y^7",

		"d(f,x)",
		"5*x^4*y^7",

		"d(f,x,0)",
		"x^5*y^7",

		"d(f,x,1)",
		"5*x^4*y^7",

		"d(f,x,2)",
		"20*x^3*y^7",

		"d(f,2)",
		"20*x^3*y^7",

		"d(f,2,y)",
		"140*x^3*y^6",

		"d(f,x,x,y,y)",
		"840*x^3*y^5",

		"f=quote(f)",
		"",
	]
