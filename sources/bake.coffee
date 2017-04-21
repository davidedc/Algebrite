# pretty print



bake = ->
	h = 0
	s = 0
	t = 0
	x = 0
	y = 0
	z = 0

	expanding++

	save()

	p1 = pop()

	s = ispoly(p1, symbol(SYMBOL_S))
	t = ispoly(p1, symbol(SYMBOL_T))
	x = ispoly(p1, symbol(SYMBOL_X))
	y = ispoly(p1, symbol(SYMBOL_Y))
	z = ispoly(p1, symbol(SYMBOL_Z))

	if (s == 1 && t == 0 && x == 0 && y == 0 && z == 0)
		p2 = symbol(SYMBOL_S)
		bake_poly()
	else if (s == 0 && t == 1 && x == 0 && y == 0 && z == 0)
		p2 = symbol(SYMBOL_T)
		bake_poly()
	else if (s == 0 && t == 0 && x == 1 && y == 0 && z == 0)
		p2 = symbol(SYMBOL_X)
		bake_poly()
	else if (s == 0 && t == 0 && x == 0 && y == 1 && z == 0)
		p2 = symbol(SYMBOL_Y)
		bake_poly()
	else if (s == 0 && t == 0 && x == 0 && y == 0 && z == 1)
		p2 = symbol(SYMBOL_Z)
		bake_poly()
	# don't bake the contents of some constructs such as "for"
	# because we don't want to evaluate the body of
	# such constructs "statically", i.e. without fully running
	# the loops.
	else if (iscons(p1)) and car(p1) != symbol(FOR)
		h = tos
		push(car(p1))
		p1 = cdr(p1)
		while (iscons(p1))
			push(car(p1))
			bake()
			p1 = cdr(p1)
		list(tos - h)
	else
		push(p1)

	restore()

	expanding--

polyform = ->
	h = 0

	save()

	p2 = pop()
	p1 = pop()

	if (ispoly(p1, p2))
		bake_poly()
	else if (iscons(p1))
		h = tos
		push(car(p1))
		p1 = cdr(p1)
		while (iscons(p1))
			push(car(p1))
			push(p2)
			polyform()
			p1 = cdr(p1)
		list(tos - h)
	else
		push(p1)

	restore()

bake_poly = ->
	h = 0
	i = 0
	k = 0
	n = 0
	#U **a
	a = tos
	push(p1);		# p(x)
	push(p2);		# x
	k = coeff()
	h = tos
	for i in[(k - 1)..0] by -1
		p1 = stack[a+i]
		bake_poly_term(i)
	n = tos - h
	if (n > 1)
		list(n)
		push(symbol(ADD))
		swap()
		cons()
	p1 = pop()
	moveTos tos - k
	push(p1)

# p1 points to coefficient of p2 ^ k

# k is an int
bake_poly_term = (k) ->
	h = 0
	n = 0

	if (iszero(p1))
		return

	# constant term?

	if (k == 0)
		if (car(p1) == symbol(ADD))
			p1 = cdr(p1)
			while (iscons(p1))
				push(car(p1))
				p1 = cdr(p1)
		else
			push(p1)
		return

	h = tos

	# coefficient

	if (car(p1) == symbol(MULTIPLY))
		p1 = cdr(p1)
		while (iscons(p1))
			push(car(p1))
			p1 = cdr(p1)
	else if (!equaln(p1, 1))
		push(p1)

	# x ^ k

	if (k == 1)
		push(p2)
	else
		push(symbol(POWER))
		push(p2)
		push_integer(k)
		list(3)

	n = tos - h

	if (n > 1)
		list(n)
		push(symbol(MULTIPLY))
		swap()
		cons()


