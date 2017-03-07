test_pattern = ->
	run_test [

		"pattern(dot(transpose(a_),a_), cov(a_))",
		"dot(transpose(a_),a_)->cov(a_)",

		"pattern(dot(a_,transpose(a_)), cov(a_))",
		"dot(a_,transpose(a_))->cov(a_)",

		#"pattern(cov(transpose(a_)), cov(a_))",
		#"",

		"simplify(1 + eig(dot(transpose(A+B),B+transpose(transpose(A)))))",
		"1+eig(cov(A+B))",
			
		"simplify(1 + eig(dot(x*transpose(transpose(A)), transpose(x*A))))",
		"1+eig(cov(transpose(A)*transpose(x)))",

		# ideally this but we need to make simplifications work better
		# "1+eig(cov(A*x))",
			
		"simplify(1 + eig(dot(x*transpose(transpose(A)), transpose(A*x))))",
		"1+eig(cov(transpose(A)*transpose(x)))",

		"simplify(1 + eig(dot(x*Aᵀᵀ, (A*x)ᵀ)))",
		"1+eig(cov(transpose(A)*transpose(x)))",

		# ideally this but we need to make simplifications work better
		# "1+eig(cov(A*x))",

		"clearpatterns()",
		"",

		# ------------------------------------------------------------------



		"simplify(integral(1/(X-A)/sqrt(X^2-A^2),X)+sqrt(X^2-A^2)/A/(X-A))",
		"0",
			

		# ------------------------------------------------------------------


		"pattern(dot(transpose(a_),a_), cov(a_))",
		"dot(transpose(a_),a_)->cov(a_)",

		"simplify(integral(1/(X-A)/sqrt(X^2-A^2),X)+sqrt(X^2-A^2)/A/(X-A))",
		"0",
			

		# ------------------------------------------------------------------


		"simplify(eig(dot(transpose(A+B),B+transpose(transpose(A)))))",
		"eig(cov(A+B))",
			
		"simplify(eig(dot(x*transpose(transpose(A)), transpose(A*x))))",
		"eig(cov(transpose(A)*transpose(x)))",
			
		"simplify(eig(dot(x*transpose(transpose(A)), transpose(x*A))))",
		"eig(cov(transpose(A)*transpose(x)))",
			

		# ------------------------------------------------------------------


		"pattern(dot(a_,transpose(a_)), cov(a_))",
		"dot(a_,transpose(a_))->cov(a_)",

		"simplify(eig(dot(transpose(A+B),B+transpose(transpose(A)))))",
		"eig(cov(A+B))",
			
		"simplify(eig(dot(x*transpose(transpose(A)), transpose(x*A))))",
		"eig(cov(transpose(A)*transpose(x)))",
			
		"simplify(eig(dot(x*transpose(transpose(A)), transpose(A*x))))",
		"eig(cov(transpose(A)*transpose(x)))",

		"clearpatterns()",
		"",


		# ------------------------------------------------------------------



		"simplify(eig(dot(transpose(A+B),B+transpose(transpose(A)))))",
		"eig(inner(transpose(A),A)+inner(transpose(A),B)+inner(transpose(B),A)+inner(transpose(B),B))",
			

		# ------------------------------------------------------------------


		"pattern(dot(transpose(a_),a_), cov(a_), not(number(a_)))",
		"dot(transpose(a_),a_)->cov(a_)",

		"pattern(dot(transpose(a_),a_), cov(a_), number(a_),a_>0 )",
		"dot(transpose(a_),a_)->cov(a_)",

		"simplify(eig(dot(transpose(3),transpose(transpose(3)))))",
		"eig(9)",

		"simplify(eig(dot(transpose(-3),transpose(transpose(-3)))))",
		"eig(9)",

		"simplify(eig(dot(transpose(-x),transpose(transpose(-x)))))",
		"eig(cov(-x))",

		"clearpatterns()",
		"",


		# ------------------------------------------------------------------



		"pattern(something(a_,b_),b_*somethingElse(a_))",
		"something(a_,b_)->b_*somethingElse(a_)",

		"simplify(something(x,y))",
		"somethingElse(x)*y",

		"clearpatterns()",
		"",


		# ------------------------------------------------------------------



		"pattern(something(a_,b_),b_*somethingElse(a_))",
		"something(a_,b_)->b_*somethingElse(a_)",

		"indirection(h,k) = something(h,k)",
		"",

		"simplify(indirection(x,y))",
		"somethingElse(x)*y",

		"clearpatterns()",
		"",


		# ------------------------------------------------------------------


		"pattern(dot(a_,transpose(a_)), cov(a_))",
		"dot(a_,transpose(a_))->cov(a_)",

		"simplify(1 + eig(dot(transpose(A)+transpose(B),B+transpose(transpose(A)))))",
		"1+eig(inner(transpose(A),A)+inner(transpose(A),B)+inner(transpose(B),A)+inner(transpose(B),B))",

		# catches if a guard works against substituting bare native functions
		"simplify(1 + eig(dot(transpose(A)+transpose(B),B+transpose(transpose(A)))))",
		"1+eig(inner(transpose(A),A)+inner(transpose(A),B)+inner(transpose(B),A)+inner(transpose(B),B))",

		"clearpatterns()",
		"",


		# ------------------------------------------------------------------


		"pattern(dot(transpose(a_),a_), cov(a_))",
		"dot(transpose(a_),a_)->cov(a_)",

		# picks up that transpose(abs(k))
		# is a substitution that works
		"simplify(1 + eig(dot(abs(k),transpose(abs(k)))))",
		"1+eig(cov(transpose(abs(k))))",

		# picks up that transpose(b(2))
		# is a substitution that works
		"simplify(1 + eig(dot(b(2),transpose(b(2)))))",
		"1+eig(cov(transpose(b(2))))",

		"clearpatterns()",
		"",


		# ------------------------------------------------------------------

		"pattern(a_ + b_, dot(cov(b_),cov(a_)))",
		"a_+b_->dot(cov(b_),cov(a_))",

		"simplify(something + somethingelse)",
		"inner(cov(somethingelse),cov(something))",

		"clearpatterns()",
		"",

		# ------------------------------------------------------------------

		"pattern(aFunction(a_), anotherFunction(a_))",
		"aFunction(a_)->anotherFunction(a_)",

		"simplify(aFunction(someArg))",
		"anotherFunction(someArg)",

		"clearpatterns()",
		"",

		# ------------------------------------------------------------------

		"pattern(aFunction(a_), anotherFunction(a_))",
		"aFunction(a_)->anotherFunction(a_)",

		"simplify(1 + aFunction(someArg))",
		"1+anotherFunction(someArg)",

		"clearpatterns()",
		"",

		# ------------------------------------------------------------------

		"pattern(aFunction(a_), anotherFunction(a_))",
		"aFunction(a_)->anotherFunction(a_)",

		"simplify(aFunction(someArg)+aFunction(someOtherArg))",
		"anotherFunction(someArg)+anotherFunction(someOtherArg)",

		"clearpatterns()",
		"",

		# ------------------------------------------------------------------

		"pattern(aFunction(a_), anotherFunction(a_))",
		"aFunction(a_)->anotherFunction(a_)",

		"simplify( a + aFunction(someArg) + b + aFunction(someOtherArg))",
		"a+b+anotherFunction(someArg)+anotherFunction(someOtherArg)",

		"clearpatterns()",
		"",

		# ------------------------------------------------------------------

		"pattern(aFunction(a_), anotherFunction(a_))",
		"aFunction(a_)->anotherFunction(a_)",

		"simplify(aFunction(aFunction(someOtherArg)))",
		"anotherFunction(anotherFunction(someOtherArg))",

		"clearpatterns()",
		"",

		# ------------------------------------------------------------------

		"pattern(aFunction(a_), anotherFunction(a_))",
		"aFunction(a_)->anotherFunction(a_)",

		"pattern(aFunction(a_), anotherFunctionBBBB(a_))",
		"aFunction(a_)->anotherFunctionBBBB(a_)",

		"simplify(aFunction(aFunction(someOtherArg)))",
		"anotherFunctionBBBB(anotherFunctionBBBB(someOtherArg))",

		"clearpatterns()",
		"",

		# ------------------------------------------------------------------

		"pattern(aFunction(a_), anotherFunctionBBBB(a_))",
		"aFunction(a_)->anotherFunctionBBBB(a_)",

		"pattern(aFunction(a_), anotherFunction(a_))",
		"aFunction(a_)->anotherFunction(a_)",

		"simplify(aFunction(aFunction(someOtherArg)))",
		"anotherFunction(anotherFunction(someOtherArg))",

		"clearpatterns()",
		"",

		# ------------------------------------------------------------------

		"pattern(aFunction(a_), anotherFunction(a_))",
		"aFunction(a_)->anotherFunction(a_)",

		"pattern(anotherFunction(a_), YETanotherFunction(a_))",
		"anotherFunction(a_)->YETanotherFunction(a_)",

		"simplify(aFunction(aFunction(someOtherArg)))",
		"YETanotherFunction(YETanotherFunction(someOtherArg))",

		"clearpatterns()",
		"",

		# ------------------------------------------------------------------
		# this one tests if multiple rounds of ruleS applications are
		# done while there are still trasformations succeeding.

		"pattern(anotherFunction(a_), YETanotherFunction(a_))",
		"anotherFunction(a_)->YETanotherFunction(a_)",

		"pattern(aFunction(a_), anotherFunction(a_))",
		"aFunction(a_)->anotherFunction(a_)",

		"simplify(aFunction(aFunction(someOtherArg)))",
		"YETanotherFunction(YETanotherFunction(someOtherArg))",

		"clearpatterns()",
		"",

		# ------------------------------------------------------------------
		# you can use transformation rules to calculate factorials
		# you shouldn't, but you can

		"pattern(fact(0), 1)",
		"fact(0)->1",

		# TODO would be nice to print out the constraints
		# as well.
		"pattern(fact(a_), a_*fact(a_-1), not(a_ == 0))",
		"fact(a_)->a_*fact(a_-1)",

		"simplify(fact(3))",
		"6",

		"clearpatterns()",
		"",

		# ------------------------------------------------------------------

		"pattern(f(a_,b_),f(b_,a_))",
		"f(a_,b_)->f(b_,a_)",

		# TODO would be nice to print out the constraints
		# as well.
		"simplify(f(1,2))",
		"Stop: maximum application of single transformation rule exceeded: f(a_,b_)(f(b_,a_))",

		"clearpatterns()",
		"",

		# overwriting a pattern ---------------------------------------------

		"pattern(a_ + a_ ,42 * a_)",
		"a_+a_->42*a_",

		"pattern(a_ + a_ ,21 * a_)",
		"a_+a_->21*a_",

		"simplify(x+x)",
		"21*x",

		"clearpatterns()",
		"",

		# ------------------------------------------------------------------

		"pattern(f(a_,b_))",
		"Stop: pattern needs at least a template and a transformed version",

		# ------------------------------------------------------------------

		"pattern()",
		"Stop: pattern needs at least a template and a transformed version",

		# ------------------------------------------------------------------

		"pattern(f(a_,b_), f(a_,b_))",
		"Stop: recursive pattern",


	]
