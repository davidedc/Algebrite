test_contract = ->
	run_test [
		"contract(0)",
		"0",

		"contract(0.0)",
		"0",

		"contract([[a,b],[c,d]])",
		"a+d",

		"contract([[1,2],[3,4]],1,2)",
		"5",

		"A=[[a11,a12],[a21,a22]]",
		"",

		"B=[[b11,b12],[b21,b22]]",
		"",

		"contract(outer(A,B),2,3)",
		"[[a11*b11+a12*b21,a11*b12+a12*b22],[a21*b11+a22*b21,a21*b12+a22*b22]]",

		"A=quote(A)",
		"",

		"B=quote(B)",
		"",
	]
