

Eval_rationalize = ->
	push(cadr(p1))
	Eval()
	rationalize()

rationalize = ->
	x = expanding
	save()
	yyrationalize()
	restore()
	expanding = x

yyrationalize = ->
	p1 = pop()

	if (istensor(p1))
		__rationalize_tensor()
		return

	expanding = 0

	if (car(p1) != symbol(ADD))
		push(p1)
		return

	if DEBUG
		printf("rationalize: this is the input expr:\n")
		printline(p1)

	# get common denominator

	push(one)
	multiply_denominators(p1)
	p2 = pop()

	if DEBUG
		printf("rationalize: this is the common denominator:\n")
		printline(p2)

	# multiply each term by common denominator

	push(zero)
	p3 = cdr(p1)
	while (iscons(p3))
		push(p2)
		push(car(p3))
		multiply()
		add()
		p3 = cdr(p3)

	if DEBUG
		printf("rationalize: original expr times common denominator:\n")
		printline(stack[tos - 1])

	# collect common factors

	Condense()

	if DEBUG
		printf("rationalize: after factoring:\n")
		printline(stack[tos - 1])

	# divide by common denominator

	push(p2)
	divide()

	if DEBUG
		printf("rationalize: after dividing by common denom. (and we're done):\n")
		printline(stack[tos - 1])

multiply_denominators = (p) ->
	if (car(p) == symbol(ADD))
		p = cdr(p)
		while (iscons(p))
			multiply_denominators_term(car(p))
			p = cdr(p)
	else
		multiply_denominators_term(p)

multiply_denominators_term = (p) ->
	if (car(p) == symbol(MULTIPLY))
		p = cdr(p)
		while (iscons(p))
			multiply_denominators_factor(car(p))
			p = cdr(p)
	else
		multiply_denominators_factor(p)

multiply_denominators_factor = (p) ->
	if (car(p) != symbol(POWER))
		return

	push(p)

	p = caddr(p)

	# like x^(-2) ?

	if (isnegativenumber(p))
		inverse()
		__lcm()
		return

	# like x^(-a) ?

	if (car(p) == symbol(MULTIPLY) && isnegativenumber(cadr(p)))
		inverse()
		__lcm()
		return

	# no match

	pop()

__rationalize_tensor = ->

	i = 0
	push(p1)

	Eval(); # makes a copy

	p1 = pop()

	if (!istensor(p1)) # might be zero
		push(p1)
		return

	n = p1.tensor.nelem

	for i in [0...n]
		push(p1.tensor.elem[i])
		rationalize()
		p1.tensor.elem[i] = pop()

	check_tensor_dimensions p1


	push(p1)



__lcm = ->
	save()

	p1 = pop()
	p2 = pop()

	push(p1)
	push(p2)
	multiply()
	push(p1)
	push(p2)
	gcd()
	divide()

	restore()
