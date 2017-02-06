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

		"rect(polar((-1)^(1/2)))",
		"i",

		"rect(polar((-1)^(-5/6)))",
		"-1/2*i-1/2*3^(1/2)",

		"rect(polar((-1)^(-5/a)))",
		"cos(5*pi/a)-i*sin(5*pi/a)",

		"rect(polar((-1)^(a)))",
		"cos(a*pi)+i*sin(a*pi)",

		"-i*(-2*rect(polar((-1)^(1/6)))/rect(polar((3^(1/2))))+2*rect(polar((-1)^(5/6)))/rect(polar((3^(1/2)))))^(1/4)*(2*rect(polar((-1)^(1/6)))/rect(polar((3^(1/2))))-2*rect(polar((-1)^(5/6)))/rect(polar((3^(1/2)))))^(1/4)/(2^(1/2))",
		#"-(-1)^(3/4)",
		"1/2^(1/2)-i/(2^(1/2))",

		# this is also "-(-1)^(3/4)" but we get to that after the simplification after
		# this test
		"-i*(-2*polar((-1)^(1/6))/polar((3^(1/2)))+2*polar((-1)^(5/6))/polar((3^(1/2))))^(1/4)*(2*polar((-1)^(1/6))/polar((3^(1/2)))-2*polar((-1)^(5/6))/polar((3^(1/2))))^(1/4)/(2^(1/2))",
		"-i*(-2*exp(1/6*i*pi)/(3^(1/2))+2*exp(5/6*i*pi)/(3^(1/2)))^(1/4)*(2*exp(1/6*i*pi)/(3^(1/2))-2*exp(5/6*i*pi)/(3^(1/2)))^(1/4)/(2^(1/2))",

		"simplify",
		"(1-i)/(2^(1/2))",

		"-i*(-2*rect(exp(1/6*i*pi))/(3^(1/2))+2*rect(exp(5/6*i*pi))/(3^(1/2)))^(1/4)*(2*rect(exp(1/6*i*pi))/(3^(1/2))-2*rect(exp(5/6*i*pi))/(3^(1/2)))^(1/4)/(2^(1/2))",
		#"-(-1)^(3/4)",
		"1/2^(1/2)-i/(2^(1/2))",

		"polar(-(-1)^(3/4))",
		"exp(-1/4*i*pi)",

		"polar(-i*(-2*(-1)^(1/6)/(3^(1/2))+2*(-1)^(5/6)/(3^(1/2)))^(1/4)*(2*(-1)^(1/6)/(3^(1/2))-2*(-1)^(5/6)/(3^(1/2)))^(1/4)/(2^(1/2)))",
		"exp(-1/4*i*pi)",

		# nothing to do for polar since we end
		# up with a real
		"polar((-1)^(1/6) - (-1)^(5/6))",
		"3^(1/2)",

	]
