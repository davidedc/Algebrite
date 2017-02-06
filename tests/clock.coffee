test_clock = ->
	run_test [

		"clock(exp(i pi/3))",
		"(-1)^(1/3)",

		"clock(exp(-i pi/3))",
		#"-(-1)^(2/3)",
		"1/(-1)^(1/3)",

		"rect(clock(3+4*i))",	# needs sin(arctan(x)) and cos(arctan(x))
		"3+4*i",

		"clock((-108+108*(-1)^(1/2)*3^(1/2))^(1/3))",
		"6*(-1)^(2/9)",

		# TODO
		# the changes to abs/mag of Jan 2017
		# make it so a ends up as absolute value
		#     (-1)^(1/5)*abs(a)
		# Rather, clock should somehow recognize
		# that this is already very close to clock
		# form and just replace the exponential with
		# the power of -1
		# Note that this was working before the Jan 2017
		# changes because abs/mag were blissfully
		# transforming abs(any_variable) -> any_variable
		#"clock(exp(1/5*i*pi)*a)",
		#"(-1)^(1/5)*a",

	]
