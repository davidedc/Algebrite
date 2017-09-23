### dot =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
a,b,...

General description
-------------------

The inner (or dot) operator gives products of vectors,
matrices, and tensors.

Note that for Algebrite, the elements of a vector/matrix
can only be scalars. This allows for example to flesh out
matrix multiplication using the usual multiplication.
So for example block-representations are not allowed.

There is an aweful lot of confusion between sw packages on
what dot and inner do.

First off, the "dot" operator is different from the
mathematical notion of dot product, which can be
slightly confusing.

The mathematical notion of dot product is here:
  http://mathworld.wolfram.com/DotProduct.html

However, "dot" does that and a bunch of other things,
i.e. in Algebrite
dot/inner does what the dot of Mathematica does, i.e.:

scalar product of vectors:

  inner((a, b, c), (x, y, z))
  > a x + b y + c z

products of matrices and vectors:

  inner(((a, b), (c,d)), (x, y))
  > (a x + b y,c x + d y)

  inner((x, y), ((a, b), (c,d)))
  > (a x + c y,b x + d y)

  inner((x, y), ((a, b), (c,d)), (r, s))
  > a r x + b s x + c r y + d s y

matrix product:

  inner(((a,b),(c,d)),((r,s),(t,u)))
  > ((a r + b t,a s + b u),(c r + d t,c s + d u))

the "dot/inner" operator is associative and
distributive but not commutative.

In Mathematica, Inner is a generalisation of Dot where
the user can specify the multiplication and the addition
operators.
But here in Algebrite they do the same thing.

 https://reference.wolfram.com/language/ref/Dot.html
 https://reference.wolfram.com/language/ref/Inner.html

 http://uk.mathworks.com/help/matlab/ref/dot.html
 http://uk.mathworks.com/help/matlab/ref/mtimes.html

###



Eval_inner = ->
	

	# if there are more than two arguments then
	# reduce it to a more standard version
	# of two arguments, which means we need to
	# transform the arguments into a tree of
	# inner products e.g.
	# inner(a,b,c) becomes inner(a,inner(b,c))
	# this is so we can get to a standard binary-tree
	# version that is simpler to manipulate.
	theArguments = []
	theArguments.push car(cdr(p1))
	secondArgument = car(cdr(cdr(p1)))
	if secondArgument == symbol(NIL)
		stop("pattern needs at least a template and a transformed version")
	
	moretheArguments = cdr(cdr(p1))
	while moretheArguments != symbol(NIL)
		theArguments.push car(moretheArguments)
		moretheArguments = cdr(moretheArguments)

	# make it so e.g. inner(a,b,c) becomes inner(a,inner(b,c))
	if theArguments.length > 2
		push_symbol(INNER)
		push theArguments[theArguments.length-2]
		push theArguments[theArguments.length-1]
		list(3)
		for i in [2...theArguments.length]
			push_symbol(INNER)
			swap()
			push theArguments[theArguments.length-i-1]
			swap()
			list(3)
		p1 = pop()
		Eval_inner()
		return




	# TODO we have to take a look at the whole
	# sequence of operands and make simplifications
	# on that...
	operands = []
	get_innerprod_factors(p1, operands)

	#console.log "printing operands --------"
	#for i in [0...operands.length]
	#	console.log "operand " + i + " : " + operands[i]

	refinedOperands = []
	# removing all identity matrices
	for i in [0...operands.length]
		if operands[i] == symbol(SYMBOL_IDENTITY_MATRIX)
			continue
		else refinedOperands.push operands[i]
	operands = refinedOperands
	
	refinedOperands = []
	if operands.length > 1
		# removing all consecutive pairs of inverses
		# so we can answer that inv(a)·a results in the
		# identity matrix. We want to catch symbolic inverses
		# not numeric inverses, those will just take care
		# of themselves when multiplied
		shift = 0
		for i in [0...operands.length]
			#console.log "comparing if " + operands[i+shift] + " and " + operands[i+shift+1] + " are inverses of each other"
			if (i+shift+1) <= (operands.length - 1)
				#console.log "isnumerictensor " + operands[i+shift] + " : " + isnumerictensor(operands[i+shift])
				#console.log "isnumerictensor " + operands[i+shift+1] + " : " + isnumerictensor(operands[i+shift+1])
				if !(isnumerictensor(operands[i+shift]) or isnumerictensor(operands[i+shift+1]))
					push operands[i+shift]
					Eval()
					inv()
					push operands[i+shift+1]
					Eval()
					subtract()
					difference = pop()
					#console.log "result: " + difference
					if (iszero(difference))
						shift+=1
					else
						refinedOperands.push operands[i+shift]
				else
					refinedOperands.push operands[i+shift]

			else
				break

			#console.log "i: " + i + " shift: " + shift + " operands.length: " + operands.length

			if i+shift == operands.length - 2
				#console.log "adding last operand 2 "
				refinedOperands.push operands[operands.length-1]
			if i+shift >= operands.length - 1
				break
		operands = refinedOperands

	#console.log "refined operands --------"
	#for i in [0...refinedOperands.length]
	#	console.log "refined operand " + i + " : " + refinedOperands[i]


	#console.log "stack[tos-1]: " + stack[tos-1]

	# now rebuild the arguments, just using the
	# refined operands
	push symbol(INNER)
	#console.log "rebuilding the argument ----"
	
	if operands.length > 0
		for i in [0...operands.length]
			#console.log "pushing " + operands[i]
			push operands[i]
	else
		pop()
		push symbol(SYMBOL_IDENTITY_MATRIX)
		return
	#console.log "list(operands.length): " + (operands.length+1)
	list(operands.length + 1)
	p1 = pop()


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

		# simple check if the two consecutive elements are one the
		# (symbolic) inv of the other. If they are, the answer is
		# the identity matrix
		if !(isnumerictensor(p1) or isnumerictensor(p2))
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

# Algebrite.run('c·(b+a)ᵀ·inv((a+b)ᵀ)·d').toString();
# Algebrite.run('c*(b+a)ᵀ·inv((a+b)ᵀ)·d').toString();
# Algebrite.run('(c·(b+a)ᵀ)·(inv((a+b)ᵀ)·d)').toString();
get_innerprod_factors = (tree, factors_accumulator) ->
	# console.log "extracting inner prod. factors from " + tree

	if !iscons(tree)
		add_factor_to_accumulator(tree, factors_accumulator)
		return
		
	if cdr(tree) == symbol(NIL)
		tree = get_innerprod_factors(car(tree), factors_accumulator)
		return

	if isinnerordot(tree)
		# console.log "there is inner at top, recursing on the operands"
		get_innerprod_factors(car(cdr(tree)),factors_accumulator)
		get_innerprod_factors(cdr(cdr(tree)),factors_accumulator)
		return
	
	add_factor_to_accumulator(tree, factors_accumulator)

add_factor_to_accumulator = (tree, factors_accumulator) ->
	if tree != symbol(NIL)
		# console.log ">> adding to factors_accumulator: " + tree
		factors_accumulator.push(tree)

