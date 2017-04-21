### det =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
m

General description
-------------------
Returns the determinant of matrix m.
Uses Gaussian elimination for numerical matrices.

Example:

  det(((1,2),(3,4)))
  > -2

###


DET_check_arg = ->
	if (!istensor(p1))
		return 0
	else if (p1.tensor.ndim != 2)
		return 0
	else if (p1.tensor.dim[0] != p1.tensor.dim[1])
		return 0
	else
		return 1

det = ->
	i = 0
	n = 0
	#U **a

	save()

	p1 = pop()

	if (DET_check_arg() == 0)
		push_symbol(DET)
		push(p1)
		list(2)
		restore()
		return

	n = p1.tensor.nelem

	a = p1.tensor.elem

	for i in [0...n]
		if (!isnum(a[i]))
			break

	if (i == n)
		yydetg()
	else
		for i in [0...p1.tensor.nelem]
			push(p1.tensor.elem[i])
		determinant(p1.tensor.dim[0])

	restore()

# determinant of n * n matrix elements on the stack

determinant = (n) ->
	h = 0
	i = 0
	j = 0
	k = 0
	q = 0
	s = 0
	sign_ = 0
	t = 0

	a = []
	#int *a, *c, *d

	h = tos - n * n

	#a = (int *) malloc(3 * n * sizeof (int))

	#if (a == NULL)
	#	out_of_memory()

	for i in [0...n]
		a[i] = i
		a[i+n] = 0
		a[i+n+n] = 1

	sign_ = 1

	push(zero)

	while 1

		if (sign_ == 1)
			push_integer(1)
		else
			push_integer(-1)

		for i in [0...n]
			k = n * a[i] + i
			push(stack[h + k])
			multiply(); # FIXME -- problem here

		add()

		# next permutation (Knuth's algorithm P)

		j = n - 1
		s = 0

		breakFromOutherWhile = false
		while 1
			q = a[n+j] + a[n+n+j]
			if (q < 0)
				a[n+n+j] = -a[n+n+j]
				j--
				continue
			if (q == j + 1)
				if (j == 0)
					breakFromOutherWhile = true
					break
				s++
				a[n+n+j] = -a[n+n+j]
				j--
				continue
			break

		if breakFromOutherWhile
			break

		t = a[j - a[n+j] + s]
		a[j - a[n+j] + s] = a[j - q + s]
		a[j - q + s] = t
		a[n+j] = q

		sign_ = -sign_


	stack[h] = stack[tos - 1]

	moveTos h + 1

#-----------------------------------------------------------------------------
#
#	Input:		Matrix on stack
#
#	Output:		Determinant on stack
#
#	Note:
#
#	Uses Gaussian elimination which is faster for numerical matrices.
#
#	Gaussian Elimination works by walking down the diagonal and clearing
#	out the columns below it.
#
#-----------------------------------------------------------------------------

detg = ->
	save()

	p1 = pop()

	if (DET_check_arg() == 0)
		push_symbol(DET)
		push(p1)
		list(2)
		restore()
		return

	yydetg()

	restore()

yydetg = ->
	i = 0
	n = 0

	n = p1.tensor.dim[0]

	for i in [0...(n * n)]
		push(p1.tensor.elem[i])

	lu_decomp(n)

	moveTos tos - n * n

	push(p1)

#-----------------------------------------------------------------------------
#
#	Input:		n * n matrix elements on stack
#
#	Output:		p1	determinant
#
#			p2	mangled
#
#			upper diagonal matrix on stack
#
#-----------------------------------------------------------------------------

M = (h,n,i, j) ->
	stack[h + n * (i) + (j)]

setM = (h,n,i,j,value) ->
	stack[h + n * (i) + (j)] = value

lu_decomp = (n) ->
	d = 0
	h = 0
	i = 0
	j = 0

	h = tos - n * n

	p1 = one

	for d in [0...(n - 1)]

		# diagonal element zero?

		if (equal(M(h,n,d, d), zero))

			# find a new row

			for i in [(d + 1)...n]
				if (!equal(M(h,n,i, d), zero))
					break

			if (i == n)
				p1 = zero
				break

			# exchange rows

			for j in [d...n]
				p2 = M(h,n,d, j)
				setM(h,n,d, j, M(h,n,i, j))
				setM(h,n,i, j, p2)

			# negate det

			push(p1)
			negate()
			p1 = pop()

		# update det

		push(p1)
		push(M(h,n,d, d))
		multiply()
		p1 = pop()

		# update lower diagonal matrix

		for i in [(d + 1)...n]

			# multiplier

			push(M(h,n,i, d))
			push(M(h,n,d, d))
			divide()
			negate()

			p2 = pop()

			# update one row

			setM(h,n,i, d, zero); # clear column below pivot d

			for j in [(d + 1)...n]
				push(M(h,n,d, j))
				push(p2)
				multiply()
				push(M(h,n,i, j))
				add()
				setM(h,n,i, j, pop())

	# last diagonal element

	push(p1)
	push(M(h,n,n - 1, n - 1))
	multiply()
	p1 = pop()
