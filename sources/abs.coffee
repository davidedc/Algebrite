# Absolute value, aka vector magnitude
# Returns the absolute value or vector length of x.

Eval_abs = ->
	push(cadr(p1))
	Eval()
	absval()


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

absval = ->
	#debugger
	h = 0
	save()
	p1 = pop()

	if (istensor(p1))
		absval_tensor()
		restore()
		return

	if (isnum(p1))
		push(p1)
		if (isnegativenumber(p1))
			negate()
		restore()
		return

	if (iscomplexnumber(p1))
		push(p1)
		push(p1)
		conjugate()
		multiply()
		push_rational(1, 2)
		power()
		restore()
		return

	# abs(1/a) evaluates to 1/abs(a)

	if (car(p1) == symbol(POWER) && isnegativeterm(caddr(p1)))
		push(p1)
		reciprocate()
		absval()
		reciprocate()
		restore()
		return

	# abs(a*b) evaluates to abs(a)*abs(b)

	if (car(p1) == symbol(MULTIPLY))
		h = tos
		p1 = cdr(p1)
		while (iscons(p1))
			push(car(p1))
			absval()
			p1 = cdr(p1)
		multiply_all(tos - h)
		restore()
		return

	if (isnegativeterm(p1) || (car(p1) == symbol(ADD) && isnegativeterm(cadr(p1))))
		push(p1)
		negate()
		p1 = pop()

	push_symbol(ABS)
	push(p1)
	list(2)

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

