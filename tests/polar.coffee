test_polar = ->
	run_test [
		"polar(1+i)",
		"2^(1/2)*exp(1/4*i*pi)",

		"polar(-1+i)",
		"2^(1/2)*exp(3/4*i*pi)",

		"polar(-1-i)",
		"2^(1/2)*exp(-3/4*i*pi)",

		"polar(1-i)",
		"2^(1/2)*exp(-1/4*i*pi)",

		"rect(polar(3+4*i))",
		"3+4*i",

		"rect(polar(-3+4*i))",
		"-3+4*i",

		"rect(polar(3-4*i))",
		"3-4*i",

		"rect(polar(-3-4*i))",
		"-3-4*i",
	]
