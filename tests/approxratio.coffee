test_approxratio = ->
	run_test [
		"approxratio(0.9054054)",
		"67/74",

		"approxratio(0.518518)",
		"14/27",

		"approxratio(0.3333)",
		"1/3",

		"approxratio(0.5)",
		"1/2",

		"approxratio(3.14159)",
		"355/113",

		"approxratio(a*3.14)",
		"approxratio(a*3.14)",

		"approxratio(3.14)",
		"22/7",

		# see http://davidbau.com/archives/2010/03/14/the_mystery_of_355113.html
		"approxratio(3.14159)",
		"355/113",

		"approxratio(-3.14159)",
		"-355/113",

		"approxratio(0)",
		"0",

		"approxratio(0.0)",
		"0",

		"approxratio(2)",
		"2",

		"approxratio(2.0)",
		"2",

	]

