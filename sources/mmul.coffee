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

