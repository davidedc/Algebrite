

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
		
	"simplify(eig(x*transpose(transpose(A)), transpose(A*x)))",
	"eig(A*x,transpose(A)*transpose(x))",
		
	"simplify(eig(x*transpose(transpose(A)), transpose(x*A)))",
	"eig(A*x,transpose(A)*transpose(x))",
		
]

userSimplifications.push "f(eig(a,transpose(a)), cov(a))"

run_test [

	"simplify(eig(transpose(A+B),B+transpose(transpose(A))))",
	"cov(A+B)",
		
	"simplify(eig(x*transpose(transpose(A)), transpose(x*A)))",
	"cov(A*x)",
		
	"simplify(eig(x*transpose(transpose(A)), transpose(A*x)))",
	"cov(A*x)",
		
]

userSimplifications = []

run_test [

	"simplify(eig(transpose(A+B),B+transpose(transpose(A))))",
	"eig(transpose(A)+transpose(B),A+B)",
		
]

userSimplifications = [
	"f(eig(transpose(a),a), cov(a), not(number(a)))",
	"f(eig(transpose(a),a), cov(a), number(a),a>0 )",
]

run_test [

	"simplify(eig(transpose(3),transpose(transpose(3))))",
	"cov(3)",

	"simplify(eig(transpose(-3),transpose(transpose(-3))))",
	"eig(-3,-3)",

	"simplify(eig(transpose(-x),transpose(transpose(-x))))",
	"cov(-x)",
]


# alert "passed tests: " + ok_tests + " / failed tests: " + ko_tests
