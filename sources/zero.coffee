

Eval_zero = ->
	i = 0
	k = []
	m = 0
	n = 0

	for i in [0...MAXDIM]
		k[i] = 0

	m = 1
	n = 0
	p2 = cdr(p1)

	while (iscons(p2))
		push(car(p2))
		Eval()
		i = pop_integer()
		if (i < 1 || isNaN(i))
			# if the input is nonsensical
			# just return 0
			push(zero)
			return
		m *= i
		k[n++] = i
		p2 = cdr(p2)
	if (n == 0)
		push(zero)
		return
	p1 = alloc_tensor(m)
	p1.tensor.ndim = n
	for i in [0...n]
		p1.tensor.dim[i] = k[i]
	push(p1)

