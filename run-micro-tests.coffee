

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

	"simplify(integral(1/(X-A)/sqrt(X^2-A^2),X)+sqrt(X^2-A^2)/A/(X-A))",
	"0",
		
]




run_test [

	"addsubstrule(eig(transpose(a_),a_), cov(a_))",
	"",

	"simplify(integral(1/(X-A)/sqrt(X^2-A^2),X)+sqrt(X^2-A^2)/A/(X-A))",
	"0",
		
]

run_test [

	"simplify(eig(transpose(A+B),B+transpose(transpose(A))))",
	"cov(A+B)",
		
	"simplify(eig(x*transpose(transpose(A)), transpose(A*x)))",
	"eig(A*x,transpose(A)*transpose(x))",
		
	"simplify(eig(x*transpose(transpose(A)), transpose(x*A)))",
	"eig(A*x,transpose(A)*transpose(x))",
		
]

run_test [

	"addsubstrule(eig(a_,transpose(a_)), cov(a_))",
	"",

	"simplify(eig(transpose(A+B),B+transpose(transpose(A))))",
	"cov(A+B)",
		
	"simplify(eig(x*transpose(transpose(A)), transpose(x*A)))",
	"cov(A*x)",
		
	"simplify(eig(x*transpose(transpose(A)), transpose(A*x)))",
	"cov(A*x)",

	"clearsubstrules()",
	"",
		
]


run_test [

	"simplify(eig(transpose(A+B),B+transpose(transpose(A))))",
	"eig(transpose(A)+transpose(B),A+B)",
		
]


run_test [

	"addsubstrule(eig(transpose(a_),a_), cov(a_), not(number(a_)))",
	"",

	"addsubstrule(eig(transpose(a_),a_), cov(a_), number(a_),a_>0 )",
	"",

	"simplify(eig(transpose(3),transpose(transpose(3))))",
	"cov(3)",

	"simplify(eig(transpose(-3),transpose(transpose(-3))))",
	"eig(-3,-3)",

	"simplify(eig(transpose(-x),transpose(transpose(-x))))",
	"cov(-x)",

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
