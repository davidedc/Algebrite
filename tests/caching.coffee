test_caching = ->
	run_test [

		"2*x",
		"2*x",

		"d(last)",
		"2",

		"3*x",
		"3*x",

		"d(last)",
		"3",

	]
