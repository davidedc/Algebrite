#-----------------------------------------------------------------------------
#
#	Input:		Matrix on stack (must have two dimensions but
#				it can be non-numerical)
#
#	Output:		Inverse on stack
#
#	Example:
#
#	> inv(((1,2),(3,4))
#	((-2,1),(3/2,-1/2))
#
#	> inv(((a,b),(c,d))
#	((d / (a d - b c),-b / (a d - b c)),(-c / (a d - b c),a / (a d - b c)))
#
#	Note:
#
#	THIS IS DIFFERENT FROM INVERSE OF AN EXPRESSION (inv)
#   Uses Gaussian elimination for numerical matrices.
#
#-----------------------------------------------------------------------------



INV_check_arg = ->
	if (!istensor(p1))
		return 0
	else if (p1.tensor.ndim != 2)
		return 0
	else if (p1.tensor.dim[0] != p1.tensor.dim[1])
		return 0
	else
		return 1

inv = ->
	i = 0
	n = 0
	#U **a

	save()

	p1 = pop()

	# an inv just goes away when
	# applied to another inv
	if (isinv(p1))
		push car(cdr(p1))
		restore()
		return

	# inverse goes away in case
	# of identity matrix
	if isidentitymatrix(p1)
		push p1
		restore()
		return

	# distribute the inverse of a dot
	# if in expanding mode
	# note that the distribution happens
	# in reverse.
	# The dot operator is not
	# commutative, so, it matters.
	if (expanding && isinnerordot(p1))
		p1 = cdr(p1)
		accumulator = []
		while (iscons(p1))
			accumulator.push car(p1)
			p1 = cdr(p1)

		for eachEntry in [accumulator.length-1..0]
			push(accumulator[eachEntry])
			inv()
			if eachEntry != accumulator.length-1
				inner()

		restore()
		return


	if (INV_check_arg() == 0)
		push_symbol(INV)
		push(p1)
		list(2)
		restore()
		return


	if isnumerictensor p1
		yyinvg()
	else
		push(p1)
		adj()
		push(p1)
		det()
		p2 = pop()
		if (iszero(p2))
			stop("inverse of singular matrix")
		push(p2)
		divide()

	restore()

invg = ->
	save()

	p1 = pop()

	if (INV_check_arg() == 0)
		push_symbol(INVG)
		push(p1)
		list(2)
		restore()
		return

	yyinvg()

	restore()

# inverse using gaussian elimination

yyinvg = ->
	h = 0
	i = 0
	j = 0
	n = 0

	n = p1.tensor.dim[0]

	h = tos

	for i in [0...n]
		for j in [0...n]
			if (i == j)
				push(one)
			else
				push(zero)

	for i in [0...(n * n)]
		push(p1.tensor.elem[i])

	INV_decomp(n)

	p1 = alloc_tensor(n * n)

	p1.tensor.ndim = 2
	p1.tensor.dim[0] = n
	p1.tensor.dim[1] = n

	for i in [0...(n * n)]
		p1.tensor.elem[i] = stack[h + i]

	moveTos tos - 2 * n * n

	push(p1)

#-----------------------------------------------------------------------------
#
#	Input:		n * n unit matrix on stack
#
#			n * n operand on stack
#
#	Output:		n * n inverse matrix on stack
#
#			n * n garbage on stack
#
#			p2 mangled
#
#-----------------------------------------------------------------------------

#define A(i, j) stack[a + n * (i) + (j)]
#define U(i, j) stack[u + n * (i) + (j)]

INV_decomp = (n) ->
	a = 0
	d = 0
	i = 0
	j = 0
	u = 0

	a = tos - n * n

	u = a - n * n

	for d in [0...n]

		# diagonal element zero?

		if (equal( (stack[a + n * (d) + (d)]) , zero))

			# find a new row

			for i in [(d + 1)...n]
				if (!equal( (stack[a + n * (i) + (d)]) , zero))
					break

			if (i == n)
				stop("inverse of singular matrix")

			# exchange rows

			for j in [0...n]

				p2 = stack[a + n * (d) + (j)]
				stack[a + n * (d) + (j)] = stack[a + n * (i) + (j)]
				stack[a + n * (i) + (j)] = p2

				p2 = stack[u + n * (d) + (j)]
				stack[u + n * (d) + (j)] = stack[u + n * (i) + (j)]
				stack[u + n * (i) + (j)] = p2

		# multiply the pivot row by 1 / pivot

		p2 = stack[a + n * (d) + (d)]

		for j in [0...n]

			if (j > d)
				push(stack[a + n * (d) + (j)])
				push(p2)
				divide()
				stack[a + n * (d) + (j)] = pop()

			push(stack[u + n * (d) + (j)])
			push(p2)
			divide()
			stack[u + n * (d) + (j)] = pop()

		# clear out the column above and below the pivot

		for i in [0...n]

			if (i == d)
				continue

			# multiplier

			p2 = stack[a + n * (i) + (d)]

			# add pivot row to i-th row

			for j in [0...n]

				if (j > d)
					push(stack[a + n * (i) + (j)])
					push(stack[a + n * (d) + (j)])
					push(p2)
					multiply()
					subtract()
					stack[a + n * (i) + (j)] = pop()

				push(stack[u + n * (i) + (j)])
				push(stack[u + n * (d) + (j)])
				push(p2)
				multiply()
				subtract()
				stack[u + n * (i) + (j)] = pop()
