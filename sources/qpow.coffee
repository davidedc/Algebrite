# Rational power function



qpow = ->
	save()
	qpowf()
	restore()

#define BASE p1
#define EXPO p2

qpowf = ->
	expo = 0
	#unsigned int a, b, *t, *x, *y

	p2 = pop(); # p2 is EXPO
	p1 = pop(); # p1 is BASE

	# if base is 1 or exponent is 0 then return 1
	if (isplusone(p1) || iszero(p2))  # p1 is BASE  # p2 is EXPO
		push_integer(1)
		return

	# if (-1)^(1/2) -> leave it as is
	if (isminusone(p1) and isoneovertwo(p2))  # p1 is BASE  # p2 is EXPO
		push(imaginaryunit)
		return

	# if base is zero then return 0
	if (iszero(p1))  # p1 is BASE
		if (isnegativenumber(p2))  # p2 is EXPO
			stop("divide by zero")
		push(zero)
		return

	# if exponent is 1 then return base
	if (isplusone(p2))  # p2 is EXPO
		push(p1);  # p1 is BASE
		return

	# if exponent is integer then power
	if (isinteger(p2))  # p2 is EXPO
		push(p2);  # p2 is EXPO
		expo = pop_integer()
		if isNaN(expo)
			# expo greater than 32 bits
			push_symbol(POWER)
			push(p1);  # p1 is BASE
			push(p2);  # p2 is EXPO
			list(3)
			return

		x = mpow(p1.q.a, Math.abs(expo));  # p1 is BASE
		y = mpow(p1.q.b, Math.abs(expo)); # p1 is BASE
		if (expo < 0)
			t = x
			x = y
			y = t
			x = makeSignSameAs(x,y)
			y = makePositive(y)

		p3 = new U()
		p3.k = NUM
		p3.q.a = x
		p3.q.b = y
		push(p3)
		return

	# from here on out the exponent is NOT an integer

	# if base is -1 then normalize polar angle
	if (isminusone(p1))  # p1 is BASE
		push(p2);  # p2 is EXPO
		normalize_angle()
		return

	# if base is negative then (-N)^M -> N^M * (-1)^M
	if (isnegativenumber(p1))  # p1 is BASE
		push(p1);  # p1 is BASE
		negate()
		push(p2);  # p2 is EXPO
		qpow()

		push_integer(-1)
		push(p2);  # p2 is EXPO
		qpow()

		multiply()
		return

	# if p1 (BASE) is not an integer then power numerator and denominator
	if (!isinteger(p1))  # p1 is BASE
		push(p1);  # p1 is BASE
		mp_numerator()
		push(p2);  # p2 is EXPO
		qpow()
		push(p1);  # p1 is BASE
		mp_denominator()
		push(p2);  # p2 is EXPO
		negate()
		qpow()
		multiply()
		return

	# At this point p1 (BASE) is a positive integer.

	# If p1 (BASE) is small then factor it.
	if (is_small_integer(p1))  # p1 is BASE
		push(p1);  # p1 is BASE
		push(p2);  # p2 is EXPO
		quickfactor()
		return

	# At this point p1 (BASE) is a positive integer and p2 (EXPO) is not an integer.

	if ( !p2.q.a.isSmall || !p2.q.b.isSmall )  # p2 is EXPO
		push_symbol(POWER)
		push(p1)  # p1 is BASE
		push(p2);  # p2 is EXPO
		list(3)
		return

	a = p2.q.a;  # p2 is EXPO
	b = p2.q.b; # p2 is EXPO

	x = mroot(p1.q.a, b);  # p1 is BASE

	if (x == 0)
		push_symbol(POWER)
		push(p1);  # p1 is BASE
		push(p2);  # p2 is EXPO
		list(3)
		return

	y = mpow(x, a)

	#mfree(x)

	p3 = new U()

	p3.k = NUM

	if (p2.q.a.isNegative())  # p2 is EXPO
		p3.q.a = bigInt(1)
		p3.q.b = y
	else
		p3.q.a = y
		p3.q.b = bigInt(1)

	push(p3)

#-----------------------------------------------------------------------------
#
#	Normalize the angle of unit imaginary, i.e. (-1) ^ N
#
#	Input:		N on stack (must be rational, not float)
#
#	Output:		Result on stack
#
#	Note:
#
#	n = q * d + r
#
#	Example:
#						n	d	q	r
#
#	(-1)^(8/3)	->	 (-1)^(2/3)	8	3	2	2
#	(-1)^(7/3)	->	 (-1)^(1/3)	7	3	2	1
#	(-1)^(5/3)	->	-(-1)^(2/3)	5	3	1	2
#	(-1)^(4/3)	->	-(-1)^(1/3)	4	3	1	1
#	(-1)^(2/3)	->	 (-1)^(2/3)	2	3	0	2
#	(-1)^(1/3)	->	 (-1)^(1/3)	1	3	0	1
#
#	(-1)^(-1/3)	->	-(-1)^(2/3)	-1	3	-1	2
#	(-1)^(-2/3)	->	-(-1)^(1/3)	-2	3	-1	1
#	(-1)^(-4/3)	->	 (-1)^(2/3)	-4	3	-2	2
#	(-1)^(-5/3)	->	 (-1)^(1/3)	-5	3	-2	1
#	(-1)^(-7/3)	->	-(-1)^(2/3)	-7	3	-3	2
#	(-1)^(-8/3)	->	-(-1)^(1/3)	-8	3	-3	1
#
#-----------------------------------------------------------------------------

#define A p1
#define Q p2
#define R p3

normalize_angle = ->
	save()

	p1 = pop(); # p1 is A

	# integer exponent?

	if (isinteger(p1)) # p1 is A
		if (p1.q.a.isOdd()) # p1 is A
			push_integer(-1); # odd exponent
		else
			push_integer(1); # even exponent
		restore()
		return

	# floor

	push(p1); # p1 is A
	bignum_truncate()
	p2 = pop(); # p2 is Q

	if (isnegativenumber(p1)) # p1 is A
		push(p2)  # p2 is Q
		push_integer(-1)
		add()
		p2 = pop();  # p2 is Q

	# remainder (always positive)

	push(p1); # p1 is A
	push(p2);  # p2 is Q
	subtract()
	p3 = pop(); # p3 is R

	# remainder becomes new angle
	push_symbol(POWER)
	push_integer(-1)
	push(p3)  # p3 is R
	list(3)

	# negate if quotient is odd

	if (p2.q.a.isOdd())  # p2 is Q
		negate()

	restore()

is_small_integer = (p) ->
	return p.q.a.isSmall
