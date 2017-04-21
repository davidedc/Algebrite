


factorial = ->
	n = 0
	save()
	p1 = pop()
	push(p1)
	n = pop_integer()
	if (n < 0 || isNaN(n))
		push_symbol(FACTORIAL)
		push(p1)
		list(2)
		restore()
		return
	bignum_factorial(n)
	restore()


# simplification rules for factorials (m < n)
#
#	(e + 1) * factorial(e)	->	factorial(e + 1)
#
#	factorial(e) / e	->	factorial(e - 1)
#
#	e / factorial(e)	->	1 / factorial(e - 1)
#
#	factorial(e + n)
#	----------------	->	(e + m + 1)(e + m + 2)...(e + n)
#	factorial(e + m)
#
#	factorial(e + m)                               1
#	----------------	->	--------------------------------
#	factorial(e + n)		(e + m + 1)(e + m + 2)...(e + n)

# this function is not actually used, but
# all these simplifications
# do happen automatically via simplify
simplifyfactorials = ->
	x = 0

	save()

	x = expanding
	expanding = 0

	p1 = pop()

	if (car(p1) == symbol(ADD))
		push(zero)
		p1 = cdr(p1)
		while (iscons(p1))
			push(car(p1))
			simplifyfactorials()
			add()
			p1 = cdr(p1)
		expanding = x
		restore()
		return

	if (car(p1) == symbol(MULTIPLY))
		sfac_product()
		expanding = x
		restore()
		return

	push(p1)

	expanding = x
	restore()

sfac_product = ->
	i = 0
	j = 0
	n = 0

	s = tos

	p1 = cdr(p1)
	n = 0
	while (iscons(p1))
		push(car(p1))
		p1 = cdr(p1)
		n++

	for i in [0...(n - 1)]
		if (stack[s + i] == symbol(NIL))
			continue
		for j in [(i + 1)...n]
			if (stack[s + j] == symbol(NIL))
				continue
			sfac_product_f(s, i, j)

	push(one)

	for i in [0...n]
		if (stack[s+i] == symbol(NIL))
			continue
		push(stack[s+i])
		multiply()

	p1 = pop()

	moveTos tos - n

	push(p1)

sfac_product_f = (s,a,b) ->
	i = 0
	n = 0

	p1 = stack[s + a]
	p2 = stack[s + b]

	if (ispower(p1))
		p3 = caddr(p1)
		p1 = cadr(p1)
	else
		p3 = one

	if (ispower(p2))
		p4 = caddr(p2)
		p2 = cadr(p2)
	else
		p4 = one

	if (isfactorial(p1) && isfactorial(p2))

		# Determine if the powers cancel.

		push(p3)
		push(p4)
		add()
		yyexpand()
		n = pop_integer()
		if (n != 0)
			return

		# Find the difference between the two factorial args.

		# For example, the difference between (a + 2)! and a! is 2.

		push(cadr(p1))
		push(cadr(p2))
		subtract()
		yyexpand(); # to simplify

		n = pop_integer()
		if (n == 0 || isNaN(n))
			return
		if (n < 0)
			n = -n
			p5 = p1
			p1 = p2
			p2 = p5
			p5 = p3
			p3 = p4
			p4 = p5

		push(one)

		for i in [1..n]
			push(cadr(p2))
			push_integer(i)
			add()
			push(p3)
			power()
			multiply()
		stack[s+a] = pop()
		stack[s+b] = symbol(NIL)
