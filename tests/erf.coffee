test_erf = ->
	run_test [

		"erf(a)",
		"erf(a)",

		"erf(0.0) + 1",		# add 1 to round off
		"1.0",

		"float(erf(0)) + 1",	# add 1 to round off
		"1.0",
	]

###

#two potential more tests that were
# commented-out

#if 0
"float(erf(1))",
"0.842701",
#endif
###

