#	Binomial coefficient
#
#	Input:		tos-2		n
#
#			tos-1		k
#
#	Output:		Binomial coefficient on stack
#
#	binomial(n, k) = n! / k! / (n - k)!
#
#	The binomial coefficient vanishes for k < 0 or k > n. (A=B, p. 19)




Eval_binomial = ->
	push(cadr(p1))
	Eval()
	push(caddr(p1))
	Eval()
	binomial()

binomial = ->
	save()
	ybinomial()
	restore()

#define N p1
#define K p2

ybinomial = ->
	p2 = pop()
	p1 = pop()

	if (BINOM_check_args() == 0)
		push(zero)
		return

	push(p1)
	factorial()

	push(p2)
	factorial()

	divide()

	push(p1)
	push(p2)
	subtract()
	factorial()

	divide()

BINOM_check_args = ->
	if (isnum(p1) && lessp(p1, zero))
		return 0
	else if (isnum(p2) && lessp(p2, zero))
		return 0
	else if (isnum(p1) && isnum(p2) && lessp(p1, p2))
		return 0
	else
		return 1

test_binomial = ->
	run_test [
		"binomial(12,6)",
		"924",

		"binomial(n,k)",
	#	"1/(factorial(k))*factorial(n)*1/(factorial(-k+n))",
	#	"factorial(n)/(factorial(k)*factorial(-k+n))",
		"n!/(k!*(-k+n)!)",

		"binomial(0,k)",
	#	"1/(factorial(k))*1/(factorial(-k))",
	#	"1/(factorial(k)*factorial(-k))",
		"1/(k!*(-k)!)",

		"binomial(n,0)",
		"1",

		"binomial(-1,k)",
		"0",

		"binomial(n,-1)",
		"0",
	]
