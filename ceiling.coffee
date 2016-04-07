

Eval_ceiling = ->
	push(cadr(p1))
	Eval()
	ceiling()

ceiling = ->
	save()
	yyceiling()
	restore()

yyceiling = ->
	d = 0.0

	p1 = pop()

	if (!isnum(p1))
		push_symbol(CEILING)
		push(p1)
		list(2)
		return

	if (isdouble(p1))
		d = Math.ceil(p1.d)
		push_double(d)
		return

	if (isinteger(p1))
		push(p1)
		return

	p3 = new U()
	p3.k = NUM
	p3.q.a = mdiv(p1.q.a, p1.q.b)
	p3.q.b = mint(1)
	push(p3)

	if (isnegativenumber(p1))
		doNothing = 1
	else
		push_integer(1)
		add()


test_ceiling = ->
	run_test [
		"ceiling(a)",
		"ceiling(a)",

		"ceiling(a+b)",
		"ceiling(a+b)",

		"ceiling(5/2)",
		"3",

		"ceiling(4/2)",
		"2",

		"ceiling(3/2)",
		"2",

		"ceiling(2/2)",
		"1",

		"ceiling(1/2)",
		"1",

		"ceiling(0/2)",
		"0",

		"ceiling(-1/2)",
		"0",

		"ceiling(-2/2)",
		"-1",

		"ceiling(-3/2)",
		"-1",

		"ceiling(-4/2)",
		"-2",

		"ceiling(-5/2)",
		"-2",

		"ceiling(5/2.0)",
		"3",

		"ceiling(4/2.0)",
		"2",

		"ceiling(3/2.0)",
		"2",

		"ceiling(2/2.0)",
		"1",

		"ceiling(1/2.0)",
		"1",

		"ceiling(0.0)",
		"0",

		"ceiling(-1/2.0)",
		"0",

		"ceiling(-2/2.0)",
		"-1",

		"ceiling(-3/2.0)",
		"-1",

		"ceiling(-4/2.0)",
		"-2",

		"ceiling(-5/2.0)",
		"-2",
	]