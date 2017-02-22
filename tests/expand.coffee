test_expand = ->
	run_test [

		# general cases

		"expand(1/(x+1)/(x+2))",
		"1/(x+1)-1/(x+2)",

		"expand((2x^3-x+2)/(x^2-2x+1))",
		"4+2*x+5/(x-1)+3/(x^2-2*x+1)",

		"expand(1/x^2/(x-1))",
		"-1/(x^2)-1/x+1/(x-1)",

		"p=5s+2",
		"",

		"q=(s+1)*(s+2)^2",
		"",

		"expand(p/q)",
		"-3/(s+1)+3/(s+2)+8/(s^2+4*s+4)",

		# ensure denominators are expanded (result seems preferable that way)

		"q=(x-1)*(x-2)^3",
		"",

		"expand(1/q)",
		"1/(x^3-6*x^2+12*x-8)+1/(x-2)-1/(x-1)-1/(x^2-4*x+4)",

		# fractional poles

		"expand(1/(x+1/2)/(x+1/3))",
		"-12/(2*x+1)+18/(3*x+1)",

		# expand tensor

		"f=1/(x+1)/(x+2)",
		"",

		"g=1/(x+1)-1/(x+2)",
		"",

		"expand([[f,f],[f,f]])-[[g,g],[g,g]]",
		"[[0,0],[0,0]]",

		# denominator normalized?

		"expand(1/(1+1/x))",
		"1-1/(x+1)",

		# poles at zero

		"expand(1/x/(x+1))",
		"1/x-1/(x+1)",

		"expand(1/x^2/(x+1))",
		#"x^(-2)-1/x+1/(x+1)",
		"1/x^2-1/x+1/(x+1)",

		# other corner cases

		"expand(1/x)",
		"1/x",

		"expand(1/x^2)",
		#"x^(-2)",
		"1/x^2",

		"expand(1/(x^2-4x+4))",
		"1/(x^2-4*x+4)",

		# cases where nothing can be done

		"expand(sin(x))",
		"sin(x)",

		"expand(x)",
		"x",

		"expand(1/sin(x))",
		# unclear why the extra parens are added but no biggie
		"1/(sin(x))",

		# note that expand isn't needed to execute the
		# multiplications, expand does something
		# different.
		"expand(expand((sin(x)+1)^2))",
		"1+sin(x)^2+2*sin(x)",

	]
