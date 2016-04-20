test_mroot = ->
	i = 0
	j = 0
	mem = 0

	logout("testing mroot\n")


	# small numbers

	for i in [0...10]
		a = mint(i)
		for j in [1...10]
			#logout(i + " " + j)
			b = mpow(a, j)
			c = mroot(b, j)
			if (c == 0 || mcmp(a, c) != 0)
				debugger
				throw new Error("failed test_mroot")

	logout(" ...mroot small numbers ok\n")

	a = mint(12345)

	for i in [1...10]
		#logout(i)
		b = mpow(a, i)
		c = mroot(b, i)
		if (c == 0 || mcmp(a, c) != 0)
			throw new Error("failed")


	logout(" ...mroot big numbers ok\n")
	logout("ok")
