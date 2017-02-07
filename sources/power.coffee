### Power function

	Input:		push	Base

			push	Exponent

	Output:		Result on stack
###

DEBUG_POWER = false

Eval_power = ->
	if DEBUG_POWER then debugger
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
	if DEBUG_POWER then debugger
	n = 0

	p2 = pop() # exponent
	p1 = pop() # base

	inputExp = p2
	inputBase = p1
	#debugger

	if DEBUG_POWER
		console.log("POWER: " + p1 + " ^ " + p2)

	# first, some very basic simplifications right away

	#	1 ^ a		->	1
	#	a ^ 0		->	1
	if (equal(p1, one) || iszero(p2))
		if evaluatingAsFloats then push_double(1.0) else push(one)
		if DEBUG_POWER then console.log "   power of " + inputBase + " ^ " + inputExp + ": " + stack[tos-1]
		return

	#	a ^ 1		->	a
	if (equal(p2, one))
		push(p1)
		if DEBUG_POWER then console.log "   power of " + inputBase + " ^ " + inputExp + ": " + stack[tos-1]
		return

	#   -1 ^ -1		->	-1
	if (isminusone(p1) and isminusone(p2))
		if evaluatingAsFloats then push_double(1.0) else push(one)
		negate()
		if DEBUG_POWER then console.log "   power of " + inputBase + " ^ " + inputExp + ": " + stack[tos-1]
		return

	#   -1 ^ 1/2	->	i
	if (isminusone(p1) and (isoneovertwo(p2)))
		push(imaginaryunit)
		if DEBUG_POWER then console.log "   power of " + inputBase + " ^ " + inputExp + ": " + stack[tos-1]
		return

	#   -1 ^ -1/2	->	-i
	if (isminusone(p1) and isminusoneovertwo(p2))
		push(imaginaryunit)
		negate()
		if DEBUG_POWER then console.log "   power of " + inputBase + " ^ " + inputExp + ": " + stack[tos-1]
		return

	#   -1 ^ rational
	if (isminusone(p1) and !isdouble(p1) and isrational(p2) and !isinteger(p2) and ispositivenumber(p2) and !evaluatingAsFloats)
		if DEBUG_POWER then console.log("   power: -1 ^ rational")
		if DEBUG_POWER then console.log " trick: p2.q.a , p2.q.b " + p2.q.a + " , " + p2.q.b 
		if p2.q.a < p2.q.b
			push_symbol(POWER)
			push(p1)
			push(p2)
			list(3)
		else
			push_symbol(MULTIPLY)
			
			push(p1)

			push_symbol(POWER)
			push(p1)
			push_rational(p2.q.a.mod(p2.q.b), p2.q.b)
			list(3)

			list(3)
			if DEBUG_POWER then console.log " trick applied : " + stack[tos-1]

		# evaluates clock form into
		# rectangular form. This seems to give
		# slightly better form to some test results.
		rect()
		if DEBUG_POWER then console.log "   power of " + inputBase + " ^ " + inputExp + ": " + stack[tos-1]
		return


	# both base and exponent are rational numbers?

	if (isrational(p1) && isrational(p2))
		if DEBUG_POWER then console.log("   power: isrational(p1) && isrational(p2)")
		push(p1)
		push(p2)
		qpow()
		if DEBUG_POWER then console.log "   power of " + inputBase + " ^ " + inputExp + ": " + stack[tos-1]
		return

	# both base and exponent are either rational or double?
	if (isnum(p1) && isnum(p2))
		if DEBUG_POWER then console.log "   power: both base and exponent are either rational or double "
		if DEBUG_POWER then console.log("POWER - isnum(p1) && isnum(p2)")
		push(p1)
		push(p2)
		dpow()
		if DEBUG_POWER then console.log "   power of " + inputBase + " ^ " + inputExp + ": " + stack[tos-1]
		return

	if (istensor(p1))
		if DEBUG_POWER then console.log "   power: istensor(p1) "
		power_tensor()
		if DEBUG_POWER then console.log "   power of " + inputBase + " ^ " + inputExp + ": " + stack[tos-1]
		return

	# if we only assume variables to be real, then |a|^2 = a^2
	# (if x is complex this doesn't hold e.g. i, which makes 1 and -1
	if (car(p1) == symbol(ABS) && iseveninteger(p2) and !iszero(get_binding(symbol(ASSUME_REAL_VARIABLES))))
		if DEBUG_POWER then console.log "   power: even power of absolute of real value "
		push(cadr(p1))
		push(p2)
		power()
		if DEBUG_POWER then console.log "   power of " + inputBase + " ^ " + inputExp + ": " + stack[tos-1]
		return

	# e^log(...)
	if (p1 == symbol(E) && car(p2) == symbol(LOG))
		push(cadr(p2))
		if DEBUG_POWER then console.log "   power of " + inputBase + " ^ " + inputExp + ": " + stack[tos-1]
		return

	# e^some_float
	if (p1 == symbol(E) && isdouble(p2))
		if DEBUG_POWER then console.log "   power: p1 == symbol(E) && isdouble(p2) "
		push_double(Math.exp(p2.d))
		if DEBUG_POWER then console.log "   power of " + inputBase + " ^ " + inputExp + ": " + stack[tos-1]
		return

	# complex number in exponential form, get it to rectangular
	# but only if we are not in the process of calculating a polar form,
	# otherwise we'd just undo the work we want to do
	if (p1 == symbol(E) && Find(p2, imaginaryunit) != 0 and Find(p2, symbol(PI))!= 0 and !evaluatingPolar)
		push_symbol(POWER)
		push(p1)
		push(p2)
		list(3)
		if DEBUG_POWER then console.log "   power: turning complex exponential to rect: " + stack[tos-1]
		rect()

		hopefullySimplified = pop(); # put new (hopefully simplified expr) in p2
		if Find(hopefullySimplified, symbol(PI)) == 0
			if DEBUG_POWER then console.log "   power: turned complex exponential to rect: " + hopefullySimplified
			push hopefullySimplified
			return


	#	(a * b) ^ c	->	(a ^ c) * (b ^ c)
	# note that we can't in general do this, for example
	# sqrt(x*y) != x^(1/2) y^(1/2) (counterexample" x = -1 and y = -1)
	# BUT we can carve-out here some cases where this
	# transformation is correct

	if (car(p1) == symbol(MULTIPLY) && isinteger(p2))
		if DEBUG_POWER then console.log "   power: (a * b) ^ c	->	(a ^ c) * (b ^ c) "
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
		if DEBUG_POWER then console.log "   power of " + inputBase + " ^ " + inputExp + ": " + stack[tos-1]
		return

	# (a ^ b) ^ c	->	a ^ (b * c)
	# note that we can't in general do this, for example
	# sqrt(x^y) !=  x^(1/2 y) (counterexample x = -1)
	# BUT we can carve-out here some cases where this
	# transformation is correct


	# simple numeric check to see if a is a number > 0
	is_a_moreThanZero = false
	if isnum(cadr(p1))
		is_a_moreThanZero = sign(compare_numbers(cadr(p1), zero))

	if (car(p1) == symbol(POWER) && (
	  isinteger(p2) or # when c is an integer
	  is_a_moreThanZero # when a is >= 0
	 ))
		push(cadr(p1))
		push(caddr(p1))
		push(p2)
		multiply()
		power()
		if DEBUG_POWER then console.log "   power of " + inputBase + " ^ " + inputExp + ": " + stack[tos-1]
		return

	b_isEven_and_c_isItsInverse = false
	if iseveninteger(caddr(p1))
		push caddr(p1)
		push p2
		multiply()

		isThisOne = pop()
		if isone(isThisOne)
			b_isEven_and_c_isItsInverse = true

	if (car(p1) == symbol(POWER) && b_isEven_and_c_isItsInverse)
		if DEBUG_POWER then console.log "   power: car(p1) == symbol(POWER) && b_isEven_and_c_isItsInverse "
		push(cadr(p1))
		abs()
		if DEBUG_POWER then console.log "   power of " + inputBase + " ^ " + inputExp + ": " + stack[tos-1]
		return


	#	when expanding,
	#	(a + b) ^ n	->	(a + b) * (a + b) ...

	if (expanding && isadd(p1) && isnum(p2))
		push(p2)
		n = pop_integer()
		if (n > 1 && !isNaN(n))
			if DEBUG_POWER then console.log "   power: expanding && isadd(p1) && isnum(p2) "
			power_sum(n)
			if DEBUG_POWER then console.log "   power of " + inputBase + " ^ " + inputExp + ": " + stack[tos-1]
			return

	#	sin(x) ^ 2n -> (1 - cos(x) ^ 2) ^ n

	if (trigmode == 1 && car(p1) == symbol(SIN) && iseveninteger(p2))
		if DEBUG_POWER then console.log "   power: trigmode == 1 && car(p1) == symbol(SIN) && iseveninteger(p2) "
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
		if DEBUG_POWER then console.log "   power of " + inputBase + " ^ " + inputExp + ": " + stack[tos-1]
		return

	#	cos(x) ^ 2n -> (1 - sin(x) ^ 2) ^ n

	if (trigmode == 2 && car(p1) == symbol(COS) && iseveninteger(p2))
		if DEBUG_POWER then console.log "   power: trigmode == 2 && car(p1) == symbol(COS) && iseveninteger(p2) "
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
		if DEBUG_POWER then console.log "   power of " + inputBase + " ^ " + inputExp + ": " + stack[tos-1]
		return


	# complex number? (just number, not expression)


	if (iscomplexnumber(p1))

		if DEBUG_POWER then console.log " power - handling the case (a + ib) ^ n"
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

			# gets the denominator
			push(p3)
			push(p1)
			multiply()
			
			divide()

			if !isone(p2)
				push(p2)
				negate()
				power()
			
			if DEBUG_POWER then console.log "   power of " + inputBase + " ^ " + inputExp + ": " + stack[tos-1]
			return

		# noninteger or floating power?

		if (isnum(p2))
			push(p1)
			abs()
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

			if DEBUG_POWER then console.log "   power of " + inputBase + " ^ " + inputExp + ": " + stack[tos-1]
			return

			#
			#push(p1)
			#abs()
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
		if DEBUG_POWER then console.log "   power: using simplify_polar"
		return



	if DEBUG_POWER then console.log "   power: nothing can be done "
	push_symbol(POWER)
	push(p1)
	push(p2)
	list(3)
	if DEBUG_POWER then console.log "   power of " + inputBase + " ^ " + inputExp + ": " + stack[tos-1]

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



