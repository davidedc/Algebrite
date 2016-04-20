#	           exp(2 x) - 1
#	tanh(x) = --------------
#	           exp(2 x) + 1



Eval_tanh = ->
	d = 0.0
	push(cadr(p1))
	Eval()
	p1 = pop()
	if (car(p1) == symbol(ARCTANH))
		push(cadr(p1))
		return
	if (isdouble(p1))
		d = Math.tanh(p1.d)
		if (Math.abs(d) < 1e-10)
			d = 0.0
		push_double(d)
		return
	if (iszero(p1))
		push(zero)
		return
	push_symbol(TANH)
	push(p1)
	list(2)

