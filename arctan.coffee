

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

	if (car(p1) == symbol(POWER) && equaln(cadr(p1), 3) && equalq(caddr(p1), -1, 2))
		push_rational(1, 6)
		push(symbol(PI))
		multiply()
		restore()
		return

	# arctan(1) -> pi/4

	if (equaln(p1, 1))
		push_rational(1, 4)
		push(symbol(PI))
		multiply()
		restore()
		return

	# arctan(sqrt(3)) -> pi/3

	if (car(p1) == symbol(POWER) && equaln(cadr(p1), 3) && equalq(caddr(p1), 1, 2))
		push_rational(1, 3)
		push(symbol(PI))
		multiply()
		restore()
		return

	push_symbol(ARCTAN)
	push(p1)
	list(2)

	restore()


test_arctan = ->
	run_test [

		"arctan(x)",
		"arctan(x)",

		"arctan(-x)",
		"-arctan(x)",

		"arctan(0)",
		"0",

		"arctan(tan(x))",
		"x",

		"arctan(1/sqrt(3))-pi/6",	# 30 degrees
		"0",

		"arctan(1)-pi/4",		# 45 degrees
		"0",

		"arctan(sqrt(3))-pi/3",		# 60 degrees
		"0",

		"arctan(a-b)",
		"arctan(a-b)",

		"arctan(b-a)",
		"-arctan(a-b)",

		"arctan(tan(x))",
		"x",
	]