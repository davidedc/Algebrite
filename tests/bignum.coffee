test_signs_in_rationals = ->
	run_test [

		# I found out about basic mistakes in
		# these very very late, better to
		# have those tests early on.

		"1/1",
		"1",

		"-1/1",
		"-1",

		"1/(-1)",
		"-1",

		"(-1)/(-1)",
		"1",

	]
