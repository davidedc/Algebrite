#-----------------------------------------------------------------------------
#
#	Generate all divisors of a term
#
#	Input:		Term on stack (factor * factor * ...)
#
#	Output:		Divisors on stack
#
#-----------------------------------------------------------------------------




divisors = ->
	i = 0
	h = 0
	n = 0
	save()
	h = tos - 1
	divisors_onstack()
	n = tos - h

	#qsort(stack + h, n, sizeof (U *), __cmp)
	subsetOfStack = stack.slice(h,h+n)
	subsetOfStack.sort(cmp_expr)
	stack = stack.slice(0,h).concat(subsetOfStack).concat(stack.slice(h+n))

	p1 = alloc_tensor(n)
	p1.tensor.ndim = 1
	p1.tensor.dim[0] = n
	for i in [0...n]
		p1.tensor.elem[i] = stack[h + i]
	moveTos h
	push(p1)
	restore()

divisors_onstack = ->
	h = 0
	i = 0
	k = 0
	n = 0

	save()

	p1 = pop()

	h = tos

	# push all of the term's factors

	if (isnum(p1))
		push(p1)
		factor_small_number()
	else if (car(p1) == symbol(ADD))
		push(p1)
		__factor_add()
		#printf(">>>\n")
		#for (i = h; i < tos; i++)
		#print(stdout, stack[i])
		#printf("<<<\n")
	else if (car(p1) == symbol(MULTIPLY))
		p1 = cdr(p1)
		if (isnum(car(p1)))
			push(car(p1))
			factor_small_number()
			p1 = cdr(p1)
		while (iscons(p1))
			p2 = car(p1)
			if (car(p2) == symbol(POWER))
				push(cadr(p2))
				push(caddr(p2))
			else
				push(p2)
				push(one)
			p1 = cdr(p1)
	else if (car(p1) == symbol(POWER))
		push(cadr(p1))
		push(caddr(p1))
	else
		push(p1)
		push(one)

	k = tos

	# contruct divisors by recursive descent

	push(one)

	gen(h, k)

	# move

	n = tos - k

	for i in [0...n]
		stack[h + i] = stack[k + i]

	moveTos h + n

	restore()

#-----------------------------------------------------------------------------
#
#	Generate divisors
#
#	Input:		Base-exponent pairs on stack
#
#			h	first pair
#
#			k	just past last pair
#
#	Output:		Divisors on stack
#
#	For example, factor list 2 2 3 1 results in 6 divisors,
#
#		1
#		3
#		2
#		6
#		4
#		12
#
#-----------------------------------------------------------------------------

#define ACCUM p1
#define BASE p2
#define EXPO p3

gen = (h,k) ->
	expo = 0
	i = 0

	save()

	p1 = pop()

	if (h == k)
		push(p1)
		restore()
		return

	p2 = stack[h + 0]
	p3 = stack[h + 1]

	push(p3)
	expo = pop_integer()

	if (!isNaN(expo))
		for i in [0..Math.abs(expo)]
			push(p1)
			push(p2)
			push_integer(sign(expo) * i)
			power()
			multiply()
			gen(h + 2, k)

	restore()

#-----------------------------------------------------------------------------
#
#	Factor ADD expression
#
#	Input:		Expression on stack
#
#	Output:		Factors on stack
#
#	Each factor consists of two expressions, the factor itself followed
#	by the exponent.
#
#-----------------------------------------------------------------------------

__factor_add = ->
	save()

	p1 = pop()

	# get gcd of all terms

	p3 = cdr(p1)
	push(car(p3))
	p3 = cdr(p3)
	while (iscons(p3))
		push(car(p3))
		gcd()
		p3 = cdr(p3)

	# check gcd

	p2 = pop()
	if (isplusone(p2))
		push(p1)
		push(one)
		restore()
		return

	# push factored gcd

	if (isnum(p2))
		push(p2)
		factor_small_number()
	else if (car(p2) == symbol(MULTIPLY))
		p3 = cdr(p2)
		if (isnum(car(p3)))
			push(car(p3))
			factor_small_number()
		else
			push(car(p3))
			push(one)
		p3 = cdr(p3)
		while (iscons(p3))
			push(car(p3))
			push(one)
			p3 = cdr(p3)
	else
		push(p2)
		push(one)

	# divide each term by gcd

	push(p2)
	inverse()
	p2 = pop()

	push(zero)
	p3 = cdr(p1)
	while (iscons(p3))
		push(p2)
		push(car(p3))
		multiply()
		add()
		p3 = cdr(p3)

	push(one)

	restore()

