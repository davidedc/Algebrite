

# quick and dirty way to run a few tests

run_test [

	"1+1",
	"2",
		
]

test_dependencies()


run_test [

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

	"clearsubstrules()",
	"",
		
]

## ---------------------------------------------------------

run_test [

	"simplify(integral(1/(X-A)/sqrt(X^2-A^2),X)+sqrt(X^2-A^2)/A/(X-A))",
	"0",
		
]




run_test [

	"pattern(dot(transpose(a_),a_), cov(a_))",
	"dot(transpose(a_),a_)->cov(a_)",

	"simplify(integral(1/(X-A)/sqrt(X^2-A^2),X)+sqrt(X^2-A^2)/A/(X-A))",
	"0",
		
]

run_test [

	"simplify(eig(dot(transpose(A+B),B+transpose(transpose(A)))))",
	"eig(cov(A+B))",
		
	"simplify(eig(dot(x*transpose(transpose(A)), transpose(A*x))))",
	"eig(cov(transpose(A)*transpose(x)))",
		
	"simplify(eig(dot(x*transpose(transpose(A)), transpose(x*A))))",
	"eig(cov(transpose(A)*transpose(x)))",
		
]

run_test [

	"pattern(dot(a_,transpose(a_)), cov(a_))",
	"dot(a_,transpose(a_))->cov(a_)",

	"simplify(eig(dot(transpose(A+B),B+transpose(transpose(A)))))",
	"eig(cov(A+B))",
		
	"simplify(eig(dot(x*transpose(transpose(A)), transpose(x*A))))",
	"eig(cov(transpose(A)*transpose(x)))",
		
	"simplify(eig(dot(x*transpose(transpose(A)), transpose(A*x))))",
	"eig(cov(transpose(A)*transpose(x)))",

	"clearsubstrules()",
	"",
		
]


run_test [

	"simplify(eig(dot(transpose(A+B),B+transpose(transpose(A)))))",
	"eig(inner(transpose(A),A)+inner(transpose(A),B)+inner(transpose(B),A)+inner(transpose(B),B))",
		
]


run_test [

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

	"clearsubstrules()",
	"",

]

run_test [

	"pattern(something(a_,b_),b_*somethingElse(a_))",
	"something(a_,b_)->b_*somethingElse(a_)",

	"simplify(something(x,y))",
	"somethingElse(x)*y",

	"clearsubstrules()",
	"",

]

run_test [

	"pattern(something(a_,b_),b_*somethingElse(a_))",
	"something(a_,b_)->b_*somethingElse(a_)",

	"indirection(h,k) = something(h,k)",
	"",

	"simplify(indirection(x,y))",
	"somethingElse(x)*y",

	"clearsubstrules()",
	"",

]


run_test [

	"pattern(dot(a_,transpose(a_)), cov(a_))",
	"dot(a_,transpose(a_))->cov(a_)",

	"simplify(1 + eig(dot(transpose(A)+transpose(B),B+transpose(transpose(A)))))",
	"1+eig(inner(transpose(A),A)+inner(transpose(A),B)+inner(transpose(B),A)+inner(transpose(B),B))",

	# catches if a guard works against substituting bare native functions
	"simplify(1 + eig(dot(transpose(A)+transpose(B),B+transpose(transpose(A)))))",
	"1+eig(inner(transpose(A),A)+inner(transpose(A),B)+inner(transpose(B),A)+inner(transpose(B),B))",

	"clearsubstrules()",
	"",

]


run_test [

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

	"clearsubstrules()",
	"",

]

run_test [

	"pattern(a_ + b_, dot(cov(b_),cov(a_)))",
	"a_+b_->dot(cov(b_),cov(a_))",

	"simplify(something + somethingelse)",
	"inner(cov(somethingelse),cov(something))",

	"clearsubstrules()",
	"",

]

# alert "passed tests: " + ok_tests + " / failed tests: " + ko_tests
