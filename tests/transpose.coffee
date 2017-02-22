test_transpose = ->
	run_test [

		"transpose(0)",
		"0",

		"transpose([[1,2,3,4]])",
		"[[1],[2],[3],[4]]",

		"transpose([[1],[2],[3],[4]])",
		"[[1,2,3,4]]",

		"transpose(0.0)",
		"0.0",

		"transpose([[a,b],[c,d]])",
		"[[a,c],[b,d]]",

		"transpose([[a,b],[c,d]],1,2)",
		"[[a,c],[b,d]]",

		"transpose([[a,b,c],[d,e,f]],1,2)",
		"[[a,d],[b,e],[c,f]]",

		"transpose([[a,d],[b,e],[c,f]],1,2)",
		"[[a,b,c],[d,e,f]]",

		# not how one-dimensional vectors
		# don't have a transposition.
		"transpose([a,b,c])",
		"[a,b,c]",


		"transpose(a)",
		"transpose(a)",

		"transpose(a,1,2)",
		"transpose(a)",

		"transpose(a,2,1)",
		"transpose(a)",

		"transpose(1+10)",
		"11",

		"transpose(1+10,2,3)",
		"11",

		"transpose(a*b)",
		"transpose(a)*transpose(b)",
			
		"transpose(a*b,3,4)",
		"transpose(a,3,4)*transpose(b,3,4)",
			
		"transpose(b*2*a)",
		"2*transpose(a)*transpose(b)",

		"transpose(b*2*a,3,4)",
		"2*transpose(a,3,4)*transpose(b,3,4)",
			
		"transpose(b+a)",
		"transpose(a)+transpose(b)",
			
		"transpose(b+a,3,4)",
		"transpose(a,3,4)+transpose(b,3,4)",
			
		"transpose(inner(a,b))",
		"inner(transpose(b),transpose(a))",
			
		"transpose(inner(a,b),3,4)",
		"inner(transpose(b,3,4),transpose(a,3,4))",

		"transpose(transpose(a))",
		"a",
					
		"transpose(transpose(transpose(a)))",
		"transpose(a)",

		"transpose(transpose(transpose(transpose(a))))",
		"a",

		"transpose(transpose(a),3,4)",
		"transpose(transpose(a),3,4)",

		"transpose(transpose(transpose(a),3,4))",
		"transpose(transpose(transpose(a),3,4))",
			
		"transpose(transpose(transpose(a),3,4))",
		"transpose(transpose(transpose(a),3,4))",

		"transpose(transpose(transpose(a),1,2))",
		"transpose(a)",

		"transpose(transpose(transpose(a),2,1))",
		"transpose(a)",
			
		"transpose(transpose(a,3,4),4,3)",
		"a",
			
		"transpose(transpose(a,3,4),5,6)",
		"transpose(transpose(a,3,4),5,6)",
			
		"transpose(a) - transpose(a)",
		"0",
			
		"transpose(a,1,2) - transpose(a,1,2)",
		"0",
			
		"transpose(a,3,4) - transpose(a,3,4)",
		"0",

		"aᵀ^b",
		"transpose(a)^b",

		"a^ᵀb",
		"a^ᵀ ? b\nStop: syntax error",

		"aᵀ^2^3",
		"transpose(a)^8",

		"aᵀ",
		"transpose(a)",

		"aᵀᵀ",
		"a",

		"aᵀᵀᵀ",
		"transpose(a)",

		"aᵀᵀᵀᵀ",
		"a",

		"aᵀ+b",
		"b+transpose(a)",

		"aᵀ*b",
		"b*transpose(a)",

		# this output could be written out more
		# cleanly without extra parens
		"aᵀ^bᵀ",
		"transpose(a)^(transpose(b))",

		"aᵀ*bᵀ",
		"transpose(a)*transpose(b)",

		"a^bᵀ",
		"a^(transpose(b))",

		"(a^b)ᵀ",
		"transpose(a^b)",

		"(a*b)ᵀ",
		"transpose(a)*transpose(b)",

		"inner(a,b)ᵀ",
		"inner(transpose(b),transpose(a))",

		"dot(a,b)ᵀ",
		"inner(transpose(b),transpose(a))",

		"(a·b·c)ᵀ",
		"inner(transpose(c),inner(transpose(b),transpose(a)))",

		"Iᵀᵀᵀ",
		"I",

		# Note that we are using the
		# standard commutative multiplication here,
		# not the dot product.
		# So, one of the two arguments should
		# be a scalar, but we don't know
		# which one, so we have to transpose
		# both. Note that we
		# don't invert the order because
		# we know it's a normal
		# multiplication.
		"transpose(A)*transpose(x)",
		"transpose(A)*transpose(x)",

	]
