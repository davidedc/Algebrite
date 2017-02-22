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

		"A=[[A11,A12],[A21,A22]]",
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

		# tries to get rid of sin and cos if there are more
		# compact clockforms or exponential forms
		"simplify(-cos(2/5*pi)*(k/a)^(1/5)-i*(k/a)^(1/5)*sin(2/5*pi))",
		"((k/a)^(2/5))^(1/2)/((-1)^(3/5))",

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

		"simplify((6 - 4*2^(1/2))^(1/2))",
		"2-2^(1/2)",

		"4-4*(-1)^(1/3)+4*(-1)^(2/3)",
		"0",

		"simplify(4-4*(-1)^(1/3)+4*(-1)^(2/3))",
		"0",

		# this requires some simplification to be
		# further done after the de-nesting
		"simplify(14^(1/2) - (16 - 4*7^(1/2))^(1/2))",
		"2^(1/2)",


		"simplify(-(2^(1/2)*(-1+7^(1/2)))+2^(1/2)*7^(1/2))",
		"2^(1/2)",


		"simplify((9 + 6*2^(1/2))^(1/2))",
		"3^(1/2)*(1+2^(1/2))",


		"simplify((7 + 13^(1/2))^(1/2))",
		"(1+13^(1/2))/(2^(1/2))",

		# two nested radicals at the same time
		"simplify((17 + 12*2^(1/2))^(1/2) + (17 - 12*2^(1/2))^(1/2))",
		"6",

		"simplify((2 + 3^(1/2))^(1/2))",
		"(1+3^(1/2))/(2^(1/2))",

		"simplify((1/2 + (39^(1/2)/16))^(1/2))",
		"(3^(1/2)+13^(1/2))/(4*2^(1/2))",

		# there would be a slightly better presentation for this,
		# where 108 is factored and some parts get out of the
		# radical but there is no way to de-nest this.
		"simplify((-108+108*(-1)^(1/2)*3^(1/2))^(1/3))",
		"6*(-1)^(2/9)",
		# also: "(-108+108*i*3^(1/2))^(1/3)" is a possible result

		# you can take that 4 out of the radical
		# but other than that there is no
		# "sum or radicals" form of this
		"simplify((-4+4*(-1)^(1/2)*3^(1/2))^(1/3))",
		"2*(-1)^(2/9)",
		# also: "(-4+4*i*3^(1/2))^(1/3)" is a possible result


		# scrambling the order of things a little
		# and checking whether the nested radical
		# still gets simplified.
		"simplify((((-3)^(1/2) + 1)/2)^(1/2))",
		#"(-1)^(1/6)",
		"1/2*(i+3^(1/2))",

		"simplify((1/2 + (-3)^(1/2)/2)^(1/2))",
		#"(-1)^(1/6)",
		"1/2*(i+3^(1/2))",

		# no possible de-nesting, should
		# leave unchanged.
		"simplify((2 +2^(1/2))^(1/2))",
		"(2+2^(1/2))^(1/2)",

		"simplify((1 +3^(1/2)/2)^(1/2) + (1 -3^(1/2)/2)^(1/2))",
		"3^(1/2)",

		"simplify((1 +3^(1/2)/2)^(1/2))",
		"1/2*(1+3^(1/2))",

		# not quite perfect as there is a radical at the
		# denominator, but the de-nesting happens.
		"simplify(((1 +39^(1/2)/8)/2)^(1/2))",
		"(3^(1/2)+13^(1/2))/(4*2^(1/2))",

		"simplify((5 +24^(1/2))^(1/2))",
		"2^(1/2)+3^(1/2)",

		"simplify((3 +4*i)^(1/2))",
		"2+i",

		"simplify((3 -4*i)^(1/2))",
		"2-i",

		"simplify((-2 +2*3^(1/2)*i)^(1/2))",
		#"2*(-1)^(1/3)",
		"1+i*3^(1/2)",

		"simplify((9 - 4*5^(1/2))^(1/2))",
		"-2+5^(1/2)",

		"simplify((61 - 24*5^(1/2))^(1/2))",
		"-4+3*5^(1/2)",

		"simplify((-352+936*(-1)^(1/2))^(1/3))",
		"2*(4+3*i)",


		"simplify((3 - 2*2^(1/2))^(1/2))",
		"-1+2^(1/2)",

		"simplify((27/2+27/2*(-1)^(1/2)*3^(1/2))^(1/3))",
		"3*(-1)^(1/9)",
		# also good: (27/2+27/2*i*3^(1/2))^(1/3)

		# this nested radical is also equal to
		# (-1)^(1/9)
		# but there is no "sum of radicals" form
		# for this.
		"simplify((1/2+1/2*(-1)^(1/2)*3^(1/2))^(1/3))",
		"(-1)^(1/9)",
		# also good: (1/2+1/2*i*3^(1/2))^(1/3)

		"simplify((2 + 5^(1/2))^(1/3))",
		"1/2*(1+5^(1/2))",

		"simplify((-3 + 10*3^(1/2)*i/9)^(1/3))",
		"1+2/3*i*3^(1/2)",

		"simplify((1-3*x^2+3*x^4-x^6)^(1/2))",
		"(-x^6+3*x^4-3*x^2+1)^(1/2)",

		"simplify(subst((-1)^(1/2),i,(-3 + 10*3^(1/2)*i/9)^(1/3)))",
		"1+2/3*i*3^(1/2)",

		"simplify(rationalize(-3 + 10*3^(1/2)*i/9)^(1/3))",
		"1+2/3*i*3^(1/2)",

		# note that sympy doesn't give a straight symbolic answer to
		# this one, the result to this is numeric instead, and with
		# a near-zero imaginary part.
		# In Sympy one can get to the answer obliquely with minpoly instead,
		# as minpoly((-1)^(1/6) - (-1)^(5/6)) -> x^2−3
		"simplify((-1)^(1/6) - (-1)^(5/6))",
		"3^(1/2)",

		"simplify((7208+2736*5^(1/2))^(1/3))",
		"17+3*5^(1/2)",

		"simplify((901+342*5^(1/2))^(1/3))",
		"1/2*(17+3*5^(1/2))",

		"-i*(-2*(-1)^(1/6)/(3^(1/2))+2*(-1)^(5/6)/(3^(1/2)))^(1/4)*(2*(-1)^(1/6)/(3^(1/2))-2*(-1)^(5/6)/(3^(1/2)))^(1/4)/(2^(1/2))",
		"1/2^(1/2)-i/(2^(1/2))",

		"simplify(-i*(-2*(-1)^(1/6)/(3^(1/2))+2*(-1)^(5/6)/(3^(1/2)))^(1/4)*(2*(-1)^(1/6)/(3^(1/2))-2*(-1)^(5/6)/(3^(1/2)))^(1/4)/(2^(1/2)))",
		# this one simplifies to any of these two, these are all the same:
		"(1-i)/(2^(1/2))",
		#    -(-1)^(3/4)
		#"-(-1)^(3/4)",

		"(-1)^(-5/a)",
		#"(-1)^(-5/a)",
		"1/(-1)^(5/a)",


		# -----------------------
		"simplify((-1)^(-5))",
		"-1",

		"simplify((-1)^(5))",
		"-1",

		"simplify((1)^(-5))",
		"1",

		"simplify((1)^(5))",
		"1",

		# seems here that the simplification
		# has more nodes than the result but
		# it's not the case: the 1/... inversion
		# is just done at the print level for
		# legibility
		"simplify((-1)^(-5/a))",
		#"(-1)^(-5/a)",
		"1/(-1)^(5/a)",

		"simplify((-1)^(5/a))",
		"(-1)^(5/a)",

		"simplify((1)^(-5/a))",
		"1",

		"simplify((1)^(5/a))",
		"1",

		# -----------------------
		"simplify((-1)^(-6))",
		"1",

		"simplify((-1)^(6))",
		"1",

		"simplify((1)^(-6))",
		"1",

		"simplify((1)^(6))",
		"1",

		# clockform can be much more compact than the
		# rectangular format so we return that one,
		# the user can always do a rect or a circexp on
		# the result if she desires other forms
		"simplify(i*2^(1/4)*sin(1/8*pi)+2^(1/4)*cos(1/8*pi))",
		"(-1)^(1/8)*2^(1/4)",
		# the circexp of the above is
		# 2^(1/4) exp(1/8 i pi), which is less compact


		# seems here that the simplification
		# has more nodes than the result but
		# it's not the case: the 1/... inversion
		# is just done at the print level for
		"simplify((-1)^(-6/a))",
		#"(-1)^(-6/a)",
		"1/(-1)^(6/a)",

		"simplify((-1)^(6/a))",
		"(-1)^(6/a)",

		"simplify((1)^(-6/a))",
		"1",

		"simplify((1)^(6/a))",
		"1",

		"simplify(transpose(A)*transpose(x))",
		"transpose(A*x)",

		"simplify(inner(transpose(A),transpose(x)))",
		"transpose(inner(x,A))",

		# ---------------------------------------------
		# checking that simplify doesn't make incorrect
		# simplifications

		"simplify(sqrt(-1/2 -1/2 * x))",
		"(-1/2*x-1/2)^(1/2)",

		"simplify(sqrt(x*y))",
		"(x*y)^(1/2)",

		"simplify(sqrt(1/x))",
		"(1/x)^(1/2)",

		"simplify(sqrt(x^y))",
		"(x^y)^(1/2)",

		"simplify(sqrt(x)^2)",
		"x",

		"simplify(sqrt(x^2))",
		"abs(x)",


	]
