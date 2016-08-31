test_inner = ->
	run_test [

		# since we don't know anything about
		# a and b, we have to leave this unevaluated
		# turning this into a normal multiplication (which is
		# commutative) would not be OK
		"inner(a,b)",
		"inner(a,b)",

		# this shouldn't ever go wrong
		# but one never knows
		"inner(b,a)",
		"inner(b,a)",

		"inner(2,a)",
		"2*a",

		"inner(a,2)",
		"2*a",

		"inner(a,(b1,b2))",
		"inner(a,(b1,b2))",

		"inner((a1,a2),b)",
		"inner((a1,a2),b)",

		"inner(2,(b1,b2))",
		"(2*b1,2*b2)",

		"inner((b1,b2),2)",
		"(2*b1,2*b2)",

		"inner(((a11,a12),(a21,a22)),(x1,x2))",
		"(a11*x1+a12*x2,a21*x1+a22*x2)",

		"inner((1,2),(3,4))",
		"11",

		"inner(inner((1,2),((3,4),(5,6))),(7,8))",
		"219",

		"inner((1,2),inner(((3,4),(5,6)),(7,8)))",
		"219",

		"inner((1,2),((3,4),(5,6)),(7,8))",
		"219",

		"inner(c,a1+b1)",
		"inner(c,a1)+inner(c,b1)",

		"inner(b1+c1,a)",
		"inner(b1,a)+inner(c1,a)",

		"inner(inner(a,b),c)",
		"inner(a,inner(b,c))",

		"inner(inner(a,b),c) - inner(a,inner(b,c))",
		"0",

		"inner(inner(a,b),c,d) - inner(a,b,inner(c,d))",
		"0",

		# trying some associativity and distributivity together
		"inner(inner(a,b),c,d+f) - ( (inner(a,inner(b,c),d)) + inner(inner(a,b),c,f) )",
		"0",

		# bring it to a canonical form
		# using associativity
		"inner(a,b,c)",
		"inner(a,inner(b,c))",

		"inner(a,b+c,d)",
		"inner(a,inner(b,d))+inner(a,inner(c,d))",

		"inner(inner(a,b),inner(c,d))",
		"inner(a,inner(b,inner(c,d)))",

		# scalar product of vectors:
		"inner((a, b, c), (x, y, z))",
		"a*x+b*y+c*z",

		# products of matrices and vectors:
		"inner(((a, b), (c,d)), (x, y))",
		"(a*x+b*y,c*x+d*y)",

		"inner((x, y), ((a, b), (c,d)))",
		"(a*x+c*y,b*x+d*y)",

		"inner((x, y), ((a, b), (c,d)), (r, s))",
		"a*r*x+b*s*x+c*r*y+d*s*y",

		# matrix product:

		"inner(((a,b),(c,d)),((r,s),(t,u)))",
		"((a*r+b*t,a*s+b*u),(c*r+d*t,c*s+d*u))",

		# ---------------------------------------
		# using the dot
		# ---------------------------------------

		"a·b",
		"inner(a,b)",

		"a·b·c",
		"inner(a,inner(b,c))",

		"a·b*c",
		"c*inner(a,b)",

		# note how we use associativity to bring it all
		# to a canonical form
		"((a·b)·c)·d",
		"inner(a,inner(b,inner(c,d)))",

		"a*b·c",
		"a*inner(b,c)",

		"2*a·b",
		"2*inner(a,b)",

	]
