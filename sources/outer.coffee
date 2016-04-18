# Outer product of tensors



Eval_outer = ->
	p1 = cdr(p1)
	push(car(p1))
	Eval()
	p1 = cdr(p1)
	while (iscons(p1))
		push(car(p1))
		Eval()
		outer()
		p1 = cdr(p1)

outer = ->
	save()
	p2 = pop()
	p1 = pop()
	if (istensor(p1) && istensor(p2))
		yyouter()
	else
		push(p1)
		push(p2)
		if (istensor(p1))
			tensor_times_scalar()
		else if (istensor(p2))
			scalar_times_tensor()
		else
			multiply()
	restore()

yyouter = ->
	i = 0
	j = 0
	k = 0
	ndim = 0
	nelem = 0

	ndim = p1.tensor.ndim + p2.tensor.ndim

	if (ndim > MAXDIM)
		stop("outer: rank of result exceeds maximum")

	nelem = p1.tensor.nelem * p2.tensor.nelem

	p3 = alloc_tensor(nelem)

	p3.tensor.ndim = ndim

	for i in [0...p1.tensor.ndim]
		p3.tensor.dim[i] = p1.tensor.dim[i]

	j = i

	for i in [0...p2.tensor.ndim]
		p3.tensor.dim[j + i] = p2.tensor.dim[i]

	k = 0

	for i in [0...p1.tensor.nelem]
		for j in [0...p2.tensor.nelem]
			push(p1.tensor.elem[i])
			push(p2.tensor.elem[j])
			multiply()
			p3.tensor.elem[k++] = pop()

	push(p3)


