### arctan =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
x

General description
-------------------
Returns the inverse tangent of x.

###

Eval_arctan = ->
	push(cadr(p1))
	Eval()
	arctan()

arctan = ->
	d = 0

	save()

	p1 = pop()

	if (car(p1) == symbol(TAN))
		push(cadr(p1))
		restore()
		return

	if (isdouble(p1))
		errno = 0
		d = Math.atan(p1.d)
		if (errno)
			stop("arctan function error")
		push_double(d)
		restore()
		return

	if (iszero(p1))
		push(zero)
		restore()
		return

	if (isnegative(p1))
		push(p1)
		negate()
		arctan()
		negate()
		restore()
		return

	# arctan(sin(a) / cos(a)) ?

	if (Find(p1, symbol(SIN)) && Find(p1, symbol(COS)))
		push(p1)
		numerator()
		p2 = pop()
		push(p1)
		denominator()
		p3 = pop()
		if (car(p2) == symbol(SIN) && car(p3) == symbol(COS) && equal(cadr(p2), cadr(p3)))
			push(cadr(p2))
			restore()
			return

	# arctan(1/sqrt(3)) -> pi/6
	# second if catches the other way of saying it, sqrt(3)/3

	if (car(p1) == symbol(POWER) && equaln(cadr(p1), 3) && equalq(caddr(p1), -1, 2)) or
	(car(p1) == symbol(MULTIPLY) && equalq(car(cdr(p1)), 1,3) and car(car(cdr(cdr(p1)))) == symbol(POWER) && equaln(car(cdr(car(cdr(cdr(p1))))),3) && equalq(car(cdr(cdr(car(cdr(cdr(p1)))))), 1, 2))
		push_rational(1, 6)
		if evaluatingAsFloats
			push_double(Math.PI)
		else
			push(symbol(PI))
		multiply()
		restore()
		return

	# arctan(1) -> pi/4

	if (equaln(p1, 1))
		push_rational(1, 4)
		if evaluatingAsFloats
			push_double(Math.PI)
		else
			push(symbol(PI))
		multiply()
		restore()
		return

	# arctan(sqrt(3)) -> pi/3

	if (car(p1) == symbol(POWER) && equaln(cadr(p1), 3) && equalq(caddr(p1), 1, 2))
		push_rational(1, 3)
		if evaluatingAsFloats
			push_double(Math.PI)
		else
			push(symbol(PI))
		multiply()
		restore()
		return

	push_symbol(ARCTAN)
	push(p1)
	list(2)

	restore()


