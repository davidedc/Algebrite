test_laguerre = ->
	run_test [
		"laguerre(x,n)",
		"laguerre(x,n,0)",

		"laguerre(x,n,k)",
		"laguerre(x,n,k)",

		"laguerre(x,0)-1",
		"0",

		"laguerre(x,1)-(-x+1)",
		"0",

		"laguerre(x,2)-1/2*(x^2-4*x+2)",
		"0",

		"laguerre(x,3)-1/6*(-x^3+9*x^2-18*x+6)",
		"0",

		"laguerre(x,0,k)-1",
		"0",

		"laguerre(x,1,k)-(-x+k+1)",
		"0",

		"laguerre(x,2,k)-1/2*(x^2-2*(k+2)*x+(k+1)*(k+2))",
		"0",

		"laguerre(x,3,k)-1/6*(-x^3+3*(k+3)*x^2-3*(k+2)*(k+3)*x+(k+1)*(k+2)*(k+3))",
		"0",

		"laguerre(a-b,10)-eval(subst(a-b,x,laguerre(x,10)))",
		"0",
	]
