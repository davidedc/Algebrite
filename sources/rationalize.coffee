

Eval_rationalize = ->
	push(cadr(p1))
	Eval()
	rationalize()

rationalize = ->
	x = expanding
	yyrationalize()
	expanding = x

yyrationalize = ->
	theArgument = pop()

	if (istensor(theArgument))
		__rationalize_tensor(theArgument)
		return

	expanding = 0

	if (car(theArgument) != symbol(ADD))
		push(theArgument)
		return

	if DEBUG
		printf("rationalize: this is the input expr:\n")
		printline(theArgument)

	# get common denominator

	push(one)
	multiply_denominators(theArgument)
	commonDenominator = pop()

	if DEBUG
		printf("rationalize: this is the common denominator:\n")
		printline(commonDenominator)

	# multiply each term by common denominator

	push(zero)
	eachTerm = cdr(theArgument)
	while (iscons(eachTerm))
		push(commonDenominator)
		push(car(eachTerm))
		multiply()
		add()
		eachTerm = cdr(eachTerm)

	if DEBUG
		printf("rationalize: original expr times common denominator:\n")
		printline(stack[tos - 1])

	# collect common factors

	Condense()

	if DEBUG
		printf("rationalize: after factoring:\n")
		printline(stack[tos - 1])

	# divide by common denominator

	push(commonDenominator)
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

__rationalize_tensor = (theTensor) ->

	i = 0
	push(theTensor)

	Eval(); # makes a copy

	theTensor = pop()

	if (!istensor(theTensor)) # might be zero
		push(theTensor)
		return

	n = theTensor.tensor.nelem

	for i in [0...n]
		push(theTensor.tensor.elem[i])
		rationalize()
		theTensor.tensor.elem[i] = pop()

	check_tensor_dimensions theTensor

	push(theTensor)



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
