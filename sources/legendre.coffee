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

	if (n < 0 || isNaN(n) || m < 0 || isNaN(m))
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

# moveTos tos * (-1)^m * (1-x^2)^(m/2)

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

