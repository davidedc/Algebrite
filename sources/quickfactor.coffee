#-----------------------------------------------------------------------------
#
#	Factor small numerical powers
#
#	Input:		tos-2		Base (positive integer < 2^31 - 1)
#
#			tos-1		Exponent
#
#	Output:		Expr on stack
#
#-----------------------------------------------------------------------------



#define BASE p1
#define EXPO p2


quickfactor = ->
	i = 0
	save()

	p2 = pop(); # p2 is EXPO
	p1 = pop(); # p1 is BASE

	h = tos

	push(p1);  # p1 is BASE

	factor_small_number()

	n = tos - h

	stackIndex = h

	for i in [0...n] by 2
		push(stack[stackIndex+i]);		# factored base
		push(stack[stackIndex + i + 1]);		# factored exponent
		push(p2);  # p2 is EXPO
		multiply()
		quickpower()

	# stack has n results from factor_number_raw()

	# on top of that are all the expressions from quickpower()

	# multiply the quickpower() results

	multiply_all(tos - h - n)

	p1 = pop()

	moveTos h

	push(p1)

	restore()

# p1 (BASE) is a prime number so power is simpler

quickpower = ->
	expo = 0

	save()

	p2 = pop(); # p2 is EXPO
	p1 = pop();  # p1 is BASE

	push(p2); # p2 is EXPO
	bignum_truncate()
	p3 = pop()

	push(p2); # p2 is EXPO
	push(p3)
	subtract()
	p4 = pop()

	# fractional part of p2 (EXPO)

	if (!iszero(p4))
		push_symbol(POWER)
		push(p1);  # p1 is BASE
		push(p4)
		list(3)

	push(p3)
	expo = pop_integer()

	if (isNaN(expo))
		push_symbol(POWER)
		push(p1);  # p1 is BASE
		push(p3)
		list(3)
		restore()
		return

	if (expo == 0)
		restore()
		return

	push(p1);  # p1 is BASE
	bignum_power_number(expo)

	restore()

#if SELFTEST

