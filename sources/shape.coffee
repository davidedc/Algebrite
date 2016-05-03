# shape of tensor



Eval_shape = ->
	push(cadr(p1))
	Eval()
	shape()

shape = ->
	i = 0
	ndim = 0
	t = 0
	ai = []
	an = []
	for i in [0...MAXDIM]
		ai[i] = 0
		an[i] = 0

	#U **a, **b

	save()

	p1 = pop()

	if (!istensor(p1))
		if (!iszero(p1))
			stop("transpose: tensor expected, 1st arg is not a tensor")
		push(zero)
		restore()
		return

	ndim = p1.tensor.ndim


	p2 = alloc_tensor(ndim)

	p2.tensor.ndim = 1
	p2.tensor.dim[0] = ndim



	for i in [0...ndim]
		push_integer(p1.tensor.dim[i])
		p2.tensor.elem[i] = pop()

	push(p2)

	restore()

