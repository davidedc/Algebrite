test_mod = ->
	run_test [
		"mod(2.0,3.0)",
		"2",

		"mod(-2.0,3.0)",
		"-2",

		"mod(2.0,-3.0)",
		"2",

		"mod(-2.0,-3.0)",
		"-2",

		"mod(2,3)",
		"2",

		"mod(-2,3)",
		"-2",

		"mod(2,-3)",
		"2",

		"mod(-2,-3)",
		"-2",

		"mod(a,b)",
		"mod(a,b)",

		"mod(2.0,0.0)",
		"Stop: mod function: divide by zero",

		"mod(2,0)",
		"Stop: mod function: divide by zero",

		"mod(1.2,2)",
		"Stop: mod function: cannot convert float value to integer",

		"mod(1/2,3)",
		"Stop: mod function: integer arguments expected",

		"mod(15,8.0)",
		"7",
	]
