test_clearall = ->
	run_test [

		"a = 1",
		"",
			
		"a",
		"1",
			
		"clearall",
		"",
			
		"a",
		"a",
	]
