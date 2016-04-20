test_madd = ->
	i = 0
	if DEBUG then console.log("test madd")
	m = mtotal
	for i in [-100...100]
		for j in [-100...100]
			test_maddf(i, j, i + j)
	#if (m != mtotal)
	#	logout("memory leak\n")
	#	errout()
	logout("ok\n")

test_maddf = (na, nb, nc) ->

	a = mint(na)
	b = mint(nb)
	c = mint(nc)

	d = madd(a, b)

	if (mcmp(c, d) == 0)
		return
	else
		throw new Error("test_maddf")

	#sprintf(logbuf, "%d %d %d %d\n", na, nb, nc, *d * MSIGN(d))
	logout(logbuf)
	errout()

test_msub = ->
	i = 0
	logout("test msub\n")
	m = mtotal
	for i in [-100..100]
		for j in [-100..100]
			test_msubf(i, j, i - j)
	if (m != mtotal)
		logout("memory leak\n")
		errout()
	logout("ok\n")

test_msubf = (na, nb, nc) ->
	#unsigned int *a, *b, *c, *d

	a = mint(na)
	b = mint(nb)
	c = mint(nc)

	d = msub(a, b)

	if (mcmp(c, d) == 0)
		#mfree(a)
		#mfree(b)
		#mfree(c)
		#mfree(d)
		return

	#sprintf(logbuf, "%d %d %d %d\n", na, nb, nc, *d * MSIGN(d))
	logout(logbuf)
	errout()

#endif
