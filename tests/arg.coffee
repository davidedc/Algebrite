test_arg = ->
	run_test [

		# wrong
		#"arg(-1)",
		#"-pi",

		"arg(pi)",
		"0",

		"arg(1+i)",
		"1/4*pi",

		"arg(1-i)",
		"-1/4*pi",

		"arg(-1+i)",
		"3/4*pi",

		"arg(-1-i)",
		"-3/4*pi",

		"arg((-1)^(1/3))",
		"1/3*pi",

		"arg(1+exp(i*pi/3))",
		"1/6*pi",

		"arg((-1)^(1/6)*exp(i*pi/6))",
		"1/3*pi",

		# check when not assuming real variables ----------
		"assumeRealVariables = 0",
		"",

		"arg(a)",
		"arg(a)",

		# TODO this is wrong
		#"arg(a*exp(b+i*pi/5))",
		#"1/5*pi",

		# this is wrong
		#"arg(-1)",
		#"-pi",

		# this is also highly debatable
		# take the example
		# a = -1-i
		# then arg(a) - arg(-a) should give pi
		# but arg(1+i) - arg(-1-i) gives -pi instead
		# "arg(-a)",
		# "-pi+arg(a)",

		"assumeRealVariables = 1",
		"",
		# --------------------------------------------------

		# TODO this is wrong.
		#"arg(a*exp(b+i*pi/5))",
		#"1/5*pi",

		# referencing the test above, if
		# a is positive:
		"arg(abs(a)*exp(b+i*pi/5))",
		"1/5*pi",

		# otherwise, if negative, we get:
		"arg((-8)*exp(b+i*pi/5))",
		"-4/5*pi",

		# if a is positive, zero
		# if a is negative, -pi, so
		# we can't say much
		"arg(a)",
		"arg(a)",

		# this is also wrong, this should
		# be either zero or pi
		#"arg(-a)",
		#"-pi+arg(a)",

		"arg(-(-1)^(1/3))",
		"-2/3*pi",

		"arg(-exp(i*pi/3))",
		"-2/3*pi",

		"arg(-i)",
		"-1/2*pi",

		"arg((a+b*i)/(c+d*i))",
		"arctan(b/a)-arctan(d/c)",

		"arg(((-1)^(1/2) / (3^(1/2)))^(1/2))",
		"1/4*pi",

		"arg((-1)^(1/6))",
		"1/6*pi",


	]
