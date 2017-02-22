test_divisors = ->
	run_test [

		"divisors(12)",
		"[1,2,3,4,6,12]",

		"divisors(-12)",
		"[1,2,3,4,6,12]",

		"divisors(a)",
		"[1,a]",

		"divisors(-a)",
		"[1,a]",

		"divisors(+3*x+3)",
		"[1,3,1+x,3+3*x]",

		"divisors(+3*x-3)",
		"[1,3,-3+3*x,-1+x]",

		"divisors(-3*x+3)",
		"[1,3,1-x,3-3*x]",

		"divisors(-3*x-3)",
		"[1,3,1+x,3+3*x]",
	]
