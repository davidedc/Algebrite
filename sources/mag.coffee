###
 Magnitude of complex z

	z		mag(z)
	-		------

	a		a

	-a		a

	(-1)^a		1

	exp(a + i b)	exp(a)

	a b		mag(a) mag(b)

	a + i b		sqrt(a^2 + b^2)

Notes

	1. Handles mixed polar and rectangular forms, e.g. 1 + exp(i pi/3)

	2. jean-francois.debroux reports that when z=(a+i*b)/(c+i*d) then

		mag(numerator(z)) / mag(denominator(z))

	   must be used to get the correct answer. Now the operation is
	   automatic.
###


DEBUG_MAG = false

Eval_mag = ->
	push(cadr(p1))
	Eval()
	mag()

mag = ->
	save()
	p1 = pop()
	push(p1)
	numerator()
	yymag()
	push(p1)
	denominator()
	yymag()
	divide()
	restore()

yymag = ->
	save()
	p1 = pop()
	input = p1

	if DEBUG_MAG then console.log "MAG of " + p1


	# handle all the "number" cases first -----------------------------------------
	if (iszero(p1))
		if DEBUG_MAG then console.log " mag: " + p1 + " just zero"
		push(zero)
		if DEBUG_MAG then console.log " --> MAG of " + input + " : " + stack[tos-1]
		restore()
		return

	if (isnegativenumber(p1))
		if DEBUG_MAG then console.log " mag: " + p1 + " just a negative"
		push(p1)
		negate()
		restore()
		return

	if (ispositivenumber(p1))
		if DEBUG_MAG then console.log " mag: " + p1 + " just a positive"
		push(p1)
		if DEBUG_MAG then console.log " --> MAG of " + input + " : " + stack[tos-1]
		restore()
		return

	if (p1 == symbol(PI))
		if DEBUG_MAG then console.log " mag: " + p1 + " of PI"
		push(p1)
		if DEBUG_MAG then console.log " --> MAG of " + input + " : " + stack[tos-1]
		restore()
		return

	# ??? should there be a shortcut case here for the imaginary unit?

	# Note that for this routine to give a correct result, this
	# must be a sum where a complex number appears.
	# If we apply this to "a+b", we get an incorrect result.
	if (car(p1) == symbol(ADD) and (
	 findPossibleClockForm(p1) or
	 findPossibleExponentialForm(p1) or
	 Find(p1,imaginaryunit))
	)
		if DEBUG_MAG then console.log " mag: " + p1 + " is a sum"
		if DEBUG_MAG then console.log "mag of a sum"
		# sum
		push(p1)
		rect() # convert polar terms, if any
		p1 = pop()
		push(p1)
		real()
		push_integer(2)
		power()
		push(p1)
		imag()
		push_integer(2)
		power()
		add()
		push_rational(1, 2)
		power()
		simplify_trig()
	else
		# default (all real)
	if (car(p1) == symbol(POWER) && equaln(cadr(p1), -1))
		if DEBUG_MAG then console.log " mag: " + p1 + " is -1 to any power"
		# -1 to any power
		push_integer(1)
		if DEBUG_MAG then console.log " --> MAG of " + input + " : " + stack[tos-1]
		restore()
		return

	# mag(a^b) is equal to mag(a)^b IF b is positive
	if (car(p1) == symbol(POWER) && ispositivenumber(caddr(p1)))
		if DEBUG_MAG then console.log " mag: " + p1 + " is something to the power of a positive number"
		push cadr(p1)
		mag()
		push caddr(p1)
		power()
		if DEBUG_MAG then console.log " --> MAG of " + input + " : " + stack[tos-1]
		restore()
		return

	# mag(e^something)
	if (car(p1) == symbol(POWER) && cadr(p1) == symbol(E))
		if DEBUG_MAG then console.log " mag: " + p1 + " is an exponential"
		# exponential
		push(caddr(p1))
		real()
		exponential()
		if DEBUG_MAG then console.log " --> MAG of " + input + " : " + stack[tos-1]
		restore()
		return

	if (car(p1) == symbol(MULTIPLY))
		if DEBUG_MAG then console.log " mag: " + p1 + " is a product"
		# product
		push_integer(1)
		p1 = cdr(p1)
		while (iscons(p1))
			push(car(p1))
			mag()
			multiply()
			p1 = cdr(p1)
		if DEBUG_MAG then console.log " --> MAG of " + input + " : " + stack[tos-1]
		restore()
		return

	if (car(p1) == symbol(MAG))
		if DEBUG_MAG then console.log " mag: " + p1 + " is mag of a mag"
		# mag of a mag
		push_symbol(MAG)
		push cadr(p1)
		list(2)
		if DEBUG_MAG then console.log " --> MAG of " + input + " : " + stack[tos-1]
		restore()
		return

		push(p1)
	restore()


