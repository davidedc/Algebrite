


#define POLY p1
#define X p2
#define A p3
#define B p4
#define C p5
#define Y p6

Eval_roots = ->
	# A == B -> A - B

	p2 = cadr(p1)

	if (car(p2) == symbol(SETQ) || car(p2) == symbol(TESTEQ))
		push(cadr(p2))
		Eval()
		push(caddr(p2))
		Eval()
		subtract()
	else
		push(p2)
		Eval()
		p2 = pop()
		if (car(p2) == symbol(SETQ) || car(p2) == symbol(TESTEQ))
			push(cadr(p2))
			Eval()
			push(caddr(p2))
			Eval()
			subtract()
		else
			push(p2)

	# 2nd arg, x

	push(caddr(p1))
	Eval()
	p2 = pop()
	if (p2 == symbol(NIL))
		guess()
	else
		push(p2)

	p2 = pop()
	p1 = pop()

	if (!ispoly(p1, p2))
		stop("roots: 1st argument is not a polynomial")

	push(p1)
	push(p2)

	roots()

roots = ->
	h = 0
	i = 0
	n = 0
	h = tos - 2
	roots2()
	n = tos - h
	if (n == 0)
		stop("roots: the polynomial is not factorable, try nroots")
	if (n == 1)
		return
	sort_stack(n)
	save()
	p1 = alloc_tensor(n)
	p1.tensor.ndim = 1
	p1.tensor.dim[0] = n
	for i in [0...n]
		p1.tensor.elem[i] = stack[h + i]
	tos = h
	push(p1)
	restore()

roots2 = ->
	save()

	p2 = pop()
	p1 = pop()

	push(p1)
	push(p2)
	factorpoly()

	p1 = pop()

	if (car(p1) == symbol(MULTIPLY))
		p1 = cdr(p1)
		while (iscons(p1))
			push(car(p1))
			push(p2)
			roots3()
			p1 = cdr(p1)
	else
		push(p1)
		push(p2)
		roots3()

	restore()

roots3 = ->
	save()
	p2 = pop()
	p1 = pop()
	if (car(p1) == symbol(POWER) && ispoly(cadr(p1), p2) && isposint(caddr(p1)))
		push(cadr(p1))
		push(p2)
		mini_solve()
	else if (ispoly(p1, p2))
		push(p1)
		push(p2)
		mini_solve()
	restore()

#-----------------------------------------------------------------------------
#
#	Input:		stack[tos - 2]		polynomial
#
#			stack[tos - 1]		dependent symbol
#
#	Output:		stack			roots on stack
#
#						(input args are popped first)
#
#-----------------------------------------------------------------------------

# note that for many quadratic and cubic polynomials we don't
# actually end up using the quadratic and cubic formulas in here,
# since there is a chance we factored the polynomial and in so
# doing we found some solutions and lowered the degree.
mini_solve = ->
	n = 0

	save()

	p2 = pop()
	p1 = pop()

	push(p1)
	push(p2)

	n = coeff()

	# AX + B, X = -B/A

	if (n == 2)
		p3 = pop()
		p4 = pop()
		push(p4)
		push(p3)
		divide()
		negate()
		restore()
		return

	# AX^2 + BX + C, X = (-B +/- (B^2 - 4AC)^(1/2)) / (2A)

	if (n == 3)
		p3 = pop() # A
		p4 = pop() # B
		p5 = pop() # C

		# B^2
		push(p4)
		push(p4)
		multiply()

		# 4AC
		push_integer(4)
		push(p3)
		multiply()
		push(p5)
		multiply()

		# B^2 - 4AC
		subtract()

		#(B^2 - 4AC)^(1/2)
		push_rational(1, 2)
		power()

		#p6 is (B^2 - 4AC)^(1/2)
		p6 = pop()
		push(p6);

		# B
		push(p4)
		subtract() # -B + (B^2 - 4AC)^(1/2)

		# 1/2A
		push(p3)
		divide()
		push_rational(1, 2)
		multiply()
		# tos - 1 now is 1st root: (-B + (B^2 - 4AC)^(1/2)) / (2A)

		push(p6);
		# tos - 1 now is (B^2 - 4AC)^(1/2)
		# tos - 2: 1st root: (-B + (B^2 - 4AC)^(1/2)) / (2A)

		# add B to tos
		push(p4)
		add()
		# tos - 1 now is  B + (B^2 - 4AC)^(1/2)
		# tos - 2: 1st root: (-B + (B^2 - 4AC)^(1/2)) / (2A)

		negate()
		# tos - 1 now is  -B -(B^2 - 4AC)^(1/2)
		# tos - 2: 1st root: (-B + (B^2 - 4AC)^(1/2)) / (2A)

		# 1/2A again
		push(p3)
		divide()
		push_rational(1, 2)
		multiply()
		# tos - 1: 2nd root: (-B - (B^2 - 4AC)^(1/2)) / (2A)
		# tos - 2: 1st root: (-B + (B^2 - 4AC)^(1/2)) / (2A)

		restore()
		return

	if (n == 4)
		#console.log ">>>>>>>>>>>>>>>> actually using cubic formula <<<<<<<<<<<<<<< "
		p3 = pop() # A
		p4 = pop() # B
		p5 = pop() # C
		p6 = pop() # D


		# B - only related calculations
		push(p4)
		push(p4)
		multiply()
		bsquared = pop()

		push(bsquared)
		push(p4)
		multiply()
		push_integer(2)
		multiply()
		two_bcubed = pop()

		# A - only related calculations
		push_integer(3)
		push(p3)
		multiply()
		three_a = pop()

		push(three_a)
		push_integer(9)
		multiply()
		push(p3)
		multiply()
		push(p6)
		multiply()
		twentyseven_asquare_d = pop()

		push(three_a)
		push_integer(2)
		multiply()
		six_a = pop()

		# mixed calculations
		push_integer(3)
		push(p3)
		push(p5)
		multiply()
		multiply()
		three_ac = pop()

		push(three_ac)
		push_integer(3)
		push(p4)
		multiply()
		multiply()
		negate()
		minus_nine_abc = pop()

		push(bsquared)
		push(three_ac)
		subtract()
		bsq_minus_3ac = pop()

		push(bsq_minus_3ac)
		push_integer(3)
		power()
		push_integer(4)
		multiply()
		four_bsq_minus_3ac_pow3 = pop()


		# K
		push(two_bcubed)
		push(minus_nine_abc)
		push(twentyseven_asquare_d)
		add()
		add()
		K = pop()

		# Q
		push(K)
		push_integer(2)
		power()
		push(four_bsq_minus_3ac_pow3)
		subtract()
		push_rational(1, 2)
		power()
		Q = pop()

		# BIGC
		push(Q)
		push(K)
		add()
		push_rational(1, 2)
		multiply()
		push_rational(1, 3)
		power()
		BIGC = pop()

		push(BIGC)
		push(three_a)
		multiply()
		three_a_BIGC = pop()

		push(three_a_BIGC)
		push_integer(2)
		multiply()
		six_a_BIGC = pop()


		# imaginary parts calculations
		push(imaginaryunit)
		push_integer(3)
		push_rational(1, 2)
		power()
		multiply()
		i_sqrt3 = pop()
		push_integer(1)
		push(i_sqrt3)
		add()
		one_plus_i_sqrt3 = pop()
		push_integer(1)
		push(i_sqrt3)
		subtract()
		one_minus_i_sqrt3 = pop()

		push(p4)
		negate()
		push(three_a)
		divide()
		minus_b_over_3a = pop()

		push(BIGC)
		push(three_a)
		divide()
		BIGC_over_3a = pop()

		# first solution
		push(minus_b_over_3a) # first term
		push(BIGC_over_3a)
		negate() # second term
		push(bsq_minus_3ac)
		push(three_a_BIGC)
		divide()
		negate() # third term
		# now add the three terms together
		add()
		add()

		# second solution
		push(minus_b_over_3a) # first term
		push(BIGC_over_3a)
		push(one_plus_i_sqrt3)
		multiply()
		push_integer(2)
		divide() # second term
		push(one_minus_i_sqrt3)
		push(bsq_minus_3ac)
		multiply()
		push(six_a_BIGC)
		divide() # third term
		# now add the three terms together
		add()
		add()

		# third solution
		push(minus_b_over_3a) # first term
		push(BIGC_over_3a)
		push(one_minus_i_sqrt3)
		multiply()
		push_integer(2)
		divide() # second term
		push(one_plus_i_sqrt3)
		push(bsq_minus_3ac)
		multiply()
		push(six_a_BIGC)
		divide() # third term
		# now add the three terms together
		add()
		add()

		restore()
		return

	tos -= n

	restore()

