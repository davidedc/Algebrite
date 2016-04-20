test_hermite = ->
	run_test [
		"hermite(x,n)",
		"hermite(x,n)",

		"hermite(x,0)-1",
		"0",

		"hermite(x,1)-2*x",
		"0",

		"hermite(x,2)-(4*x^2-2)",
		"0",

		"hermite(x,3)-(8*x^3-12*x)",
		"0",

		"hermite(x,4)-(16*x^4-48*x^2+12)",
		"0",

		"hermite(x,5)-(32*x^5-160*x^3+120*x)",
		"0",

		"hermite(x,6)-(64*x^6-480*x^4+720*x^2-120)",
		"0",

		"hermite(x,7)-(128*x^7-1344*x^5+3360*x^3-1680*x)",
		"0",

		"hermite(x,8)-(256*x^8-3584*x^6+13440*x^4-13440*x^2+1680)",
		"0",

		"hermite(x,9)-(512*x^9-9216*x^7+48384*x^5-80640*x^3+30240*x)",
		"0",

		"hermite(x,10)-(1024*x^10-23040*x^8+161280*x^6-403200*x^4+302400*x^2-30240)",
		"0",

		"hermite(a-b,10)-eval(subst(a-b,x,hermite(x,10)))",
		"0",
	]
