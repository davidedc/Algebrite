test_choose = ->
	run_test [
		"choose(52,5)",
		"2598960",

		"choose(n,k)",
		"n!/(k!*(-k+n)!)",

		"choose(0,k)",
		"1/(k!*(-k)!)",

		"choose(n,0)",
		"1",

		"choose(-1,k)",
		"0",

		"choose(n,-1)",
		"0",
	]

