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

		"inner(a,[b1,b2])",
		"inner(a,[b1,b2])",

		"inner([a1,a2],b)",
		"inner([a1,a2],b)",

		"inner(2,[b1,b2])",
		"[2*b1,2*b2]",

		"inner([b1,b2],2)",
		"[2*b1,2*b2]",

		"inner([[a11,a12],[a21,a22]],[x1,x2])",
		"[a11*x1+a12*x2,a21*x1+a22*x2]",

		"inner([1,2],[3,4])",
		"11",

		# non-invertible matrix
		"inner([[2,2],[2,2]],[[0],[1]])",
		"[[2],[2]]",

		"inner(inner([1,2],[[3,4],[5,6]]),[7,8])",
		"219",

		"inner([1,2],inner([[3,4],[5,6]],[7,8]))",
		"219",

		"inner([1,2],[[3,4],[5,6]],[7,8])",
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
		"inner([a, b, c], [x, y, z])",
		"a*x+b*y+c*z",

		# products of matrices and vectors:
		"inner([[a, b], [c,d]], [x, y])",
		"[a*x+b*y,c*x+d*y]",

		"inner([x, y], [[a, b], [c,d]])",
		"[a*x+c*y,b*x+d*y]",

		"inner([x, y], [[a, b], [c,d]], [r, s])",
		"a*r*x+b*s*x+c*r*y+d*s*y",

		# matrix product:

		"inner([[a,b],[c,d]],[[r,s],[t,u]])",
		"[[a*r+b*t,a*s+b*u],[c*r+d*t,c*s+d*u]]",

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

		"inv(a)·a",
		"I",

		"a·inv(a)",
		"I",

		"b·a·inv(a)·c",
		"inner(b,c)",

		"b·aᵀ·inv(aᵀ)·c",
		"inner(b,c)",

		"b·inv(aᵀ)·aᵀ·c",
		"inner(b,c)",

		"b·inv((a+b)ᵀ)·(b+a)ᵀ·c",
		"inner(b,c)",

		"(-a)·(-b)",
		"inner(a,b)",

		"I·I",
		"I",

		"I·Iᵀ",
		"I",

		"(-I)·(-I)",
		"I",

		"(-Iᵀ)·(-I)",
		"I",

		"c·(b+a)ᵀ·inv((a+b)ᵀ)·d",
		"inner(c,d)",
			
		"c·inv((b+a)ᵀ)·(a+b)ᵀ·d",
		"inner(c,d)",
			
		"c·(b+a)ᵀ·inv((a+b)ᵀ)·inv(c)",
		"I",

		"c·inv((b+a)ᵀ)·(a+b)ᵀ·inv(c)",
		"I",
			
		"inv(c)·(b+a)ᵀ·inv((a+b)ᵀ)·c",
		"I",

		"inv(c)·inv((b+a)ᵀ)·(a+b)ᵀ·c",
		"I",
			
			
		"c·d·(b+a)ᵀ·inv((a+b)ᵀ)",
		"inner(c,d)",

		"d·(b+a)ᵀ·inv((a+b)ᵀ)",
		"d",
			
		"(b+a)ᵀ·inv((a+b)ᵀ)",
		"I",
			
		"c·d·(b+a)ᵀ·inv((a+b)ᵀ)·inv(d)",
		"c",
					
		"c·d·(b+a)ᵀ·inv((a+b)ᵀ)·inv(d)·inv(c)",
		"I",
			
		"c·d·(b+a)ᵀ·inv((a+b)ᵀ)·inv(c·d)",
		"I",
			
		"c·d·(a+b)ᵀ·inv(c·d·(b+a)ᵀ)",
		"I",
			
		"inv(c)·c",
		"I",
			
		"inv(c·a)·c·a",
		"I",
			
		"inv(c·b·a)·c·b·a",
		"I",
			
		"inv(c)·d·(a+b)ᵀ·inv(inv(c)·d·(b+a)ᵀ)",
		"I",
			
		"inv(c+f)·d·(a+b)ᵀ·inv(inv(f+c)·d·(b+a)ᵀ)",
		"I",
			
		"c·d·inv(a)·inv(c·d·inv(a))",
		"I",

	]
