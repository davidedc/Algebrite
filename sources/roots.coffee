


#define POLY p1
#define X p2
#define A p3
#define B p4
#define C p5
#define Y p6

show_power_debug = false
performing_roots = false

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


hasImaginaryCoeff = (k) ->

	#polycoeff = tos


	imaginaryCoefficients = false
	h = tos
	for i in [k...0] by -1
		#console.log "hasImaginaryCoeff - coeff.:" + stack[tos-i].toString()
		if iscomplexnumber(stack[tos-i])
			imaginaryCoefficients = true
			break
	return imaginaryCoefficients

isSimpleRoot = (k) ->

	#polycoeff = tos


	#tos-n		Coefficient of x^0
	#tos-1		Coefficient of x^(n-1)

	if k > 2
		isSimpleRootPolynomial = true
		h = tos

		if iszero(stack[tos-k])
			isSimpleRootPolynomial = false

		for i in [(k-1)...1] by -1
			#console.log "hasImaginaryCoeff - coeff.:" + stack[tos-i].toString()
			if !iszero(stack[tos-i])
				isSimpleRootPolynomial = false
				break
	else
		isSimpleRootPolynomial = false

	return isSimpleRootPolynomial


normalisedCoeff = ->
	k = coeff()
	#console.log("->" + tos)
	divideBy = stack[tos-1]
	miniStack = []
	for i in [1..k]
		miniStack.push(pop())
		#console.log(tos)

	for i in [(k-1)..0]
		push(miniStack[i])
		push(divideBy)
		divide()
		#console.log(tos)
	return k



# takes the polynomial and the
# variable on the stack

roots = ->
	h = 0
	i = 0
	n = 0

	save()

	# the simplification of nested radicals uses
	# "roots", which in turn uses simplification
	# of nested radicals. Usually there is no problem,
	# one level of recursion does the job. Beyond that,
	# we probably got stuck in a strange case of infinite
	# recursion, so bail out and return NIL.
	if recursionLevelNestedRadicalsRemoval > 1
		pop()
		pop()
		push(symbol(NIL))
		restore()
		return

	performing_roots = true
	h = tos - 2

	if DEBUG then console.log("checking if " + stack[tos-1].toString() + " is a case of simple roots")

	p2 = pop()
	p1 = pop()

	push(p1)
	push(p2)

	push(p1)
	push(p2)
	k = normalisedCoeff()

	if isSimpleRoot(k)
		if DEBUG then console.log("yes, " + stack[tos-1].toString() + " is a case of simple roots")
		lastCoeff = stack[tos-k]
		leadingCoeff = stack[tos-1]
		moveTos tos - k
		pop()
		pop()
		getSimpleRoots(k, leadingCoeff, lastCoeff)
	else
		moveTos tos - k
		roots2()

	n = tos - h
	if (n == 0)
		stop("roots: the polynomial is not factorable, try nroots")
	if (n == 1)
		performing_roots = false
		restore()
		return
	sort_stack(n)
	p1 = alloc_tensor(n)
	p1.tensor.ndim = 1
	p1.tensor.dim[0] = n
	for i in [0...n]
		p1.tensor.elem[i] = stack[h + i]
	moveTos h
	push(p1)
	restore()
	performing_roots = false

# ok to generate these roots take a look at their form
# in the case of even and odd exponents here:
# http://www.wolframalpha.com/input/?i=roots+x%5E14+%2B+1
# http://www.wolframalpha.com/input/?i=roots+ax%5E14+%2B+b
# http://www.wolframalpha.com/input/?i=roots+x%5E15+%2B+1
# http://www.wolframalpha.com/input/?i=roots+a*x%5E15+%2B+b
getSimpleRoots = (n, leadingCoeff, lastCoeff) ->
	if DEBUG then console.log("getSimpleRoots")
	save()

	#tos-n		Coefficient of x^0
	#tos-1		Coefficient of x^(n-1)

	n = n-1

	push(lastCoeff)
	push_rational(1,n)
	power()

	push(leadingCoeff)
	push_rational(1,n)
	power()
	divide()

	commonPart = pop()

	if n % 2 == 0
		for rootsOfOne in [1..n] by 2
			push(commonPart)
			push_integer(-1)
			push_rational(rootsOfOne,n)
			power()
			multiply()
			aSol = pop()
			push(aSol)
			push(aSol)
			negate()
	else
		for rootsOfOne in [1..n]
			push(commonPart)
			push_integer(-1)
			push_rational(rootsOfOne,n)
			power()
			multiply()
			if rootsOfOne % 2 == 0
				negate()


	restore()

roots2 = ->
	save()

	p2 = pop() # the polynomial variable
	p1 = pop() # the polynomial

	push(p1)
	push(p2)

	push(p1)
	push(p2)
	k = normalisedCoeff()

	if !hasImaginaryCoeff(k)
		moveTos tos - k
		factorpoly()
		p1 = pop()
	else
		moveTos tos - k
		pop()
		pop()


	if (car(p1) == symbol(MULTIPLY))
		p1 = cdr(p1)
		# scan through all the factors
		# and find the roots of each of them
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
		n = normalisedCoeff()
		mini_solve(n)
	else if (ispoly(p1, p2))
		push(p1)
		push(p2)
		n = normalisedCoeff()
		mini_solve(n)
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

# note that for many quadratic, cubic and quartic polynomials we don't
# actually end up using the quadratic/cubic/quartic formulas in here,
# since there is a chance we factored the polynomial and in so
# doing we found some solutions and lowered the degree.
mini_solve = (n) ->
	#console.log "mini_solve >>>>>>>>>>>>>>>>>>>>>>>> tos:" + tos

	save()

	# AX + B, X = -B/A

	if (n == 2)
		#console.log "mini_solve >>>>>>>>> 1st degree"
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
		#console.log "mini_solve >>>>>>>>> 2nd degree"
		p3 = pop() # A
		p4 = pop() # B
		p5 = pop() # C

		# B^2
		push(p4)
		push_integer(2)
		power()

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
		push_integer(2)
		multiply()
		divide()
		#simplify()
		#rationalize()
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
		#simplify()
		#rationalize()
		# tos - 1: 2nd root: (-B - (B^2 - 4AC)^(1/2)) / (2A)
		# tos - 2: 1st root: (-B + (B^2 - 4AC)^(1/2)) / (2A)

		restore()
		return

	#if (n == 4)
	if (n == 4 or n == 5)

		p3 = pop() # A
		p4 = pop() # B
		p5 = pop() # C
		p6 = pop() # D

		# C - only related calculations
		push(p5)
		push(p5)
		multiply()
		R_c2 = pop()

		push(R_c2)
		push(p5)
		multiply()
		R_c3 = pop()

		# B - only related calculations
		push(p4)
		push(p4)
		multiply()
		R_b2 = pop()

		push(R_b2)
		push(p4)
		multiply()
		R_b3 = pop()

		push(R_b3)
		push(p6)
		multiply()
		R_b3_d = pop()

		push(R_b3_d)
		push_integer(-4)
		multiply()
		R_m4_b3_d = pop()


		push(R_b3)
		push_integer(2)
		multiply()
		R_2_b3 = pop()

		# A - only related calculations
		push(p3)
		push(p3)
		multiply()
		R_a2 = pop()

		push(R_a2)
		push(p3)
		multiply()
		R_a3 = pop()

		push_integer(3)
		push(p3)
		multiply()
		R_3_a = pop()

		push(R_a2)
		push(p6)
		multiply()
		R_a2_d = pop()

		push(R_a2_d)
		push(p6)
		multiply()
		R_a2_d2 = pop()

		push(R_a2_d)
		push_integer(27)
		multiply()
		R_27_a2_d = pop()

		push(R_a2_d2)
		push_integer(-27)
		multiply()
		R_m27_a2_d2 = pop()

		push(R_3_a)
		push_integer(2)
		multiply()
		R_6_a = pop()

		# mixed calculations
		push(p3)
		push(p5)
		multiply()
		R_a_c = pop()

		push(R_a_c)
		push(p4)
		multiply()
		R_a_b_c = pop()

		push(R_a_b_c)
		push(p6)
		multiply()
		R_a_b_c_d = pop()

		push(R_a_c)
		push_integer(3)
		multiply()
		R_3_a_c = pop()

		push_integer(-4)
		push(p3)
		push(R_c3)
		multiply()
		multiply()
		R_m4_a_c3 = pop()

		push(R_a_b_c)
		push_integer(9)
		multiply()
		negate()
		R_m9_a_b_c = pop()

		push(R_a_b_c_d)
		push_integer(18)
		multiply()
		R_18_a_b_c_d = pop()

		push(R_b2)
		push(R_3_a_c)
		subtract()
		R_DELTA0 = pop()

		push(R_b2)
		push(R_c2)
		multiply()
		R_b2_c2 = pop()

		push(p4)
		negate()
		push(R_3_a)
		divide()
		R_m_b_over_3a = pop()


		if (n == 4)
			if DEBUG then console.log ">>>>>>>>>>>>>>>> actually using cubic formula <<<<<<<<<<<<<<< "

			#console.log ">>>> A:" + p3.toString()
			#console.log ">>>> B:" + p4.toString()
			#console.log ">>>> C:" + p5.toString()
			#console.log ">>>> D:" + p6.toString()


			if DEBUG then console.log "cubic: D0: " + R_DELTA0.toString()

			push(R_DELTA0)
			push_integer(3)
			power()
			push_integer(4)
			multiply()
			R_4_DELTA03 = pop()

			push(R_DELTA0)
			simplify()
			absValFloat()
			R_DELTA0_toBeCheckedIfZero = pop()
			if DEBUG then console.log "cubic: D0 as float: " + R_DELTA0_toBeCheckedIfZero.toString()
			#if iszero(R_DELTA0_toBeCheckedIfZero)
			#	console.log " *********************************** D0 IS ZERO"


			# DETERMINANT
			push(R_18_a_b_c_d)
			push(R_m4_b3_d)
			push(R_b2_c2)
			push(R_m4_a_c3)
			push(R_m27_a2_d2)
			add()
			add()
			add()
			add()
			simplify()
			absValFloat()
			R_determinant = pop()
			if DEBUG then console.log "cubic: DETERMINANT: " + R_determinant.toString()

			# R_DELTA1
			push(R_2_b3)
			push(R_m9_a_b_c)
			push(R_27_a2_d)
			add()
			add()
			R_DELTA1 = pop()
			if DEBUG then console.log "cubic: D1: " + R_DELTA1.toString()

			# R_Q
			push(R_DELTA1)
			push_integer(2)
			power()
			push(R_4_DELTA03)
			subtract()
			push_rational(1, 2)
			power()
			simplify()
			R_Q = pop()


			if iszero(R_determinant)
				if iszero(R_DELTA0_toBeCheckedIfZero)
					if DEBUG then console.log " cubic: DETERMINANT IS ZERO and delta0 is zero"
					push(R_m_b_over_3a) # just same solution three times
					restore()
					return
				else
					if DEBUG then console.log " cubic: DETERMINANT IS ZERO and delta0 is not zero"
					push(p3)
					push(p6)
					push_integer(9)
					multiply()
					multiply()
					push(p4)
					push(p5)
					multiply()
					subtract()
					push(R_DELTA0)
					push_integer(2)
					multiply()
					divide() # first solution
					root_solution = pop()
					push(root_solution) # pushing two of them on the stack
					push(root_solution)

					# second solution here
					# 4abc
					push(R_a_b_c)
					push_integer(4)
					multiply()

					# -9a*a*d
					push(p3)
					push(p3)
					push(p6)
					push_integer(9)
					multiply()
					multiply()
					multiply()
					negate()

					# -9*b^3
					push(R_b3)
					negate()

					# sum the three terms
					add()
					add()

					# denominator is a*delta0
					push(p3)
					push(R_DELTA0)
					multiply()

					# build the fraction
					divide()

					restore()
					return



			C_CHECKED_AS_NOT_ZERO = false
			flipSignOFQSoCIsNotZero = false
			
			# C will go as denominator, we have to check
			# that is not zero
			while !C_CHECKED_AS_NOT_ZERO

				# R_C
				push(R_Q)
				if flipSignOFQSoCIsNotZero
					negate()
				push(R_DELTA1)
				add()
				push_rational(1, 2)
				multiply()
				push_rational(1, 3)
				power()
				simplify()
				R_C = pop()
				if DEBUG then console.log "cubic: C: " + R_C.toString()

				push(R_C)
				simplify()
				absValFloat()
				R_C_simplified_toCheckIfZero = pop()
				if DEBUG then console.log "cubic: C as absval and float: " + R_C_simplified_toCheckIfZero.toString()

				if iszero(R_C_simplified_toCheckIfZero)
					if DEBUG then console.log " cubic: C IS ZERO flipping the sign"
					flipSignOFQSoCIsNotZero = true
				else
					C_CHECKED_AS_NOT_ZERO = true


			push(R_C)
			push(R_3_a)
			multiply()
			R_3_a_C = pop()

			push(R_3_a_C)
			push_integer(2)
			multiply()
			R_6_a_C = pop()


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


			push(R_C)
			push(R_3_a)
			divide()
			R_C_over_3a = pop()

			# first solution
			push(R_m_b_over_3a) # first term
			push(R_C_over_3a)
			negate() # second term
			push(R_DELTA0)
			push(R_3_a_C)
			divide()
			negate() # third term
			# now add the three terms together
			add()
			add()
			simplify()

			# second solution
			push(R_m_b_over_3a) # first term
			push(R_C_over_3a)
			push(one_plus_i_sqrt3)
			multiply()
			push_integer(2)
			divide() # second term
			push(one_minus_i_sqrt3)
			push(R_DELTA0)
			multiply()
			push(R_6_a_C)
			divide() # third term
			# now add the three terms together
			add()
			add()
			simplify()

			# third solution
			push(R_m_b_over_3a) # first term
			push(R_C_over_3a)
			push(one_minus_i_sqrt3)
			multiply()
			push_integer(2)
			divide() # second term
			push(one_plus_i_sqrt3)
			push(R_DELTA0)
			multiply()
			push(R_6_a_C)
			divide() # third term
			# now add the three terms together
			add()
			add()
			simplify()

			restore()
			return

		# See http://www.sscc.edu/home/jdavidso/Math/Catalog/Polynomials/Fourth/Fourth.html
		# for a description of general shapes and properties of fourth degree polynomials
		if (n == 5)
			if DEBUG then console.log ">>>>>>>>>>>>>>>> actually using quartic formula <<<<<<<<<<<<<<< "
			p7 = pop() # E

			if iszero(p4) and iszero(p6) and !iszero(p5) and !iszero(p7)
				if DEBUG then console.log("biquadratic case")
				push(p3)
				push(symbol(SECRETX))
				push_integer(2)
				power()
				multiply()

				push(p5)
				push(symbol(SECRETX))
				multiply()

				push(p7)

				add()
				add()

				push(symbol(SECRETX))
				roots()

				biquadraticSolutions = pop()

				for eachSolution in biquadraticSolutions.tensor.elem
					push(eachSolution)
					push_rational(1,2)
					power()
					simplify()

					push(eachSolution)
					push_rational(1,2)
					power()
					negate()
					simplify()

				restore()
				return





			# D - only related calculations
			push(p6)
			push(p6)
			multiply()
			R_d2 = pop()

			# E - only related calculations
			push(p7)
			push(p7)
			multiply()
			R_e2 = pop()

			push(R_e2)
			push(p7)
			multiply()
			R_e3 = pop()

			# DETERMINANT

			push_integer(256)
			push(R_a3)
			push(R_e3)
			multiply()
			multiply() # first term 256 a^3 e^3

			push_integer(-192)
			push(R_a2_d)
			push(R_e2)
			push(p4)
			multiply()
			multiply()
			multiply() # second term -192 a^3 b d e^2

			push_integer(-128)
			push(R_a2)
			push(R_c2)
			push(R_e2)
			multiply()
			multiply()
			multiply() # third term -128 a^2 c^2 e^2

			push_integer(144)
			push(R_a2_d2)
			push(p5)
			push(p7)
			multiply()
			multiply()
			multiply() # fourth term 144 a^2 c d^2 e

			push(R_m27_a2_d2)
			push(R_d2)
			multiply() # fifth term -27 a^2 d^4

			push_integer(144)
			push(R_a_b_c)
			push(p4)
			push(R_e2)
			multiply()
			multiply()
			multiply() # sixth term 144 a b^2 c e^2

			push_integer(-6)
			push(p3)
			push(R_b2)
			push(R_d2)
			push(p7)
			multiply()
			multiply()
			multiply()
			multiply() # seventh term -6 a b^2 d^2 e

			push_integer(-80)
			push(R_a_b_c_d)
			push(p5)
			push(p7)
			multiply()
			multiply()
			multiply() # eigth term -80 a b c^2 d e

			push_integer(18)
			push(R_a_b_c_d)
			push(R_d2)
			multiply()
			multiply() # ninth term 18 a b c d^3

			push_integer(16)
			push(R_a_c)
			push(R_c3)
			push(p7)
			multiply()
			multiply()
			multiply() # tenth term 16 a c^4 e

			push_integer(-4)
			push(R_a_c)
			push(R_c2)
			push(R_d2)
			multiply()
			multiply()
			multiply() # eleventh term -4 a c^3 d^2

			push_integer(-27)
			push(R_b3)
			push(p4)
			push(R_e2)
			multiply()
			multiply()
			multiply() # twelveth term -27 b^4 e^2

			push_integer(18)
			push(R_b3_d)
			push(p5)
			push(p7)
			multiply()
			multiply()
			multiply() # thirteenth term 18 b^3 c d e

			push(R_m4_b3_d)
			push(R_d2)
			multiply() # fourteenth term -4 b^3 d^3

			push_integer(-4)
			push(R_b2_c2)
			push(p5)
			push(p7)
			multiply()
			multiply()
			multiply() # fifteenth term -4 b^2 c^3 e

			push(R_b2_c2)
			push(R_d2)
			multiply() # sixteenth term b^2 c^2 d^2

			# add together the sixteen terms by doing
			# fifteen adds
			add()
			add()
			add()
			add()
			add()
			add()
			add()
			add()
			add()
			add()
			add()
			add()
			add()
			add()
			add()

			R_determinant = pop()
			if DEBUG then console.log("R_determinant: " + R_determinant.toString())

			# DELTA0
			push(R_c2) # term one of DELTA0

			push_integer(-3)
			push(p4)
			push(p6)
			multiply()
			multiply()  # term two of DELTA0

			push_integer(12)
			push(p3)
			push(p7)
			multiply()
			multiply()  # term three of DELTA0

			# add the three terms together
			add()
			add()

			R_DELTA0 = pop()
			if DEBUG then console.log("R_DELTA0: " + R_DELTA0.toString())

			# DELTA1
			push_integer(2)
			push(R_c3)
			multiply()

			push_integer(-9)
			push(p4)
			push(p5)
			push(p6)
			multiply()
			multiply()
			multiply()

			push_integer(27)
			push(R_b2)
			push(p7)
			multiply()
			multiply()

			push_integer(27)
			push(p3)
			push(R_d2)
			multiply()
			multiply()

			push_integer(-72)
			push(R_a_c)
			push(p7)
			multiply()
			multiply()

			# add the five terms together
			add()
			add()
			add()
			add()

			R_DELTA1 = pop()
			if DEBUG then console.log("R_DELTA1: " + R_DELTA1.toString())

			# p
			push_integer(8)
			push(R_a_c)
			multiply()

			push_integer(-3)
			push(R_b2)
			multiply()

			add()

			push_integer(8)
			push(R_a2)
			multiply()

			divide()

			R_p = pop()
			if DEBUG then console.log("p: " + R_p.toString())

			# q
			push(R_b3)

			push_integer(-4)
			push(R_a_b_c)
			multiply()

			push_integer(8)
			push(R_a2_d)
			multiply()

			add()
			add()

			push_integer(8)
			push(R_a3)
			multiply()

			divide()

			R_q = pop()
			if DEBUG then console.log("q: " + R_q.toString())

			if DEBUG then console.log("tos 1 " + tos)
			if !iszero(p4)
				if DEBUG then console.log("tos 2 " + tos)

				push_integer(8)
				push(p5)
				push(p3)
				multiply()
				multiply()

				push_integer(-3)
				push(p4)
				push_integer(2)
				power()
				multiply()

				add()

				push_integer(8)
				push(p3)
				push_integer(2)
				power()
				multiply()

				divide()

				R_p = pop()
				if DEBUG then console.log("p for depressed quartic: " + R_p.toString())

				push(p4)
				push_integer(3)
				power()

				push_integer(-4)
				push(p3)
				push(p4)
				push(p5)
				multiply()
				multiply()
				multiply()

				push_integer(8)
				push(p6)
				push(p3)
				push_integer(2)
				power()
				multiply()
				multiply()

				add()
				add()


				push_integer(8)
				push(p3)
				push_integer(3)
				power()
				multiply()

				divide()

				R_q = pop()
				if DEBUG then console.log("q for depressed quartic: " + R_q.toString())


				# convert to depressed quartic
				push(p4)
				push_integer(4)
				power()
				push_integer(-3)
				multiply()

				push_integer(256)
				push(R_a3)
				push(p7)
				multiply()
				multiply()

				push_integer(-64)
				push(R_a2_d)
				push(p4)
				multiply()
				multiply()

				push_integer(16)
				push(R_b2)
				push(p3)
				push(p5)
				multiply()
				multiply()
				multiply()

				add()
				add()
				add()

				push_integer(256)
				push(p3)
				push_integer(4)
				power()
				multiply()
				divide()

				R_r = pop()
				if DEBUG then console.log("r for depressed quartic: " + R_r.toString())

				if DEBUG then console.log("tos 4 " + tos)

				push(symbol(SECRETX))
				push_integer(4)
				power()
				if DEBUG then console.log("4 * x^4: " + stack[tos-1].toString())

				push(R_p)
				push(symbol(SECRETX))
				push_integer(2)
				power()
				multiply()
				if DEBUG then console.log("R_p * x^2: " + stack[tos-1].toString())

				push(R_q)
				push(symbol(SECRETX))
				multiply()
				if DEBUG then console.log("R_q * x: " + stack[tos-1].toString())

				push(R_r)
				if DEBUG then console.log("R_r: " + stack[tos-1].toString())

				add()
				add()
				add()

				simplify()
				if DEBUG then console.log("solving depressed quartic: " + stack[tos-1].toString())

				push(symbol(SECRETX))

				roots()

				depressedSolutions = pop()
				if DEBUG then console.log("depressedSolutions: " +  depressedSolutions)

				for eachSolution in depressedSolutions.tensor.elem
					push(eachSolution)
					push(p4)
					push_integer(4)
					push(p3)
					multiply()
					divide()
					subtract()
					simplify()
					if DEBUG then console.log("solution from depressed: " +  stack[tos-1].toString())

				restore()
				return

			else
				R_p = p5
				R_q = p6
				R_r = p7

				###
				# Descartes' solution
				# https://en.wikipedia.org/wiki/Quartic_function#Descartes.27_solution
				# finding the "u" in the depressed equation

				push_integer(2)
				push(R_p)
				multiply()
				coeff2 = pop()

				push_integer(-4)
				push(R_p)
				push_integer(2)
				power()
				multiply()
				push(R_r)
				multiply()
				coeff3 = pop()

				push(R_q)
				push_integer(2)
				power()
				negate()
				coeff4 = pop()

				# now build the polynomial
				push(symbol(SECRETX))
				push_integer(3)
				power()

				push(coeff2)
				push(symbol(SECRETX))
				push_integer(2)
				power()
				multiply()

				push(coeff3)
				push(symbol(SECRETX))
				multiply()

				push(coeff4)

				add()
				add()
				add()

				console.log("Descarte's resolventCubic: " +  stack[tos-1].toString())
				push(symbol(SECRETX))

				roots()

				resolventCubicSolutions = pop()
				console.log("Descarte's resolventCubic solutions: " +  resolventCubicSolutions)
				console.log("tos: " +  tos)

				R_u = null
				#R_u = resolventCubicSolutions.tensor.elem[1]
				for eachSolution in resolventCubicSolutions.tensor.elem
					console.log("examining solution: " +  eachSolution)
					push(eachSolution)
					push_integer(2)
					multiply()
					push(R_p)
					add()

					absValFloat()
					toBeCheckedIFZero = pop()
					console.log("abs value is: " +  eachSolution)
					if !iszero(toBeCheckedIFZero)
						R_u = eachSolution
						break

				console.log("chosen solution: " +  R_u)

				push(R_u)
				negate()
				R_s = pop()

				push(R_p)
				push(R_u)
				push_integer(2)
				power()
				push(R_q)
				push(R_u)
				divide()
				add()
				add()
				push_integer(2)
				divide()
				R_t = pop()

				push(R_p)
				push(R_u)
				push_integer(2)
				power()
				push(R_q)
				push(R_u)
				divide()
				subtract()
				add()
				push_integer(2)
				divide()
				R_v = pop()

				# factoring the quartic into two quadratics:

				# now build the polynomial
				push(symbol(SECRETX))
				push_integer(2)
				power()

				push(R_s)
				push(symbol(SECRETX))
				multiply()

				push(R_t)

				add()
				add()

				console.log("factored quartic 1: " + stack[tos-1].toString())

				push(symbol(SECRETX))
				push_integer(2)
				power()

				push(R_u)
				push(symbol(SECRETX))
				multiply()

				push(R_v)

				add()
				add()

				console.log("factored quartic 2: " + stack[tos-1].toString())
				pop()

				restore()
				return
				###

				# Ferrari's solution
				# https://en.wikipedia.org/wiki/Quartic_function#Ferrari.27s_solution
				# finding the "m" in the depressed equation
				push_rational(5,2)
				push(R_p)
				multiply()
				coeff2 = pop()

				push_integer(2)
				push(R_p)
				push_integer(2)
				power()
				multiply()
				push(R_r)
				subtract()
				coeff3 = pop()

				push(R_p)
				push_integer(3)
				power()
				push_integer(2)
				divide()

				push_rational(-1,2)
				push(R_p)
				push(R_r)
				multiply()
				multiply()

				push_rational(-1,8)
				push(R_q)
				push_integer(2)
				power()
				multiply()

				add()
				add()

				coeff4 = pop()

				push(symbol(SECRETX))
				push_integer(3)
				power()

				push(coeff2)
				push(symbol(SECRETX))
				push_integer(2)
				power()
				multiply()

				push(coeff3)
				push(symbol(SECRETX))
				multiply()

				push(coeff4)

				add()
				add()
				add()

				if DEBUG then console.log("resolventCubic: " +  stack[tos-1].toString())
				push(symbol(SECRETX))

				roots()

				resolventCubicSolutions = pop()
				if DEBUG then console.log("resolventCubicSolutions: " +  resolventCubicSolutions)

				R_m = null
				#R_m = resolventCubicSolutions.tensor.elem[1]
				for eachSolution in resolventCubicSolutions.tensor.elem
					if DEBUG then console.log("examining solution: " +  eachSolution)
					push(eachSolution)
					push_integer(2)
					multiply()
					push(R_p)
					add()

					absValFloat()
					toBeCheckedIFZero = pop()
					if DEBUG then console.log("abs value is: " +  eachSolution)
					if !iszero(toBeCheckedIFZero)
						R_m = eachSolution
						break

				if DEBUG then console.log("chosen solution: " +  R_m)
				push(R_m)
				push_integer(2)
				multiply()
				push(R_p)
				add()
				push_rational(1,2)
				power()
				simplify()
				sqrtPPlus2M = pop()

				push(R_q)
				push_integer(2)
				multiply()
				push(sqrtPPlus2M)
				divide()
				simplify()
				TwoQOversqrtPPlus2M = pop()

				push(R_p)
				push_integer(3)
				multiply()
				push(R_m)
				push_integer(2)
				multiply()
				add()
				ThreePPlus2M = pop()

				# solution1
				push(sqrtPPlus2M)
				push(ThreePPlus2M)
				push(TwoQOversqrtPPlus2M)
				add()
				negate()
				push_rational(1,2)
				power()
				simplify()
				add()
				push_integer(2)
				divide()
				# solution2
				push(sqrtPPlus2M)
				push(ThreePPlus2M)
				push(TwoQOversqrtPPlus2M)
				add()
				negate()
				push_rational(1,2)
				power()
				simplify()
				subtract()
				push_integer(2)
				divide()
				# solution3
				push(sqrtPPlus2M)
				negate()
				push(ThreePPlus2M)
				push(TwoQOversqrtPPlus2M)
				subtract()
				negate()
				push_rational(1,2)
				power()
				simplify()
				add()
				push_integer(2)
				divide()
				# solution4
				push(sqrtPPlus2M)
				negate()
				push(ThreePPlus2M)
				push(TwoQOversqrtPPlus2M)
				subtract()
				negate()
				push_rational(1,2)
				power()
				simplify()
				subtract()
				push_integer(2)
				divide()

				restore()
				return






			# Q ---------------------------

			push(R_determinant)
			simplify()
			absValFloat()
			R_determinant_simplified_toCheckIfZero = pop()

			push(R_DELTA0)
			simplify()
			absValFloat()
			R_DELTA0_simplified_toCheckIfZero = pop()

			S_CHECKED_AS_NOT_ZERO = false
			choiceOfRadicalInQSoSIsNotZero = 0

			while !S_CHECKED_AS_NOT_ZERO

				Q_CHECKED_AS_NOT_ZERO = false
				flipSignOFRadicalSoQIsNotZero = false
				
				# Q will go as denominator to calculate S
				# so we have to check
				# that is not zero
				while !Q_CHECKED_AS_NOT_ZERO

					# D1 under the outer radical
					push(R_DELTA1)

					# D1^2 under the inner radical
					push(R_DELTA1)
					push_integer(2)
					power()

					# 4*D0^3 under the inner radical
					push_integer(-4)
					push(R_DELTA0)
					push_integer(3)
					power()
					multiply()

					# addition under the inner radical
					add()

					# the second radical
					push_rational(1,2)
					power()

					if flipSignOFRadicalSoQIsNotZero
						negate()

					# the addition under the outer radical
					add()

					# content of outer radical divided by two
					push_integer(2)
					divide()

					if DEBUG then console.log("content of cubic root: " + stack[tos-1].toString())

					# outer radical calculation: cubic root
					# now we actually have to find all the roots
					# because we have to pick the one that makes S != 0
					push_rational(1,3)
					power()
					simplify()
					R_principalCubicRoot = pop()
					if DEBUG then console.log("principal cubic root: " + R_principalCubicRoot.toString())

					if DEBUG then console.log("tos : " + tos)

					if choiceOfRadicalInQSoSIsNotZero == 0
						if DEBUG then console.log("chosing principal cubic root")
						push(R_principalCubicRoot)
					else if choiceOfRadicalInQSoSIsNotZero == 1
						if DEBUG then console.log("chosing cubic root beyond principal")
						push(R_principalCubicRoot)
						push_rational(-1,2)
						multiply()

						push_integer(3)
						push_rational(1,2)
						power()
						push(imaginaryunit)
						multiply()
						push_rational(-1,2)
						multiply()
						push(R_principalCubicRoot)
						multiply()
						add()
					else if choiceOfRadicalInQSoSIsNotZero == 1
						if DEBUG then console.log("chosing cubic root beyond beyond principal")
						push(R_principalCubicRoot)
						push_rational(-1,2)
						multiply()

						push_integer(3)
						push_rational(1,2)
						power()
						push(imaginaryunit)
						multiply()
						push_rational(1,2)
						multiply()
						push(R_principalCubicRoot)
						multiply()
						add()




					simplify()
					R_Q = pop()
					if DEBUG then console.log "Q " + R_Q.toString()
					if DEBUG then console.log("tos: " + tos)


					push(R_Q)
					simplify()
					absValFloat()

					R_Q_simplified_toCheckIfZero = pop()
					if DEBUG then console.log "Q simplified and abs" + R_Q_simplified_toCheckIfZero.toString()
					if iszero(R_Q_simplified_toCheckIfZero) and (!iszero(R_determinant_simplified_toCheckIfZero) and iszero(R_DELTA0_simplified_toCheckIfZero))
						if DEBUG then console.log " *********************************** Q IS ZERO and it matters, flipping the sign"
						flipSignOFRadicalSoQIsNotZero = true
					else
						Q_CHECKED_AS_NOT_ZERO = true

							
					if DEBUG then console.log("tos: " + tos)

				# S
				push_rational(-2,3)
				push(R_p)
				multiply()

				push(R_Q)
				
				push(R_DELTA0)
				push(R_Q)
				divide()

				add()
				#rationalize()
				#console.log("rationalised: " + stack[tos-1].toString())
				#simplify()

				push(R_3_a)
				divide()

				add()

				push_rational(1,2)
				power()

				push_integer(2)
				divide()

				show_power_debug = true
				simplify()
				R_S = pop()
				if DEBUG then console.log "S " + R_S.toString()

				# now check if S is zero
				push(R_S)
				simplify()
				absValFloat()

				R_S_simplified_toCheckIfZero = pop()
				if DEBUG then console.log "S " + R_S_simplified_toCheckIfZero.toString()
				if iszero(R_S_simplified_toCheckIfZero)
					if DEBUG then console.log " *********************************** S IS ZERO chosing another cubic root"
					choiceOfRadicalInQSoSIsNotZero++
				else
					S_CHECKED_AS_NOT_ZERO = true

				if DEBUG then console.log("tos: " + tos)


			# ----------------------------

			if DEBUG then console.log("tos: " + tos)

			push(p4)
			negate()
			push(p3)
			push_integer(4)
			multiply()
			divide()
			R_minus_b_over_4a = pop()

			push_integer(-4)
			push(R_S)
			push_integer(2)
			power()
			multiply()
			push_integer(2)
			push(R_p)
			multiply()
			subtract()
			R_minus_4S2_minus_2p = pop()

			push(R_q)
			push(R_S)
			divide()
			R_q_over_S = pop()

			if DEBUG then console.log("tos before putting together the 4 solutions: " + tos)

			# first solution
			push(R_minus_b_over_4a) # first term
			push(R_S)
			subtract()
			push(R_minus_4S2_minus_2p)
			push(R_q_over_S)
			add()
			push_rational(1,2)
			power()
			push_integer(2)
			divide()
			add()
			simplify()

			# second solution
			push(R_minus_b_over_4a) # first term
			push(R_S)
			subtract()
			push(R_minus_4S2_minus_2p)
			push(R_q_over_S)
			add()
			push_rational(1,2)
			power()
			push_integer(2)
			divide()
			subtract()
			simplify()

			# third solution
			push(R_minus_b_over_4a) # first term
			push(R_S)
			add()
			push(R_minus_4S2_minus_2p)
			push(R_q_over_S)
			subtract()
			push_rational(1,2)
			power()
			push_integer(2)
			divide()
			add()
			simplify()

			# fourth solution
			push(R_minus_b_over_4a) # first term
			push(R_S)
			add()
			push(R_minus_4S2_minus_2p)
			push(R_q_over_S)
			subtract()
			push_rational(1,2)
			power()
			push_integer(2)
			divide()
			subtract()
			simplify()

			restore()
			return

	moveTos tos - n

	restore()

