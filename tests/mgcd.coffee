test_mgcd = ->
	logout("testing mgcd\n")
	for i in [1...100]
		a = mint(i)
		for j in [1...100]
			b = mint(j)
			c = mgcd(a, b)
			d = egcd(a, b)
			if (mcmp(c, d) != 0)
				throw new Error("test_mgcd failed")
	logout("ok\n")

# Euclid's algorithm

egcd = (a, b) ->
	sign_ = 0
	if (MZERO(b))
		stop("divide by zero")
	#b = mcopy(b)
	if (MZERO(a))
		return b
	sign_ = MSIGN(b)
	#a = mcopy(a)
	while (!MZERO(b))
		c = mmod(a, b)
		#mfree(a)
		a = b
		b = c
	a = setSignTo(a,sign_)
	return a

