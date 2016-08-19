

# quick and dirty way to run a few tests

run_test [

	"1+1",
	"2",
		
]

test_dependencies()

run_test [

	"simplify(transpose(A)*transpose(x))",
	"transpose(A*x)",

	"simplify(inner(transpose(A),transpose(x)))",
	"transpose(inner(x,A))",
		
]

run_test [

	# one of the two arguments should
	# be a scalar, but we don't know
	# which one, so we have to transpose
	# both of them. Note that we
	# don't invert the order because
	# we know it's not an inner (dot)
	# product
	"transpose(A)*transpose(x)",
	"transpose(A)*transpose(x)",
		
]

run_test [

	"addsubstrule(eig(transpose(a_),a_), eig(cov(a_)))",
	"",

	"addsubstrule(eig(a_,transpose(a_)), eig(cov(a_)))",
	"",

	#"addsubstrule(cov(transpose(a_)), cov(a_))",
	#"",

	"simplify(1 + eig(transpose(A+B),B+transpose(transpose(A))))",
	"1+eig(cov(A+B))",
		
	"simplify(1 + eig(x*transpose(transpose(A)), transpose(x*A)))",
	"1+eig(cov(transpose(A)*transpose(x)))",

	# ideally this but we need to make simplifications work better
	# "1+eig(cov(A*x))",
		
	"simplify(1 + eig(x*transpose(transpose(A)), transpose(A*x)))",
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

	"addsubstrule(eig(transpose(a_),a_), eig(cov(a_)))",
	"",

	"simplify(integral(1/(X-A)/sqrt(X^2-A^2),X)+sqrt(X^2-A^2)/A/(X-A))",
	"0",
		
]

run_test [

	"simplify(eig(transpose(A+B),B+transpose(transpose(A))))",
	"eig(cov(A+B))",
		
	"simplify(eig(x*transpose(transpose(A)), transpose(A*x)))",
	"eig(cov(transpose(A)*transpose(x)))",
		
	"simplify(eig(x*transpose(transpose(A)), transpose(x*A)))",
	"eig(cov(transpose(A)*transpose(x)))",
		
]

run_test [

	"addsubstrule(eig(a_,transpose(a_)), eig(cov(a_)))",
	"",

	"simplify(eig(transpose(A+B),B+transpose(transpose(A))))",
	"eig(cov(A+B))",
		
	"simplify(eig(x*transpose(transpose(A)), transpose(x*A)))",
	"eig(cov(transpose(A)*transpose(x)))",
		
	"simplify(eig(x*transpose(transpose(A)), transpose(A*x)))",
	"eig(cov(transpose(A)*transpose(x)))",

	"clearsubstrules()",
	"",
		
]


run_test [

	"simplify(eig(transpose(A+B),B+transpose(transpose(A))))",
	"eig(transpose(A)+transpose(B),A+B)",
		
]


run_test [

	"addsubstrule(eig(transpose(a_),a_), eig(cov(a_)), not(number(a_)))",
	"",

	"addsubstrule(eig(transpose(a_),a_), eig(cov(a_)), number(a_),a_>0 )",
	"",

	# in theory this could be simplified to eig(cov(3)) but
	# in practice we evaluate away all the transposes before
	# doing the matching, so the matching
	# doesn't work in this case.
	# if we ran the matching before the eval (no expand) as
	# well, then we would catch it.
	"simplify(eig(transpose(3),transpose(transpose(3))))",
	"eig(3,3)",

	"simplify(eig(transpose(-3),transpose(transpose(-3))))",
	"eig(-3,-3)",

	"simplify(eig(transpose(-x),transpose(transpose(-x))))",
	"eig(cov(-x))",

	"clearsubstrules()",
	"",

]

run_test [

	"addsubstrule(something(a_,b_),b_*somethingElse(a_))",
	"",

	"simplify(something(x,y))",
	"somethingElse(x)*y",

	"clearsubstrules()",
	"",

]

run_test [

	"addsubstrule(something(a_,b_),b_*somethingElse(a_))",
	"",

	"indirection(h,k) = something(h,k)",
	"",

	"simplify(indirection(x,y))",
	"somethingElse(x)*y",

	"clearsubstrules()",
	"",

]



# alert "passed tests: " + ok_tests + " / failed tests: " + ko_tests
