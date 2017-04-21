# Symbolic multiplication

# multiplication is commutative, so it can't be used
# e.g. on two matrices.
# But it can be used, say, on a scalar and a matrix.,
# so the output of a multiplication is not
# always a scalar.

#extern void append(void)
#static void parse_p1(void)
#static void parse_p2(void)
#static void __normalize_radical_factors(int)

Eval_multiply = ->
	push(cadr(p1))
	Eval()
	p1 = cddr(p1)
	while (iscons(p1))
		push(car(p1))
		Eval()
		multiply()
		p1 = cdr(p1)

# this one doesn't eval the factors,
# so you pass i*(-1)^(1/2), it wouldnt't
# give -1, because i is not evalled
multiply = ->
	if (esc_flag)
		stop("escape key stop")
	if (isnum(stack[tos - 2]) && isnum(stack[tos - 1]))
		multiply_numbers()
	else
		save()
		yymultiply()
		restore()

yymultiply = ->
	h = 0
	i = 0
	n = 0

	# pop operands

	p2 = pop()
	p1 = pop()

	h = tos

	# is either operand zero?

	if (iszero(p1) || iszero(p2))
		if evaluatingAsFloats then push_double(0.0) else push(zero)
		return

	# is either operand a sum?

	#console.log("yymultiply: expanding: " + expanding)
	if (expanding && isadd(p1))
		p1 = cdr(p1)
		if evaluatingAsFloats then push_double(0.0) else push(zero)
		while (iscons(p1))
			push(car(p1))
			push(p2)
			multiply()
			add()
			p1 = cdr(p1)
		return

	if (expanding && isadd(p2))
		p2 = cdr(p2)
		if evaluatingAsFloats then push_double(0.0) else push(zero)
		while (iscons(p2))
			push(p1)
			push(car(p2))
			multiply()
			add()
			p2 = cdr(p2)
		return

	# scalar times tensor?

	if (!istensor(p1) && istensor(p2))
		push(p1)
		push(p2)
		scalar_times_tensor()
		return

	# tensor times scalar?

	if (istensor(p1) && !istensor(p2))
		push(p1)
		push(p2)
		tensor_times_scalar()
		return

	# adjust operands

	if (car(p1) == symbol(MULTIPLY))
		p1 = cdr(p1)
	else
		push(p1)
		list(1)
		p1 = pop()

	if (car(p2) == symbol(MULTIPLY))
		p2 = cdr(p2)
	else
		push(p2)
		list(1)
		p2 = pop()

	# handle numerical coefficients

	if (isnum(car(p1)) && isnum(car(p2)))
		push(car(p1))
		push(car(p2))
		multiply_numbers()
		p1 = cdr(p1)
		p2 = cdr(p2)
	else if (isnum(car(p1)))
		push(car(p1))
		p1 = cdr(p1)
	else if (isnum(car(p2)))
		push(car(p2))
		p2 = cdr(p2)
	else
		if evaluatingAsFloats then push_double(1.0) else push(one)

	parse_p1()
	parse_p2()

	while (iscons(p1) && iscons(p2))

		#		if (car(p1)->gamma && car(p2)->gamma) {
		#			combine_gammas(h)
		#			p1 = cdr(p1)
		#			p2 = cdr(p2)
		#			parse_p1()
		#			parse_p2()
		#			continue
		#		}

		if (caar(p1) == symbol(OPERATOR) && caar(p2) == symbol(OPERATOR))
			push_symbol(OPERATOR)
			push(cdar(p1))
			push(cdar(p2))
			append()
			cons()
			p1 = cdr(p1)
			p2 = cdr(p2)
			parse_p1()
			parse_p2()
			continue

		switch (cmp_expr(p3, p4))
			when -1
				push(car(p1))
				p1 = cdr(p1)
				parse_p1()
			when 1
				push(car(p2))
				p2 = cdr(p2)
				parse_p2()
			when 0
				combine_factors(h)
				p1 = cdr(p1)
				p2 = cdr(p2)
				parse_p1()
				parse_p2()
			else
				stop("internal error 2")

	# push remaining factors, if any

	while (iscons(p1))
		push(car(p1))
		p1 = cdr(p1)

	while (iscons(p2))
		push(car(p2))
		p2 = cdr(p2)

	# normalize radical factors

	# example: 2*2(-1/2) -> 2^(1/2)

	# must be done after merge because merge may produce radical

	# example: 2^(1/2-a)*2^a -> 2^(1/2)

	__normalize_radical_factors(h)

	# this hack should not be necessary, unless power returns a multiply

	#for (i = h; i < tos; i++) {
	#	if (car(stack[i]) == symbol(MULTIPLY)) {
	#		multiply_all(tos - h)
	#		return
	#	}
	#}

	if (expanding)
		for i in [h...tos]
			if (isadd(stack[i]))
				multiply_all(tos - h)
				return

	# n is the number of result factors on the stack

	n = tos - h

	if (n == 1)
		return

	# discard integer 1

	if (isrational(stack[h]) && equaln(stack[h], 1))
		if (n == 2)
			p7 = pop()
			pop()
			push(p7)
		else
			stack[h] = symbol(MULTIPLY)
			list(n)
		return

	list(n)
	p7 = pop()
	push_symbol(MULTIPLY)
	push(p7)
	cons()

# Decompose a factor into base and power.
#
# input:	car(p1)		factor
#
# output:	p3		factor's base
#
#		p5		factor's power (possibly 1)

parse_p1 = ->
	p3 = car(p1)
	p5 = if evaluatingAsFloats then one_as_double else one
	if (car(p3) == symbol(POWER))
		p5 = caddr(p3)
		p3 = cadr(p3)

# Decompose a factor into base and power.
#
# input:	car(p2)		factor
#
# output:	p4		factor's base
#
#		p6		factor's power (possibly 1)

parse_p2 = ->
	p4 = car(p2)
	p6 = if evaluatingAsFloats then one_as_double else one
	if (car(p4) == symbol(POWER))
		p6 = caddr(p4)
		p4 = cadr(p4)

# h an integer
combine_factors = (h) ->
	push(p4)
	push(p5)
	push(p6)
	add()
	power()
	p7 = pop()
	if (isnum(p7))
		push(stack[h])
		push(p7)
		multiply_numbers()
		stack[h] = pop()
	else if (car(p7) == symbol(MULTIPLY))
		# power can return number * factor (i.e. -1 * i)
		if (isnum(cadr(p7)) && cdddr(p7) == symbol(NIL))
			push(stack[h])
			push(cadr(p7))
			multiply_numbers()
			stack[h] = pop()
			push(caddr(p7))
		else
			push(p7)
	else
		push(p7)

gp = [
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,1,-6,-7,-8,-3,-4,-5,13,14,15,-16,9,10,11,-12],
	[0,0,6,-1,-11,10,-2,-15,14,12,-5,4,-9,16,-8,7,-13],
	[0,0,7,11,-1,-9,15,-2,-13,5,12,-3,-10,8,16,-6,-14],
	[0,0,8,-10,9,-1,-14,13,-2,-4,3,12,-11,-7,6,16,-15],
	[0,0,3,2,15,-14,1,11,-10,16,-8,7,13,12,-5,4,9],
	[0,0,4,-15,2,13,-11,1,9,8,16,-6,14,5,12,-3,10],
	[0,0,5,14,-13,2,10,-9,1,-7,6,16,15,-4,3,12,11],
	[0,0,13,12,-5,4,16,-8,7,-1,-11,10,-3,-2,-15,14,-6],
	[0,0,14,5,12,-3,8,16,-6,11,-1,-9,-4,15,-2,-13,-7],
	[0,0,15,-4,3,12,-7,6,16,-10,9,-1,-5,-14,13,-2,-8],
	[0,0,16,-9,-10,-11,-13,-14,-15,-3,-4,-5,1,-6,-7,-8,2],
	[0,0,9,-16,8,-7,-12,5,-4,-2,-15,14,6,-1,-11,10,3],
	[0,0,10,-8,-16,6,-5,-12,3,15,-2,-13,7,11,-1,-9,4],
	[0,0,11,7,-6,-16,4,-3,-12,-14,13,-2,8,-10,9,-1,5],
	[0,0,12,13,14,15,9,10,11,-6,-7,-8,-2,-3,-4,-5,-1]
]

#if 0

# h an int
combine_gammas = (h) ->
	n = gp[Math.floor(p1.gamma)][Math.floor(p2.gamma)]
	if (n < 0)
		n = -n
		push(stack[h])
		negate()
		stack[h] = pop()
	if (n > 1)
		push(_gamma[n])

#endif

multiply_noexpand = ->
	prev_expanding = expanding
	expanding = 0
	multiply()
	expanding = prev_expanding

# multiply n factors on stack

# n an integer
multiply_all = (n) ->
	i = 0
	if (n == 1)
		return
	if (n == 0)
		push if evaluatingAsFloats then one_as_double else one
		return
	h = tos - n
	push(stack[h])
	for i in [1...n]
		push(stack[h + i])
		multiply()
	stack[h] = pop()
	moveTos h + 1

# n an integer
multiply_all_noexpand = (n) ->
	prev_expanding = expanding
	expanding = 0
	multiply_all(n)
	expanding = prev_expanding

#-----------------------------------------------------------------------------
#
#	Symbolic division, or numeric division if doubles are found.
#
#	Input:		Dividend and divisor on stack
#
#	Output:		Quotient on stack
#
#-----------------------------------------------------------------------------

divide = ->
	if (isnum(stack[tos - 2]) && isnum(stack[tos - 1]))
		divide_numbers()
	else
		inverse()
		multiply()

# this is different from inverse of a matrix (inv)!
inverse = ->
	if (isnum(stack[tos - 1]))
		invert_number()
	else
		push_integer(-1)
		power()

reciprocate = ->
	inverse()

negate = ->
	if (isnum(stack[tos - 1]))
		negate_number()
	else
		if evaluatingAsFloats then push_double(-1.0) else push_integer(-1)
		multiply()

negate_expand = ->
	prev_expanding = expanding
	expanding = 1
	negate()
	expanding = prev_expanding

negate_noexpand = ->
	prev_expanding = expanding
	expanding = 0
	negate()
	expanding = prev_expanding

#-----------------------------------------------------------------------------
#
#	Normalize radical factors
#
#	Input:		stack[h]	Coefficient factor, possibly 1
#
#			stack[h + 1]	Second factor
#
#			stack[tos - 1]	Last factor
#
#	Output:		Reduced coefficent and normalized radicals (maybe)
#
#	Example:	2*2^(-1/2) -> 2^(1/2)
#
#	(power number number) is guaranteed to have the following properties:
#
#	1. Base is an integer
#
#	2. Absolute value of exponent < 1
#
#	These properties are assured by the power function.
#
#-----------------------------------------------------------------------------

#define A p1
#define B p2

#define BASE p3
#define EXPO p4

#define TMP p5


# h is an int
__normalize_radical_factors = (h) ->

	i = 0
	# if coeff is 1 or floating then don't bother

	if (isplusone(stack[h]) || isminusone(stack[h]) || isdouble(stack[h]))
		return

	# if no radicals then don't bother

	for i in [(h + 1)...tos]
		if (__is_radical_number(stack[i]))
			break

	if (i == tos)
		return

	# ok, try to simplify

	save()

	# numerator

	push(stack[h])
	mp_numerator()
	#console.log("__normalize_radical_factors numerator: " + stack[tos-1])
	p1 = pop(); # p1 is A

	for i in [(h + 1)...tos]

		if (isplusone(p1) || isminusone(p1)) # p1 is A
			break

		if (!__is_radical_number(stack[i]))
			continue

		p3 = cadr(stack[i]); #p3 is BASE
		p4 = caddr(stack[i]); #p4 is EXPO

		# exponent must be negative

		if (!isnegativenumber(p4)) #p4 is EXPO
			continue

		# numerator divisible by p3 (base)?

		push(p1); # p1 is A
		push(p3); #p3 is BASE
		divide()

		p5 = pop(); #p5 is TMP

		if (!isinteger(p5)) #p5 is TMP
			continue

		# reduce numerator

		p1 = p5; # p1 is A  #p5 is TMP

		# invert radical

		push_symbol(POWER)
		push(p3); #p3 is BASE
		push if evaluatingAsFloats then one_as_double else one
		push(p4); #p4 is EXPO
		add()
		list(3)
		stack[i] = pop()

	# denominator

	push(stack[h])
	mp_denominator()
	#console.log("__normalize_radical_factors denominator: " + stack[tos-1])
	p2 = pop(); # p2 is B

	for i in [(h + 1)...tos]

		if (isplusone(p2)) # p2 is B
			break

		if (!__is_radical_number(stack[i]))
			continue

		p3 = cadr(stack[i]); #p3 is BASE
		p4 = caddr(stack[i]); #p4 is EXPO

		# exponent must be positive

		if (isnegativenumber(p4)) #p4 is EXPO
			continue

		# denominator divisible by p3? #p3 is BASE

		push(p2); # p2 is B
		push(p3); #p3 is BASE
		divide()

		p5 = pop(); #p5 is TMP

		if (!isinteger(p5)) #p5 is TMP
			continue
		#console.log("__new radical p5: " + p5.toString())
		#console.log("__new radical top stack: " + stack[tos-1])

		# reduce denominator

		p2 = p5; # p2 is B #p5 is TMP

		# invert radical

		push_symbol(POWER)
		push(p3); #p3 is BASE
		push(p4);  #p4 is EXPO
		#console.log("__new radical p3: " + p3.toString())
		#console.log("__new radical p4: " + p4.toString())
		push(one)
		subtract()

		if dontCreateNewRadicalsInDenominatorWhenEvalingMultiplication
			if (isinteger(p3) and !isinteger(stack[tos-1]) and isnegativenumber(stack[tos - 1]))
				# bail out,
				# we want to avoid going ahead with the subtraction of
				# the exponents, because that would turn a perfectly good
				# integer exponent in the denominator into a fractional one
				# i.e. a radical.
				# Note that this only prevents new radicals ending up
				# in the denominator, it doesn't fix existing ones.
				pop()
				pop()
				pop()

				push(p1); # p1 is A
				push(p3); #p3 is BASE
				divide()
				p1 = pop()

				break
		#console.log("__new radical exponent: " + stack[tos-1])

		list(3)
		stack[i] = pop()

	# reconstitute the coefficient

	push(p1); # p1 is A
	push(p2); # p2 is B
	divide()
	stack[h] = pop()

	restore()

# don't include i

# p is a U
__is_radical_number = (p) ->
	# don't use i

	if (car(p) == symbol(POWER) && isnum(cadr(p)) && isnum(caddr(p)) && !isminusone(cadr(p)))
		return 1
	else
		return 0

#-----------------------------------------------------------------------------
#
#	> a*hilbert(2)
#	((a,1/2*a),(1/2*a,1/3*a))
#
#	Note that "a" is presumed to be a scalar. Is this correct?
#
#	Yes, because "*" has no meaning if "a" is a tensor.
#	To multiply tensors, "dot" or "outer" should be used.
#
#	> dot(a,hilbert(2))
#	dot(a,((1,1/2),(1/2,1/3)))
#
#	In this case "a" could be a scalar or tensor so the result is not
#	expanded.
#
#-----------------------------------------------------------------------------


