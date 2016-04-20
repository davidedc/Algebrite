

Eval_floor = ->
	push(cadr(p1))
	Eval()
	yfloor()

yfloor = ->
	save()
	yyfloor()
	restore()

yyfloor = ->
	d = 0.0

	p1 = pop()

	if (!isnum(p1))
		push_symbol(FLOOR)
		push(p1)
		list(2)
		return

	if (isdouble(p1))
		d = Math.floor(p1.d)
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
		push_integer(-1)
		add()


