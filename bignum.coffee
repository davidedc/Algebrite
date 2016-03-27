#include "stdafx.h"
#include "defs.h"

MP_MIN_SIZE = 2
MP_MAX_FREE  = 1000

#double convert_rational_to_double(U *)
#double convert_bignum_to_double(unsigned int *)
#int ge(unsigned int *, unsigned int *, int)

mtotal = 0
free_stack = []

makeSignSameAs = (a,b) ->
	if a.isPositive
		if b.isNegative
			b = b.multiply bigInt -1
	else
		# a is negative
		if b.isPositive
			b = b.multiply bigInt -1

makePositive = (a) ->
	if a.isNegative
		a = a.multiply bigInt -1

# n is an int
###
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

# a >= b ?

# and and b arrays of ints, len is an int
ge = (a, b, len) ->
	debugger
	for i in [0...len]
		if (a[i] == b[i])
			continue
		else
			break
	if (a[i] >= b[i])
		return 1
	else
		return 0

add_numbers = ->
	double a, b

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

	push_double(a + b)

	restore()

subtract_numbers = ->
	double a, b

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
	double a, b

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

	# !!! fu
	#MSIGN(b) = MSIGN(a)
	# MSIGN(a) = 1

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
			p2.q.a = bigInt(p1.q.a)
			p2.q.b = bigInt(p1.q.b)
			# !!! fu
			#MSIGN(p2.q.a) *= -1
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

	a = mpow(p1.q.a, abs(expo))
	b = mpow(p1.q.b, abs(expo))

	if (expo < 0)
		t = a
		a = b
		b = t
		# !!! fu
		#MSIGN(a) = MSIGN(b)
		# !!! fu
		#MSIGN(b) = 1

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
	console.log '!!!! convert_rational_to_double not properly translated due to MLENGTH'
	i = 0
	n = 0
	na = 0
	nb = 0
	a = 0.0
	b = 0.0

	na = MLENGTH(p.q.a)
	nb = MLENGTH(p.q.b)

	if (na < nb)
		n = na
	else
		n = nb

	for i in [0...n]
		a = a / 4294967296.0 + p.q.a[i]
		b = b / 4294967296.0 + p.q.b[i]

	if (na > nb)
		for i in [nb...na]
			a = a / 4294967296.0 + p.q.a[i]
			b = b / 4294967296.0

	if (na < nb)
		for i in [na...nb]
			a = a / 4294967296.0
			b = b / 4294967296.0 + p.q.b[i]

	if (MSIGN(p.q.a) == -1)
		a = -a

	return a / b

# n an integer
push_integer = (n) ->
	console.log "pushing integer " + n
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
	n = 0

	save()

	p1 = pop()

	switch (p1.k)

		when NUM
			if (isinteger(p1) && p1.q.a.isSmall())
				n = p1.q.a[0]
				if (n & 0x80000000)
					n = 0x80000000
				else
					n *= MSIGN(p1.q.a)
			else
				n = 0x80000000

		when DOUBLE
			n = Math.floor(p1.d)
			if (n != p1.d)
				n = 0x80000000

		else
			n = 0x80000000

	restore()
	return n

# p is a U, flag is an int
print_double = (p,flag) ->
	buf = ""
	buf = "" + p.d
	if (flag == 1 && buf == '-')
		# !!!! passing a pointer willy-nilly
		print_str(buf + 1)
	else
		print_str(buf)

# s is a string
bignum_scan_integer = (s) ->
	#unsigned int *a
	#char sign

	save()
	scounter = 0

	sign = s[scounter]

	if (sign == '+' || sign == '-')
		scounter++

	# !!!! some mess in here, added an argument
	a = bigInt(s.substring(scounter))

	p1 = new U()

	p1.k = NUM

	p1.q.a = a
	p1.q.b = bigInt(1)

	push(p1)

	if (sign == '-')
		negate()

	restore()

# s a string
bignum_scan_float = (s) ->
	push_double(atof(s))

# print as unsigned

# p is a U
print_number = (p) ->
	s = ""
	buf = ""
	switch (p.k)
		when NUM
			s = p.q.a.toString()
			console.log(s)
			if (isfraction(p))
				console.log("/")
				s = p.q.b.toString()
				console.log(s)
		when DOUBLE
			console.log(p,d)

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

	# !!! fu
	#MSIGN(p3.q.a) = 1

	push(p3)

	restore()

pop_double = ->
	double d
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
	double d
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
	int i
	#unsigned int *a, *b, *t

	if (n == 0 || n == 1)
		a = bigInt(1)
		return a

	a = bigInt(2)

	b = bigInt(0)

	for i in [3..n]
		b[0] = Math.floor(i)
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
	x[k / 32] |= mask[k % 32]

# unsigned int *x, unsigned int k
mp_clr_bit = (x,k) ->
	x[k / 32] &= ~mask[k % 32]

# unsigned int *a
mshiftright = (a) ->
	n = MLENGTH(a)
	c = 0
	for i in [0...n]
		if (a[i] & 1)
			a[i] = (a[i] >> 1) | c
			c = 0x80000000
		else
			a[i] = (a[i] >> 1) | c
			c = 0
	if (n > 1 && a[n - 1] == 0)
		# !!! fu
		#MLENGTH(a) = n - 1
		fu = true
