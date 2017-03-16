#(docs are generated from top-level comments, keep an eye on the formatting!)

### abs =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
x

General description
-------------------
Returns the absolute value of a real number, the magnitude of a complex number, or the vector length.

###

###
 Absolute value of a number,or magnitude of complex z, or norm of a vector

	z		abs(z)
	-		------

	a		a

	-a		a

	(-1)^a		1

	exp(a + i b)	exp(a)

	a b		abs(a) abs(b)

	a + i b		sqrt(a^2 + b^2)

Notes

	1. Handles mixed polar and rectangular forms, e.g. 1 + exp(i pi/3)

	2. jean-francois.debroux reports that when z=(a+i*b)/(c+i*d) then

		abs(numerator(z)) / abs(denominator(z))

	   must be used to get the correct answer. Now the operation is
	   automatic.
###


DEBUG_ABS = false

Eval_abs = ->
	push(cadr(p1))
	Eval()
	abs()

absValFloat = ->
	Eval()
	absval()
	Eval(); # normalize
	zzfloat()
	# zzfloat of an abs doesn't necessarily result in a double
	# , for example if there are variables. But
	# in many of the tests there should be indeed
	# a float, these two lines come handy to highlight
	# when that doesn't happen for those tests.
	#if !isdouble(stack[tos-1])
	#	stop("absValFloat should return a double and instead got: " + stack[tos-1])

abs = ->
	save()
	p1 = pop()
	push(p1)
	numerator()
	absval()
	push(p1)
	denominator()
	absval()
	divide()
	restore()

absval = ->
	save()
	p1 = pop()
	input = p1

	if DEBUG_ABS then console.log "ABS of " + p1


	# handle all the "number" cases first -----------------------------------------
	if (iszero(p1))
		if DEBUG_ABS then console.log " abs: " + p1 + " just zero"
		push(zero)
		if DEBUG_ABS then console.log " --> ABS of " + input + " : " + stack[tos-1]
		restore()
		return

	if (isnegativenumber(p1))
		if DEBUG_ABS then console.log " abs: " + p1 + " just a negative"
		push(p1)
		negate()
		restore()
		return

	if (ispositivenumber(p1))
		if DEBUG_ABS then console.log " abs: " + p1 + " just a positive"
		push(p1)
		if DEBUG_ABS then console.log " --> ABS of " + input + " : " + stack[tos-1]
		restore()
		return

	if (p1 == symbol(PI))
		if DEBUG_ABS then console.log " abs: " + p1 + " of PI"
		push(p1)
		if DEBUG_ABS then console.log " --> ABS of " + input + " : " + stack[tos-1]
		restore()
		return

	# ??? should there be a shortcut case here for the imaginary unit?

	# now handle decomposition cases ----------------------------------------------

	# we catch the "add", "power", "multiply" cases first,
	# before falling back to the
	# negative/positive cases because there are some
	# simplification thay we might be able to do.
	# Note that for this routine to give a correct result, this
	# must be a sum where a complex number appears.
	# If we apply this to "a+b", we get an incorrect result.
	if (car(p1) == symbol(ADD) and (
	 findPossibleClockForm(p1) or
	 findPossibleExponentialForm(p1) or
	 Find(p1,imaginaryunit))
	)
		if DEBUG_ABS then console.log " abs: " + p1 + " is a sum"
		if DEBUG_ABS then console.log "abs of a sum"
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
		if DEBUG_ABS then console.log " --> ABS of " + input + " : " + stack[tos-1]
		restore()
		return

	if (car(p1) == symbol(POWER) && equaln(cadr(p1), -1))
		if DEBUG_ABS then console.log " abs: " + p1 + " is -1 to any power"
		# -1 to any power
		if evaluatingAsFloats
			if DEBUG_ABS then console.log " abs: numeric, so result is 1.0"
			push_double(1.0)
		else
			if DEBUG_ABS then console.log " abs: symbolic, so result is 1"
			push_integer(1)
		if DEBUG_ABS then console.log " --> ABS of " + input + " : " + stack[tos-1]
		restore()
		return

	# abs(a^b) is equal to abs(a)^b IF b is positive
	if (car(p1) == symbol(POWER) && ispositivenumber(caddr(p1)))
		if DEBUG_ABS then console.log " abs: " + p1 + " is something to the power of a positive number"
		push cadr(p1)
		abs()
		push caddr(p1)
		power()
		if DEBUG_ABS then console.log " --> ABS of " + input + " : " + stack[tos-1]
		restore()
		return

	# abs(e^something)
	if (car(p1) == symbol(POWER) && cadr(p1) == symbol(E))
		if DEBUG_ABS then console.log " abs: " + p1 + " is an exponential"
		# exponential
		push(caddr(p1))
		real()
		exponential()
		if DEBUG_ABS then console.log " --> ABS of " + input + " : " + stack[tos-1]
		restore()
		return

	if (car(p1) == symbol(MULTIPLY))
		if DEBUG_ABS then console.log " abs: " + p1 + " is a product"
		# product
		push_integer(1)
		p1 = cdr(p1)
		while (iscons(p1))
			push(car(p1))
			abs()
			multiply()
			p1 = cdr(p1)
		if DEBUG_ABS then console.log " --> ABS of " + input + " : " + stack[tos-1]
		restore()
		return

	if (car(p1) == symbol(ABS))
		if DEBUG_ABS then console.log " abs: " + p1 + " is abs of a abs"
		# abs of a abs
		push_symbol(ABS)
		push cadr(p1)
		list(2)
		if DEBUG_ABS then console.log " --> ABS of " + input + " : " + stack[tos-1]
		restore()
		return

	###
	# Evaluation via zzfloat()
	# ...while this is in theory a powerful mechanism, I've commented it
	# out because I've refined this method enough to not need this.
	# Evaling via zzfloat() is in principle more problematic because it could
	# require further evaluations which could end up in further "abs" which
	# would end up in infinite loops. Better not use it if not necessary.

	# we look directly at the float evaluation of the argument
	# to see if we end up with a number, which would mean that there
	# is no imaginary component and we can just return the input
	# (or its negation) as the result.
	push p1
	zzfloat()
	floatEvaluation = pop()

	if (isnegativenumber(floatEvaluation))
		if DEBUG_ABS then console.log " abs: " + p1 + " just a negative"
		push(p1)
		negate()
		restore()
		return

	if (ispositivenumber(floatEvaluation))
		if DEBUG_ABS then console.log " abs: " + p1 + " just a positive"
		push(p1)
		if DEBUG_ABS then console.log " --> ABS of " + input + " : " + stack[tos-1]
		restore()
		return
	###

	if (istensor(p1))
		absval_tensor()
		restore()
		return

	if (isnegativeterm(p1) || (car(p1) == symbol(ADD) && isnegativeterm(cadr(p1))))
		push(p1)
		negate()
		p1 = pop()

	if DEBUG_ABS then console.log " abs: " + p1 + " is nothing decomposable"
	push_symbol(ABS)
	push(p1)
	list(2)

	if DEBUG_ABS then console.log " --> ABS of " + input + " : " + stack[tos-1]
	restore()

# also called the "norm" of a vector
absval_tensor = ->
	if (p1.tensor.ndim != 1)
		stop("abs(tensor) with tensor rank > 1")
	push(p1)
	push(p1)
	conjugate()
	inner()
	push_rational(1, 2)
	power()
	simplify()
	Eval()
