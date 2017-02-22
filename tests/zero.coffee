test_zero = ->
	run_test [
		"zero(2,2)",
		"[[0,0],[0,0]]",

		"zero(1,1)",
		"[[0]]",

		"zero(1)",
		"[0]",

		"zero(2)",
		"[0,0]",

		"zero(1,2)",
		"[[0,0]]",

		"zero(2,1)",
		"[[0],[0]]",

		"zero(0)",
		"0",

		"zero(0,0)",
		"0",

		# it's relevant to handle the case of tensor
		# being passed because if you type
		#  2
		#  zero
		#  > (0,0)
		#  zero # now the last result is passed to zero
		#  > 0 # (0,0) being passed, but it's handled!
		# before some adjustments this used to crash.
		# And it happened to me, so it can happen.
		"zero([2,3])",
		"0",

	]
