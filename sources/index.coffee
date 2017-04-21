

# n is the total number of things on the stack. The first thing on the stack
# is the object to be indexed, followed by the indices themselves.

# called by Eval_index
index_function = (n) ->
	i = 0
	k = 0
	m = 0
	ndim = 0
	nelem = 0
	t = 0

	save()
	s = tos - n
	p1 = stack[s]


	ndim = p1.tensor.ndim

	m = n - 1

	if (m > ndim)
		stop("too many indices for tensor")

	k = 0

	for i in [0...m]
		push(stack[s + i + 1])
		t = pop_integer()
		if (t < 1 || t > p1.tensor.dim[i])
			stop("index out of range")
		k = k * p1.tensor.dim[i] + t - 1

	if (ndim == m)
		moveTos tos - n
		push(p1.tensor.elem[k])
		restore()
		return

	for i in [m...ndim]
		k = k * p1.tensor.dim[i] + 0

	nelem = 1

	for i in [m...ndim]
		nelem *= p1.tensor.dim[i]

	p2 = alloc_tensor(nelem)

	p2.tensor.ndim = ndim - m

	for i in [m...ndim]
		p2.tensor.dim[i - m] = p1.tensor.dim[i]

	for i in [0...nelem]
		p2.tensor.elem[i] = p1.tensor.elem[k + i]

	check_tensor_dimensions p1
	check_tensor_dimensions p2

	moveTos tos - n
	push(p2)
	restore()

#-----------------------------------------------------------------------------
#
#	Input:		n		Number of args on stack
#
#			tos-n		Right-hand value
#
#			tos-n+1		Left-hand value
#
#			tos-n+2		First index
#
#			.
#			.
#			.
#
#			tos-1		Last index
#
#	Output:		Result on stack
#
#-----------------------------------------------------------------------------

#define LVALUE p1
#define RVALUE p2
#define TMP p3

set_component = (n) ->
	i = 0
	k = 0
	m = 0
	ndim = 0
	t = 0

	save()

	if (n < 3)
		stop("error in indexed assign")

	s = tos - n

	p2 = stack[s]; # p2 is RVALUE

	p1 = stack[s+1]; # p1 is LVALUE

	if (!istensor(p1)) # p1 is LVALUE
		stop("error in indexed assign")

	ndim = p1.tensor.ndim;  # p1 is LVALUE

	m = n - 2

	if (m > ndim)
		stop("error in indexed assign")

	k = 0

	for i in [0...m]
		push(stack[ s + i + 2])
		t = pop_integer()
		if (t < 1 || t > p1.tensor.dim[i]) # p1 is LVALUE
			stop("error in indexed assign\n")
		k = k * p1.tensor.dim[i] + t - 1

	for i in [m...ndim]
		k = k * p1.tensor.dim[i] + 0

	# copy

	p3 = alloc_tensor(p1.tensor.nelem); # p1 is LVALUE # p3 is TMP

	p3.tensor.ndim = p1.tensor.ndim; # p1 is LVALUE # p3 is TMP

	for i in [0...p1.tensor.ndim]
		p3.tensor.dim[i] = p1.tensor.dim[i]; # p1 is LVALUE # p3 is TMP

	for i in [0...p1.tensor.nelem]
		p3.tensor.elem[i] = p1.tensor.elem[i]; # p1 is LVALUE # p3 is TMP

	check_tensor_dimensions p1
	check_tensor_dimensions p3

	p1 = p3; # p1 is LVALUE # p3 is TMP

	if (ndim == m)
		if (istensor(p2)) # p2 is RVALUE
			stop("error in indexed assign")
		p1.tensor.elem[k] = p2; # p1 is LVALUE # p2 is RVALUE

		check_tensor_dimensions p1

		moveTos tos - n
		push(p1); # p1 is LVALUE
		restore()
		return


	# see if the rvalue matches

	if (!istensor(p2)) # p2 is RVALUE
		stop("error in indexed assign")

	if (ndim - m != p2.tensor.ndim) # p2 is RVALUE
		stop("error in indexed assign")

	for i in [0...p2.tensor.ndim] # p2 is RVALUE
		if (p1.tensor.dim[m + i] != p2.tensor.dim[i]) # p1 is LVALUE # p2 is RVALUE
			stop("error in indexed assign")

	# copy rvalue

	for i in [0...p2.tensor.nelem] # p2 is RVALUE
		p1.tensor.elem[k + i] = p2.tensor.elem[i]; # p1 is LVALUE # p2 is RVALUE

	check_tensor_dimensions p1
	check_tensor_dimensions p2

	moveTos tos - n

	push(p1); # p1 is LVALUE

	restore()

