### besselj =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
x,n

General description
-------------------

Returns a solution to the Bessel differential equation (Bessel function of first kind).

Recurrence relation:

	besselj(x,n) = (2/x) (n-1) besselj(x,n-1) - besselj(x,n-2)

	besselj(x,1/2) = sqrt(2/pi/x) sin(x)

	besselj(x,-1/2) = sqrt(2/pi/x) cos(x)

For negative n, reorder the recurrence relation as:

	besselj(x,n-2) = (2/x) (n-1) besselj(x,n-1) - besselj(x,n)

Substitute n+2 for n to obtain

	besselj(x,n) = (2/x) (n+1) besselj(x,n+1) - besselj(x,n+2)

Examples:

	besselj(x,3/2) = (1/x) besselj(x,1/2) - besselj(x,-1/2)

	besselj(x,-3/2) = -(1/x) besselj(x,-1/2) - besselj(x,1/2)

###



Eval_besselj = ->
	push(cadr(p1))
	Eval()
	push(caddr(p1))
	Eval()
	besselj()

besselj = ->
	save()
	yybesselj()
	restore()

#define X p1
#define N p2
#define SGN p3

yybesselj = ->
	d = 0.0
	n = 0

	p2 = pop()
	p1 = pop()

	push(p2)
	n = pop_integer()

	# numerical result

	if (isdouble(p1) && !isNaN(n))
		d = jn(n, p1.d)
		push_double(d)
		return

	# bessej(0,0) = 1

	if (iszero(p1) && iszero(p2))
		push_integer(1)
		return

	# besselj(0,n) = 0

	if (iszero(p1) && !isNaN(n))
		push_integer(0)
		return

	# half arguments

	if (p2.k == NUM && MEQUAL(p2.q.b, 2))

		# n = 1/2

		if (MEQUAL(p2.q.a, 1))
			if evaluatingAsFloats
				push_double(2.0 / Math.PI)
			else
				push_integer(2)
				push_symbol(PI)
				divide()
			push(p1)
			divide()
			push_rational(1, 2)
			power()
			push(p1)
			sine()
			multiply()
			return

		# n = -1/2

		if (MEQUAL(p2.q.a, -1))
			if evaluatingAsFloats
				push_double(2.0 / Math.PI)
			else
				push_integer(2)
				push_symbol(PI)
				divide()
			push(p1)
			divide()
			push_rational(1, 2)
			power()
			push(p1)
			cosine()
			multiply()
			return

		# besselj(x,n) = (2/x) (n-sgn(n)) besselj(x,n-sgn(n)) - besselj(x,n-2*sgn(n))

		push_integer(MSIGN(p2.q.a))
		p3 = pop()

		push_integer(2)
		push(p1)
		divide()
		push(p2)
		push(p3)
		subtract()
		multiply()
		push(p1)
		push(p2)
		push(p3)
		subtract()
		besselj()
		multiply()
		push(p1)
		push(p2)
		push_integer(2)
		push(p3)
		multiply()
		subtract()
		besselj()
		subtract()

		return

	#if 0 # test cases needed
	if (isnegativeterm(p1))
		push(p1)
		negate()
		push(p2)
		power()
		push(p1)
		push(p2)
		negate()
		power()
		multiply()
		push_symbol(BESSELJ)
		push(p1)
		negate()
		push(p2)
		list(3)
		multiply()
		return

	if (isnegativeterm(p2))
		push_integer(-1)
		push(p2)
		power()
		push_symbol(BESSELJ)
		push(p1)
		push(p2)
		negate()
		list(3)
		multiply()
		return
	#endif

	push(symbol(BESSELJ))
	push(p1)
	push(p2)
	list(3)


