#(docs are generated from top-level comments, keep an eye on the formatting!)

### tensor =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

General description
-------------------
Tensors are a strange in-between of matrices and "computer"
rectangular data structures.

Tensors, unlike matrices, and like rectangular data structures,
can have an arbitrary number of dimensions (rank), although a tensor with
rank zero is just a scalar.

Tensors, like matrices and unlike many computer rectangular data structures,
must be "contiguous" i.e. have no empty spaces within its size, and "uniform",
i.e. each element must have the same shape and hence the same rank.

Also tensors have necessarily to make a distinction between row vectors,
column vectors (which have a rank of 2) and uni-dimensional vectors (rank 1).
They look very similar but they are fundamentally different.

Tensors with elements that are also tensors get promoted to a higher rank
, this is so we can represent and get the rank of a matrix correctly.
Example:
Start with a tensor of rank 1 with 2 elements (i.e. shape: 2)
if you put in both its elements another 2 tensors
of rank 1 with 2 elements (i.e. shape: 2)
then the result is a tensor of rank 2 with shape 2,2
i.e. the dimension of a tensor at all times must be
the number of nested tensors in it.
Also, all tensors must be "uniform" i.e. they must be accessed
uniformly, which means that all existing elements of a tensor
must be contiguous and have the same shape.
Implication of it all is that you can't put arbitrary
tensors inside tensors (like you would do to represent block matrices)
Rather, all tensors inside tensors must have same shape (and hence, rank)

Limitations
-----------
n.a.

Implementation info
-------------------
Tensors are implemented...

###

# Called from the "eval" module to evaluate tensor elements.
# p1 points to the tensor operand.
Eval_tensor = ->
	i = 0
	ndim = 0
	nelem = 0
	#U **a, **b

	#---------------------------------------------------------------------
	#
	#	create a new tensor for the result
	#
	#---------------------------------------------------------------------

	check_tensor_dimensions p1

	nelem = p1.tensor.nelem

	ndim = p1.tensor.ndim

	p2 = alloc_tensor(nelem)

	p2.tensor.ndim = ndim

	for i in [0...ndim]
		p2.tensor.dim[i] = p1.tensor.dim[i]

	#---------------------------------------------------------------------
	#
	#	b = Eval(a)
	#
	#---------------------------------------------------------------------

	a = p1.tensor.elem
	b = p2.tensor.elem

	check_tensor_dimensions p2

	for i in [0...nelem]
		#console.log "push/pop: pushing element a of " + i
		push(a[i])
		Eval()
		#console.log "push/pop: popping into element b of " + i
		b[i] = pop()

	check_tensor_dimensions p1
	check_tensor_dimensions p2
	#---------------------------------------------------------------------
	#
	#	push the result
	#
	#---------------------------------------------------------------------

	push(p2)

	promote_tensor()

#-----------------------------------------------------------------------------
#
#	Add tensors
#
#	Input:		Operands on stack
#
#	Output:		Result on stack
#
#-----------------------------------------------------------------------------

tensor_plus_tensor = ->
	i = 0
	ndim = 0
	nelem = 0
	#U **a, **b, **c

	save()

	p2 = pop()
	p1 = pop()

	# are the dimension lists equal?

	ndim = p1.tensor.ndim

	if (ndim != p2.tensor.ndim)
		push(symbol(NIL))
		restore()
		return

	for i in [0...ndim]
		if (p1.tensor.dim[i] != p2.tensor.dim[i])
			push(symbol(NIL))
			restore()
			return

	# create a new tensor for the result

	nelem = p1.tensor.nelem

	p3 = alloc_tensor(nelem)

	p3.tensor.ndim = ndim

	for i in [0...ndim]
		p3.tensor.dim[i] = p1.tensor.dim[i]

	# c = a + b

	a = p1.tensor.elem
	b = p2.tensor.elem
	c = p3.tensor.elem

	for i in [0...nelem]
		push(a[i])
		push(b[i])
		add()
		c[i] = pop()

	# push the result

	push(p3)

	restore()

#-----------------------------------------------------------------------------
#
#	careful not to reorder factors
#
#-----------------------------------------------------------------------------

tensor_times_scalar = ->
	i = 0
	ndim = 0
	nelem = 0
	#U **a, **b

	save()

	p2 = pop()
	p1 = pop()

	ndim = p1.tensor.ndim
	nelem = p1.tensor.nelem

	p3 = alloc_tensor(nelem)

	p3.tensor.ndim = ndim

	for i in [0...ndim]
		p3.tensor.dim[i] = p1.tensor.dim[i]

	a = p1.tensor.elem
	b = p3.tensor.elem

	for i in [0...nelem]
		push(a[i])
		push(p2)
		multiply()
		b[i] = pop()

	push(p3)
	restore()

scalar_times_tensor = ->
	i = 0
	ndim = 0
	nelem = 0
	#U **a, **b

	save()

	p2 = pop()
	p1 = pop()

	ndim = p2.tensor.ndim
	nelem = p2.tensor.nelem

	p3 = alloc_tensor(nelem)

	p3.tensor.ndim = ndim

	for i in [0...ndim]
		p3.tensor.dim[i] = p2.tensor.dim[i]

	a = p2.tensor.elem
	b = p3.tensor.elem

	for i in [0...nelem]
		push(p1)
		push(a[i])
		multiply()
		b[i] = pop()

	push(p3)

	restore()

check_tensor_dimensions = (p) ->
	if p.tensor.nelem != p.tensor.elem.length
		console.log "something wrong in tensor dimensions"
		debugger

is_square_matrix = (p) ->
	if (istensor(p) && p.tensor.ndim == 2 && p.tensor.dim[0] == p.tensor.dim[1])
		return 1
	else
		return 0

#-----------------------------------------------------------------------------
#
#	gradient of tensor
#
#-----------------------------------------------------------------------------

d_tensor_tensor = ->
	i = 0
	j = 0
	ndim = 0
	nelem = 0
	#U **a, **b, **c

	ndim = p1.tensor.ndim
	nelem = p1.tensor.nelem

	if (ndim + 1 >= MAXDIM)
		push_symbol(DERIVATIVE)
		push(p1)
		push(p2)
		list(3)
		return

	p3 = alloc_tensor(nelem * p2.tensor.nelem)

	p3.tensor.ndim = ndim + 1

	for i in [0...ndim]
		p3.tensor.dim[i] = p1.tensor.dim[i]

	p3.tensor.dim[ndim] = p2.tensor.dim[0]

	a = p1.tensor.elem
	b = p2.tensor.elem
	c = p3.tensor.elem

	for i in [0...nelem]
		for j in [0...p2.tensor.nelem]
			push(a[i])
			push(b[j])
			derivative()
			c[i * p2.tensor.nelem + j] = pop()

	push(p3)


#-----------------------------------------------------------------------------
#
#	gradient of scalar
#
#-----------------------------------------------------------------------------

d_scalar_tensor = ->
	#U **a, **b

	p3 = alloc_tensor(p2.tensor.nelem)

	p3.tensor.ndim = 1

	p3.tensor.dim[0] = p2.tensor.dim[0]

	a = p2.tensor.elem
	b = p3.tensor.elem

	for i in [0...p2.tensor.nelem]
		push(p1)
		push(a[i])
		derivative()
		b[i] = pop()

	push(p3)

#-----------------------------------------------------------------------------
#
#	Derivative of tensor
#
#-----------------------------------------------------------------------------

d_tensor_scalar = ->
	i = 0
	#U **a, **b

	p3 = alloc_tensor(p1.tensor.nelem)

	p3.tensor.ndim = p1.tensor.ndim

	for i in [0...p1.tensor.ndim]
		p3.tensor.dim[i] = p1.tensor.dim[i]

	a = p1.tensor.elem
	b = p3.tensor.elem

	for i in [0...p1.tensor.nelem]
		push(a[i])
		push(p2)
		derivative()
		b[i] = pop()

	push(p3)

compare_tensors = (p1, p2) ->

	i = 0
	if (p1.tensor.ndim < p2.tensor.ndim)
		return -1

	if (p1.tensor.ndim > p2.tensor.ndim)
		return 1

	for i in [0...p1.tensor.ndim]
		if (p1.tensor.dim[i] < p2.tensor.dim[i])
			return -1
		if (p1.tensor.dim[i] > p2.tensor.dim[i])
			return 1

	for i in [0...p1.tensor.nelem]
		if (equal(p1.tensor.elem[i], p2.tensor.elem[i]))
			continue
		if (lessp(p1.tensor.elem[i], p2.tensor.elem[i]))
			return -1
		else
			return 1

	return 0

#-----------------------------------------------------------------------------
#
#	Raise a tensor to a power
#
#	Input:		p1	tensor
#
#			p2	exponent
#
#	Output:		Result on stack
#
#-----------------------------------------------------------------------------

power_tensor = ->
	i = 0
	k = 0
	n = 0

	# first and last dims must be equal

	k = p1.tensor.ndim - 1

	if (p1.tensor.dim[0] != p1.tensor.dim[k])
		push_symbol(POWER)
		push(p1)
		push(p2)
		list(3)
		return

	push(p2)

	n = pop_integer()

	if (isNaN(n))
		push_symbol(POWER)
		push(p1)
		push(p2)
		list(3)
		return

	if (n == 0)
		if (p1.tensor.ndim != 2)
			stop("power(tensor,0) with tensor rank not equal to 2")
		n = p1.tensor.dim[0]
		p1 = alloc_tensor(n * n)
		p1.tensor.ndim = 2
		p1.tensor.dim[0] = n
		p1.tensor.dim[1] = n
		for i in [0...n]
			p1.tensor.elem[n * i + i] = one

		check_tensor_dimensions p1

		push(p1)
		return

	if (n < 0)
		n = -n
		push(p1)
		inv()
		p1 = pop()

	push(p1)

	for i in [1...n]
		push(p1)
		inner()
		if (iszero(stack[tos - 1]))
			break

copy_tensor = ->
	i = 0

	save()

	p1 = pop()

	p2 = alloc_tensor(p1.tensor.nelem)

	p2.tensor.ndim = p1.tensor.ndim

	for i in [0...p1.tensor.ndim]
		p2.tensor.dim[i] = p1.tensor.dim[i]

	for i in [0...p1.tensor.nelem]
		p2.tensor.elem[i] = p1.tensor.elem[i]

	check_tensor_dimensions p1
	check_tensor_dimensions p2

	push(p2)

	restore()

# Tensors with elements that are also tensors get promoted to a higher rank.

promote_tensor = ->
	i = 0
	j = 0
	k = 0
	nelem = 0
	ndim = 0

	save()

	p1 = pop()

	if (!istensor(p1))
		push(p1)
		restore()
		return

	p2 = p1.tensor.elem[0]

	for i in [1...p1.tensor.nelem]
		if (!compatible(p2, p1.tensor.elem[i]))
			stop("Cannot promote tensor due to inconsistent tensor components.")

	if (!istensor(p2))
		push(p1)
		restore()
		return

	ndim = p1.tensor.ndim + p2.tensor.ndim

	if (ndim > MAXDIM)
		stop("tensor rank > " + MAXDIM)

	nelem = p1.tensor.nelem * p2.tensor.nelem

	p3 = alloc_tensor(nelem)

	p3.tensor.ndim = ndim

	for i in [0...p1.tensor.ndim]
		p3.tensor.dim[i] = p1.tensor.dim[i]

	for j in [0...p2.tensor.ndim]
		p3.tensor.dim[i + j] = p2.tensor.dim[j]

	k = 0

	for i in [0...p1.tensor.nelem]
		p2 = p1.tensor.elem[i]
		for j in [0...p2.tensor.nelem]
			p3.tensor.elem[k++] = p2.tensor.elem[j]

	check_tensor_dimensions p2
	check_tensor_dimensions p3

	push(p3)

	restore()

compatible = (p,q) ->

	if (!istensor(p) && !istensor(q))
		return 1

	if (!istensor(p) || !istensor(q))
		return 0

	if (p.tensor.ndim != q.tensor.ndim)
		return 0

	for i in [0...p.tensor.ndim]
		if (p.tensor.dim[i] != q.tensor.dim[i])
			return 0

	return 1


