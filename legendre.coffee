###
 Legendre function

Example

	legendre(x,3,0)

Result

	 5   3    3
	--- x  - --- x
	 2        2

The computation uses the following recurrence relation.

	P(x,0) = 1

	P(x,1) = x

	n*P(x,n) = (2*(n-1)+1)*x*P(x,n-1) - (n-1)*P(x,n-2)

In the "for" loop we have i = n-1 so the recurrence relation becomes

	(i+1)*P(x,n) = (2*i+1)*x*P(x,n-1) - i*P(x,n-2)

For m > 0

	P(x,n,m) = (-1)^m * (1-x^2)^(m/2) * d^m/dx^m P(x,n)
###



Eval_legendre = ->
	# 1st arg

	push(cadr(p1))
	Eval()

	# 2nd arg

	push(caddr(p1))
	Eval()

	# 3rd arg (optional)

	push(cadddr(p1))
	Eval()

	p2 = pop()
	if (p2 == symbol(NIL))
		push_integer(0)
	else
		push(p2)

	legendre()

#define X p1
#define N p2
#define M p3
#define Y p4
#define Y0 p5
#define Y1 p6


legendre = ->
	save()
	__legendre()
	restore()

__legendre = ->
	m = 0
	n = 0

	p3 = pop()
	p2 = pop()
	p1 = pop()

	push(p2)
	n = pop_integer()

	push(p3)
	m = pop_integer()

	if (n < 0 || n == 0x80000000 || m < 0 || m == 0x80000000)
		push_symbol(LEGENDRE)
		push(p1)
		push(p2)
		push(p3)
		list(4)
		return

	if (issymbol(p1))
		__legendre2(n, m)
	else
		p4 = p1;			# do this when X is an expr
		p1 = symbol(SECRETX)
		__legendre2(n, m)
		p1 = p4
		push(symbol(SECRETX))
		push(p1)
		subst()
		Eval()

	__legendre3(m)

__legendre2 = (n, m) ->
	i = 0

	push_integer(1)
	push_integer(0)

	p6 = pop()

	#	i=1	p5 = 0 
	#		p6 = 1 
	#		((2*i+1)*x*p6 - i*p5) / i = x
	#
	#	i=2	p5 = 1
	#		p6 = x
	#		((2*i+1)*x*p6 - i*p5) / i = -1/2 + 3/2*x^2
	#
	#	i=3	p5 = x
	#		p6 = -1/2 + 3/2*x^2
	#		((2*i+1)*x*p6 - i*p5) / i = -3/2*x + 5/2*x^3

	for i in [0...n]

		p5 = p6

		p6 = pop()

		push_integer(2 * i + 1)
		push(p1)
		multiply()
		push(p6)
		multiply()

		push_integer(i)
		push(p5)
		multiply()

		subtract()

		push_integer(i + 1)
		divide()

	for i in [0...m]
		push(p1)
		derivative()

# tos = tos * (-1)^m * (1-x^2)^(m/2)

__legendre3 = (m) ->
	if (m == 0)
		return

	if (car(p1) == symbol(COS))
		push(cadr(p1))
		sine()
		square()
	else if (car(p1) == symbol(SIN))
		push(cadr(p1))
		cosine()
		square()
	else
		push_integer(1)
		push(p1)
		square()
		subtract()

	push_integer(m)
	push_rational(1, 2)
	multiply()
	power()
	multiply()

	if (m % 2)
		negate()

test_legendre = ->
	run_test [
		"legendre(x,n)",
		"legendre(x,n,0)",

		"legendre(x,n,m)",
		"legendre(x,n,m)",

		"legendre(x,0)-1",
		"0",

		"legendre(x,1)-x",
		"0",

		"legendre(x,2)-1/2*(3*x^2-1)",
		"0",

		"legendre(x,3)-1/2*(5*x^3-3*x)",
		"0",

		"legendre(x,4)-1/8*(35*x^4-30*x^2+3)",
		"0",

		"legendre(x,5)-1/8*(63*x^5-70*x^3+15*x)",
		"0",

		"legendre(x,6)-1/16*(231*x^6-315*x^4+105*x^2-5)",
		"0",

		"legendre(x,0,0)-1",
		"0",

		"legendre(x,1,0)-x",
		"0",

		"legendre(x,1,1)+(1-x^2)^(1/2)",
		"0",

		"legendre(x,2,0)-1/2*(3*x^2-1)",
		"0",

		"legendre(x,2,1)+3*x*(1-x^2)^(1/2)",
		"0",

		"legendre(x,2,2)-3*(1-x^2)",
		"0",

		"legendre(x,3,0)-1/2*x*(5*x^2-3)",
		"0",

		"legendre(x,3,1)-3/2*(1-5*x^2)*(1-x^2)^(1/2)",
		"0",

		"legendre(x,3,2)-15*x*(1-x^2)",
		"0",

		"legendre(x,3,3)+15*(1-x^2)^(3/2)",
		"0",

		"legendre(x,4,0)-1/8*(35*x^4-30*x^2+3)",
		"0",

		"legendre(x,4,1)-5/2*x*(3-7*x^2)*(1-x^2)^(1/2)",
		"0",

		"legendre(x,4,2)-15/2*(7*x^2-1)*(1-x^2)",
		"0",

		"legendre(x,4,3)+105*x*(1-x^2)^(3/2)",
		"0",

		"legendre(x,4,4)-105*(1-x^2)^2",
		"0",

		"legendre(x,5,0)-1/8*x*(63*x^4-70*x^2+15)",
		"0",

		"legendre(cos(theta),0,0)-1",
		"0",

		"legendre(cos(theta),1,0)-cos(theta)",
		"0",

		"legendre(cos(theta),1,1)+sin(theta)",
		"0",

		"legendre(cos(theta),2,0)-1/2*(3*cos(theta)^2-1)",
		"0",

		"legendre(cos(theta),2,1)+3*sin(theta)*cos(theta)",
		"0",

		"legendre(cos(theta),2,2)-3*sin(theta)^2",
		"0",

		"legendre(cos(theta),3,0)-1/2*cos(theta)*(5*cos(theta)^2-3)",
		"0",

		"legendre(cos(theta),3,1)+3/2*(5*cos(theta)^2-1)*sin(theta)",
		"0",

		"legendre(cos(theta),3,2)-15*cos(theta)*sin(theta)^2",
		"0",

		"legendre(cos(theta),3,3)+15*sin(theta)^3",
		"0",

		"legendre(a-b,10)-eval(subst(a-b,x,legendre(x,10)))",
		"0",
	]