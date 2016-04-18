# Factor using the Pollard rho method



n_factor_number = 0

factor_number = ->
	h = 0

	save()

	p1 = pop()

	# 0 or 1?

	if (equaln(p1, 0) || equaln(p1, 1) || equaln(p1, -1))
		push(p1)
		restore()
		return

	n_factor_number = p1.q.a

	h = tos

	factor_a()

	if (tos - h > 1)
		list(tos - h)
		push_symbol(MULTIPLY)
		swap()
		cons()

	restore()

# factor using table look-up, then switch to rho method if necessary

# From TAOCP Vol. 2 by Knuth, p. 380 (Algorithm A)

factor_a = ->
	k = 0

	if (n_factor_number.isNegative())
		n_factor_number = setSignTo(n_factor_number, 1)
		push_integer(-1)

	for k in [0...10000]

		try_kth_prime(k)

		# if n_factor_number is 1 then we're done

		if (n_factor_number.compare(1) == 0)
			return

	factor_b()

try_kth_prime = (k) ->
	count = 0

	d = mint(primetab[k])

	count = 0

	while (1)

		# if n_factor_number is 1 then we're done

		if (n_factor_number.compare(1) == 0)
			if (count)
				push_factor(d, count)
			return

		[q,r] = mdivrem(n_factor_number, d)

		# continue looping while remainder is zero

		if (r.isZero())
			count++
			n_factor_number = q
		else
			break

	if (count)
		push_factor(d, count)

	# q = n_factor_number/d, hence if q < d then
	# n_factor_number < d^2 so n_factor_number is prime

	if (mcmp(q, d) == -1)
		push_factor(n_factor_number, 1)
		n_factor_number = mint(1)


# From TAOCP Vol. 2 by Knuth, p. 385 (Algorithm B)

factor_b = ->
	k = 0
	l = 0

	bigint_one = mint(1)
	x = mint(5)
	xprime = mint(2)

	k = 1
	l = 1

	while (1)

		if (mprime(n_factor_number))
			push_factor(n_factor_number, 1)
			return 0

		while (1)

			if (esc_flag)
				stop("esc")

			# g = gcd(x' - x, n_factor_number)

			t = msub(xprime, x)
			t = setSignTo(t,1)
			g = mgcd(t, n_factor_number)

			if (MEQUAL(g, 1))
				if (--k == 0)
					xprime = x
					l *= 2
					k = l

				# x = (x ^ 2 + 1) mod n_factor_number

				t = mmul(x, x)
				x = madd(t, bigint_one)
				t = mmod(x, n_factor_number)
				x = t

				continue

			push_factor(g, 1)

			if (mcmp(g, n_factor_number) == 0)
				return -1

			# n_factor_number = n_factor_number / g

			t = mdiv(n_factor_number, g)
			n_factor_number = t

			# x = x mod n_factor_number

			t = mmod(x, n_factor_number)
			x = t

			# xprime = xprime mod n_factor_number

			t = mmod(xprime, n_factor_number)
			xprime = t

			break

push_factor = (d, count) ->
	p1 = new U()
	p1.k = NUM
	p1.q.a = d
	p1.q.b = mint(1)
	push(p1)
	if (count > 1)
		push_symbol(POWER)
		swap()
		p1 = new U()
		p1.k = NUM
		p1.q.a = mint(count)
		p1.q.b = mint(1)
		push(p1)
		list(3)
