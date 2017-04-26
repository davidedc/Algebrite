# Evaluate an expression, for example...
#
#	push(p1)
#	Eval()
#	p2 = pop()



Eval = ->
	check_esc_flag()
	save()
	p1 = pop()
	if !p1?
		debugger

	if !evaluatingAsFloats and isfloating(p1)
		willEvaluateAsFloats = true
		evaluatingAsFloats++

	switch (p1.k)
		when CONS
			Eval_cons()
		when NUM
			if evaluatingAsFloats
				push_double(convert_rational_to_double(p1))
			else
				push(p1)
		when DOUBLE, STR
			push(p1)
		when TENSOR
			Eval_tensor()
		when SYM
			Eval_sym()
		else
			stop("atom?")

	if willEvaluateAsFloats
		evaluatingAsFloats--

	restore()

Eval_sym = ->

	# note that function calls are not processed here
	# because, since they have an argument (at least an empty one)
	# they are actually CONs, which is a branch of the
	# switch before the one that calls this function

	# bare keyword?
	# If it's a keyword, then we don't look
	# at the binding array, because keywords
	# are not redefinable. 
	if (iskeyword(p1))
		push(p1)
		push(symbol(LAST))
		list(2)
		Eval()
		return
	else if (p1 == symbol(PI) and evaluatingAsFloats)
		push_double(Math.PI)
		return

	# Evaluate symbol's binding
	p2 = get_binding(p1)
	if DEBUG then console.log "looked up: " + p1 + " which contains: " + p2

	push(p2)


	# differently from standard Lisp,
	# here the evaluation is not
	# one-step only, rather it keeps evaluating
	# "all the way" until a symbol is
	# defined as itself.
	# Uncomment these two lines to get Lisp
	# behaviour (and break most tests)
	if (p1 != p2)

		# detect recursive lookup of symbols, which would otherwise
		# cause a stack overflow.
		# Note that recursive functions will still work because
		# as mentioned at the top, this method doesn't look
		# up and evaluate function calls.
		positionIfSymbolAlreadyBeingEvaluated = chainOfUserSymbolsNotFunctionsBeingEvaluated.indexOf(p1)
		if  positionIfSymbolAlreadyBeingEvaluated != -1
			cycleString = ""
			for i in [positionIfSymbolAlreadyBeingEvaluated...chainOfUserSymbolsNotFunctionsBeingEvaluated.length]
				cycleString += chainOfUserSymbolsNotFunctionsBeingEvaluated[i].printname + " -> "
			cycleString += p1.printname

			stop("recursive evaluation of symbols: " + cycleString)
			return

		chainOfUserSymbolsNotFunctionsBeingEvaluated.push(p1)


		Eval()

		chainOfUserSymbolsNotFunctionsBeingEvaluated.pop()

Eval_cons = ->
	
	cons_head = car(p1)

	# normally the cons_head is a symbol,
	# but sometimes in the case of
	# functions we don't have a symbol,
	# we have to evaluate something to get to the
	# symbol. For example if a function is inside
	# a tensor, then we need to evaluate an index
	# access first to get to the function.
	# In those cases, we find an EVAL here,
	# so we proceed to EVAL
	if car(cons_head) == symbol(EVAL)
		Eval_user_function()
		return

	# If we didn't fall in the EVAL case above
	# then at this point we must have a symbol.
	if (!issymbol(cons_head))
		stop("cons?")

	switch (symnum(cons_head))
		when ABS then Eval_abs()
		when ADD then Eval_add()
		when ADJ then Eval_adj()
		when AND then Eval_and()
		when ARCCOS then Eval_arccos()
		when ARCCOSH then Eval_arccosh()
		when ARCSIN then Eval_arcsin()
		when ARCSINH then Eval_arcsinh()
		when ARCTAN then Eval_arctan()
		when ARCTANH then Eval_arctanh()
		when ARG then Eval_arg()
		when ATOMIZE then Eval_atomize()
		when BESSELJ then Eval_besselj()
		when BESSELY then Eval_bessely()
		when BINDING then Eval_binding()
		when BINOMIAL then Eval_binomial()
		when CEILING then Eval_ceiling()
		when CHECK then Eval_check()
		when CHOOSE then Eval_choose()
		when CIRCEXP then Eval_circexp()
		when CLEAR then Eval_clear()
		when CLEARALL then Eval_clearall()
		when CLEARPATTERNS then Eval_clearpatterns()
		when CLOCK then Eval_clock()
		when COEFF then Eval_coeff()
		when COFACTOR then Eval_cofactor()
		when CONDENSE then Eval_condense()
		when CONJ then Eval_conj()
		when CONTRACT then Eval_contract()
		when COS then Eval_cos()
		when COSH then Eval_cosh()
		when DECOMP then Eval_decomp()
		when DEGREE then Eval_degree()
		when DEFINT then Eval_defint()
		when DENOMINATOR then Eval_denominator()
		when DERIVATIVE then Eval_derivative()
		when DET then Eval_det()
		when DIM then Eval_dim()
		when DIRAC then Eval_dirac()
		when DIVISORS then Eval_divisors()
		when DO then Eval_do()
		when DOT then Eval_inner()
		when DRAW then Eval_draw()
		when DSOLVE then Eval_dsolve()
		when EIGEN then Eval_eigen()
		when EIGENVAL then Eval_eigenval()
		when EIGENVEC then Eval_eigenvec()
		when ERF then Eval_erf()
		when ERFC then Eval_erfc()
		when EVAL then Eval_Eval()
		when EXP then Eval_exp()
		when EXPAND then Eval_expand()
		when EXPCOS then Eval_expcos()
		when EXPSIN then Eval_expsin()
		when FACTOR then Eval_factor()
		when FACTORIAL then Eval_factorial()
		when FACTORPOLY then Eval_factorpoly()
		when FILTER then Eval_filter()
		when FLOATF then Eval_float()
		when APPROXRATIO then Eval_approxratio()
		when FLOOR then Eval_floor()
		when FOR then Eval_for()
		# this is invoked only when we
		# evaluate a function that is NOT being called
		# e.g. when f is a function as we do
		#  g = f
		when FUNCTION then Eval_function_reference()
		when GAMMA then Eval_gamma()
		when GCD then Eval_gcd()
		when HERMITE then Eval_hermite()
		when HILBERT then Eval_hilbert()
		when IMAG then Eval_imag()
		when INDEX then Eval_index()
		when INNER then Eval_inner()
		when INTEGRAL then Eval_integral()
		when INV then Eval_inv()
		when INVG then Eval_invg()
		when ISINTEGER then Eval_isinteger()
		when ISPRIME then Eval_isprime()
		when LAGUERRE then Eval_laguerre()
		#	when LAPLACE then Eval_laplace()
		when LCM then Eval_lcm()
		when LEADING then Eval_leading()
		when LEGENDRE then Eval_legendre()
		when LOG then Eval_log()
		when LOOKUP then Eval_lookup()
		when MOD then Eval_mod()
		when MULTIPLY then Eval_multiply()
		when NOT then Eval_not()
		when NROOTS then Eval_nroots()
		when NUMBER then Eval_number()
		when NUMERATOR then Eval_numerator()
		when OPERATOR then Eval_operator()
		when OR then Eval_or()
		when OUTER then Eval_outer()
		when PATTERN then Eval_pattern()
		when PATTERNSINFO then Eval_patternsinfo()
		when POLAR then Eval_polar()
		when POWER then Eval_power()
		when PRIME then Eval_prime()
		when PRINT then Eval_print()
		when PRINT2DASCII then Eval_print2dascii()
		when PRINTFULL then Eval_printfull()
		when PRINTLATEX then Eval_printlatex()
		when PRINTLIST then Eval_printlist()
		when PRINTPLAIN then Eval_printplain()
		when PRODUCT then Eval_product()
		when QUOTE then Eval_quote()
		when QUOTIENT then Eval_quotient()
		when RANK then Eval_rank()
		when RATIONALIZE then Eval_rationalize()
		when REAL then Eval_real()
		when ROUND then Eval_round()
		when YYRECT then Eval_rect()
		when ROOTS then Eval_roots()
		when SETQ then Eval_setq()
		when SGN then Eval_sgn()
		when SILENTPATTERN then Eval_silentpattern()
		when SIMPLIFY then Eval_simplify()
		when SIN then Eval_sin()
		when SINH then Eval_sinh()
		when SHAPE then Eval_shape()
		when SQRT then Eval_sqrt()
		when STOP then Eval_stop()
		when SUBST then Eval_subst()
		when SUM then Eval_sum()
		when SYMBOLSINFO then Eval_symbolsinfo()
		when TAN then Eval_tan()
		when TANH then Eval_tanh()
		when TAYLOR then Eval_taylor()
		when TEST then Eval_test()
		when TESTEQ then Eval_testeq()
		when TESTGE then Eval_testge()
		when TESTGT then Eval_testgt()
		when TESTLE then Eval_testle()
		when TESTLT then Eval_testlt()
		when TRANSPOSE then Eval_transpose()
		when UNIT then Eval_unit()
		when ZERO then Eval_zero()
		else
			Eval_user_function()

Eval_binding = ->
	push(get_binding(cadr(p1)))

### check =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
p

General description
-------------------
Checks the predicate p, e.g. check(a = b)
Note how "check" can turn what normally would be an assignment into a test,
so in the case above "a" is not assigned anything.

###

# check definition
Eval_check = ->
	push(cadr(p1))
	Eval_predicate()
	p1 = pop()
	push(p1)

Eval_det = ->
	push(cadr(p1))
	Eval()
	det()


### dim =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
m,n

General description
-------------------
Returns the cardinality of the nth index of tensor "m".

###

Eval_dim = ->
	#int n
	push(cadr(p1))
	Eval()
	p2 = pop()
	if (iscons(cddr(p1)))
		push(caddr(p1))
		Eval()
		n = pop_integer()
	else
		n = 1
	if (!istensor(p2))
		push_integer(1) # dim of scalar is 1
	else if (n < 1 || n > p2.tensor.ndim)
		push(p1)
	else
		push_integer(p2.tensor.dim[n - 1])

Eval_divisors = ->
	push(cadr(p1))
	Eval()
	divisors()

### do =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
a,b,...

General description
-------------------
Evaluates each argument from left to right. Returns the result of the last argument.

###

Eval_do = ->
	push(car(p1))
	p1 = cdr(p1)
	while (iscons(p1))
		pop()
		push(car(p1))
		Eval()
		p1 = cdr(p1)

Eval_dsolve = ->
	push(cadr(p1))
	Eval()
	push(caddr(p1))
	Eval()
	push(cadddr(p1))
	Eval()
	dsolve()

# for example, Eval(f,x,2)

Eval_Eval = ->
	push(cadr(p1))
	Eval()
	p1 = cddr(p1)
	while (iscons(p1))
		push(car(p1))
		Eval()
		push(cadr(p1))
		Eval()
		subst()
		p1 = cddr(p1)
	Eval()

# exp evaluation: it replaces itself with
# a POWER(E,something) node and evals that one
Eval_exp = ->
	push(cadr(p1))
	Eval()
	exponential()

Eval_factorial = ->
	push(cadr(p1))
	Eval()
	factorial()

Eval_factorpoly = ->
	p1 = cdr(p1)
	push(car(p1))
	Eval()
	p1 = cdr(p1)
	push(car(p1))
	Eval()
	factorpoly()
	p1 = cdr(p1)
	while (iscons(p1))
		push(car(p1))
		Eval()
		factorpoly()
		p1 = cdr(p1)

Eval_hermite = ->
	push(cadr(p1))
	Eval()
	push(caddr(p1))
	Eval()
	hermite()

Eval_hilbert = ->
	push(cadr(p1))
	Eval()
	hilbert()

Eval_index = ->
	h = tos
	orig = p1
	
	# look into the head of the list,
	# when evaluated it should be a tensor
	p1 = cdr(p1)
	push car(p1)
	Eval()
	theTensor = stack[tos-1]

	if isnum(theTensor)
		stop("trying to access a scalar as a tensor")

	if !istensor(theTensor)
		# the tensor is not allocated yet, so
		# leaving the expression unevalled
		moveTos h
		push orig
		return

	# we examined the head of the list which
	# was the tensor, now look into
	# the indexes
	p1 = cdr(p1)
	while (iscons(p1))
		push(car(p1))
		Eval()
		if !isintegerorintegerfloat(stack[tos-1])
			# index with something other than
			# an integer
			moveTos h
			push orig
			return
		p1 = cdr(p1)
	index_function(tos - h)

Eval_inv = ->
	push(cadr(p1))
	Eval()
	inv()

Eval_invg = ->
	push(cadr(p1))
	Eval()
	invg()

Eval_isinteger = ->
	push(cadr(p1))
	Eval()
	p1 = pop()
	if (isrational(p1))
		if (isinteger(p1))
			push(one)
		else
			push(zero)
		return
	if (isdouble(p1))
		n = Math.floor(p1.d)
		if (n == p1.d)
			push(one)
		else
			push(zero)
		return
	push_symbol(ISINTEGER)
	push(p1)
	list(2)

Eval_number = ->
	push(cadr(p1))
	Eval()
	p1 = pop()
	if (p1.k == NUM || p1.k == DOUBLE)
		push_integer(1)
	else
		push_integer(0)

Eval_operator = ->
	h = tos
	push_symbol(OPERATOR)
	p1 = cdr(p1)
	while (iscons(p1))
		push(car(p1))
		Eval()
		p1 = cdr(p1)
	list(tos - h)

# quote definition
Eval_quote = ->
	push(cadr(p1))

# rank definition
Eval_rank = ->
	push(cadr(p1))
	Eval()
	p1 = pop()
	if (istensor(p1))
		push_integer(p1.tensor.ndim)
	else
		push(zero)

# Evaluates the right side and assigns the
# result of the evaluation to the left side.
# It's called setq because it stands for "set quoted" from Lisp,
# see:
#   http://stackoverflow.com/questions/869529/difference-between-set-setq-and-setf-in-common-lisp

# Example:
#   f = x
#   // f evaluates to x, so x is assigned to g really
#   // rather than actually f being assigned to g
#   g = f
#   f = y
#   g
#   > x

Eval_setq = ->
	# case of array
	if (caadr(p1) == symbol(INDEX))
		setq_indexed()
		return

	# case of function definition
	if (iscons(cadr(p1)))
		define_user_function()
		return

	if (!issymbol(cadr(p1)))
		stop("symbol assignment: error in symbol")

	push(caddr(p1))
	Eval()
	p2 = pop()
	set_binding(cadr(p1), p2)

	push(symbol(NIL))

# Here "setq" is a misnomer because
# setq wouldn't work in Lisp to set array elements
# since setq stands for "set quoted" and you wouldn't
# quote an array element access.
# You'd rather use setf, which is a macro that can
# assign a value to anything.
#   (setf (aref YourArray 2) "blue")
# see
#   http://stackoverflow.com/questions/18062016/common-lisp-how-to-set-an-element-in-a-2d-array
#-----------------------------------------------------------------------------
#
#	Example: a[1] = b
#
#	p1	*-------*-----------------------*
#		|	|			|
#		setq	*-------*-------*	b
#			|	|	|
#			index	a	1
#
#	cadadr(p1) -> a
#
#-----------------------------------------------------------------------------

setq_indexed = ->
	p4 = cadadr(p1)
	if (!issymbol(p4))
		stop("indexed assignment: error in symbol")
	h = tos
	push(caddr(p1))
	Eval()
	p2 = cdadr(p1)
	while (iscons(p2))
		push(car(p2))
		Eval()
		p2 = cdr(p2)
	set_component(tos - h)
	p3 = pop()
	set_binding(p4, p3)
	push(symbol(NIL))


Eval_sqrt = ->
	push(cadr(p1))
	Eval()
	push_rational(1, 2)
	power()

Eval_stop = ->
	stop("user stop")

Eval_subst = ->
	push(cadddr(p1))
	Eval()
	push(caddr(p1))
	Eval()
	push(cadr(p1))
	Eval()
	subst()
	Eval() # normalize

# always returns a matrix with rank 2
# i.e. two dimensions,
# the passed parameter is the size
Eval_unit = ->
	i = 0
	n = 0
	push(cadr(p1))
	Eval()
	n = pop_integer()

	if isNaN(n)
		push(p1)
		return

	if (n < 1)
		push(p1)
		return

	p1 = alloc_tensor(n * n)
	p1.tensor.ndim = 2
	p1.tensor.dim[0] = n
	p1.tensor.dim[1] = n
	for i in [0...n]
		p1.tensor.elem[n * i + i] = one
	check_tensor_dimensions p1
	push(p1)

Eval_noexpand = ->
	prev_expanding = expanding
	expanding = 0
	Eval()
	expanding = prev_expanding

# like Eval() except "=" (assignment) is treated
# as "==" (equality test)

Eval_predicate = ->
	save()
	p1 = top()
	if (car(p1) == symbol(SETQ))
		# replace the assignment in the
		# head with an equality test
		pop()
		push_symbol(TESTEQ)
		push cadr(p1)
		push caddr(p1)
		list 3

	Eval()
	restore()
