

Eval_float = ->
	push(cadr(p1))
	Eval()
	yyfloat()
	Eval(); # normalize

yyfloat = ->
	i = 0
	h = 0
	save()
	p1 = pop()
	if (iscons(p1))
		h = tos
		while (iscons(p1))
			push(car(p1))
			yyfloat()
			p1 = cdr(p1)
		list(tos - h)
	else if (p1.k == TENSOR)
		push(p1)
		copy_tensor()
		p1 = pop()
		for i in [0...p1.tensor.nelem]
			push(p1.tensor.elem[i])
			yyfloat()
			p1.tensor.elem[i] = pop()
		push(p1)
	else if (p1.k == NUM)
		push(p1)
		bignum_float()
	else if (p1 == symbol(PI))
		push_double(Math.PI)
	else if (p1 == symbol(E))
		push_double(Math.E)
	else
		push(p1)
	restore()

