test_roots = ->
	run_test [
		"roots(x)",
		"0",

		"roots(x^2)",
		"0",

		"roots(x^3)",
		"0",

		"roots(2 x)",
		"0",

		"roots(2 x^2)",
		"0",

		"roots(2 x^3)",
		"0",

		"roots(6+11*x+6*x^2+x^3)",
		"(-3,-2,-1)",

		"roots(a*x^2+b*x+c)",
		"(-b/(2*a)-(-4*a*c+b^2)^(1/2)/(2*a),-b/(2*a)+(-4*a*c+b^2)^(1/2)/(2*a))",

		"roots(3+7*x+5*x^2+x^3)",
		"(-3,-1)",

		"roots(x^3+x^2+x+1)",
		"(-1,-i,i)",

		"roots(x^4+1)",
		"Stop: roots: the polynomial is not factorable, try nroots",

		"roots(x^2==1)",
		"(-1,1)",

		"roots(3 x + 12 == 24)",
		"4",

		"y=roots(x^2+b*x+c/k)[1]",
		"",

		"y^2+b*y+c/k",
		"0",

		"y=roots(x^2+b*x+c/k)[2]",
		"",

		"y^2+b*y+c/k",
		"0",

		"y=roots(a*x^2+b*x+c/4)[1]",
		"",

		"a*y^2+b*y+c/4",
		"0",

		"y=roots(a*x^2+b*x+c/4)[2]",
		"",

		"a*y^2+b*y+c/4",
		"0",

		"y=quote(y)",
		"",

		# --------------------------------------------
		# some more tests with 3rd degree polynomials
		# including use of cubic formula
		# --------------------------------------------

		# doesn't actually use cubic formula
		"roots(x^3 + x^2 + x + 1)",
		"(-1,-i,i)",
		
		# doesn't actually use cubic formula
		"roots(2*x^3 + 3*x^2 - 11*x - 6)",
		"(-3,-1/2,2)",

		# doesn't actually use cubic formula
		"roots(x^3 - 7*x^2 + 4*x + 12)",
		"(-1,2,6)",

		# doesn't actually use cubic formula
		"roots(x^3 + 1)",
		"(-1,1/2-1/2*i*3^(1/2),1/2+1/2*i*3^(1/2))",
		
		# doesn't actually use cubic formula
		"roots(x^3 - 1)",
		"(1,-1/2-1/2*i*3^(1/2),-1/2+1/2*i*3^(1/2))",
		
		# DOES use cubic formula
		"roots(x^3 + d)",
		"(1/2*d^(1/3)-1/2*i*3^(1/2)*d^(1/3),1/2*d^(1/3)+1/2*i*3^(1/2)*d^(1/3),-d^(1/3))",

		# DOES use cubic formula
		# the actual format of this solution might change, the important thing
		# is that the next steps 4 tests are satisfied, where we plug in the
		# symbolic solutions in the polynomial again and we check that we
		# get the zeroes.
		"roots(a*x^3 + b*x^2 + c*x + d)",
		"(-c/(2*(-9/2*a*b*c+b^3+1/2*(-27*a^2*b^2*c^2+108*a^2*b^3*d-486*a^3*b*c*d+108*a^3*c^3+729*a^4*d^2)^(1/2)+27/2*a^2*d)^(1/3))-i*b^2/(2*3^(1/2)*a*(-9/2*a*b*c+b^3+1/2*(-27*a^2*b^2*c^2+108*a^2*b^3*d-486*a^3*b*c*d+108*a^3*c^3+729*a^4*d^2)^(1/2)+27/2*a^2*d)^(1/3))+i*(-9/2*a*b*c+b^3+1/2*(-27*a^2*b^2*c^2+108*a^2*b^3*d-486*a^3*b*c*d+108*a^3*c^3+729*a^4*d^2)^(1/2)+27/2*a^2*d)^(1/3)/(2*3^(1/2)*a)+i*3^(1/2)*c/(2*(-9/2*a*b*c+b^3+1/2*(-27*a^2*b^2*c^2+108*a^2*b^3*d-486*a^3*b*c*d+108*a^3*c^3+729*a^4*d^2)^(1/2)+27/2*a^2*d)^(1/3))-b/(3*a)+b^2/(6*a*(-9/2*a*b*c+b^3+1/2*(-27*a^2*b^2*c^2+108*a^2*b^3*d-486*a^3*b*c*d+108*a^3*c^3+729*a^4*d^2)^(1/2)+27/2*a^2*d)^(1/3))+(-9/2*a*b*c+b^3+1/2*(-27*a^2*b^2*c^2+108*a^2*b^3*d-486*a^3*b*c*d+108*a^3*c^3+729*a^4*d^2)^(1/2)+27/2*a^2*d)^(1/3)/(6*a),-c/(2*(-9/2*a*b*c+b^3+1/2*(-27*a^2*b^2*c^2+108*a^2*b^3*d-486*a^3*b*c*d+108*a^3*c^3+729*a^4*d^2)^(1/2)+27/2*a^2*d)^(1/3))+i*b^2/(2*3^(1/2)*a*(-9/2*a*b*c+b^3+1/2*(-27*a^2*b^2*c^2+108*a^2*b^3*d-486*a^3*b*c*d+108*a^3*c^3+729*a^4*d^2)^(1/2)+27/2*a^2*d)^(1/3))-i*(-9/2*a*b*c+b^3+1/2*(-27*a^2*b^2*c^2+108*a^2*b^3*d-486*a^3*b*c*d+108*a^3*c^3+729*a^4*d^2)^(1/2)+27/2*a^2*d)^(1/3)/(2*3^(1/2)*a)-i*3^(1/2)*c/(2*(-9/2*a*b*c+b^3+1/2*(-27*a^2*b^2*c^2+108*a^2*b^3*d-486*a^3*b*c*d+108*a^3*c^3+729*a^4*d^2)^(1/2)+27/2*a^2*d)^(1/3))-b/(3*a)+b^2/(6*a*(-9/2*a*b*c+b^3+1/2*(-27*a^2*b^2*c^2+108*a^2*b^3*d-486*a^3*b*c*d+108*a^3*c^3+729*a^4*d^2)^(1/2)+27/2*a^2*d)^(1/3))+(-9/2*a*b*c+b^3+1/2*(-27*a^2*b^2*c^2+108*a^2*b^3*d-486*a^3*b*c*d+108*a^3*c^3+729*a^4*d^2)^(1/2)+27/2*a^2*d)^(1/3)/(6*a),c/((-9/2*a*b*c+b^3+1/2*(-27*a^2*b^2*c^2+108*a^2*b^3*d-486*a^3*b*c*d+108*a^3*c^3+729*a^4*d^2)^(1/2)+27/2*a^2*d)^(1/3))-b/(3*a)-b^2/(3*a*(-9/2*a*b*c+b^3+1/2*(-27*a^2*b^2*c^2+108*a^2*b^3*d-486*a^3*b*c*d+108*a^3*c^3+729*a^4*d^2)^(1/2)+27/2*a^2*d)^(1/3))-(-9/2*a*b*c+b^3+1/2*(-27*a^2*b^2*c^2+108*a^2*b^3*d-486*a^3*b*c*d+108*a^3*c^3+729*a^4*d^2)^(1/2)+27/2*a^2*d)^(1/3)/(3*a))",

		"solutions = last",
		"",

		"simplify(a*(solutions[1])^3 + b*(solutions[1])^2 + c*(solutions[1]) + d)",
		"0",

		"simplify(a*(solutions[2])^3 + b*(solutions[2])^2 + c*(solutions[2]) + d)",
		"0",

		"simplify(a*(solutions[3])^3 + b*(solutions[3])^2 + c*(solutions[3]) + d)",
		"0",

		# we meddled with the "solutions" variable, now clean up
		"solutions = quote(solutions)",
		"",

	]
