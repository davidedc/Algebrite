# get the coefficient of x^n in polynomial p(x)



#define P p1
#define X p2
#define N p3

Eval_coeff = ->
	push(cadr(p1));			# 1st arg, p
	Eval()

	push(caddr(p1));		# 2nd arg, x
	Eval()

	push(cadddr(p1));		# 3rd arg, n
	Eval()

	p3 = pop(); # p3 is N
	p2 = pop(); # p2 is X
	p1 = pop(); # p1 is P

	if (p3 == symbol(NIL))	 # p3 is N	# only 2 args?
		p3 = p2;  # p2 is X  # p3 is N
		p2 = symbol(SYMBOL_X);  # p2 is X

	push(p1);  # p1 is P			# divide p by x^n
	push(p2);  # p2 is X
	push(p3);  # p3 is N
	power()
	divide()

	push(p2);  # p2 is X			# keep the constant part
	filter()

#-----------------------------------------------------------------------------
#
#	Put polynomial coefficients on the stack
#
#	Input:		tos-2		p(x)
#
#			tos-1		x
#
#	Output:		Returns number of coefficients on stack
#
#			tos-n		Coefficient of x^0
#
#			tos-1		Coefficient of x^(n-1)
#
#-----------------------------------------------------------------------------

coeff = ->

	save()

	p2 = pop()
	p1 = pop()

	h = tos

	while 1

		push(p1)
		push(p2)
		push(zero)
		subst()
		Eval()

		p3 = pop()
		push(p3)

		push(p1)
		push(p3)
		subtract()

		p1 = pop()

		if (equal(p1, zero))
			n = tos - h
			restore()
			return n

		push(p1)
		push(p2)
		divide()
		p1 = pop()


test_coeff = ->
	run_test [

		"coeff(40*x^3+30*x^2+20*x+10,3)",
		"40",

		"coeff(40*x^3+30*x^2+20*x+10,2)",
		"30",

		"coeff(40*x^3+30*x^2+20*x+10,1)",
		"20",

		"coeff(40*x^3+30*x^2+20*x+10,0)",
		"10",

		"coeff(a*t^3+b*t^2+c*t+d,t,3)",
		"a",

		"coeff(a*t^3+b*t^2+c*t+d,t,2)",
		"b",

		"coeff(a*t^3+b*t^2+c*t+d,t,1)",
		"c",

		"coeff(a*t^3+b*t^2+c*t+d,t,0)",
		"d",
	]