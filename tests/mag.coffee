test_mag = ->
	run_test [

		"mag(a+i*b)",
		"(a^2+b^2)^(1/2)",

		"mag(a+b+i*c)",
		"(2*a*b+a^2+b^2+c^2)^(1/2)",

		"mag(exp(a+i*b))",
		"exp(a)",

		"mag(((-1)^(1/3)+1)^(1/2))",
		"3^(1/4)",

		"mag((-2*(-1)^(1/6)/(3^(1/2)))^(1/4))",
		"(2/(3^(1/2)))^(1/4)",

		"mag((-2*(-1)^(1/6)/(3^(1/2))+1)^(1/4))",
		"1/3^(1/8)",

		"mag((2*(-1)^(5/6)/(3^(1/2)))^(1/4))",
		"(2/(3^(1/2)))^(1/4)",

		"mag(1)",
		"1",

		"mag(x)",
		"mag(x)",

		"mag(-x)",
		"mag(x)",

		"mag(mag(-x))",
		"mag(x)",

		"mag(mag(mag(-x)))",
		"mag(x)",

		"mag(a+b)",
		"mag(a+b)",

		"mag(a*b)",
		"mag(a)*mag(b)",

		"mag(-1)",
		"1",

		"mag(1+exp(i*pi/3))",
		"3^(1/2)",

		"mag((a+i*b)/(c+i*d))",
		"(a^2+b^2)^(1/2)/((c^2+d^2)^(1/2))",

		"mag(((-1)^(1/2) / (3^(1/2)))^(1/2))",
		"1/3^(1/4)",

		"mag(exp(i theta))",
		"1",

		"mag(exp(-i theta))",
		"1",

		"mag((-1)^theta)",
		"1",

		"mag((-1)^(-theta))",
		"1",

		"mag(3*(-1)^theta)",
		"3",

		"mag(3*(-1)^(-theta))",
		"3",

		"mag(-3*(-1)^theta)",
		"3",

		"mag(-3*(-1)^(-theta))",
		"3",

		"mag(-5 i pi / a)",
		"5*pi/mag(a)",

		"mag(1 / a)",
		"1/(mag(a))",

		# ---------- old abs tests

		"mag(2)",
		"2",

		"mag(2.0)",
		"2.0",

		"mag(-2)",
		"2",

		"mag(-2.0)",
		"2.0",

		"mag(a)",
		"mag(a)",

		"mag(-a)",
		"mag(a)",

		"mag(2*a)",
		"2*mag(a)",

		"mag(-2*a)",
		"2*mag(a)",

		"mag(2.0*a)",
		"2.0*mag(a)",

		"mag(-2.0*a)",
		"2.0*mag(a)",

		"mag(a-b)+mag(b-a)",
		"2*mag(a-b)",

		"mag(3 + 4 i)",
		"5",

		"mag((2,3,4))",
		"29^(1/2)",

		"mag(a*b)",
		"mag(a)*mag(b)",

		"mag(a/b)",
		"mag(a)/mag(b)",

		"mag(1/a^b)",
		"1/(mag(a^b))",

		# Check that vector length is simplified

		"P=(u*cos(v),u*sin(v),v)",
		"",

		"mag(cross(d(P,u),d(P,v)))",
		"(1+u^2)^(1/2)",

		"mag((-1)^(-0.666667+0.0291367/pi))",
		"1.0",

		"mag((-1)^(9/3))",
		"1",

		"mag((1)^(9/3))",
		"1",

		"mag((-1.0)^(9/3))",
		"1.0",

	]
