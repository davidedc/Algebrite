

Eval_round = ->
	push(cadr(p1))
	Eval()
	yround()

yround = ->
	save()
	yyround()
	restore()

yyround = ->
	d = 0.0

	p1 = pop()

	if (!isnum(p1))
		push_symbol(ROUND)
		push(p1)
		list(2)
		return

	if (isdouble(p1))
		d = Math.round(p1.d)
		push_double(d)
		return

	if (isinteger(p1))
		push(p1)
		return

	push p1
	yyfloat()
	p1 = pop()
	push_integer Math.round(p1.d)



