test_transpose = ->
	run_test [
		"transpose(0)",
		"0",

		"transpose(0.0)",
		"0",

		"transpose(((a,b),(c,d)))",
		"((a,c),(b,d))",

		"transpose(((a,b),(c,d)),1,2)",
		"((a,c),(b,d))",

		"transpose(((a,b,c),(d,e,f)),1,2)",
		"((a,d),(b,e),(c,f))",

		"transpose(((a,d),(b,e),(c,f)),1,2)",
		"((a,b,c),(d,e,f))",

		"transpose((a,b,c))",
		"(a,b,c)",
	]