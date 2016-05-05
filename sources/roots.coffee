


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


hasImaginaryCoeff = ->

	polycoeff = tos

	push(p1)
	push(p2)
	k = coeff()

	imaginaryCoefficients = false
	h = tos
	for i in [k...0] by -1
		#console.log "hasImaginaryCoeff - coeff.:" + stack[tos-i].toString()
		if iscomplexnumber(stack[tos-i])
			imaginaryCoefficients = true
			break
	tos -= k
	return imaginaryCoefficients


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

	if !hasImaginaryCoeff()
		factorpoly()
		p1 = pop()
	else
		pop()
		pop()


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
	#console.log "mini_solve >>>>>>>>>>>>>>>>>>>>>>>> tos:" + tos
	n = 0

	save()

	p2 = pop()
	p1 = pop()

	push(p1)
	push(p2)

	n = coeff()

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
	#if (n == 4 or n == 5)

		p3 = pop() # A
		p4 = pop() # B
		p5 = pop() # C
		p6 = pop() # D

		if (n == 4)
			#console.log ">>>>>>>>>>>>>>>> actually using cubic formula <<<<<<<<<<<<<<< "

			#console.log ">>>> A:" + p3.toString()
			#console.log ">>>> B:" + p4.toString()
			#console.log ">>>> C:" + p5.toString()
			#console.log ">>>> D:" + p6.toString()

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

			push(R_DELTA0)
			push_integer(3)
			power()
			push_integer(4)
			multiply()
			R_4_DELTA03 = pop()

			push(R_DELTA0)
			simplify()
			Eval()
			yyfloat()
			Eval(); # normalize
			absval()
			R_DELTA0_toBeCheckedIfZero = pop()
			#console.log "D0 " + R_DELTA0_toBeCheckedIfZero.toString()
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
			Eval()
			yyfloat()
			Eval(); # normalize
			absval()
			R_determinant = pop()
			#console.log "DETERMINANT: " + R_determinant.toString()

			# R_DELTA1
			push(R_2_b3)
			push(R_m9_a_b_c)
			push(R_27_a2_d)
			add()
			add()
			R_DELTA1 = pop()

			# R_Q
			push(R_DELTA1)
			push_integer(2)
			power()
			push(R_4_DELTA03)
			subtract()
			push_rational(1, 2)
			power()
			R_Q = pop()

			push(p4)
			negate()
			push(R_3_a)
			divide()
			R_m_b_over_3a = pop()

			if iszero(R_determinant)
				if iszero(R_DELTA0_toBeCheckedIfZero)
					#console.log " *********************************** DETERMINANT IS ZERO and delta0 is zero"
					push(R_m_b_over_3a) # just same solution three times
					restore()
					return
				else
					#console.log " *********************************** DETERMINANT IS ZERO and delta0 is not zero"
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
				R_C = pop()

				push(R_C)
				simplify()
				Eval()
				yyfloat()
				Eval(); # normalize
				absval()
				R_C_simplified_toCheckIfZero = pop()
				#console.log "C " + R_C_simplified_toCheckIfZero.toString()
				if iszero(R_C_simplified_toCheckIfZero)
					#console.log " *********************************** C IS ZERO flipping the sign"
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

		if (n == 5)
			#console.log ">>>>>>>>>>>>>>>> actually using quartic formula <<<<<<<<<<<<<<< "
			p7 = pop() # E

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

			push_integer(72)
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

			# Q ---------------------------

			push(R_determinant)
			simplify()
			Eval()
			yyfloat()
			Eval(); # normalize
			absval()
			R_determinant_simplified_toCheckIfZero = pop()

			push(R_DELTA0)
			simplify()
			Eval()
			yyfloat()
			Eval(); # normalize
			absval()
			R_DELTA0_simplified_toCheckIfZero = pop()


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

				# outer radical calculation: cubic root
				push_rational(1,3)
				power()

				R_Q = pop()


				push(R_Q)
				simplify()
				Eval()
				yyfloat()
				Eval(); # normalize
				absval()

				R_Q_simplified_toCheckIfZero = pop()
				#console.log "Q " + R_Q_simplified_toCheckIfZero.toString()
				if iszero(R_Q_simplified_toCheckIfZero) and (!iszero(R_determinant_simplified_toCheckIfZero) and iszero(R_DELTA0_simplified_toCheckIfZero))
					#console.log " *********************************** Q IS ZERO flipping the sign"
					flipSignOFRadicalSoQIsNotZero = true
				else
					Q_CHECKED_AS_NOT_ZERO = true

						

			# S
			push_rational(-2,3)
			push(R_p)
			multiply()

			push(R_Q)
			
			push(R_DELTA0)
			push(R_Q)
			divide()

			add()

			push(R_3_a)
			divide()

			add()

			push_rational(1,2)
			power()

			push_integer(2)
			divide()

			R_S = pop()

			# ----------------------------



			push(R_b2)
			push(R_3_a_c)
			subtract()
			R_DELTA0 = pop()

			push(R_b2)
			push(R_c2)
			multiply()
			R_b2_c2 = pop()

			push(R_DELTA0)
			push_integer(3)
			power()
			push_integer(4)
			multiply()
			R_4_DELTA03 = pop()

			push(R_DELTA0)
			simplify()
			Eval()
			yyfloat()
			Eval(); # normalize
			absval()
			R_DELTA0_toBeCheckedIfZero = pop()
			#console.log "D0 " + R_DELTA0_toBeCheckedIfZero.toString()
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
			Eval()
			yyfloat()
			Eval(); # normalize
			absval()
			R_determinant = pop()
			#console.log "DETERMINANT: " + R_determinant.toString()

			# R_DELTA1
			push(R_2_b3)
			push(R_m9_a_b_c)
			push(R_27_a2_d)
			add()
			add()
			R_DELTA1 = pop()

			# R_Q
			push(R_DELTA1)
			push_integer(2)
			power()
			push(R_4_DELTA03)
			subtract()
			push_rational(1, 2)
			power()
			R_Q = pop()

			push(p4)
			negate()
			push(R_3_a)
			divide()
			R_m_b_over_3a = pop()

			if iszero(R_determinant)
				if iszero(R_DELTA0_toBeCheckedIfZero)
					#console.log " *********************************** DETERMINANT IS ZERO and delta0 is zero"
					push(R_m_b_over_3a) # just same solution three times
					restore()
					return
				else
					#console.log " *********************************** DETERMINANT IS ZERO and delta0 is not zero"
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
				R_C = pop()

				push(R_C)
				simplify()
				Eval()
				yyfloat()
				Eval(); # normalize
				absval()
				R_C_simplified_toCheckIfZero = pop()
				#console.log "C " + R_C_simplified_toCheckIfZero.toString()
				if iszero(R_C_simplified_toCheckIfZero)
					#console.log " *********************************** C IS ZERO flipping the sign"
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

	tos -= n

	restore()

