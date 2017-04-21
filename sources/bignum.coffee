


#double convert_rational_to_double(U *)
#double convert_bignum_to_double(unsigned int *)
#int ge(unsigned int *, unsigned int *, int)



mint = (a) ->
	return bigInt a


# b is +1 or -1, a is a bigint
setSignTo = (a,b) ->
	if a.isPositive()
		if b < 0
			return a.multiply bigInt -1
	else
		# a is negative
		if b > 0
			return a.multiply bigInt -1
	return a


makeSignSameAs = (a,b) ->
	if a.isPositive()
		if b.isNegative()
			return a.multiply bigInt -1
	else
		# a is negative
		if b.isPositive()
			return a.multiply bigInt -1
	return a

makePositive = (a) ->
	if a.isNegative()
		return a.multiply bigInt -1
	return a

# n is an int
###
mtotal = 0
MP_MIN_SIZE = 2
MP_MAX_FREE  = 1000

mnew = (n) ->
	if (n < MP_MIN_SIZE)
		n = MP_MIN_SIZE
	if (n == MP_MIN_SIZE && mfreecount)
		p = free_stack[--mfreecount]
	else
		p = [] #(unsigned int *) malloc((n + 3) * sizeof (int))
		#if (p == 0)
		#	stop("malloc failure")
	p[0] = n
	mtotal += n
	return p[3]
###

# p is the index of array of ints
# !!! array wasn't passed here
###
free_stack = []

mfree = (array, p) ->
	p -= 3
	mtotal -= array[p]
	if (array[p] == MP_MIN_SIZE && mfreecount < MP_MAX_FREE)
		free_stack[mfreecount++] = p
	else
		free(p)
###

# convert int to bignum

# n is an int
###
mint = (n) ->
	p = mnew(1)
	if (n < 0)
		# !!! this is FU
		# MSIGN(p) = -1
		fu = true
	else
		# !!! this is FU
		#MSIGN(p) = 1
		fu = true
	# !!! this is FU
	#MLENGTH(p) = 1
	p[0] = Math.abs(n)
	return p
###

# copy bignum

# a is an array of ints
###
mcopy = (a) ->
	#unsigned int *b

	b = mnew(MLENGTH(a))

	# !!! fu
	#MSIGN(b) = MSIGN(a)
	#MLENGTH(b) = MLENGTH(a)

	for i in [0...MLENGTH(a)]
		b[i] = a[i]

	return b
###


###
# 
# ge not invoked from anywhere - is you need ge
# just use the bigNum's ge implementation
# leaving it here just in case I decide to backport to C
#
# a >= b ?
# and and b arrays of ints, len is an int
ge = (a, b, len) ->
	i = 0
	for i in [0...len]
		if (a[i] == b[i])
			continue
		else
			break
	if (a[i] >= b[i])
		return 1
	else
		return 0
###

add_numbers = ->
	a = 1.0
	b = 1.0

	#if DEBUG then console.log("add_numbers adding numbers: " + print_list(stack[tos - 1]) + " and " + print_list(stack[tos - 2]))

	if (isrational(stack[tos - 1]) && isrational(stack[tos - 2]))
		qadd()
		return

	save()

	p2 = pop()
	p1 = pop()

	if (isdouble(p1))
		a = p1.d
	else
		a = convert_rational_to_double(p1)

	if (isdouble(p2))
		b = p2.d
	else
		b = convert_rational_to_double(p2)

	theResult = a+b
	push_double(theResult)

	restore()

subtract_numbers = ->
	a = 0.0
	b = 0.0

	if (isrational(stack[tos - 1]) && isrational(stack[tos - 2]))
		qsub()
		return

	save()

	p2 = pop()
	p1 = pop()

	if (isdouble(p1))
		a = p1.d
	else
		a = convert_rational_to_double(p1)

	if (isdouble(p2))
		b = p2.d
	else
		b = convert_rational_to_double(p2)

	push_double(a - b)

	restore()

multiply_numbers = ->
	a = 0.0
	b = 0.0

	if (isrational(stack[tos - 1]) && isrational(stack[tos - 2]))
		qmul()
		return

	save()

	p2 = pop()
	p1 = pop()

	if (isdouble(p1))
		a = p1.d
	else
		a = convert_rational_to_double(p1)

	if (isdouble(p2))
		b = p2.d
	else
		b = convert_rational_to_double(p2)

	push_double(a * b)

	restore()

divide_numbers = ->
	a = 0.0
	b = 0.0

	if (isrational(stack[tos - 1]) && isrational(stack[tos - 2]))
		qdiv()
		return

	save()

	p2 = pop()
	p1 = pop()

	if (iszero(p2))
		stop("divide by zero")

	if (isdouble(p1))
		a = p1.d
	else
		a = convert_rational_to_double(p1)

	if (isdouble(p2))
		b = p2.d
	else
		b = convert_rational_to_double(p2)

	push_double(a / b)

	restore()

invert_number = ->
	#unsigned int *a, *b

	save()

	p1 = pop()

	if (iszero(p1))
		stop("divide by zero")

	if (isdouble(p1))
		push_double(1 / p1.d)
		restore()
		return

	a = bigInt(p1.q.a)
	b = bigInt(p1.q.b)

	b = makeSignSameAs(b,a)
	a = setSignTo(a,1)

	p1 = new U()
	p1.k = NUM
	p1.q.a = b
	p1.q.b = a

	push(p1)

	restore()

# a and b are Us
compare_rationals = (a, b) ->
	t = 0
	#unsigned int *ab, *ba
	ab = mmul(a.q.a, b.q.b)
	ba = mmul(a.q.b, b.q.a)
	t = mcmp(ab, ba)
	return t

# a and b are Us
compare_numbers = (a,b) ->
	x = 0.0
	y = 0.0
	if (isrational(a) && isrational(b))
		return compare_rationals(a, b)
	if (isdouble(a))
		x = a.d
	else
		x = convert_rational_to_double(a)
	if (isdouble(b))
		y = b.d
	else
		y = convert_rational_to_double(b)
	if (x < y)
		return -1
	if (x > y)
		return 1
	return 0

negate_number = ->
	save()
	p1 = pop()
	if (iszero(p1))
		push(p1)
		restore()
		return

	switch (p1.k)
		when NUM
			p2 = new U()
			p2.k = NUM
			p2.q.a = bigInt(p1.q.a.multiply(bigInt.minusOne))
			p2.q.b = bigInt(p1.q.b)
			push(p2)
		when DOUBLE
			push_double(-p1.d)
		else
			stop("bug caught in mp_negate_number")
	restore()

bignum_truncate = ->
	#unsigned int *a

	save()

	p1 = pop()

	a = mdiv(p1.q.a, p1.q.b)

	p1 = new U()

	p1.k = NUM

	p1.q.a = a
	p1.q.b = bigInt(1)

	push(p1)

	restore()

mp_numerator = ->
	save()

	p1 = pop()

	if (p1.k != NUM)
		push(one)
		restore()
		return

	p2 = new U()

	p2.k = NUM

	p2.q.a = bigInt(p1.q.a)
	p2.q.b = bigInt(1)

	push(p2)

	restore()

mp_denominator = ->
	save()

	p1 = pop()

	if (p1.k != NUM)
		push(one)
		restore()
		return

	p2 = new U()
	p2.k = NUM
	p2.q.a = bigInt(p1.q.b)
	p2.q.b = bigInt(1)

	push(p2)

	restore()

# expo is an integer
bignum_power_number = (expo) ->
	#unsigned int *a, *b, *t

	save()

	p1 = pop()

	a = mpow(p1.q.a, Math.abs(expo))
	b = mpow(p1.q.b, Math.abs(expo))

	if (expo < 0)
		# swap a and b
		t = a
		a = b
		b = t

		a = makeSignSameAs(a,b)
		b = setSignTo(b,1)

	p1 = new U()

	p1.k = NUM

	p1.q.a = a
	p1.q.b = b

	push(p1)

	restore()

# p an array of ints
convert_bignum_to_double = (p) ->
	return p.toJSNumber()

# p is a U
convert_rational_to_double = (p) ->
	if !p.q?
		debugger
	quotientAndRemainder = p.q.a.divmod(p.q.b)
	result = quotientAndRemainder.quotient + quotientAndRemainder.remainder / p.q.b.toJSNumber()

	return result

# n an integer
push_integer = (n) ->
	if DEBUG then console.log "pushing integer " + n
	save()
	p1 = new U()
	p1.k = NUM
	p1.q.a = bigInt(n)
	p1.q.b = bigInt(1)
	push(p1)
	restore()

# d a double
push_double = (d) ->
	save()
	p1 = new U()
	p1.k = DOUBLE
	p1.d = d
	push(p1)
	restore()

# a,b parts of a rational
push_rational = (a,b) ->
	###
	save()
	p1 = new U()
	p1.k = NUM
	p1.q.a = bigInt(a)
	p1.q.b = bigInt(b)
	## FIXME -- normalize ##
	push(p1)
	restore()
	###

	p = new U()
	p.k = NUM
	p.q.a = bigInt(a)
	p.q.b = bigInt(b)
	push(p)

pop_integer = ->
	n = NaN

	save()

	p1 = pop()

	switch (p1.k)

		when NUM
			if (isinteger(p1) && p1.q.a.isSmall)
				n = p1.q.a.toJSNumber()

		when DOUBLE
			if DEBUG
				console.log "popping integer but double is found"
			if Math.floor(p1.d) == p1.d
				if DEBUG
					console.log "...altough it's an integer"
				n = p1.d

	restore()
	return n

# p is a U, flag is an int
print_double = (p,flag) ->
	accumulator = ""
	buf = doubleToReasonableString(p.d)
	if (flag == 1 && buf == '-')
		accumulator += print_str(buf + 1)
	else
		accumulator += print_str(buf)
	return accumulator

# s is a string
bignum_scan_integer = (s) ->
	#unsigned int *a
	#char sign

	save()
	scounter = 0

	sign_ = s[scounter]

	if (sign_ == '+' || sign_ == '-')
		scounter++

	# !!!! some mess in here, added an argument
	a = bigInt(s.substring(scounter))

	p1 = new U()

	p1.k = NUM

	p1.q.a = a
	p1.q.b = bigInt(1)

	push(p1)

	if (sign_ == '-')
		negate()

	restore()

# s a string
bignum_scan_float = (s) ->
	push_double(parseFloat(s))

# gives the capability of printing the unsigned
# value. This is handy because printing of the sign
# might be taken care of "upstream"
# e.g. when printing a base elevated to a negative exponent
# prints the inverse of the base powered to the unsigned
# exponent.
# p is a U
print_number = (p, signed) ->
	accumulator = ""

	denominatorString = ""
	buf = ""
	switch (p.k)
		when NUM
			aAsString = p.q.a.toString()
			if !signed
				if aAsString[0] == "-"
					aAsString = aAsString.substring(1)

			if (printMode == PRINTMODE_LATEX and isfraction(p))
				aAsString = "\\frac{"+aAsString+"}{"

			accumulator += aAsString

			if (isfraction(p))
				if printMode != PRINTMODE_LATEX
					accumulator += ("/")
				denominatorString = p.q.b.toString()
				if printMode == PRINTMODE_LATEX then denominatorString += "}"

				accumulator += denominatorString

		when DOUBLE
			aAsString = doubleToReasonableString(p.d)
			if !signed
				if aAsString[0] == "-"
					aAsString = aAsString.substring(1)

			accumulator += aAsString

	return accumulator

gcd_numbers = ->
	save()

	p2 = pop()
	p1 = pop()

#	if (!isinteger(p1) || !isinteger(p2))
#		stop("integer args expected for gcd")

	p3 = new U()

	p3.k = NUM

	p3.q.a = mgcd(p1.q.a, p2.q.a)
	p3.q.b = mgcd(p1.q.b, p2.q.b)

	p3.q.a = setSignTo(p3.q.a,1)

	push(p3)

	restore()

pop_double = ->
	d = 0.0
	save()
	p1 = pop()
	switch (p1.k)
		when NUM
			d = convert_rational_to_double(p1)
		when DOUBLE
			d = p1.d
		else
			d = 0.0
	restore()
	return d

bignum_float = ->
	d = 0.0
	d = convert_rational_to_double(pop())
	push_double(d)

#static unsigned int *__factorial(int)

# n is an int
bignum_factorial = (n) ->
	save()
	p1 = new U()
	p1.k = NUM
	p1.q.a = __factorial(n)
	p1.q.b = bigInt(1)
	push(p1)
	restore()

# n is an int
__factorial = (n) ->
	i = 0
	#unsigned int *a, *b, *t

	if (n == 0 || n == 1)
		a = bigInt(1)
		return a

	a = bigInt(2)

	b = bigInt(0)

	if 3 <= n
		for i in [3..n]
			b = bigInt(i)
			t = mmul(a, b)
			a = t


	return a

mask = [
	0x00000001,
	0x00000002,
	0x00000004,
	0x00000008,
	0x00000010,
	0x00000020,
	0x00000040,
	0x00000080,
	0x00000100,
	0x00000200,
	0x00000400,
	0x00000800,
	0x00001000,
	0x00002000,
	0x00004000,
	0x00008000,
	0x00010000,
	0x00020000,
	0x00040000,
	0x00080000,
	0x00100000,
	0x00200000,
	0x00400000,
	0x00800000,
	0x01000000,
	0x02000000,
	0x04000000,
	0x08000000,
	0x10000000,
	0x20000000,
	0x40000000,
	0x80000000,
]

# unsigned int *x, unsigned int k
mp_set_bit = (x, k) ->
	console.log "not implemented yet"
	debugger
	x[k / 32] |= mask[k % 32]

# unsigned int *x, unsigned int k
mp_clr_bit = (x,k) ->
	console.log "not implemented yet"
	debugger
	x[k / 32] &= ~mask[k % 32]

# unsigned int *a
mshiftright = (a) ->
	a = a.shiftRight()

