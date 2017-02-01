test_multiply = ->
	if DEBUG then console.log "test_multiply ----------------------------"
	run_test [

			"0*a",
			"0",

			"a*0",
			"0",

			"1*a",
			"a",

			"a*1",
			"a",

			"0.0*a",
			"0.0",

			"a*0.0",
			"0.0",

			"1.0*a",
			"1.0*a",

			"a*1.0",
			"1.0*a",

			"a*a",
			"a^2",

			"a^2*a",
			"a^3",

			"a*a^2",
			"a^3",

			"a^2*a^2",
			"a^4",

			"2^a*2^(3-a)",		# symbolic exponents cancel
			"8",

			"sqrt(2)/2",
			# leave the roots nice and
			# clean in numerator, avoid these
			# forms
			#"2^(-1/2)",
			"1/2*2^(1/2)",

			"2/sqrt(2)",
			"2^(1/2)",

			"-sqrt(2)/2",
			# avoid having roots in denominator
			#"-1/(2^(1/2))",
			"-1/2*2^(1/2)",

			"2^(1/2-a)*2^a/10",
			# avoid roots in denominator
			#"1/(5*2^(1/2))",
			"1/10*2^(1/2)",

			"i/4",
			"1/4*i",

			"1/(4 i)",
			"-1/4*i",

			# ensure 1.0 is not discarded

			"1.0 pi 1/2",
			"1.5708",

			"1.0 1/2 pi",
			"1.5708",
		]
