# find the roots of a polynomial numerically



NROOTS_YMAX = 101
NROOTS_DELTA = 1.0e-6
NROOTS_EPSILON = 1.0e-9
NROOTS_ABS = (z) ->
	return Math.sqrt((z).r * (z).r + (z).i * (z).i)

# random between -2 and 2
theRandom = 0.0

NROOTS_RANDOM = ->
	#theRandom += 0.2
	#return theRandom
	return 4.0 * Math.random() - 2.0

class numericRootOfPolynomial
	r: 0.0
	i: 0.0

nroots_a = new numericRootOfPolynomial()
nroots_b = new numericRootOfPolynomial()
nroots_x = new numericRootOfPolynomial()
nroots_y = new numericRootOfPolynomial()
nroots_fa = new numericRootOfPolynomial()
nroots_fb = new numericRootOfPolynomial()
nroots_dx = new numericRootOfPolynomial()
nroots_df = new numericRootOfPolynomial()
nroots_c = []
for initNRoots in [0...NROOTS_YMAX]
	nroots_c[initNRoots] = new numericRootOfPolynomial()

Eval_nroots = ->
	h = 0
	i = 0
	k = 0
	n = 0

	push(cadr(p1))
	Eval()

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
		stop("nroots: polynomial?")

	# mark the stack

	h = tos

	# get the coefficients

	push(p1)
	push(p2)
	n = coeff()
	if (n > NROOTS_YMAX)
		stop("nroots: degree?")

	# convert the coefficients to real and imaginary doubles

	for i in [0...n]
		push(stack[h + i])
		real()
		yyfloat()
		Eval()
		p1 = pop()
		push(stack[h + i])
		imag()
		yyfloat()
		Eval()
		p2 = pop()
		if (!isdouble(p1) || !isdouble(p2))
			stop("nroots: coefficients?")
		nroots_c[i].r = p1.d
		nroots_c[i].i = p2.d

	# pop the coefficients

	moveTos h

	# n is the number of coefficients, n = deg(p) + 1

	monic(n)

	for k in [n...1] by -1
		findroot(k)
		if (Math.abs(nroots_a.r) < NROOTS_DELTA)
			nroots_a.r = 0.0
		if (Math.abs(nroots_a.i) < NROOTS_DELTA)
			nroots_a.i = 0.0
		push_double(nroots_a.r)
		push_double(nroots_a.i)
		push(imaginaryunit)
		multiply()
		add()
		NROOTS_divpoly(k)

	# now make n equal to the number of roots

	n = tos - h

	if (n > 1)
		sort_stack(n)
		p1 = alloc_tensor(n)
		p1.tensor.ndim = 1
		p1.tensor.dim[0] = n
		for i in [0...n]
			p1.tensor.elem[i] = stack[h + i]
		moveTos h
		push(p1)

# divide the polynomial by its leading coefficient

monic = (n) ->
	k = 0
	t = 0.0
	nroots_y.r = nroots_c[n - 1].r
	nroots_y.i = nroots_c[n - 1].i
	t = nroots_y.r * nroots_y.r + nroots_y.i * nroots_y.i
	for k in [0...(n - 1)]
		nroots_c[k].r = (nroots_c[k].r * nroots_y.r + nroots_c[k].i * nroots_y.i) / t
		nroots_c[k].i = (nroots_c[k].i * nroots_y.r - nroots_c[k].r * nroots_y.i) / t
	nroots_c[n - 1].r = 1.0
	nroots_c[n - 1].i = 0.0

# uses the secant method

findroot = (n) ->
	j = 0
	k = 0
	t = 0.0

	if (NROOTS_ABS(nroots_c[0]) < NROOTS_DELTA)
		nroots_a.r = 0.0
		nroots_a.i = 0.0
		return

	for j in [0...100]

		nroots_a.r = NROOTS_RANDOM()
		nroots_a.i = NROOTS_RANDOM()

		compute_fa(n)

		nroots_b.r = nroots_a.r
		nroots_b.i = nroots_a.i

		nroots_fb.r = nroots_fa.r
		nroots_fb.i = nroots_fa.i

		nroots_a.r = NROOTS_RANDOM()
		nroots_a.i = NROOTS_RANDOM()

		for k in [0...1000]

			compute_fa(n)

			nrabs = NROOTS_ABS(nroots_fa)
			if DEBUG then console.log "nrabs: " + nrabs
			if ( nrabs < NROOTS_EPSILON)
				return

			if (NROOTS_ABS(nroots_fa) < NROOTS_ABS(nroots_fb))
				nroots_x.r = nroots_a.r
				nroots_x.i = nroots_a.i

				nroots_a.r = nroots_b.r
				nroots_a.i = nroots_b.i

				nroots_b.r = nroots_x.r
				nroots_b.i = nroots_x.i

				nroots_x.r = nroots_fa.r
				nroots_x.i = nroots_fa.i

				nroots_fa.r = nroots_fb.r
				nroots_fa.i = nroots_fb.i

				nroots_fb.r = nroots_x.r
				nroots_fb.i = nroots_x.i

			# dx = nroots_b - nroots_a

			nroots_dx.r = nroots_b.r - nroots_a.r
			nroots_dx.i = nroots_b.i - nroots_a.i

			# df = fb - fa

			nroots_df.r = nroots_fb.r - nroots_fa.r
			nroots_df.i = nroots_fb.i - nroots_fa.i

			# y = dx / df

			t = nroots_df.r * nroots_df.r + nroots_df.i * nroots_df.i

			if (t == 0.0)
				break

			nroots_y.r = (nroots_dx.r * nroots_df.r + nroots_dx.i * nroots_df.i) / t
			nroots_y.i = (nroots_dx.i * nroots_df.r - nroots_dx.r * nroots_df.i) / t

			# a = b - y * fb

			nroots_a.r = nroots_b.r - (nroots_y.r * nroots_fb.r - nroots_y.i * nroots_fb.i)
			nroots_a.i = nroots_b.i - (nroots_y.r * nroots_fb.i + nroots_y.i * nroots_fb.r)

	stop("nroots: convergence error")

compute_fa = (n) ->
	k = 0
	t = 0.0

	# x = a

	nroots_x.r = nroots_a.r
	nroots_x.i = nroots_a.i

	# fa = c0 + c1 * x

	nroots_fa.r = nroots_c[0].r + nroots_c[1].r * nroots_x.r - nroots_c[1].i * nroots_x.i
	nroots_fa.i = nroots_c[0].i + nroots_c[1].r * nroots_x.i + nroots_c[1].i * nroots_x.r

	for k in [2...n]

		# x = a * x

		t = nroots_a.r * nroots_x.r - nroots_a.i * nroots_x.i
		nroots_x.i = nroots_a.r * nroots_x.i + nroots_a.i * nroots_x.r
		nroots_x.r = t

		# fa += c[k] * x

		nroots_fa.r += nroots_c[k].r * nroots_x.r - nroots_c[k].i * nroots_x.i
		nroots_fa.i += nroots_c[k].r * nroots_x.i + nroots_c[k].i * nroots_x.r

# divide the polynomial by x - a

NROOTS_divpoly = (n) ->
	k = 0
	for k in [(n - 1)...0]
		nroots_c[k - 1].r += nroots_c[k].r * nroots_a.r - nroots_c[k].i * nroots_a.i
		nroots_c[k - 1].i += nroots_c[k].i * nroots_a.r + nroots_c[k].r * nroots_a.i

	if (NROOTS_ABS(nroots_c[0]) > NROOTS_DELTA)
		stop("nroots: residual error")

	for k in [0...(n - 1)]
		nroots_c[k].r = nroots_c[k + 1].r
		nroots_c[k].i = nroots_c[k + 1].i


