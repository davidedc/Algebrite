#-----------------------------------------------------------------------------
#
#	Bignum root
#
#	Returns null pointer if not perfect root.
#
#	The sign of the radicand is ignored.
#
#-----------------------------------------------------------------------------


mroot = (n, index) ->
	# this doesn't quite work
	#return n.pow(1/index +  0.0000000000000001)

	# sign of radicand ignored
	n = n.abs()

	i = 0
	j = 0
	k = 0

	if (index == 0)
		stop("root index is zero")

	# count number of bits
	k = 0
	while n.shiftRight(k) > 0
		k++
	
	if (k == 0)
		return mint(0)

	# initial guess

	k = Math.floor((k - 1) / index)

	j = Math.floor(k / 32 + 1)
	x = bigInt(j)

	for i in [0...j]
		# zero-out the ith bit
		x = x.and(bigInt(1).shiftLeft(i).not())

	while (k >= 0)
		# set the kth bit
		x = x.or(bigInt(1).shiftLeft(k))

		y = mpow(x, index)
		switch (mcmp(y, n))
			when 0
				return x
			when 1
				#mp_clr_bit(x, k)
				# clear the kth bit
				x = x.and(bigInt(1).shiftLeft(k).not())
		k--

	return 0


#if SELFTEST

