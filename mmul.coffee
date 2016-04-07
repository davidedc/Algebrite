# Bignum multiplication and division





mmul = (a, b) ->
	return a.multiply b


mdiv = (a, b) ->
	return a.divide b

# a = a + b

###
static void
addf(unsigned int *a, unsigned int *b, int len)
{
	int i
	long long t = 0; # can be signed or unsigned 
	for (i = 0; i < len; i++) {
		t += (long long) a[i] + b[i]
		a[i] = (unsigned int) t
		t >>= 32
	}
}

// a = a - b

static void
subf(unsigned int *a, unsigned int *b, int len)
{
	int i
	long long t = 0; # must be signed
	for (i = 0; i < len; i++) {
		t += (long long) a[i] - b[i]
		a[i] = (unsigned int) t
		t >>= 32
	}
}

// a = b * c

// 0xffffffff + 0xffffffff * 0xffffffff == 0xffffffff00000000

static void
mulf(unsigned int *a, unsigned int *b, int len, unsigned int c)
{
	int i
	unsigned long long t = 0; # must be unsigned
	for (i = 0; i < len; i++) {
		t += (unsigned long long) b[i] * c
		a[i] = (unsigned int) t
		t >>= 32
	}
	a[i] = (unsigned int) t
}
###

mmod = (a,b) ->
	return a.mod b

# return both quotient and remainder of a/b
# we'd have this method as divmod(number)
# but obviously doesn't change the passed parameters

mdivrem = (a,b) ->
	toReturn = a.divmod b
	return [toReturn.quotient, toReturn.remainder]

#if SELFTEST

# small integer tests

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



