test_abs = ->
	run_test [

		"abs(2)",
		"2",

		"abs(2.0)",
		"2",

		"abs(-2)",
		"2",

		"abs(-2.0)",
		"2",

		"abs(a)",
		"abs(a)",

		"abs(-a)",
		"abs(a)",

		"abs(2*a)",
		"2*abs(a)",

		"abs(-2*a)",
		"2*abs(a)",

		"abs(2.0*a)",
		"2*abs(a)",

		"abs(-2.0*a)",
		"2*abs(a)",

		"abs(a-b)+abs(b-a)",
		"2*abs(a-b)",

		"abs(3 + 4 i)",
		"5",

		"abs((2,3,4))",
		"29^(1/2)",

		"abs(a*b)",
		"abs(a)*abs(b)",

		"abs(a/b)",
		"abs(a)/abs(b)",

		"abs(1/a^b)",
		"1/(abs(a^b))",

		# Check that vector length is simplified

		"P=(u*cos(v),u*sin(v),v)",
		"",

		"abs(cross(d(P,u),d(P,v)))",
		"(1+u^2)^(1/2)",
	]
