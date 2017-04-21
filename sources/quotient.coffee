# Divide polynomials



Eval_quotient = ->
	push(cadr(p1));			# 1st arg, p(x)
	Eval()

	push(caddr(p1));		# 2nd arg, q(x)
	Eval()

	push(cadddr(p1));		# 3rd arg, x
	Eval()

	p1 = pop();			# default x
	if (p1 == symbol(NIL))
		p1 = symbol(SYMBOL_X)
	push(p1)

	divpoly()

#-----------------------------------------------------------------------------
#
#	Divide polynomials
#
#	Input:		tos-3		Dividend
#
#			tos-2		Divisor
#
#			tos-1		x
#
#	Output:		tos-1		Quotient
#
#-----------------------------------------------------------------------------

#define DIVIDEND p1
#define DIVISOR p2
#define X p3
#define Q p4
#define QUOTIENT p5

divpoly = ->
	h = 0
	i = 0
	m = 0
	n = 0
	x = 0
	#U **dividend, **divisor

	save()

	p3 = pop()
	p2 = pop()
	p1 = pop()

	h = tos

	dividend = tos

	push(p1)
	push(p3)
	m = coeff() - 1;	# m is dividend's power

	divisor = tos

	push(p2)
	push(p3)
	n = coeff() - 1;	# n is divisor's power

	x = m - n

	push_integer(0)
	p5 = pop()

	while (x >= 0)

		push(stack[dividend+m])
		push(stack[divisor+n])
		divide()
		p4 = pop()

		for i in [0..n]
			push(stack[dividend+x + i])
			push(stack[divisor+i])
			push(p4)
			multiply()
			subtract()
			stack[dividend+x + i] = pop()

		push(p5)
		push(p4)
		push(p3)
		push_integer(x)
		power()
		multiply()
		add()
		p5 = pop()

		m--
		x--

	moveTos h

	push(p5)

	restore()



