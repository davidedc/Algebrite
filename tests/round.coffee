test_round = ->
	run_test [
		"round(a)",
		"round(a)",

		"round(a+b)",
		"round(a+b)",

		"round(5/2)",
		"3",

		"round(5/2 - 1/10)",
		"2",

		"round(4/2)",
		"2",

		"round(3/2)",
		"2",

		"round(2/2)",
		"1",

		"round(1/2)",
		"1",

		"round(0/2)",
		"0",

		"round(-1/2)",
		"0",

		"round(-2/2)",
		"-1",

		"round(-3/2)",
		"-1",

		"round(-4/2)",
		"-2",

		"round(-5/2)",
		"-2",

		"round(-5/2 + 1/10)",
		"-2",

		"round(5/2) - round(5/2.0)",
		"0.0",

		"round(4/2) - round(4/2.0)",
		"0.0",

		"round(3/2) - round(3/2.0)",
		"0.0",

		"round(2/2) - round(2/2.0)",
		"0.0",

		"round(1/2) - round(1/2.0)",
		"0.0",

		"round(0.0)",
		"0.0",

		"round(-1/2) - round(-1/2.0)",
		"0.0",

		"round(-2/2) - round(-2/2.0)",
		"0.0",

		"round(-3/2) - round(-3/2.0)",
		"0.0",

		"round(-4/2) - round(-4/2.0)",
		"0.0",

		"round(-5/2) - round(-5/2.0)",
		"0.0",
	]
