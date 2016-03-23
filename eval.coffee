# Evaluate an expression, for example...
#
#	push(p1)
#	EVAL()
#	p2 = pop()

#include "stdafx.h"
#include "defs.h"

EVAL = ->
	check_esc_flag()
	save()
	p1 = pop()
	switch (p1.k)
		when CONS
			EVAL_cons()
		when NUM
			push(p1)
		when DOUBLE
			push(p1)
		when STR
			push(p1)
		when TENSOR
			EVAL_tensor()
		when SYM
			EVAL_sym()
		else
			stop("atom?")
	restore()

EVAL_sym = ->
	# bare keyword?

	if (iskeyword(p1))
		push(p1)
		push(symbol(LAST))
		list(2)
		EVAL()
		return

	# EVALuate symbol's binding

	p2 = get_binding(p1)
	push(p2)
	if (p1 != p2)
		EVAL()

EVAL_cons = ->
	if (!issymbol(car(p1)))
		stop("cons?")

	switch (symnum(car(p1)))
		when ABS then EVAL_abs()
		when ADD then EVAL_add()
		when ADJ then EVAL_adj()
		when AND then EVAL_and()
		when ARCCOS then EVAL_arccos()
		when ARCCOSH then EVAL_arccosh()
		when ARCSIN then EVAL_arcsin()
		when ARCSINH then EVAL_arcsinh()
		when ARCTAN then EVAL_arctan()
		when ARCTANH then EVAL_arctanh()
		when ARG then EVAL_arg()
		when ATOMIZE then EVAL_atomize()
		when BESSELJ then EVAL_besselj()
		when BESSELY then EVAL_bessely()
		when BINDING then EVAL_binding()
		when BINOMIAL then EVAL_binomial()
		when CEILING then EVAL_ceiling()
		when CHECK then EVAL_check()
		when CHOOSE then EVAL_choose()
		when CIRCEXP then EVAL_circexp()
		when CLEAR then EVAL_clear()
		when CLOCK then EVAL_clock()
		when COEFF then EVAL_coeff()
		when COFACTOR then EVAL_cofactor()
		when CONDENSE then EVAL_condense()
		when CONJ then EVAL_conj()
		when CONTRACT then EVAL_contract()
		when COS then EVAL_cos()
		when COSH then EVAL_cosh()
		when DECOMP then EVAL_decomp()
		when DEGREE then EVAL_degree()
		when DEFINT then EVAL_defint()
		when DENOMINATOR then EVAL_denominator()
		when DERIVATIVE then EVAL_derivative()
		when DET then EVAL_det()
		when DIM then EVAL_dim()
		when DIRAC then EVAL_dirac()
		when DISPLAY then EVAL_display()
		when DIVISORS then EVAL_divisors()
		when DO then EVAL_do()
		when DOT then EVAL_inner()
		when DRAW then EVAL_draw()
		when DSOLVE then EVAL_dsolve()
		when EIGEN then EVAL_eigen()
		when EIGENVAL then EVAL_eigenval()
		when EIGENVEC then EVAL_eigenvec()
		when ERF then EVAL_erf()
		when ERFC then EVAL_erfc()
		when EVAL then EVAL_EVAL()
		when EXP then EVAL_exp()
		when EXPAND then EVAL_expand()
		when EXPCOS then EVAL_expcos()
		when EXPSIN then EVAL_expsin()
		when FACTOR then EVAL_factor()
		when FACTORIAL then EVAL_factorial()
		when FACTORPOLY then EVAL_factorpoly()
		when FILTER then EVAL_filter()
		when FLOATF then EVAL_float()
		when FLOOR then EVAL_floor()
		when FOR then EVAL_for()
		when GAMMA then EVAL_gamma()
		when GCD then EVAL_gcd()
		when HERMITE then EVAL_hermite()
		when HILBERT then EVAL_hilbert()
		when IMAG then EVAL_imag()
		when INDEX then EVAL_index()
		when INNER then EVAL_inner()
		when INTEGRAL then EVAL_integral()
		when INV then EVAL_inv()
		when INVG then EVAL_invg()
		when ISINTEGER then EVAL_isinteger()
		when ISPRIME then EVAL_isprime()
		when LAGUERRE then EVAL_laguerre()
	#	when LAPLACE then EVAL_laplace()
		when LCM then EVAL_lcm()
		when LEADING then EVAL_leading()
		when LEGENDRE then EVAL_legendre()
		when LOG then EVAL_log()
		when MAG then EVAL_mag()
		when MOD then EVAL_mod()
		when MULTIPLY then EVAL_multiply()
		when NOT then EVAL_not()
		when NROOTS then EVAL_nroots()
		when NUMBER then EVAL_number()
		when NUMERATOR then EVAL_numerator()
		when OPERATOR then EVAL_operator()
		when OR then EVAL_or()
		when OUTER then EVAL_outer()
		when POLAR then EVAL_polar()
		when POWER then EVAL_power()
		when PRIME then EVAL_prime()
		when PRINT then EVAL_display()
		when PRODUCT then EVAL_product()
		when QUOTE then EVAL_quote()
		when QUOTIENT then EVAL_quotient()
		when RANK then EVAL_rank()
		when RATIONALIZE then EVAL_rationalize()
		when REAL then EVAL_real()
		when YYRECT then EVAL_rect()
		when ROOTS then EVAL_roots()
		when SETQ then EVAL_setq()
		when SGN then EVAL_sgn()
		when SIMPLIFY then EVAL_simplify()
		when SIN then EVAL_sin()
		when SINH then EVAL_sinh()
		when SQRT then EVAL_sqrt()
		when STOP then EVAL_stop()
		when SUBST then EVAL_subst()
		when SUM then EVAL_sum()
		when TAN then EVAL_tan()
		when TANH then EVAL_tanh()
		when TAYLOR then EVAL_taylor()
		when TEST then EVAL_test()
		when TESTEQ then EVAL_testeq()
		when TESTGE then EVAL_testge()
		when TESTGT then EVAL_testgt()
		when TESTLE then EVAL_testle()
		when TESTLT then EVAL_testlt()
		when TRANSPOSE then EVAL_transpose()
		when UNIT then EVAL_unit()
		when ZERO then EVAL_zero()
		else
			EVAL_user_function()

EVAL_binding = ->
	push(get_binding(cadr(p1)))

# checks a predicate, i.e. check(A = B)

EVAL_check = ->
	push(cadr(p1))
	EVAL_predicate()
	p1 = pop()
	if (iszero(p1))
		stop("check(arg): arg is zero")
	push(symbol(NIL)) # no result is printed

EVAL_det = ->
	push(cadr(p1))
	EVAL()
	det()

EVAL_dim = ->
	#int n
	push(cadr(p1))
	EVAL()
	p2 = pop()
	if (iscons(cddr(p1)))
		push(caddr(p1))
		EVAL()
		n = pop_integer()
	else
		n = 1
	if (!istensor(p2))
		push_integer(1) # dim of scalar is 1
	else if (n < 1 || n > p2.tensor.ndim)
		push(p1)
	else
		push_integer(p2.tensor.dim[n - 1])

EVAL_divisors = ->
	push(cadr(p1))
	EVAL()
	divisors()

EVAL_do = ->
	push(car(p1))
	p1 = cdr(p1)
	while (iscons(p1))
		pop()
		push(car(p1))
		EVAL()
		p1 = cdr(p1)

EVAL_dsolve = ->
	push(cadr(p1))
	EVAL()
	push(caddr(p1))
	EVAL()
	push(cadddr(p1))
	EVAL()
	dsolve()

# for example, EVAL(f,x,2)

EVAL_EVAL = ->
	push(cadr(p1))
	EVAL()
	p1 = cddr(p1)
	while (iscons(p1))
		push(car(p1))
		EVAL()
		push(cadr(p1))
		EVAL()
		subst()
		p1 = cddr(p1)
	EVAL()

EVAL_exp = ->
	push(cadr(p1))
	EVAL()
	exponential()

EVAL_factorial = ->
	push(cadr(p1))
	EVAL()
	factorial()

EVAL_factorpoly = ->
	p1 = cdr(p1)
	push(car(p1))
	EVAL()
	p1 = cdr(p1)
	push(car(p1))
	EVAL()
	factorpoly()
	p1 = cdr(p1)
	while (iscons(p1))
		push(car(p1))
		EVAL()
		factorpoly()
		p1 = cdr(p1)

EVAL_hermite = ->
	push(cadr(p1))
	EVAL()
	push(caddr(p1))
	EVAL()
	hermite()

EVAL_hilbert = ->
	push(cadr(p1))
	EVAL()
	hilbert()

EVAL_index = ->
	h = tos
	p1 = cdr(p1)
	while (iscons(p1))
		push(car(p1))
		EVAL()
		p1 = cdr(p1)
	index_function(tos - h)

EVAL_inv = ->
	push(cadr(p1))
	EVAL()
	inv()

EVAL_invg = ->
	push(cadr(p1))
	EVAL()
	invg()

EVAL_isinteger = ->
	push(cadr(p1))
	EVAL()
	p1 = pop()
	if (isrational(p1))
		if (isinteger(p1))
			push(one)
		else
			push(zero)
		return
	if (isdouble(p1))
		n = (int) p1.d
		if (n == p1.d)
			push(one)
		else
			push(zero)
		return
	push_symbol(ISINTEGER)
	push(p1)
	list(2)

EVAL_multiply = ->
	push(cadr(p1))
	EVAL()
	p1 = cddr(p1)
	while (iscons(p1))
		push(car(p1))
		EVAL()
		multiply()
		p1 = cdr(p1)

EVAL_number = ->
	push(cadr(p1))
	EVAL()
	p1 = pop()
	if (p1.k == NUM || p1.k == DOUBLE)
		push_integer(1)
	else
		push_integer(0)

EVAL_operator = ->
	h = tos
	push_symbol(OPERATOR)
	p1 = cdr(p1)
	while (iscons(p1))
		push(car(p1))
		EVAL()
		p1 = cdr(p1)
	list(tos - h)

EVAL_print = ->
	p1 = cdr(p1)
	while (iscons(p1))
		push(car(p1))
		EVAL()
		if (equaln(get_binding(symbol(TTY)), 1))
			printline(pop())
		else
			display(pop())
		p1 = cdr(p1)
	push(symbol(NIL))

EVAL_quote = ->
	push(cadr(p1))

EVAL_rank = ->
	push(cadr(p1))
	EVAL()
	p1 = pop()
	if (istensor(p1))
		push_integer(p1.tensor.ndim)
	else
		push(zero)

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
	EVAL()
	p2 = cdadr(p1)
	while (iscons(p2))
		push(car(p2))
		EVAL()
		p2 = cdr(p2)
	set_component(tos - h)
	p3 = pop()
	set_binding(p4, p3)
	push(symbol(NIL))

EVAL_setq = ->
	if (caadr(p1) == symbol(INDEX))
		setq_indexed()
		return

	if (iscons(cadr(p1)))
		define_user_function()
		return

	if (!issymbol(cadr(p1)))
		stop("symbol assignment: error in symbol")

	push(caddr(p1))
	EVAL()
	p2 = pop()
	set_binding(cadr(p1), p2)

	push(symbol(NIL))

EVAL_sqrt = ->
	push(cadr(p1))
	EVAL()
	push_rational(1, 2)
	power()

EVAL_stop = ->
	stop("user stop")

EVAL_subst = ->
	push(cadddr(p1))
	EVAL()
	push(caddr(p1))
	EVAL()
	push(cadr(p1))
	EVAL()
	subst()
	EVAL() # normalize

EVAL_unit = ->
	#int i, n
	push(cadr(p1))
	EVAL()
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
	push(p1)

EVAL_noexpand = ->
	x = expanding
	expanding = 0
	EVAL()
	expanding = x

# like EVAL() except "=" is EVALuated as "=="

EVAL_predicate = ->
	save()
	p1 = pop()
	if (car(p1) == symbol(SETQ))
		EVAL_testeq()
	else
		push(p1)
		EVAL()
	restore()
