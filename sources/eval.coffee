# Evaluate an expression, for example...
#
#	push(p1)
#	Eval()
#	p2 = pop()



Eval = ->
	#debugger
	check_esc_flag()
	save()
	p1 = pop()
	if !p1?
		debugger
	switch (p1.k)
		when CONS
			Eval_cons()
		when NUM
			push(p1)
		when DOUBLE
			push(p1)
		when STR
			push(p1)
		when TENSOR
			Eval_tensor()
		when SYM
			Eval_sym()
		else
			stop("atom?")
	restore()

Eval_sym = ->
	# bare keyword?

	if (iskeyword(p1))
		push(p1)
		push(symbol(LAST))
		list(2)
		Eval()
		return

	# Evaluate symbol's binding

	p2 = get_binding(p1)
	push(p2)

	# differently from standard Lisp,
	# here the evaluation is not
	# one-step only, rather it keeps evaluating
	# "all the way" until a symbol is
	# defined as itself.
	# Uncomment these two lines to get Lisp
	# behaviour (and break most tests)
	if (p1 != p2)
		Eval()

Eval_cons = ->
	if (!issymbol(car(p1)))
		stop("cons?")

	switch (symnum(car(p1)))
		when ABS then Eval_abs()
		when ADD then Eval_add()
		when ADDSUBSTRULE then Eval_addsubstrule()
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
		when CLEARSUBSTRULES then Eval_clearsubstrules()
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
		when DISPLAY then Eval_display()
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
		when FLOOR then Eval_floor()
		when FOR then Eval_for()
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
		when MAG then Eval_mag()
		when MOD then Eval_mod()
		when MULTIPLY then Eval_multiply()
		when NOT then Eval_not()
		when NROOTS then Eval_nroots()
		when NUMBER then Eval_number()
		when NUMERATOR then Eval_numerator()
		when OPERATOR then Eval_operator()
		when OR then Eval_or()
		when OUTER then Eval_outer()
		when POLAR then Eval_polar()
		when POWER then Eval_power()
		when PRIME then Eval_prime()
		when PRINT then Eval_display()
		when PRODUCT then Eval_product()
		when QUOTE then Eval_quote()
		when QUOTIENT then Eval_quotient()
		when RANK then Eval_rank()
		when RATIONALIZE then Eval_rationalize()
		when REAL then Eval_real()
		when YYRECT then Eval_rect()
		when ROOTS then Eval_roots()
		when SETQ then Eval_setq()
		when SGN then Eval_sgn()
		when SIMPLIFY then Eval_simplify()
		when SIN then Eval_sin()
		when SINH then Eval_sinh()
		when SHAPE then Eval_shape()
		when SQRT then Eval_sqrt()
		when STOP then Eval_stop()
		when SUBST then Eval_subst()
		when SUM then Eval_sum()
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

# checks a predicate, i.e. check(A = B)

# check definition
Eval_check = ->
	push(cadr(p1))
	Eval_predicate()
	p1 = pop()
	if (iszero(p1))
		stop("check(arg): arg is zero")
	push(symbol(NIL)) # no result is printed

Eval_det = ->
	push(cadr(p1))
	Eval()
	det()

# dim definition
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

# do definition
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

# exp definition
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
	p1 = cdr(p1)
	while (iscons(p1))
		push(car(p1))
		Eval()
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

Eval_multiply = ->
	push(cadr(p1))
	Eval()
	p1 = cddr(p1)
	while (iscons(p1))
		push(car(p1))
		Eval()
		multiply()
		p1 = cdr(p1)

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

Eval_print = ->
	p1 = cdr(p1)
	while (iscons(p1))
		push(car(p1))
		Eval()
		if (equaln(get_binding(symbol(TTY)), 1))
			printline(pop())
		else
			display(pop())
		p1 = cdr(p1)
	push(symbol(NIL))

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
	if (caadr(p1) == symbol(INDEX))
		setq_indexed()
		return

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

Eval_unit = ->
	i = 0
	n = 0
	push(cadr(p1))
	Eval()
	n = pop_integer()
	if (n < 2)
		push(p1)
		return
	p1 = alloc_tensor(n * n)
	p1.tensor.ndim = 2
	p1.tensor.dim[0] = n
	p1.tensor.dim[1] = n
	for i in [0...n]
		p1.tensor.elem[n * i + i] = one
	if p1.tensor.nelem != p1.tensor.elem.length
		console.log "something wrong in tensor dimensions"
		debugger
	push(p1)

Eval_noexpand = ->
	x = expanding
	expanding = 0
	Eval()
	expanding = x

# like Eval() except "=" is Evaluated as "=="

Eval_predicate = ->
	save()
	p1 = pop()
	if (car(p1) == symbol(SETQ))
		Eval_testeq()
	else
		push(p1)
		Eval()
	restore()
