test_mpow = ->
	logout("testing mpow\n")


	# small numbers

	for i  in [-10...10]
		a = mint(i)
		x = 1
		for j in [0...10]
			b = mpow(a, j)
			c = mint(x)
			if (mcmp(b, c) != 0)
				throw new Error("failed test_mpow")
			x *= i


	logout("ok\n")

#endif
