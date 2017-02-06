###
	Substitute new expr for old expr in expr.

	Input:	push	expr

		push	old expr

		push	new expr

	Output:	Result on stack
###



subst = ->
	i = 0
	save()
	p3 = pop(); # new expr
	p2 = pop(); # old expr
	if (p2 == symbol(NIL) || p3 == symbol(NIL))
		restore()
		return
	p1 = pop(); # expr
	if (istensor(p1))
		p4 = alloc_tensor(p1.tensor.nelem)
		p4.tensor.ndim = p1.tensor.ndim
		for i in [0...p1.tensor.ndim]
			p4.tensor.dim[i] = p1.tensor.dim[i]
		for i in [0...p1.tensor.nelem]
			push(p1.tensor.elem[i])
			push(p2)
			push(p3)
			subst()
			p4.tensor.elem[i] = pop()

			check_tensor_dimensions p4

		push(p4)
	else if (equal(p1, p2))
		push(p3)
	else if (iscons(p1))
		push(car(p1))
		push(p2)
		push(p3)
		subst()
		push(cdr(p1))
		push(p2)
		push(p3)
		subst()
		cons()
	else
		push(p1)
	restore()
