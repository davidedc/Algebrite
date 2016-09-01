# the inner (or dot) operator gives products of vectors,
# matrices, and tensors.
#
# Note that for Algebrite, the elements of a vector/matrix
# can only be scalars. This allows for example to flesh out
# matrix multiplication using the usual multiplication.
# So for example block-representations are not allowed.
#
# There is an aweful lot of confusion between sw packages on
# what dot and inner do.
#
# First off, the "dot" operator is different from the
# mathematical notion of dot product, which can be
# slightly confusing.
#
# The mathematical notion of dot product is here:
#   http://mathworld.wolfram.com/DotProduct.html
#
# However, "dot" does that and a bunch of other things,
# i.e. in Algebrite
# dot/inner does what the dot of Mathematica does, i.e.:
#
# scalar product of vectors:
#
#   inner((a, b, c), (x, y, z))
#   > a x + b y + c z
#
# products of matrices and vectors:
#
#   inner(((a, b), (c,d)), (x, y))
#   > (a x + b y,c x + d y)
#
#   inner((x, y), ((a, b), (c,d)))
#   > (a x + c y,b x + d y)
#
#   inner((x, y), ((a, b), (c,d)), (r, s))
#   > a r x + b s x + c r y + d s y
#
# matrix product:
#
#   inner(((a,b),(c,d)),((r,s),(t,u)))
#   > ((a r + b t,a s + b u),(c r + d t,c s + d u))
#
# the "dot/inner" operator is associative and
# distributive but not commutative.
#
# In Mathematica, Inner if a generalisation of Dot where
# the user can specify the multiplication and the addition
# operators.
# But here in Algebrite they do the same thing.
#
# https://reference.wolfram.com/language/ref/Dot.html
# https://reference.wolfram.com/language/ref/Inner.html
#
# http://uk.mathworks.com/help/matlab/ref/dot.html
# http://uk.mathworks.com/help/matlab/ref/mtimes.html




Eval_inner = ->

	# note that
	#   inner(a,b,c)
	# is
	#   inner(inner(a,b),c)
	# but we're gonna normalise that
	# to
	#   inner(a,inner(b,c)) 

	p1 = cdr(p1)
	push(car(p1))
	Eval()
	p1 = cdr(p1)
	while (iscons(p1))
		push(car(p1))
		Eval()
		inner()
		p1 = cdr(p1)

# inner definition
inner = ->
	save()
	p2 = pop()
	p1 = pop()

	# more in general, when a and b are scalars,
	# inner(a*M1, b*M2) is equal to
	# a*b*inner(M1,M2), but of course we can only
	# "bring out" in a and b the scalars, because
	# it's the only commutative part.
	# that's going to be trickier to do in general
	# but let's start with just the signs.
	if isnegativeterm(p2) and isnegativeterm(p1)
		push p2
		negate()
		p2 = pop()
		push p1
		negate()
		p1 = pop()

	# since inner is associative,
	# put it in a canonical form i.e.
	# inner(inner(a,b),c) ->
	# inner(a,inner(b,c))
	# so that we can recognise when they
	# are equal.
	if isinnerordot(p1)
		arg1 = car(cdr(p1)) #a
		arg2 = car(cdr(cdr(p1))) #b
		arg3 = p2
		p1 = arg1
		push arg2
		push arg3
		inner()
		p2 = pop()

	# Check if one of the operands is the identity matrix
	# we could maybe use Eval_testeq here but
	# this seems to suffice?
	if p1 == symbol(SYMBOL_IDENTITY_MATRIX)
		push p2
		restore()
		return
	else if p2 == symbol(SYMBOL_IDENTITY_MATRIX)
		push p1
		restore()
		return


	if (istensor(p1) && istensor(p2))
		inner_f()
	else

		# simple check if the two elements are one the
		# inv of the other. If they are, the answer is
		# the identity matrix
		push p1
		push p2
		inv()
		subtract()
		subtractionResult = pop()
		if (iszero(subtractionResult))
			push_symbol(SYMBOL_IDENTITY_MATRIX)
			restore()
			return


		# if either operand is a sum then distribute
		# (if we are in expanding mode)
		if (expanding && isadd(p1))
			p1 = cdr(p1)
			push(zero)
			while (iscons(p1))
				push(car(p1))
				push(p2)
				inner()
				add()
				p1 = cdr(p1)
			restore()
			return

		if (expanding && isadd(p2))
			p2 = cdr(p2)
			push(zero)
			while (iscons(p2))
				push(p1)
				push(car(p2))
				inner()
				add()
				p2 = cdr(p2)
			restore()
			return

		push(p1)
		push(p2)


		# there are 8 remaining cases here, since each of the
		# two arguments can only be a scalar/tensor/unknown
		# and the tensor - tensor case was caught
		# upper in the code
		if (istensor(p1) and isnum(p2))
			# one case covered by this branch:
			#   tensor - scalar
			tensor_times_scalar()
		else if (isnum(p1) and istensor(p2))
			# one case covered by this branch:
			#   scalar - tensor
			scalar_times_tensor()
		else
			if (isnum(p1) or isnum(p2))
				# three cases covered by this branch:
				#   unknown - scalar
				#   scalar - unknown
				#   scalar  - scalar
				# in these cases a normal multiplication
				# will be OK
				multiply()
			else
				# three cases covered by this branch:
				#   unknown - unknown
				#   unknown - tensor
				#   tensor  - unknown
				# in this case we can't use normal
				# multiplication.
				pop()
				pop()
				push_symbol(INNER)
				push(p1)
				push(p2)
				list(3)
				restore()
				return


	restore()

# inner product of tensors p1 and p2
inner_f = ->

	i = 0
	n = p1.tensor.dim[p1.tensor.ndim - 1]

	if (n != p2.tensor.dim[0])
		debugger
		stop("inner: tensor dimension check")

	ndim = p1.tensor.ndim + p2.tensor.ndim - 2

	if (ndim > MAXDIM)
		stop("inner: rank of result exceeds maximum")

	a = p1.tensor.elem
	b = p2.tensor.elem

	#---------------------------------------------------------------------
	#
	#	ak is the number of rows in tensor A
	#
	#	bk is the number of columns in tensor B
	#
	#	Example:
	#
	#	A[3][3][4] B[4][4][3]
	#
	#	  3  3				ak = 3 * 3 = 9
	#
	#	                4  3		bk = 4 * 3 = 12
	#
	#---------------------------------------------------------------------

	ak = 1
	for i in [0...(p1.tensor.ndim - 1)]
		ak *= p1.tensor.dim[i]

	bk = 1
	for i in [1...p2.tensor.ndim]
		bk *= p2.tensor.dim[i]

	p3 = alloc_tensor(ak * bk)

	c = p3.tensor.elem

	# new method copied from ginac http://www.ginac.de/
	for i in [0...ak]
		for j in [0...n]
			if (iszero(a[i * n + j]))
				continue
			for k in [0...bk]
				push(a[i * n + j])
				push(b[j * bk + k])
				multiply()
				push(c[i * bk + k])
				add()
				c[i * bk + k] = pop()

	#---------------------------------------------------------------------
	#
	#	Note on understanding "k * bk + j"
	#
	#	k * bk because each element of a column is bk locations apart
	#
	#	+ j because the beginnings of all columns are in the first bk 
	#	locations
	#
	#	Example: n = 2, bk = 6
	#
	#	b111	<- 1st element of 1st column
	#	b112	<- 1st element of 2nd column
	#	b113	<- 1st element of 3rd column
	#	b121	<- 1st element of 4th column
	#	b122	<- 1st element of 5th column
	#	b123	<- 1st element of 6th column
	#
	#	b211	<- 2nd element of 1st column
	#	b212	<- 2nd element of 2nd column
	#	b213	<- 2nd element of 3rd column
	#	b221	<- 2nd element of 4th column
	#	b222	<- 2nd element of 5th column
	#	b223	<- 2nd element of 6th column
	#
	#---------------------------------------------------------------------

	if (ndim == 0)
		push(p3.tensor.elem[0])
	else
		p3.tensor.ndim = ndim
		j = 0
		for i in [0...(p1.tensor.ndim - 1)]
			p3.tensor.dim[i] = p1.tensor.dim[i]
		j = p1.tensor.ndim - 1
		for i in [0...(p2.tensor.ndim - 1)]
			p3.tensor.dim[j + i] = p2.tensor.dim[i + 1]
		push(p3)

