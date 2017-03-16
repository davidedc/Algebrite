### eigen =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
m

General description
-------------------
Compute eigenvalues and eigenvectors. Matrix m must be both numerical and symmetric.
The eigenval function returns a matrix with the eigenvalues along the diagonal.
The eigenvec function returns a matrix with the eigenvectors arranged as row vectors.
The eigen function does not return anything but stores the eigenvalue matrix in D
and the eigenvector matrix in Q.

Input:		stack[tos - 1]		symmetric matrix

Output:		D			diagnonal matrix
			Q			eigenvector matrix

D and Q have the property that

	A == dot(transpose(Q),D,Q)

where A is the original matrix.

The eigenvalues are on the diagonal of D.
The eigenvectors are row vectors in Q.

The eigenvalue relation:

	A X = lambda X

can be checked as follows:

	lambda = D[1,1]
	X = Q[1]
	dot(A,X) - lambda X

Example 1. Check the relation AX = lambda X where lambda is an eigenvalue and X is the associated eigenvector.

Enter:

     A = hilbert(3)

     eigen(A)

     lambda = D[1,1]

     X = Q[1]

     dot(A,X) - lambda X

Result:

     -1.16435e-14
 
     -6.46705e-15
 
     -4.55191e-15

Example 2: Check the relation A = QTDQ.

Enter:

  A - dot(transpose(Q),D,Q)

Result: 

  6.27365e-12    -1.58236e-11   1.81902e-11
 
  -1.58236e-11   -1.95365e-11   2.56514e-12
 
  1.81902e-11    2.56514e-12    1.32627e-11

###



#define D(i, j) yydd[EIG_N * (i) + (j)]
#define Q(i, j) yyqq[EIG_N * (i) + (j)]

EIG_N = 0
EIG_yydd = []
EIG_yyqq = []

Eval_eigen = ->
	if (EIG_check_arg() == 0)
		stop("eigen: argument is not a square matrix")

	eigen(EIGEN)

	p1 = usr_symbol("D")
	set_binding(p1, p2)

	p1 = usr_symbol("Q")
	set_binding(p1, p3)

	push(symbol(NIL))

### eigenval =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
m

General description
-------------------
Compute eigenvalues of m. See "eigen" for more info.

###

Eval_eigenval = ->
	if (EIG_check_arg() == 0)
		push_symbol(EIGENVAL)
		push(p1)
		list(2)
		return

	eigen(EIGENVAL)

	push(p2)

### eigenvec =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
m

General description
-------------------
Compute eigenvectors of m. See "eigen" for more info.

###

Eval_eigenvec = ->
	if (EIG_check_arg() == 0)
		push_symbol(EIGENVEC)
		push(p1)
		list(2)
		return

	eigen(EIGENVEC)

	push(p3)

EIG_check_arg = ->
	i = 0
	j = 0

	push(cadr(p1))
	Eval()
	yyfloat()
	Eval()
	p1 = pop()

	if (!istensor(p1))
		return 0

	if (p1.tensor.ndim != 2 || p1.tensor.dim[0] != p1.tensor.dim[1])
		stop("eigen: argument is not a square matrix")

	EIG_N = p1.tensor.dim[0]

	for i in [0...EIG_N]
		for j in [0...EIG_N]
			if (!isdouble(p1.tensor.elem[EIG_N * i + j]))
				stop("eigen: matrix is not numerical")

	for i in [0...(EIG_N-1)]
		for j in [(i+1)...EIG_N]
			if (Math.abs(p1.tensor.elem[EIG_N * i + j].d - p1.tensor.elem[EIG_N * j + i].d) > 1e-10)
				stop("eigen: matrix is not symmetrical")

	return 1

#-----------------------------------------------------------------------------
#
#	Input:		p1		matrix
#
#	Output:		p2		eigenvalues
#
#			p3		eigenvectors
#
#-----------------------------------------------------------------------------

eigen = (op) ->
	i = 0
	j = 0

	# malloc working vars

	#EIG_yydd = (double *) malloc(n * n * sizeof (double))
	for i in [0...(EIG_N*EIG_N)]
		EIG_yydd[i] = 0.0

	#if (EIG_yydd == NULL)
	#	stop("malloc failure")

	#EIG_yyqq = (double *) malloc(n * n * sizeof (double))
	for i in [0...(EIG_N*EIG_N)]
		EIG_yyqq[i] = 0.0

	#if (EIG_yyqq == NULL)
	#	stop("malloc failure")

	# initialize D

	for i in [0...EIG_N]
		EIG_yydd[EIG_N * (i) + (i)] = p1.tensor.elem[EIG_N * i + i].d
		for j in [(i+1)...EIG_N]
			EIG_yydd[EIG_N * (i) + (j)] = p1.tensor.elem[EIG_N * i + j].d
			EIG_yydd[EIG_N * (j) + (i)] = p1.tensor.elem[EIG_N * i + j].d

	# initialize Q

	for i in [0...EIG_N]
		EIG_yyqq[EIG_N * (i) + (i)] = 1.0
		for j in [(i+1)...EIG_N]
			EIG_yyqq[EIG_N * (i) + (j)] = 0.0
			EIG_yyqq[EIG_N * (j) + (i)] = 0.0

	# step up to 100 times

	for i in [0...100]
		if (step() == 0)
			break

	if (i == 100)
		printstr("\nnote: eigen did not converge\n")

	# p2 = D

	if (op == EIGEN || op == EIGENVAL)

		push(p1)
		copy_tensor()
		p2 = pop()

		for i in [0...EIG_N]
			for j in [0...EIG_N]
				push_double(EIG_yydd[EIG_N * (i) + (j)])
				p2.tensor.elem[EIG_N * i + j] = pop()

	# p3 = Q

	if (op == EIGEN || op == EIGENVEC)

		push(p1)
		copy_tensor()
		p3 = pop()

		for i in [0...EIG_N]
			for j in [0...EIG_N]
				push_double(EIG_yyqq[EIG_N * (i) + (j)])
				p3.tensor.elem[EIG_N * i + j] = pop()

	# free working vars


#-----------------------------------------------------------------------------
#
#	Example: p = 1, q = 3
#
#		c	0	s	0
#
#		0	1	0	0
#	G =
#		-s	0	c	0
#
#		0	0	0	1
#
#	The effect of multiplying G times A is...
#
#	row 1 of A    = c (row 1 of A ) + s (row 3 of A )
#	          n+1                n                 n
#
#	row 3 of A    = c (row 3 of A ) - s (row 1 of A )
#	          n+1                n                 n
#
#	In terms of components the overall effect is...
#
#	row 1 = c row 1 + s row 3
#
#		A[1,1] = c A[1,1] + s A[3,1]
#
#		A[1,2] = c A[1,2] + s A[3,2]
#
#		A[1,3] = c A[1,3] + s A[3,3]
#
#		A[1,4] = c A[1,4] + s A[3,4]
#
#	row 3 = c row 3 - s row 1
#
#		A[3,1] = c A[3,1] - s A[1,1]
#
#		A[3,2] = c A[3,2] - s A[1,2]
#
#		A[3,3] = c A[3,3] - s A[1,3]
#
#		A[3,4] = c A[3,4] - s A[1,4]
#
#	                                   T
#	The effect of multiplying A times G  is...
#
#	col 1 of A    = c (col 1 of A ) + s (col 3 of A )
#	          n+1                n                 n
#
#	col 3 of A    = c (col 3 of A ) - s (col 1 of A )
#	          n+1                n                 n
#
#	In terms of components the overall effect is...
#
#	col 1 = c col 1 + s col 3
#
#		A[1,1] = c A[1,1] + s A[1,3]
#
#		A[2,1] = c A[2,1] + s A[2,3]
#
#		A[3,1] = c A[3,1] + s A[3,3]
#
#		A[4,1] = c A[4,1] + s A[4,3]
#
#	col 3 = c col 3 - s col 1
#
#		A[1,3] = c A[1,3] - s A[1,1]
#
#		A[2,3] = c A[2,3] - s A[2,1]
#
#		A[3,3] = c A[3,3] - s A[3,1]
#
#		A[4,3] = c A[4,3] - s A[4,1]
#
#	What we want to do is just compute the upper triangle of A since we
#	know the lower triangle is identical.
#
#	In other words, we just want to update components A[i,j] where i < j.
#
#-----------------------------------------------------------------------------
#
#	Example: p = 2, q = 5
#
#				p			q
#
#			j=1	j=2	j=3	j=4	j=5	j=6
#
#		i=1	.	A[1,2]	.	.	A[1,5]	.
#
#	p	i=2	A[2,1]	A[2,2]	A[2,3]	A[2,4]	A[2,5]	A[2,6]
#
#		i=3	.	A[3,2]	.	.	A[3,5]	.
#
#		i=4	.	A[4,2]	.	.	A[4,5]	.
#
#	q	i=5	A[5,1]	A[5,2]	A[5,3]	A[5,4]	A[5,5]	A[5,6]
#
#		i=6	.	A[6,2]	.	.	A[6,5]	.
#
#-----------------------------------------------------------------------------
#
#	This is what B = GA does:
#
#	row 2 = c row 2 + s row 5
#
#		B[2,1] = c * A[2,1] + s * A[5,1]
#		B[2,2] = c * A[2,2] + s * A[5,2]
#		B[2,3] = c * A[2,3] + s * A[5,3]
#		B[2,4] = c * A[2,4] + s * A[5,4]
#		B[2,5] = c * A[2,5] + s * A[5,5]
#		B[2,6] = c * A[2,6] + s * A[5,6]
#
#	row 5 = c row 5 - s row 2
#
#		B[5,1] = c * A[5,1] + s * A[2,1]
#		B[5,2] = c * A[5,2] + s * A[2,2]
#		B[5,3] = c * A[5,3] + s * A[2,3]
#		B[5,4] = c * A[5,4] + s * A[2,4]
#		B[5,5] = c * A[5,5] + s * A[2,5]
#		B[5,6] = c * A[5,6] + s * A[2,6]
#
#	               T
#	This is what BG  does:
#
#	col 2 = c col 2 + s col 5
#
#		B[1,2] = c * A[1,2] + s * A[1,5]
#		B[2,2] = c * A[2,2] + s * A[2,5]
#		B[3,2] = c * A[3,2] + s * A[3,5]
#		B[4,2] = c * A[4,2] + s * A[4,5]
#		B[5,2] = c * A[5,2] + s * A[5,5]
#		B[6,2] = c * A[6,2] + s * A[6,5]
#
#	col 5 = c col 5 - s col 2
#
#		B[1,5] = c * A[1,5] - s * A[1,2]
#		B[2,5] = c * A[2,5] - s * A[2,2]
#		B[3,5] = c * A[3,5] - s * A[3,2]
#		B[4,5] = c * A[4,5] - s * A[4,2]
#		B[5,5] = c * A[5,5] - s * A[5,2]
#		B[6,5] = c * A[6,5] - s * A[6,2]
#
#-----------------------------------------------------------------------------
#
#	Step 1: Just do upper triangle (i < j), B[2,5] = 0
#
#		B[1,2] = c * A[1,2] + s * A[1,5]
#
#		B[2,3] = c * A[2,3] + s * A[5,3]
#		B[2,4] = c * A[2,4] + s * A[5,4]
#		B[2,6] = c * A[2,6] + s * A[5,6]
#
#		B[1,5] = c * A[1,5] - s * A[1,2]
#		B[3,5] = c * A[3,5] - s * A[3,2]
#		B[4,5] = c * A[4,5] - s * A[4,2]
#
#		B[5,6] = c * A[5,6] + s * A[2,6]
#
#-----------------------------------------------------------------------------
#
#	Step 2: Transpose where i > j since A[i,j] == A[j,i]
#
#		B[1,2] = c * A[1,2] + s * A[1,5]
#
#		B[2,3] = c * A[2,3] + s * A[3,5]
#		B[2,4] = c * A[2,4] + s * A[4,5]
#		B[2,6] = c * A[2,6] + s * A[5,6]
#
#		B[1,5] = c * A[1,5] - s * A[1,2]
#		B[3,5] = c * A[3,5] - s * A[2,3]
#		B[4,5] = c * A[4,5] - s * A[2,4]
#
#		B[5,6] = c * A[5,6] + s * A[2,6]
#
#-----------------------------------------------------------------------------
#
#	Step 3: Same as above except reorder
#
#	k < p		(k = 1)
#
#		A[1,2] = c * A[1,2] + s * A[1,5]
#		A[1,5] = c * A[1,5] - s * A[1,2]
#
#	p < k < q	(k = 3..4)
#
#		A[2,3] = c * A[2,3] + s * A[3,5]
#		A[3,5] = c * A[3,5] - s * A[2,3]
#
#		A[2,4] = c * A[2,4] + s * A[4,5]
#		A[4,5] = c * A[4,5] - s * A[2,4]
#
#	q < k		(k = 6)
#
#		A[2,6] = c * A[2,6] + s * A[5,6]
#		A[5,6] = c * A[5,6] - s * A[2,6]
#
#-----------------------------------------------------------------------------

step = ->
	i = 0
	j = 0
	count = 0

	# for each upper triangle "off-diagonal" component do step2

	for i in [0...(EIG_N-1)]
		for j in [(i+1)...EIG_N]
			if (EIG_yydd[EIG_N * (i) + (j)] != 0.0)
				step2(i, j)
				count++

	return count

step2 = (p,q) ->
	k = 0
	t = 0.0
	theta = 0.0
	c = 0.0
	cc = 0.0
	s = 0.0
	ss = 0.0

	# compute c and s

	# from Numerical Recipes (except they have a_qq - a_pp)

	theta = 0.5 * (EIG_yydd[EIG_N * (p) + (p)] - EIG_yydd[EIG_N * (q) + (q)]) / EIG_yydd[EIG_N * (p) + (q)]

	t = 1.0 / (Math.abs(theta) + Math.sqrt(theta * theta + 1.0))

	if (theta < 0.0)
		t = -t

	c = 1.0 / Math.sqrt(t * t + 1.0)

	s = t * c

	# D = GD

	# which means "add rows"

	for k in [0...EIG_N]
		cc = EIG_yydd[EIG_N * (p) + (k)]
		ss = EIG_yydd[EIG_N * (q) + (k)]
		EIG_yydd[EIG_N * (p) + (k)] = c * cc + s * ss
		EIG_yydd[EIG_N * (q) + (k)] = c * ss - s * cc

	# D = D transpose(G)

	# which means "add columns"

	for k in [0...EIG_N]
		cc = EIG_yydd[EIG_N * (k) + (p)]
		ss = EIG_yydd[EIG_N * (k) + (q)]
		EIG_yydd[EIG_N * (k) + (p)] = c * cc + s * ss
		EIG_yydd[EIG_N * (k) + (q)] = c * ss - s * cc

	# Q = GQ

	# which means "add rows"

	for k in [0...EIG_N]
		cc = EIG_yyqq[EIG_N * (p) + (k)]
		ss = EIG_yyqq[EIG_N * (q) + (k)]
		EIG_yyqq[EIG_N * (p) + (k)] = c * cc + s * ss
		EIG_yyqq[EIG_N * (q) + (k)] = c * ss - s * cc

	EIG_yydd[EIG_N * (p) + (q)] = 0.0
	EIG_yydd[EIG_N * (q) + (p)] = 0.0


