test_abs = ->
	run_test [

		"abs(a+i*b)",
		"(a^2+b^2)^(1/2)",

		"abs(a+b+i*c)",
		"(2*a*b+a^2+b^2+c^2)^(1/2)",

		"abs(exp(a+i*b))",
		"exp(a)",

		"abs(((-1)^(1/3)+1)^(1/2))",
		"3^(1/4)",

		"abs((-2*(-1)^(1/6)/(3^(1/2)))^(1/4))",
		"(2/(3^(1/2)))^(1/4)",

		"abs((-2*(-1)^(1/6)/(3^(1/2))+1)^(1/4))",
		"1/3^(1/8)",

		"abs((2*(-1)^(5/6)/(3^(1/2)))^(1/4))",
		"(2/(3^(1/2)))^(1/4)",

		"abs(1)",
		"1",

		"abs(x)",
		"abs(x)",

		# true only if x is real,
		# counterexample: i, which makes 1 and -1
		"abs(x)^2",
		"x^2",

		"abs(-x)",
		"abs(x)",

		"abs(abs(-x))",
		"abs(x)",

		"abs(abs(abs(-x)))",
		"abs(x)",

		"abs(a+b)",
		"abs(a+b)",

		"abs(a*b)",
		"abs(a)*abs(b)",

		"abs(-1)",
		"1",

		"abs(1+exp(i*pi/3))",
		"3^(1/2)",

		"abs((a+i*b)/(c+i*d))",
		"(a^2+b^2)^(1/2)/((c^2+d^2)^(1/2))",

		"abs(((-1)^(1/2) / (3^(1/2)))^(1/2))",
		"1/3^(1/4)",

		"abs(exp(i theta))",
		"1",

		"abs(exp(-i theta))",
		"1",

		"abs((-1)^theta)",
		"1",

		"abs((-1)^(-theta))",
		"1",

		"abs(3*(-1)^theta)",
		"3",

		"abs(3*(-1)^(-theta))",
		"3",

		"abs(-3*(-1)^theta)",
		"3",

		"abs(-3*(-1)^(-theta))",
		"3",

		"abs(-5 i pi / a)",
		"5*pi/abs(a)",

		"abs(1 / a)",
		"1/(abs(a))",

		# ---------- old abs tests

		"abs(2)",
		"2",

		"abs(2.0)",
		"2.0",

		"abs(-2)",
		"2",

		"abs(-2.0)",
		"2.0",

		"abs(a)",
		"abs(a)",

		"abs(-a)",
		"abs(a)",

		"abs(2*a)",
		"2*abs(a)",

		"abs(-2*a)",
		"2*abs(a)",

		"abs(2.0*a)",
		"2.0*abs(a)",

		"abs(-2.0*a)",
		"2.0*abs(a)",

		"abs(a-b)+abs(b-a)",
		"2*abs(a-b)",

		"abs(3 + 4 i)",
		"5",

		"abs([2,3,4])",
		"29^(1/2)",

		"abs(a*b)",
		"abs(a)*abs(b)",

		"abs(a/b)",
		"abs(a)/abs(b)",

		"abs(1/a^b)",
		"1/(abs(a^b))",

		# Check that vector length is simplified

		"P=[u*cos(v),u*sin(v),v]",
		"",

		"abs(cross(d(P,u),d(P,v)))",
		"(1+u^2)^(1/2)",

		"abs((-1)^(-0.666667+0.0291367/pi))",
		"1.0",

		"abs((-1)^(9/3))",
		"1",

		"abs((1)^(9/3))",
		"1",

		"abs((-1.0)^(9/3))",
		"1.0",

	]
