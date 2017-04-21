# Factor a polynomial




#define POLY p1
#define X p2
#define Z p3
#define A p4
#define B p5
#define Q p6
#define RESULT p7
#define FACTOR p8

polycoeff = 0
factpoly_expo = 0

factorpoly = ->
	save()

	p2 = pop()
	p1 = pop()

	if (!Find(p1, p2))
		push(p1)
		restore()
		return

	if (!ispoly(p1, p2))
		push(p1)
		restore()
		return

	if (!issymbol(p2))
		push(p1)
		restore()
		return

	push(p1)
	push(p2)
	yyfactorpoly()

	restore()

#-----------------------------------------------------------------------------
#
#	Input:		tos-2		true polynomial
#
#			tos-1		free variable
#
#	Output:		factored polynomial on stack
#
#-----------------------------------------------------------------------------

yyfactorpoly = ->
	h = 0
	i = 0

	save()

	p2 = pop()
	p1 = pop()

	h = tos

	if (isfloating(p1))
		stop("floating point numbers in polynomial")

	polycoeff = tos

	push(p1)
	push(p2)
	factpoly_expo = coeff() - 1

	rationalize_coefficients(h)

	# for univariate polynomials we could do factpoly_expo > 1

	whichRootsAreWeFinding = "real"
	remainingPoly = null
	while (factpoly_expo > 0)

		if (iszero(stack[polycoeff+0]))
			push_integer(1)
			p4 = pop()
			push_integer(0)
			p5 = pop()
		else
			#console.log("trying to find a " + whichRootsAreWeFinding + " root")
			if whichRootsAreWeFinding == "real"
				foundRealRoot = get_factor_from_real_root()
			else if whichRootsAreWeFinding == "complex"
				foundComplexRoot = get_factor_from_complex_root(remainingPoly)

		if whichRootsAreWeFinding == "real"
			if foundRealRoot == 0
				whichRootsAreWeFinding = "complex"
				continue
			else
				# build the 1-degree polynomial out of the
				# real solution that was just found.
				push(p4) # A
				push(p2) # x
				multiply()
				push(p5) # B
				add()
				p8 = pop()

				if (DEBUG)
					console.log("success\nFACTOR=" + p8)

				# factor out negative sign (not req'd because p4 > 1)
				#if 0
				###
				if (isnegativeterm(p4))
					push(p8)
					negate()
					p8 = pop()
					push(p7)
					negate_noexpand()
					p7 = pop()
				###
				#endif
				
				# p7 is the part of the polynomial that was factored so far,
				# add the newly found factor to it. Note that we are not actually
				# multiplying the polynomials fully, we are just leaving them
				# expressed as (P1)*(P2), we are not expanding the product.
				push(p7)
				push(p8)
				multiply_noexpand()
				p7 = pop()

				# ok now on stack we have the coefficients of the
				# remaining part of the polynomial still to factor.
				# Divide it by the newly-found factor so that
				# the stack then contains the coefficients of the
				# polynomial part still left to factor.
				yydivpoly()

				while (factpoly_expo and iszero(stack[polycoeff+factpoly_expo]))
					factpoly_expo--

				push(zero)
				for i in [0..factpoly_expo]
					push(stack[polycoeff+i])
					push(p2) # the free variable
					push_integer(i)
					power()
					multiply()
					add()
				remainingPoly = pop()
				#console.log("real branch remainingPoly: " + remainingPoly)

		else if whichRootsAreWeFinding == "complex"
			if foundComplexRoot == 0
				break
			else
				# build the 2-degree polynomial out of the
				# real solution that was just found.
				push(p4) # A
				push(p2) # x
				subtract()
				#console.log("first factor: " + stack[tos-1].toString())

				push(p4) # A
				conjugate()
				push(p2) # x
				subtract()
				#console.log("second factor: " + stack[tos-1].toString())

				multiply()

				#if (factpoly_expo > 0 && isnegativeterm(stack[polycoeff+factpoly_expo]))
				#	negate()
				#	negate_noexpand()
					
				p8 = pop()

				if (DEBUG)
					console.log("success\nFACTOR=" + p8)

				# factor out negative sign (not req'd because p4 > 1)
				#if 0
				###
				if (isnegativeterm(p4))
					push(p8)
					negate()
					p8 = pop()
					push(p7)
					negate_noexpand()
					p7 = pop()
				###
				#endif
				
				# p7 is the part of the polynomial that was factored so far,
				# add the newly found factor to it. Note that we are not actually
				# multiplying the polynomials fully, we are just leaving them
				# expressed as (P1)*(P2), we are not expanding the product.

				push(p7)
				previousFactorisation = pop()

				#console.log("previousFactorisation: " + previousFactorisation)

				push(p7)
				push(p8)
				multiply_noexpand()
				p7 = pop()

				#console.log("new prospective factorisation: " + p7)


				# build the polynomial of the unfactored part
				#console.log("build the polynomial of the unfactored part factpoly_expo: " + factpoly_expo)
				
				if !remainingPoly?
					push(zero)
					for i in [0..factpoly_expo]
						push(stack[polycoeff+i])
						push(p2) # the free variable
						push_integer(i)
						power()
						multiply()
						add()
					remainingPoly = pop()
				#console.log("original polynomial (dividend): " + remainingPoly)

				dividend = remainingPoly
				#push(dividend)
				#degree()
				#startingDegree = pop()
				push(dividend)

				#console.log("dividing " + stack[tos-1].toString() + " by " + p8)
				push(p8) # divisor
				push(p2) # X
				divpoly()
				remainingPoly = pop()

				push(remainingPoly)
				push(p8) # divisor
				multiply()
				checkingTheDivision = pop()

				if !equal(checkingTheDivision, dividend)

					#push(dividend)
					#gcd_expr()
					#console.log("gcd top of stack: " + stack[tos-1].toString())


					if DEBUG then console.log("we found a polynomial based on complex root and its conj but it doesn't divide the poly, quitting")
					if DEBUG then console.log("so just returning previousFactorisation times dividend: " + previousFactorisation + " * " + dividend)
					push(previousFactorisation)
					push(dividend)

					prev_expanding = expanding
					expanding = 0
					yycondense()
					expanding = prev_expanding

					multiply_noexpand()
					p7 = pop()
					stack[h] = p7
					moveTos h + 1
					restore()
					return

				#console.log("result: (still to be factored) " + remainingPoly)

				#push(remainingPoly)
				#degree()
				#remainingDegree = pop()

				###
				if compare_numbers(startingDegree, remainingDegree)
					# ok even if we found a complex root that
					# together with the conjugate generates a poly in Z,
					# that doesn't mean that the division would end up in Z.
					# Example: 1+x^2+x^4+x^6 has +i and -i as one of its roots
					# so a factor is 1+x^2 ( = (x+i)*(x-i))
					# BUT 
				###


				for i in [0..factpoly_expo]
					pop()

				push(remainingPoly)
				push(p2)
				coeff()


				factpoly_expo -= 2
				#console.log("factpoly_expo: " + factpoly_expo)


	# build the remaining unfactored part of the polynomial

	push(zero)
	for i in [0..factpoly_expo]
		push(stack[polycoeff+i])
		push(p2) # the free variable
		push_integer(i)
		power()
		multiply()
		add()
	p1 = pop()

	if (DEBUG)
		console.log("POLY=" + p1)

	push(p1)

	prev_expanding = expanding
	expanding = 0
	yycondense()
	expanding = prev_expanding

	p1 = pop()
	#console.log("new poly with extracted common factor: " + p1)
	#debugger

	# factor out negative sign

	if (factpoly_expo > 0 && isnegativeterm(stack[polycoeff+factpoly_expo]))
		push(p1)
		#prev_expanding = expanding
		#expanding = 1
		negate()
		#expanding = prev_expanding
		p1 = pop()
		push(p7)
		negate_noexpand()
		p7 = pop()

	push(p7)
	push(p1)
	multiply_noexpand()
	p7 = pop()

	if (DEBUG)
		console.log("RESULT=" + p7)

	stack[h] = p7

	moveTos h + 1

	restore()

rationalize_coefficients = (h) ->
	i = 0

	# LCM of all polynomial coefficients

	p7 = one
	for i in [h...tos]
		push(stack[i])
		denominator()
		push(p7)
		lcm()
		p7 = pop()

	# multiply each coefficient by RESULT

	for i in [h...tos]
		push(p7)
		push(stack[i])
		multiply()
		stack[i] = pop()

	# reciprocate RESULT

	push(p7)
	reciprocate()
	p7 = pop()
	if DEBUG then console.log("rationalize_coefficients result")
	#console.log print_list(p7)

get_factor_from_real_root = ->

	i = 0
	j = 0
	h = 0
	a0 = 0
	an = 0
	na0 = 0
	nan = 0

	if (DEBUG)
		push(zero)
		for i in [0..factpoly_expo]
			push(stack[polycoeff+i])
			push(p2)
			push_integer(i)
			power()
			multiply()
			add()
		p1 = pop()
		console.log("POLY=" + p1)

	h = tos

	an = tos
	push(stack[polycoeff+factpoly_expo])

	divisors_onstack()

	nan = tos - an

	a0 = tos
	push(stack[polycoeff+0])
	divisors_onstack()
	na0 = tos - a0

	if (DEBUG)
		console.log("divisors of base term")
		for i in [0...na0]
			console.log(", " + stack[a0 + i])
		console.log("divisors of leading term")
		for i in [0...nan]
			console.log(", " + stack[an + i])

	# try roots

	for rootsTries_i in [0...nan]
		for rootsTries_j in [0...na0]

			#if DEBUG then console.log "nan: " + nan + " na0: " + na0 + " i: " + rootsTries_i + " j: " + rootsTries_j

			p4 = stack[an + rootsTries_i]
			p5 = stack[a0 + rootsTries_j]

			push(p5)
			push(p4)
			divide()
			negate()
			p3 = pop()

			Evalpoly()

			if (DEBUG)
				console.log("try A=" + p4)
				console.log(", B=" + p5)
				console.log(", root " + p2)
				console.log("=-B/A=" + p3)
				console.log(", POLY(" + p3)
				console.log(")=" + p6)

			if (iszero(p6))
				moveTos h
				if DEBUG then console.log "get_factor_from_real_root returning 1"
				return 1

			push(p5)
			negate()
			p5 = pop()

			push(p3)
			negate()
			p3 = pop()

			Evalpoly()

			if (DEBUG)
				console.log("try A=" + p4)
				console.log(", B=" + p5)
				console.log(", root " + p2)
				console.log("=-B/A=" + p3)
				console.log(", POLY(" + p3)
				console.log(")=" + p6)

			if (iszero(p6))
				moveTos h
				if DEBUG then console.log "get_factor_from_real_root returning 1"
				return 1

	moveTos h

	if DEBUG then console.log "get_factor_from_real_root returning 0"
	return 0

get_factor_from_complex_root = (remainingPoly) ->

	i = 0
	j = 0
	h = 0
	a0 = 0
	an = 0
	na0 = 0
	nan = 0

	if factpoly_expo <= 2
		if DEBUG then console.log("no more factoring via complex roots to be found in polynomial of degree <= 2")
		return 0

	p1 = remainingPoly
	if DEBUG then console.log("complex root finding for POLY=" + p1)

	h = tos
	an = tos

	# trying -1^(2/3) which generates a polynomial in Z
	# generates x^2 + 2x + 1
	push_integer(-1)
	push_rational(2,3)
	power()
	rect()
	p4 = pop()
	if DEBUG then console.log("complex root finding: trying with " + p4)
	push(p4)
	p3 = pop()
	push(p3)
	Evalpoly()
	if DEBUG then console.log("complex root finding result: " + p6)
	if (iszero(p6))
		moveTos h
		if DEBUG then console.log "get_factor_from_complex_root returning 1"
		return 1

	# trying 1^(2/3) which generates a polynomial in Z
	# http://www.wolframalpha.com/input/?i=(1)%5E(2%2F3)
	# generates x^2 - 2x + 1
	push_integer(1)
	push_rational(2,3)
	power()
	rect()
	p4 = pop()
	if DEBUG then console.log("complex root finding: trying with " + p4)
	push(p4)
	p3 = pop()
	push(p3)
	Evalpoly()
	if DEBUG then console.log("complex root finding result: " + p6)
	if (iszero(p6))
		moveTos h
		if DEBUG then console.log "get_factor_from_complex_root returning 1"
		return 1


	# trying some simple complex numbers. All of these
	# generate polynomials in Z
	for rootsTries_i in [-10..10]
		for rootsTries_j in [1..5]
			push_integer(rootsTries_i)
			push_integer(rootsTries_j)
			push(imaginaryunit)
			multiply()
			add()
			rect()
			p4 = pop()
			#console.log("complex root finding: trying simple complex combination: " + p4)

			push(p4)
			p3 = pop()


			push(p3)

			Evalpoly()

			#console.log("complex root finding result: " + p6)
			if (iszero(p6))
				moveTos h
				if DEBUG then console.log "found complex root: " + p6
				return 1

	moveTos h

	if DEBUG then console.log "get_factor_from_complex_root returning 0"
	return 0

#-----------------------------------------------------------------------------
#
#	Divide a polynomial by Ax+B
#
#	Input:	on stack:	polycoeff	Dividend coefficients
#
#			factpoly_expo		Degree of dividend
#
#			A (p4)		As above
#
#			B (p5)		As above
#
#	Output:	 on stack: polycoeff	Contains quotient coefficients
#
#-----------------------------------------------------------------------------

yydivpoly = ->
	i = 0
	p6 = zero
	for i in [factpoly_expo...0]
		push(stack[polycoeff+i])
		stack[polycoeff+i] = p6
		push(p4)
		divide()
		p6 = pop()
		push(stack[polycoeff+i - 1])
		push(p6)
		push(p5)
		multiply()
		subtract()
		stack[polycoeff+i - 1] = pop()
	stack[polycoeff+0] = p6
	if DEBUG then console.log("yydivpoly Q:")
	#console.log print_list(p6)

Evalpoly = ->
	i = 0
	push(zero)
	for i in [factpoly_expo..0]
		push(p3)
		multiply()
		push(stack[polycoeff+i])
		if DEBUG
			console.log("Evalpoly top of stack:")
			console.log print_list(stack[tos-i])
		add()
	p6 = pop()

