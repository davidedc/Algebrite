# derivative



#define F p3
#define X p4
#define N p5

Eval_derivative = ->

	# evaluate 1st arg to get function F

	i = 0
	p1 = cdr(p1)
	push(car(p1))
	Eval()

	# evaluate 2nd arg and then...

	# example	result of 2nd arg	what to do
	#
	# d(f)		nil			guess X, N = nil
	# d(f,2)	2			guess X, N = 2
	# d(f,x)	x			X = x, N = nil
	# d(f,x,2)	x			X = x, N = 2
	# d(f,x,y)	x			X = x, N = y

	p1 = cdr(p1)
	push(car(p1))
	Eval()

	p2 = pop()
	if (p2 == symbol(NIL))
		guess()
		push(symbol(NIL))
	else if (isnum(p2))
		guess()
		push(p2)
	else
		push(p2)
		p1 = cdr(p1)
		push(car(p1))
		Eval()

	p5 = pop(); # p5 is N
	p4 = pop(); # p4 is X
	p3 = pop(); # p3 is F

	while (1)

		# p5 (N) might be a symbol instead of a number

		if (isnum(p5)) # p5 is N
			push(p5); # p5 is N
			n = pop_integer()
			if (n == 0x80000000)
				stop("nth derivative: check n")
		else
			n = 1

		push(p3); # p3 is F

		if (n >= 0)
			for i in [0...n]
				push(p4); # p4 is X
				derivative()
		else
			n = -n
			for i in [0...n]
				push(p4); # p4 is X
				integral()

		p3 = pop(); # p3 is F

		# if p5 (N) is nil then arglist is exhausted

		if (p5 == symbol(NIL)) # p5 is N
			break

		# otherwise...

		# N		arg1		what to do
		#
		# number	nil		break
		# number	number		N = arg1, continue
		# number	symbol		X = arg1, N = arg2, continue
		#
		# symbol	nil		X = N, N = nil, continue
		# symbol	number		X = N, N = arg1, continue
		# symbol	symbol		X = N, N = arg1, continue

		if (isnum(p5)) # p5 is N
			p1 = cdr(p1)
			push(car(p1))
			Eval()
			p5 = pop(); # p5 is N
			if (p5 == symbol(NIL)) # p5 is N
				break;		# arglist exhausted
			if (isnum(p5)) # p5 is N
				doNothing = 1		# N = arg1
			else
				p4 = p5; # p5 is N	 # p4 is X	# X = arg1
				p1 = cdr(p1)
				push(car(p1))
				Eval()
				p5 = pop(); # p5 is N	# N = arg2
		else
			p4 = p5;	 # p5 is N	 # p4 is X	# X = N
			p1 = cdr(p1)
			push(car(p1))
			Eval()
			p5 = pop();	 # p5 is N	# N = arg1

	push(p3);  # p3 is F # final result

derivative = ->
	save()
	p2 = pop()
	p1 = pop()
	if (isnum(p2))
		stop("undefined function")
	if (istensor(p1))
		if (istensor(p2))
			d_tensor_tensor()
		else
			d_tensor_scalar()
	else
		if (istensor(p2))
			d_scalar_tensor()
		else
			d_scalar_scalar()
	restore()

d_scalar_scalar = ->
	if (issymbol(p2))
		d_scalar_scalar_1()
	else
		# Example: d(sin(cos(x)),cos(x))
		# Replace cos(x) <- X, find derivative, then do X <- cos(x)
		push(p1);		# sin(cos(x))
		push(p2);		# cos(x)
		push(symbol(SECRETX));	# X
		subst();		# sin(cos(x)) -> sin(X)
		push(symbol(SECRETX));	# X
		derivative()
		push(symbol(SECRETX));	# X
		push(p2);		# cos(x)
		subst();		# cos(X) -> cos(cos(x))

d_scalar_scalar_1 = ->
	# d(x,x)?

	if (equal(p1, p2))
		push(one)
		return

	# d(a,x)?

	if (!iscons(p1))
		push(zero)
		return

	if (isadd(p1))
		dsum()
		return

	if (car(p1) == symbol(MULTIPLY))
		dproduct()
		return

	if (car(p1) == symbol(POWER))
		dpower()
		return

	if (car(p1) == symbol(DERIVATIVE))
		dd()
		return

	if (car(p1) == symbol(LOG))
		dlog()
		return

	if (car(p1) == symbol(SIN))
		dsin()
		return

	if (car(p1) == symbol(COS))
		dcos()
		return

	if (car(p1) == symbol(TAN))
		dtan()
		return

	if (car(p1) == symbol(ARCSIN))
		darcsin()
		return

	if (car(p1) == symbol(ARCCOS))
		darccos()
		return

	if (car(p1) == symbol(ARCTAN))
		darctan()
		return

	if (car(p1) == symbol(SINH))
		dsinh()
		return

	if (car(p1) == symbol(COSH))
		dcosh()
		return

	if (car(p1) == symbol(TANH))
		dtanh()
		return

	if (car(p1) == symbol(ARCSINH))
		darcsinh()
		return

	if (car(p1) == symbol(ARCCOSH))
		darccosh()
		return

	if (car(p1) == symbol(ARCTANH))
		darctanh()
		return

	if (car(p1) == symbol(ABS))
		dabs()
		return

	if (car(p1) == symbol(SGN))
		dsgn()
		return

	if (car(p1) == symbol(HERMITE))
		dhermite()
		return

	if (car(p1) == symbol(ERF))
		derf()
		return

	if (car(p1) == symbol(ERFC))
		derfc()
		return

	if (car(p1) == symbol(BESSELJ))
		if (iszero(caddr(p1)))
			dbesselj0()
		else
			dbesseljn()
		return

	if (car(p1) == symbol(BESSELY))
		if (iszero(caddr(p1)))
			dbessely0()
		else
			dbesselyn()
		return

	if (car(p1) == symbol(INTEGRAL) && caddr(p1) == p2)
		derivative_of_integral()
		return

	dfunction()

dsum = ->
	h = tos
	p1 = cdr(p1)
	while (iscons(p1))
		push(car(p1))
		push(p2)
		derivative()
		p1 = cdr(p1)
	add_all(tos - h)

dproduct = ->
	i = 0
	j = 0
	n = 0
	n = length(p1) - 1
	for i in [0...n]
		p3 = cdr(p1)
		for j in [0...n]
			push(car(p3))
			if (i == j)
				push(p2)
				derivative()
			p3 = cdr(p3)
		multiply_all(n)
	add_all(n)

#-----------------------------------------------------------------------------
#
#	     v
#	y = u
#
#	log y = v log u
#
#	1 dy   v du           dv
#	- -- = - -- + (log u) --
#	y dx   u dx           dx
#
#	dy    v  v du           dv
#	-- = u  (- -- + (log u) --)
#	dx       u dx           dx
#
#-----------------------------------------------------------------------------

dpower = ->
	push(caddr(p1));	# v/u
	push(cadr(p1))
	divide()

	push(cadr(p1));		# du/dx
	push(p2)
	derivative()

	multiply()

	push(cadr(p1));		# log u
	logarithm()

	push(caddr(p1));	# dv/dx
	push(p2)
	derivative()

	multiply()

	add()

	push(p1);		# u^v

	multiply()

dlog = ->
	push(cadr(p1))
	push(p2)
	derivative()
	push(cadr(p1))
	divide()

#	derivative of derivative
#
#	example: d(d(f(x,y),y),x)
#
#	p1 = d(f(x,y),y)
#
#	p2 = x
#
#	cadr(p1) = f(x,y)
#
#	caddr(p1) = y

dd = ->
	# d(f(x,y),x)

	push(cadr(p1))
	push(p2)
	derivative()

	p3 = pop()

	if (car(p3) == symbol(DERIVATIVE))

		# sort dx terms

		push_symbol(DERIVATIVE)
		push_symbol(DERIVATIVE)
		push(cadr(p3))

		if (lessp(caddr(p3), caddr(p1)))
			push(caddr(p3))
			list(3)
			push(caddr(p1))
		else
			push(caddr(p1))
			list(3)
			push(caddr(p3))

		list(3)

	else
		push(p3)
		push(caddr(p1))
		derivative()

# derivative of a generic function

dfunction = ->
	p3 = cdr(p1);	# p3 is the argument list for the function

	if (p3 == symbol(NIL) || Find(p3, p2))
		push_symbol(DERIVATIVE)
		push(p1)
		push(p2)
		list(3)
	else
		push(zero)

dsin = ->
	push(cadr(p1))
	push(p2)
	derivative()
	push(cadr(p1))
	cosine()
	multiply()

dcos = ->
	push(cadr(p1))
	push(p2)
	derivative()
	push(cadr(p1))
	sine()
	multiply()
	negate()

dtan = ->
	push(cadr(p1))
	push(p2)
	derivative()
	push(cadr(p1))
	cosine()
	push_integer(-2)
	power()
	multiply()

darcsin = ->
	push(cadr(p1))
	push(p2)
	derivative()
	push_integer(1)
	push(cadr(p1))
	push_integer(2)
	power()
	subtract()
	push_rational(-1, 2)
	power()
	multiply()

darccos = ->
	push(cadr(p1))
	push(p2)
	derivative()
	push_integer(1)
	push(cadr(p1))
	push_integer(2)
	power()
	subtract()
	push_rational(-1, 2)
	power()
	multiply()
	negate()

#				Without simplify	With simplify
#
#	d(arctan(y/x),x)	-y/(x^2*(y^2/x^2+1))	-y/(x^2+y^2)
#
#	d(arctan(y/x),y)	1/(x*(y^2/x^2+1))	x/(x^2+y^2)

darctan = ->
	push(cadr(p1))
	push(p2)
	derivative()
	push_integer(1)
	push(cadr(p1))
	push_integer(2)
	power()
	add()
	inverse()
	multiply()
	simplify()

dsinh = ->
	push(cadr(p1))
	push(p2)
	derivative()
	push(cadr(p1))
	ycosh()
	multiply()

dcosh = ->
	push(cadr(p1))
	push(p2)
	derivative()
	push(cadr(p1))
	ysinh()
	multiply()

dtanh = ->
	push(cadr(p1))
	push(p2)
	derivative()
	push(cadr(p1))
	ycosh()
	push_integer(-2)
	power()
	multiply()

darcsinh = ->
	push(cadr(p1))
	push(p2)
	derivative()
	push(cadr(p1))
	push_integer(2)
	power()
	push_integer(1)
	add()
	push_rational(-1, 2)
	power()
	multiply()

darccosh = ->
	push(cadr(p1))
	push(p2)
	derivative()
	push(cadr(p1))
	push_integer(2)
	power()
	push_integer(-1)
	add()
	push_rational(-1, 2)
	power()
	multiply()

darctanh = ->
	push(cadr(p1))
	push(p2)
	derivative()
	push_integer(1)
	push(cadr(p1))
	push_integer(2)
	power()
	subtract()
	inverse()
	multiply()

dabs = ->
	push(cadr(p1))
	push(p2)
	derivative()
	push(cadr(p1))
	sgn()
	multiply()

dsgn = ->
	push(cadr(p1))
	push(p2)
	derivative()
	push(cadr(p1))
	dirac()
	multiply()
	push_integer(2)
	multiply()

dhermite = ->
	push(cadr(p1))
	push(p2)
	derivative()
	push_integer(2)
	push(caddr(p1))
	multiply()
	multiply()
	push(cadr(p1))
	push(caddr(p1))
	push_integer(-1)
	add()
	hermite()
	multiply()

derf = ->
	push(cadr(p1))
	push_integer(2)
	power()
	push_integer(-1)
	multiply()
	exponential()
	push_symbol(PI)
	push_rational(-1,2)
	power()
	multiply()
	push_integer(2)
	multiply()
	push(cadr(p1))
	push(p2)
	derivative()
	multiply()

derfc = ->
	push(cadr(p1))
	push_integer(2)
	power()
	push_integer(-1)
	multiply()
	exponential()
	push_symbol(PI)
	push_rational(-1,2)
	power()
	multiply()
	push_integer(-2)
	multiply()
	push(cadr(p1))
	push(p2)
	derivative()
	multiply()

dbesselj0 = ->
	push(cadr(p1))
	push(p2)
	derivative()
	push(cadr(p1))
	push_integer(1)
	besselj()
	multiply()
	push_integer(-1)
	multiply()

dbesseljn = ->
	push(cadr(p1))
	push(p2)
	derivative()
	push(cadr(p1))
	push(caddr(p1))
	push_integer(-1)
	add()
	besselj()
	push(caddr(p1))
	push_integer(-1)
	multiply()
	push(cadr(p1))
	divide()
	push(cadr(p1))
	push(caddr(p1))
	besselj()
	multiply()
	add()
	multiply()

dbessely0 = ->
	push(cadr(p1))
	push(p2)
	derivative()
	push(cadr(p1))
	push_integer(1)
	besselj()
	multiply()
	push_integer(-1)
	multiply()

dbesselyn = ->
	push(cadr(p1))
	push(p2)
	derivative()
	push(cadr(p1))
	push(caddr(p1))
	push_integer(-1)
	add()
	bessely()
	push(caddr(p1))
	push_integer(-1)
	multiply()
	push(cadr(p1))
	divide()
	push(cadr(p1))
	push(caddr(p1))
	bessely()
	multiply()
	add()
	multiply()

derivative_of_integral = ->
	push(cadr(p1))


test_derivative = ->
	run_test [

		"x=quote(x)",
		"",

		"f=quote(f)",
		"",

		"g=quote(g)",
		"",

		"d(a,x)",
		"0",

		"d(x,x)",
		"1",

		"d(x^2,x)",
		"2*x",

		"d(log(x),x)",
		"1/x",

		"d(exp(x),x)",
		"exp(x)",

		"d(a^x,x)",
		"a^x*log(a)",

		"d(x^x,x)-(x^x+x^x*log(x))",
		"0",

		"d(log(x^2+5),x)-(2*x/(5+x^2))",
		"0",

		"d(d(f(x),x),y)",
		"0",

		"d(d(f(x),y),x)",
		"0",

		"d(d(f(y),x),y)",
		"0",

		"d(d(f(y),y),x)",
		"0",

		"d((x*y*z,y,x+z),(x,y,z))",
		"((y*z,x*z,x*y),(0,1,0),(1,0,1))",

		"d(x+z,(x,y,z))",
		"(1,0,1)",

		"d(cos(theta)^2,cos(theta))",
		"2*cos(theta)",

		"d(f())",
		"d(f(),x)",

		"d(x^2)",
		"2*x",

		"d(t^2)",
		"2*t",

		"d(t^2 x^2)",
		"2*t^2*x",

		# trig functions

		"d(sin(x),x)-cos(x)",
		"0",

		"d(cos(x),x)+sin(x)",
		"0",

		"d(tan(x),x)-cos(x)^(-2)",
		"0",

		"d(arcsin(x),x)-1/sqrt(1-x^2)",
		"0",

		"d(arccos(x),x)+1/sqrt(1-x^2)",
		"0",

		"d(arctan(x),x)-1/(1+x^2)",
		"0",

		"d(arctan(y/x),x)",
		"-y/(x^2+y^2)",

		"d(arctan(y/x),y)",
		"x/(x^2+y^2)",

		# hyp functions

		"d(sinh(x),x)-cosh(x)",
		"0",

		"d(cosh(x),x)-sinh(x)",
		"0",

		"d(tanh(x),x)-cosh(x)^(-2)",
		"0",

		"d(arcsinh(x),x)-1/sqrt(x^2+1)",
		"0",

		"d(arccosh(x),x)-1/sqrt(x^2-1)",
		"0",

		"d(arctanh(x),x)-1/(1-x^2)",
		"0",

		"d(sin(cos(x)),x)+cos(cos(x))*sin(x)",
		"0",

		"d(sin(x)^2,x)-2*sin(x)*cos(x)",
		"0",

		"d(sin(cos(x)),cos(x))-cos(cos(x))",
		"0",

		"d(abs(x),x)",
		"sgn(x)",
		
		"d(sgn(x),x)",
		"2*dirac(x)",

		# generic functions

		"d(f(),x)",
		"d(f(),x)",

		"d(f(x),x)",
		"d(f(x),x)",

		"d(f(y),x)",
		"0",

		"d(g(f(x)),f(x))",
		"d(g(f(x)),f(x))",

		"d(g(f(x)),x)",
		"d(g(f(x)),x)",

		# other functions

		"d(erf(x))-2*exp(-x^2)/sqrt(pi)",
		"0",

		# arg lists

		"f=x^5*y^7",
		"",

		"d(f)",
		"5*x^4*y^7",

		"d(f,x)",
		"5*x^4*y^7",

		"d(f,x,0)",
		"x^5*y^7",

		"d(f,x,1)",
		"5*x^4*y^7",

		"d(f,x,2)",
		"20*x^3*y^7",

		"d(f,2)",
		"20*x^3*y^7",

		"d(f,2,y)",
		"140*x^3*y^6",

		"d(f,x,x,y,y)",
		"840*x^3*y^5",

		"f=quote(f)",
		"",
	]