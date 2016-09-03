# Transpose tensor indices



Eval_transpose = ->
	push(cadr(p1))
	Eval()

	# add default params if they
	# have not been passed
	if (cddr(p1) == symbol(NIL))
		push_integer(1)
		push_integer(2)
	else
		push(caddr(p1))
		Eval()
		push(cadddr(p1))
		Eval()
	transpose()

transpose = ->
	i = 0
	j = 0
	k = 0
	l = 0
	m = 0
	ndim = 0
	nelem = 0
	t = 0
	ai = []
	an = []
	for i in [0...MAXDIM]
		ai[i] = 0
		an[i] = 0

	#U **a, **b

	save()

	# by default p3 is 2 and p2 is 1
	p3 = pop() # index to be transposed
	p2 = pop() # other index to be transposed
	p1 = pop() # what needs to be transposed

	# a transposition just goes away when
	# applied to a scalar
	if (isnum(p1))
		push p1
		restore()
		return

	# transposition goes away for identity matrix
	if ((isplusone(p2) and isplustwo(p3)) or (isplusone(p3) and isplustwo(p2)))
		if isidentitymatrix(p1)
			push p1
			restore()
			return

	# a transposition just goes away when
	# applied to another transposition with
	# the same columns to be switched
	if (istranspose(p1))
		innerTranspSwitch1 = car(cdr(cdr(p1)))
		innerTranspSwitch2 = car(cdr(cdr(cdr(p1))))

		if ( equal(innerTranspSwitch1,p3) and equal(innerTranspSwitch2,p2) ) or
			( equal(innerTranspSwitch2,p3) and equal(innerTranspSwitch1,p2) ) or
			(( equal(innerTranspSwitch1,symbol(NIL)) and equal(innerTranspSwitch2,symbol(NIL)) ) and ((isplusone(p3) and isplustwo(p2)) or ((isplusone(p2) and isplustwo(p3)))))
				push car(cdr(p1))
				restore()
				return

	# if operand is a sum then distribute
	# (if we are in expanding mode)
	if (expanding && isadd(p1))
		p1 = cdr(p1)
		push(zero)
		while (iscons(p1))
			push(car(p1))
			# add the dimensions to switch but only if
			# they are not the default ones.
			push(p2)
			push(p3)
			transpose()
			add()
			p1 = cdr(p1)
		restore()
		return

	# if operand is a multiplication then distribute
	# (if we are in expanding mode)
	if (expanding && ismultiply(p1))
		p1 = cdr(p1)
		push(one)
		while (iscons(p1))
			push(car(p1))
			# add the dimensions to switch but only if
			# they are not the default ones.
			push(p2)
			push(p3)
			transpose()
			multiply()
			p1 = cdr(p1)
		restore()
		return

	# distribute the transpose of a dot
	# if in expanding mode
	# note that the distribution happens
	# in reverse as per tranpose rules.
	# The dot operator is not
	# commutative, so, it matters.
	if (expanding && isinnerordot(p1))
		p1 = cdr(p1)
		accumulator = []
		while (iscons(p1))
			accumulator.push [car(p1),p2,p3]
			p1 = cdr(p1)

		for eachEntry in [accumulator.length-1..0]
			push(accumulator[eachEntry][0])
			push(accumulator[eachEntry][1])
			push(accumulator[eachEntry][2])
			transpose()
			if eachEntry != accumulator.length-1
				inner()

		restore()
		return


	if (!istensor(p1))
		if (!iszero(p1))
			#stop("transpose: tensor expected, 1st arg is not a tensor")
			push_symbol(TRANSPOSE)
			push(p1)
			# remove the default "dimensions to be switched"
			# parameters
			if (!isplusone(p2) or !isplustwo(p3)) and (!isplusone(p3) or !isplustwo(p2))
				push(p2)
				push(p3)
				list(4)
			else
				list(2)
			restore()
			return
		push(zero)
		restore()
		return

	ndim = p1.tensor.ndim
	nelem = p1.tensor.nelem

	# is it a vector?
	# so here it's something curious - note how vectors are
	# not really special two-dimensional matrices, but rather
	# 1-dimension objects (like tensors can be). So since
	# they have one dimension, transposition has no effect.
	# (as opposed as if they were special two-dimensional
	# matrices)
	# see also Ran Pan, Tensor Transpose and Its Properties. CoRR abs/1411.1503 (2014)

	if (ndim == 1)
		push(p1)
		restore()
		return

	push(p2)
	l = pop_integer()

	push(p3)
	m = pop_integer()

	if (l < 1 || l > ndim || m < 1 || m > ndim)
		stop("transpose: index out of range")

	l--
	m--

	p2 = alloc_tensor(nelem)

	p2.tensor.ndim = ndim

	for i in [0...ndim]
		p2.tensor.dim[i] = p1.tensor.dim[i]

	p2.tensor.dim[l] = p1.tensor.dim[m]
	p2.tensor.dim[m] = p1.tensor.dim[l]

	a = p1.tensor.elem
	b = p2.tensor.elem

	# init tensor index

	for i in [0...ndim]
		ai[i] = 0
		an[i] = p1.tensor.dim[i]

	# copy components from a to b

	for i in [0...nelem]

		# swap indices l and m

		t = ai[l]; ai[l] = ai[m]; ai[m] = t;
		t = an[l]; an[l] = an[m]; an[m] = t;

		# convert tensor index to linear index k

		k = 0
		for j in [0...ndim]
			k = (k * an[j]) + ai[j]

		# swap indices back

		t = ai[l]; ai[l] = ai[m]; ai[m] = t;
		t = an[l]; an[l] = an[m]; an[m] = t;

		# copy one element

		b[k] = a[i]

		# increment tensor index

		# Suppose the tensor dimensions are 2 and 3.
		# Then the tensor index ai increments as follows:
		# 00 -> 01
		# 01 -> 02
		# 02 -> 10
		# 10 -> 11
		# 11 -> 12
		# 12 -> 00

		for j in [(ndim - 1)..0]
			if (++ai[j] < an[j])
				break
			ai[j] = 0

	push(p2)
	restore()

