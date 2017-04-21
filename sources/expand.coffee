# Partial fraction expansion
#
# Example
#
#      expand(1/(x^3+x^2),x)
#
#        1      1       1
#      ---- - --- + -------
#        2     x     x + 1
#       x



Eval_expand = ->

	# 1st arg

	push(cadr(p1))
	Eval()

	# 2nd arg

	push(caddr(p1))
	Eval()

	p2 = pop()
	if (p2 == symbol(NIL))
		guess()
	else
		push(p2)

	expand()

#define A p2
#define B p3
#define C p4
#define F p5
#define P p6
#define Q p7
#define T p8
#define X p9

expand = ->

	save()

	p9 = pop()
	p5 = pop()

	if (istensor(p5))
		expand_tensor()
		restore()
		return

	# if sum of terms then sum over the expansion of each term

	if (car(p5) == symbol(ADD))
		push_integer(0)
		p1 = cdr(p5)
		while (iscons(p1))
			push(car(p1))
			push(p9)
			expand()
			add()
			p1 = cdr(p1)
		restore()
		return

	# B = numerator

	push(p5)
	numerator()
	p3 = pop()

	# A = denominator

	push(p5)
	denominator()
	p2 = pop()

	remove_negative_exponents()

	# Q = quotient

	push(p3)
	push(p2)
	push(p9)

	# if the denominator is one then always bail out
	# also bail out if the denominator is not one but
	# it's not anything recognizable as a polynomial.
	if isone(p3) || isone(p2)
		if !ispoly(p2,p9) || isone(p2)
			pop()
			pop()
			pop()
			push(p5)
			# p5 is the original input, leave unchanged
			restore()
			return

	divpoly()
	p7 = pop()

	# remainder B = B - A * Q

	push(p3)
	push(p2)
	push(p7)
	multiply()
	subtract()
	p3 = pop()

	# if the remainder is zero then we're done

	if (iszero(p3))
		push(p7)
		restore()
		return

	# A = factor(A)

	#console.log("expand - to be factored: " + p2)
	push(p2)
	push(p9)
	factorpoly()
	p2 = pop()
	#console.log("expand - factored to: " + p2)

	expand_get_C()
	expand_get_B()
	expand_get_A()

	if (istensor(p4))
		push(p4)
		prev_expanding = expanding
		expanding = 1
		inv()
		expanding = prev_expanding
		push(p3)
		inner()
		push(p2)
		inner()
	else
		push(p3)
		push(p4)
		prev_expanding = expanding
		expanding = 1
		divide()
		expanding = prev_expanding
		push(p2)
		multiply()

	push(p7)
	add()

	restore()

expand_tensor = ->
	i = 0
	push(p5)
	copy_tensor()
	p5 = pop()
	for i in [0...p5.tensor.nelem]
		push(p5.tensor.elem[i])
		push(p9)
		expand()
		p5.tensor.elem[i] = pop()
	push(p5)

remove_negative_exponents = ->
	h = 0
	i = 0
	j = 0
	k = 0
	n = 0

	h = tos
	factors(p2)
	factors(p3)
	n = tos - h

	# find the smallest exponent

	j = 0
	for i in [0...n]
		p1 = stack[h + i]
		if (car(p1) != symbol(POWER))
			continue
		if (cadr(p1) != p9)
			continue
		push(caddr(p1))
		k = pop_integer()
		if (isNaN(k))
			continue
		if (k < j)
			j = k

	moveTos h

	if (j == 0)
		return

	# A = A / X^j

	push(p2)
	push(p9)
	push_integer(-j)
	power()
	multiply()
	p2 = pop()

	# B = B / X^j

	push(p3)
	push(p9)
	push_integer(-j)
	power()
	multiply()
	p3 = pop()

# Returns the expansion coefficient matrix C.
#
# Example:
#
#       B         1
#      --- = -----------
#       A      2 
#             x (x + 1)
#
# We have
#
#       B     Y1     Y2      Y3
#      --- = ---- + ---- + -------
#       A      2     x      x + 1
#             x
#
# Our task is to solve for the unknowns Y1, Y2, and Y3.
#
# Multiplying both sides by A yields
#
#           AY1     AY2      AY3
#      B = ----- + ----- + -------
#            2      x       x + 1
#           x
#
# Let
#
#            A               A                 A
#      W1 = ----       W2 = ---        W3 = -------
#             2              x               x + 1
#            x
#
# Then the coefficient matrix C is
#
#              coeff(W1,x,0)   coeff(W2,x,0)   coeff(W3,x,0)
#
#       C =    coeff(W1,x,1)   coeff(W2,x,1)   coeff(W3,x,1)
#
#              coeff(W1,x,2)   coeff(W2,x,2)   coeff(W3,x,2)
#
# It follows that
#
#       coeff(B,x,0)     Y1
#
#       coeff(B,x,1) = C Y2
#
#       coeff(B,x,2) =   Y3
#
# Hence
#
#       Y1       coeff(B,x,0)
#             -1
#       Y2 = C   coeff(B,x,1)
#
#       Y3       coeff(B,x,2)

expand_get_C = ->
	h = 0
	i = 0
	j = 0
	n = 0
	#U **a
	h = tos
	if (car(p2) == symbol(MULTIPLY))
		p1 = cdr(p2)
		while (iscons(p1))
			p5 = car(p1)
			expand_get_CF()
			p1 = cdr(p1)
	else
		p5 = p2
		expand_get_CF()
	n = tos - h
	if (n == 1)
		p4 = pop()
		return
	p4 = alloc_tensor(n * n)
	p4.tensor.ndim = 2
	p4.tensor.dim[0] = n
	p4.tensor.dim[1] = n
	a = h
	for i in [0...n]
		for j in [0...n]
			push(stack[a+j])
			push(p9)
			push_integer(i)
			power()
			prev_expanding = expanding
			expanding = 1
			divide()
			expanding = prev_expanding
			push(p9)
			filter()
			p4.tensor.elem[n * i + j] = pop()
	moveTos tos - n

# The following table shows the push order for simple roots, repeated roots,
# and inrreducible factors.
#
#  Factor F        Push 1st        Push 2nd         Push 3rd      Push 4th
#
#
#                   A
#  x               ---
#                   x
#
#
#   2               A               A
#  x               ----            ---
#                    2              x
#                   x
#
#
#                     A
#  x + 1           -------
#                   x + 1
#
#
#         2            A              A
#  (x + 1)         ----------      -------
#                          2        x + 1
#                   (x + 1)
#
#
#   2                   A               Ax
#  x  + x + 1      ------------    ------------
#                    2               2
#                   x  + x + 1      x  + x + 1
#
#
#    2         2          A              Ax              A             Ax
#  (x  + x + 1)    --------------- ---------------  ------------  ------------
#                     2         2     2         2     2             2
#                   (x  + x + 1)    (x  + x + 1)     x  + x + 1    x  + x + 1
#
#
# For T = A/F and F = P^N we have
#
#
#      Factor F          Push 1st    Push 2nd    Push 3rd    Push 4th
#
#      x                 T
#
#       2
#      x                 T           TP
#
#
#      x + 1             T
#
#             2
#      (x + 1)           T           TP
#
#       2
#      x  + x + 1        T           TX
#
#        2         2
#      (x  + x + 1)      T           TX          TP          TPX
#
#
# Hence we want to push in the order
#
#      T * (P ^ i) * (X ^ j)
#
# for all i, j such that
#
#      i = 0, 1, ..., N - 1
#
#      j = 0, 1, ..., deg(P) - 1
#
# where index j runs first.

expand_get_CF = ->
	d = 0
	i = 0
	j = 0
	n = 0

	if (!Find(p5, p9))
		return
	prev_expanding = expanding
	expanding = 1
	trivial_divide()
	expanding = prev_expanding
	if (car(p5) == symbol(POWER))
		push(caddr(p5))
		n = pop_integer()
		p6 = cadr(p5)
	else
		n = 1
		p6 = p5

	push(p6)
	push(p9)
	degree()
	d = pop_integer()
	for i in [0...n]
		for j in [0...d]
			push(p8)
			push(p6)
			push_integer(i)
			power()
			prev_expanding = expanding
			expanding = 1
			multiply()
			expanding = prev_expanding
			push(p9)
			push_integer(j)
			power()
			prev_expanding = expanding
			expanding = 1
			multiply()
			expanding = prev_expanding

# Returns T = A/F where F is a factor of A.

trivial_divide = ->
	h = 0
	if (car(p2) == symbol(MULTIPLY))
		h = tos
		p0 = cdr(p2)
		while (iscons(p0))
			if (!equal(car(p0), p5))
				push(car(p0))
				Eval(); # force expansion of (x+1)^2, f.e.
			p0 = cdr(p0)
		multiply_all(tos - h)
	else
		push_integer(1)
	p8 = pop()

# Returns the expansion coefficient vector B.

expand_get_B = ->
	i = 0
	n = 0
	if (!istensor(p4))
		return
	n = p4.tensor.dim[0]
	p8 = alloc_tensor(n)
	p8.tensor.ndim = 1
	p8.tensor.dim[0] = n
	for i in [0...n]
		push(p3)
		push(p9)
		push_integer(i)
		power()
		prev_expanding = expanding
		expanding = 1
		divide()
		expanding = prev_expanding
		push(p9)
		filter()
		p8.tensor.elem[i] = pop()
	p3 = p8

# Returns the expansion fractions in A.

expand_get_A = ->
	h = 0
	i = 0
	n = 0
	if (!istensor(p4))
		push(p2)
		reciprocate()
		p2 = pop()
		return
	h = tos
	if (car(p2) == symbol(MULTIPLY))
		p8 = cdr(p2)
		while (iscons(p8))
			p5 = car(p8)
			expand_get_AF()
			p8 = cdr(p8)
	else
		p5 = p2
		expand_get_AF()
	n = tos - h
	p8 = alloc_tensor(n)
	p8.tensor.ndim = 1
	p8.tensor.dim[0] = n
	for i in [0...n]
		p8.tensor.elem[i] = stack[h + i]
	moveTos h
	p2 = p8

expand_get_AF = ->
	d = 0
	i = 0
	j = 0
	n = 1
	if (!Find(p5, p9))
		return
	if (car(p5) == symbol(POWER))
		push(caddr(p5))
		n = pop_integer()
		p5 = cadr(p5)
	push(p5)
	push(p9)
	degree()
	d = pop_integer()
	for i in [n...0]
		for j in [0...d]
			push(p5)
			push_integer(i)
			power()
			reciprocate()
			push(p9)
			push_integer(j)
			power()
			multiply()


