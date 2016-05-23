### Power function

	Input:		push	Base

			push	Exponent

	Output:		Result on stack
###


Eval_power = ->
	push(cadr(p1))
	Eval()
	push(caddr(p1))
	Eval()
	power()

power = ->
	save()
	yypower()
	restore()

yypower = ->
	n = 0

	p2 = pop() # exponent
	#console.log("EVALING THE BASE: " + stack[tos-1].toString())

	p1 = pop() # base

	# first, some very basic simplifications right away

	#	1 ^ a		->	1
	#	a ^ 0		->	1

	if (equal(p1, one) || iszero(p2))
		push(one)
		return

	#	a ^ 1		->	a

	if (equal(p2, one))
		push(p1)
		return


	if (isminusone(p1) and isminusone(p2))
		#console.log("************** replacing -1^1/2 with i *********** ")
		push(one)
		negate()
		return

	if (isminusone(p1) and (isoneovertwo(p2)))
		#console.log("************** replacing -1^1/2 with i *********** ")
		push(imaginaryunit)
		return

	if (isminusone(p1) and isminusoneovertwo(p2))
		#console.log("************** replacing -1^1/2 with i *********** ")
		push(imaginaryunit)
		negate()
		return


	# both base and exponent are rational numbers?

	if (isrational(p1) && isrational(p2))
		#console.log("isrational(p1) && isrational(p2)")
		push(p1)
		push(p2)
		qpow()
		return

	# both base and exponent are either rational or double?
	if (isnum(p1) && isnum(p2))
		#console.log("isnum(p1) && isnum(p2)")
		push(p1)
		push(p2)
		dpow()
		return

	if (istensor(p1))
		power_tensor()
		return

	if (p1 == symbol(E) && car(p2) == symbol(LOG))
		push(cadr(p2))
		return

	if (p1 == symbol(E) && isdouble(p2))
		push_double(Math.exp(p2.d))
		return


	#	(a * b) ^ c	->	(a ^ c) * (b ^ c)

	if (car(p1) == symbol(MULTIPLY))
		p1 = cdr(p1)
		push(car(p1))
		push(p2)
		power()
		p1 = cdr(p1)
		while (iscons(p1))
			push(car(p1))
			push(p2)
			power()
			multiply()
			p1 = cdr(p1)
		return

	#	(a ^ b) ^ c	->	a ^ (b * c)

	if (car(p1) == symbol(POWER))
		push(cadr(p1))
		push(caddr(p1))
		push(p2)
		multiply()
		power()
		return

	#	(a + b) ^ n	->	(a + b) * (a + b) ...

	if (expanding && isadd(p1) && isnum(p2))
		push(p2)
		n = pop_integer()
		if (n > 1 && n != 0x80000000)
			power_sum(n)
			return

	#	sin(x) ^ 2n -> (1 - cos(x) ^ 2) ^ n

	if (trigmode == 1 && car(p1) == symbol(SIN) && iseveninteger(p2))
		push_integer(1)
		push(cadr(p1))
		cosine()
		push_integer(2)
		power()
		subtract()
		push(p2)
		push_rational(1, 2)
		multiply()
		power()
		return

	#	cos(x) ^ 2n -> (1 - sin(x) ^ 2) ^ n

	if (trigmode == 2 && car(p1) == symbol(COS) && iseveninteger(p2))
		push_integer(1)
		push(cadr(p1))
		sine()
		push_integer(2)
		power()
		subtract()
		push(p2)
		push_rational(1, 2)
		multiply()
		power()
		return

	# complex number? (just number, not expression)

	if (iscomplexnumber(p1))

		# integer power?

		# n will be negative here, positive n already handled

		if (isinteger(p2))

			#               /        \  n
			#         -n   |  a - ib  |
			# (a + ib)   = | -------- |
			#              |   2   2  |
			#               \ a + b  /

			push(p1)
			conjugate()
			p3 = pop()
			push(p3)
			push(p3)
			push(p1)
			multiply()
			divide()
			push(p2)
			negate()
			power()
			return

		# noninteger or floating power?

		if (isnum(p2))
			push(p1)
			mag()
			push(p2)
			power()
			push_integer(-1)
			push(p1)
			arg()
			push(p2)
			multiply()
			if 	evaluatingAsFloats or (iscomplexnumberdouble(p1) and isdouble(p2))
				# remember that the "double" type is
				# toxic, i.e. it propagates, so we do
				# need to evaluate PI to its actual double
				# value
				push_double(Math.PI)
			else
				#console.log("power pushing PI when p1 is: " + p1 + " and p2 is:" + p2)
				push(symbol(PI))
			divide()
			power()
			multiply()

			# if we calculate the power making use of arctan:
			#  * it prevents nested radicals from being simplified
			#  * results become really hard to manipulate afterwards
			#  * we can't go back to other forms.
			# so leave the power as it is.
			if avoidCalculatingPowersIntoArctans
				if Find(stack[tos-1], symbol(ARCTAN))
					pop()
					push_symbol(POWER)
					push(p1)
					push(p2)
					list(3)

			return

			#
			#push(p1)
			#mag()
			#push(p2)
			#power()
			#push(symbol(E))
			#push(p1)
			#arg()
			#push(p2)
			#multiply()
			#push(imaginaryunit)
			#multiply()
			#power()
			#multiply()
			#

	if (simplify_polar())
		return

	push_symbol(POWER)
	push(p1)
	push(p2)
	list(3)

#-----------------------------------------------------------------------------
#
#	Compute the power of a sum
#
#	Input:		p1	sum
#
#			n	exponent
#
#	Output:		Result on stack
#
#	Note:
#
#	Uses the multinomial series (see Math World)
#
#                          n              n!          n1   n2       nk
#	(a1 + a2 + ... + ak)  = sum (--------------- a1   a2   ... ak  )
#	                             n1! n2! ... nk!
#
#	The sum is over all n1 ... nk such that n1 + n2 + ... + nk = n.
#
#-----------------------------------------------------------------------------

# first index is the term number 0..k-1, second index is the exponent 0..n

#define A(i, j) frame[(i) * (n + 1) + (j)]

power_sum = (n) ->
	a = []
	i = 0
	j = 0
	k = 0

	# number of terms in the sum

	k = length(p1) - 1

	# local frame

	push_frame(k * (n + 1))

	# array of powers

	p1 = cdr(p1)
	for i in [0...k]
		for j in [0..n]
			push(car(p1))
			push_integer(j)
			power()
			stack[frame + (i) * (n + 1) + (j)] = pop()
		p1 = cdr(p1)

	push_integer(n)
	factorial()
	p1 = pop()

	for i in [0...k]
		a[i] = 0

	push(zero)

	multinomial_sum(k, n, a, 0, n)

	pop_frame(k * (n + 1))

#-----------------------------------------------------------------------------
#
#	Compute multinomial sum
#
#	Input:		k	number of factors
#
#			n	overall exponent
#
#			a	partition array
#
#			i	partition array index
#
#			m	partition remainder
#
#			p1	n!
#
#			A	factor array
#
#	Output:		Result on stack
#
#	Note:
#
#	Uses recursive descent to fill the partition array.
#
#-----------------------------------------------------------------------------

#int k, int n, int *a, int i, int m
multinomial_sum = (k,n,a,i,m) ->
	j = 0

	if (i < k - 1)
		for j in [0..m]
			a[i] = j
			multinomial_sum(k, n, a, i + 1, m - j)
		return

	a[i] = m

	# coefficient

	push(p1)

	for j in [0...k]
		push_integer(a[j])
		factorial()
		divide()

	# factors

	for j in [0...k]
		push(stack[frame + (j) * (n + 1) + a[j]])
		multiply()

	add()

# exp(n/2 i pi) ?

# p2 is the exponent expression

# clobbers p3

simplify_polar = ->
	n = 0

	n = isquarterturn(p2)

	switch(n)
		when 0
			doNothing = 1
		when 1
			push_integer(1)
			return 1
		when 2
			push_integer(-1)
			return 1
		when 3
			push(imaginaryunit)
			return 1
		when 4
			push(imaginaryunit)
			negate()
			return 1

	if (car(p2) == symbol(ADD))
		p3 = cdr(p2)
		while (iscons(p3))
			n = isquarterturn(car(p3))
			if (n)
				break
			p3 = cdr(p3)
		switch (n)
			when 0
				return 0
			when 1
				push_integer(1)
			when 2
				push_integer(-1)
			when 3
				push(imaginaryunit)
			when 4
				push(imaginaryunit)
				negate()
		push(p2)
		push(car(p3))
		subtract()
		exponential()
		multiply()
		return 1

	return 0



