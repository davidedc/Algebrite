

# quick and dirty way to run a few tests

run_test [

	"1+1",
	"2",
		
]

test_dependencies()

run_test [

	"simplify(integral(1/(X-A)/sqrt(X^2-A^2),X)+sqrt(X^2-A^2)/A/(X-A))",
	"0",
		
]



userSimplifications = [
	"f(eig(transpose(a),a), cov(a))",
]

run_test [

	"simplify(integral(1/(X-A)/sqrt(X^2-A^2),X)+sqrt(X^2-A^2)/A/(X-A))",
	"0",
		
]

run_test [

	"simplify(eig(transpose(A+B),B+transpose(transpose(A))))",
	"cov(A+B)",
		
	"simplify(eig(x*transpose(transpose(A)), transpose(x*A)))",
	"eig(A*x,transpose(A)*transpose(x))",
		
]

userSimplifications.push "f(eig(a,transpose(a)), cov(a))"

run_test [

	"simplify(eig(transpose(A+B),B+transpose(transpose(A))))",
	"cov(A+B)",
		
	"simplify(eig(x*transpose(transpose(A)), transpose(x*A)))",
	"cov(A*x)",
		
]

userSimplifications = []

run_test [

	"simplify(eig(transpose(A+B),B+transpose(transpose(A))))",
	"eig(transpose(A)+transpose(B),A+B)",
		
]


# alert "passed tests: " + ok_tests + " / failed tests: " + ko_tests
