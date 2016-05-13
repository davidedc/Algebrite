test_simplify = ->
	run_test [

		"simplify(A)",
		"A",

		"simplify(A+B)",
		"A+B",

		"simplify(A B)",
		"A*B",

		"simplify(A^B)",
		"A^B",

		"simplify(A/(A+B)+B/(A+B))",
		"1",

		"simplify((A-B)/(B-A))",
		"-1",

		"A=((A11,A12),(A21,A22))",
		"",

		"simplify(det(A) inv(A) - adj(A))",
		"0",

		"A=quote(A)",
		"",

		# this shows need for <= in try_factoring

		#	"x*(1+a)",
		#	"x+a*x",

		#	"simplify(last)",
		#	"x*(1+a)",

		"simplify(-3 exp(-1/3 r + i phi) cos(theta) / sin(theta)\
		 + 3 exp(-1/3 r + i phi) cos(theta) sin(theta)\
		 + 3 exp(-1/3 r + i phi) cos(theta)^3 / sin(theta))",
		"0",

		"simplify((A^2 C^2 + A^2 D^2 + B^2 C^2 + B^2 D^2)/(A^2+B^2)/(C^2+D^2))",
		"1",

		"simplify(d(arctan(y/x),y))",
		"x/(x^2+y^2)",

		"simplify(d(arctan(y/x),x))",
		"-y/(x^2+y^2)",

		"simplify(1-sin(x)^2)",
		"cos(x)^2",

		"simplify(1-cos(x)^2)",
		"sin(x)^2",

		"simplify(sin(x)^2-1)",
		"-cos(x)^2",

		"simplify(cos(x)^2-1)",
		"-sin(x)^2",

		#"simfac(n!/n)-(n-1)!",
		#"0",

		#"simfac(n/n!)-1/(n-1)!",
		#"0",

		#"simfac(rationalize((n+k+1)/(n+k+1)!))-1/(n+k)!",
		#"0",

		#"simfac(condense((n+1)*n!))-(n+1)!",
		#"0",

		#"simfac(1/((n+1)*n!))-1/(n+1)!",
		#"0",

		#"simfac((n+1)!/n!)-n-1",
		#"0",

		#"simfac(n!/(n+1)!)-1/(n+1)",
		#"0",

		#"simfac(binomial(n+1,k)/binomial(n,k))",
		#"(1+n)/(1-k+n)",

		#"simfac(binomial(n,k)/binomial(n+1,k))",
		#"(1-k+n)/(1+n)",

		#"F(nn,kk)=kk*binomial(nn,kk)",
		#"",

		#"simplify(simfac((F(n,k)+F(n,k-1))/F(n+1,k))-n/(n+1))",
		#"0",

		#"F=quote(F)",
		#"",

		"simplify(n!/n)-(n-1)!",
		"0",

		"simplify(n/n!)-1/(n-1)!",
		"0",

		"simplify(rationalize((n+k+1)/(n+k+1)!))-1/(n+k)!",
		"0",

		"simplify(condense((n+1)*n!))-(n+1)!",
		"0",

		"simplify(1/((n+1)*n!))-1/(n+1)!",
		"0",

		"simplify((n+1)!/n!)-n-1",
		"0",

		"simplify(n!/(n+1)!)-1/(n+1)",
		"0",

		"simplify(binomial(n+1,k)/binomial(n,k))",
		"(1+n)/(1-k+n)",

		"simplify(binomial(n,k)/binomial(n+1,k))",
		"(1-k+n)/(1+n)",

		"F(nn,kk)=kk*binomial(nn,kk)",
		"",

		"simplify((F(n,k)+F(n,k-1))/F(n+1,k))-n/(n+1)",
		"0",

		"F=quote(F)",
		"",

		"simplify((n+1)/(n+1)!)-1/n!",
		"0",

		"simplify(a*b+a*c)",
		"a*(b+c)",

		# Symbol's binding is evaluated, undoing simplify

		"x=simplify(a*b+a*c)",
		"",

		"x",
		"a*b+a*c",

		"x=quote(x)",
		"",
	]
