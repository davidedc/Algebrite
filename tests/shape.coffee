test_shape = ->
	run_test [

		# see transpose function source to see why
		# transposition has no effect on vectors.

		"shape((A,B,C))",
		"(3)",

		"shape(transpose((A,B,C)))",
		"(3)",

		"shape(((A),(B),(C)))",
		"(3)",

		"shape(transpose(((A),(B),(C))))",
		"(3)",

		"shape(((A,B),(C,D),(E,F)))",
		"(3,2)",

		"shape(transpose(((A,B),(C,D),(E,F))))",
		"(2,3)",

	]

