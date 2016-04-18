test_mmul = ->
	i = 0
	j = 0
	m = 0
	logout("test mmul\n")
	for i in [-100..100]
		for j in [-100..100]
			test_mmulf(i, j, i * j)
	logout("ok\n")

test_mmulf = (na, nb, nc) ->

	a = mint(na)
	b = mint(nb)
	c = mint(nc)

	d = mmul(a, b)

	if (mcmp(c, d) == 0)
		return
	else
		throw new Error("test_mmulf error")

test_mdiv = ->
	i = 0
	j = 0
	m = 0
	logout("test mdiv\n")
	for i in [-100..100]
		for j in [-100..100]
			if (j)
				if i/j > 0
					expectedResult = Math.floor(i / j)
				else
					expectedResult = Math.ceil(i / j)
				test_mdivf(i, j, expectedResult)
	logout("ok\n")

test_mdivf = (na, nb, nc) ->

	a = mint(na)
	b = mint(nb)
	c = mint(nc)

	d = mdiv(a, b)

	if (mcmp(c, d) == 0)
		return
	else
		debugger
		throw new Error("test_mdivf error")


test_mmod = ->
	i = 0
	j = 0
	m = 0
	logout("test mmod\n")
	for i in [-100..100]
		for j in [-100..100]
			if (j)
				test_mmodf(i, j, i % j)
	logout("ok\n")

test_mmodf = (na,nb,nc) ->

	a = mint(na)
	b = mint(nb)
	c = mint(nc)

	d = mmod(a, b)

	if (mcmp(c, d) == 0)
		return
	else
		throw new Error("test_mmodf error")



