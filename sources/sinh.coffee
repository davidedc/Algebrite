#	          exp(x) - exp(-x)
#	sinh(x) = ----------------
#	                 2



Eval_sinh = ->
	push(cadr(p1))
	Eval()
	ysinh()

ysinh = ->
	save()
	yysinh()
	restore()

yysinh = ->
	d = 0.0
	p1 = pop()
	if (car(p1) == symbol(ARCSINH))
		push(cadr(p1))
		return
	if (isdouble(p1))
		d = Math.sinh(p1.d)
		if (Math.abs(d) < 1e-10)
			d = 0.0
		push_double(d)
		return
	if (iszero(p1))
		push(zero)
		return
	push_symbol(SINH)
	push(p1)
	list(2)


