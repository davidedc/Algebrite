test_for = ->
	run_test [

		"x=0\ny=2\nfor(do(x=sqrt(2+x),y=2*y/x), k,1,9)\nfloat(y)",
		"3.14159",

		"for(do(x=sqrt(2+x),y=2*y/x),k,1,iterations)",
		"for(do(x=sqrt(2+x),y=2*y/x),k,1,iterations)",

	]
