# Bignum multiplication and division

#include "stdafx.h"
#include "defs.h"



mmul = (a, b) ->
	return a.multiply b


mdiv = (a, b) ->
	return a.divide b

# a = a + b

###
static void
addf(unsigned int *a, unsigned int *b, int len)
{
	int i;
	long long t = 0; # can be signed or unsigned 
	for (i = 0; i < len; i++) {
		t += (long long) a[i] + b[i];
		a[i] = (unsigned int) t;
		t >>= 32;
	}
}

// a = a - b

static void
subf(unsigned int *a, unsigned int *b, int len)
{
	int i;
	long long t = 0; # must be signed
	for (i = 0; i < len; i++) {
		t += (long long) a[i] - b[i];
		a[i] = (unsigned int) t;
		t >>= 32;
	}
}

// a = b * c

// 0xffffffff + 0xffffffff * 0xffffffff == 0xffffffff00000000

static void
mulf(unsigned int *a, unsigned int *b, int len, unsigned int c)
{
	int i;
	unsigned long long t = 0; # must be unsigned
	for (i = 0; i < len; i++) {
		t += (unsigned long long) b[i] * c;
		a[i] = (unsigned int) t;
		t >>= 32;
	}
	a[i] = (unsigned int) t;
}
###

mmod = (a,b) ->
	return a.mod b

# return both quotient and remainder of a/b
# we'd have this method as divmod(number)
# but obviously doesn't change the passed parameters

###
void
mdivrem(unsigned int **q, unsigned int **r, unsigned int *a, unsigned int *b)
{
	int alen, blen, i, n;
	unsigned int c, *t, *x, *y;
	unsigned long long jj, kk;

	if (MZERO(b))
		stop("divide by zero");

	if (MZERO(a)) {
		*q = mint(0);
		*r = mint(0);
		return;
	}

	alen = MLENGTH(a);
	blen = MLENGTH(b);

	n = alen - blen;

	if (n < 0) {
		*q = mint(0);
		*r = mcopy(a);
		return;
	}

	x = mnew(alen + 1);

	for (i = 0; i < alen; i++)
		x[i] = a[i];

	x[i] = 0;

	y = mnew(n + 1);

	t = mnew(blen + 1);

	kk = (unsigned long long) b[blen - 1] + 1;

	for (i = 0; i <= n; i++) {

		y[n - i] = 0;

		for (;;) {

			# estimate the partial quotient

			if (little_endian()) {
				((unsigned int *) &jj)[0] = x[alen - i - 1];
				((unsigned int *) &jj)[1] = x[alen - i - 0];
			} else {
				((unsigned int *) &jj)[1] = x[alen - i - 1];
				((unsigned int *) &jj)[0] = x[alen - i - 0];
			}

			c = (int) (jj / kk);

			if (c == 0) {
				if (ge(x + n - i, b, blen)) { # see note 1
					y[n - i]++;
					subf(x + n - i, b, blen);
				}
				break;
			}

			y[n - i] += c;
			mulf(t, b, blen, c);
			subf(x + n - i, t, blen + 1);
		}
	}

	mfree(t);

	# length of quotient

	for (i = n; i > 0; i--)
		if (y[i])
			break;

	if (i == 0 && y[0] == 0) {
		mfree(y);
		y = mint(0);
	} else {
		MLENGTH(y) = i + 1;
		MSIGN(y) = MSIGN(a) * MSIGN(b);
	}

	# length of remainder

	for (i = blen - 1; i > 0; i--)
		if (x[i])
			break;

	if (i == 0 && x[0] == 0) {
		mfree(x);
		x = mint(0);
	} else {
		MLENGTH(x) = i + 1;
		MSIGN(x) = MSIGN(a);
	}

	*q = y;
	*r = x;
}
###

#if SELFTEST

# small integer tests

test_mmul = ->
	i = 0
	j = 0
	m = 0
	logout("test mmul\n");
	for i in [-100..100]
		for j in [-100..100]
			test_mmulf(i, j, i * j);
	logout("ok\n");

test_mmulf = (na, nb, nc) ->

	a = mint(na);
	b = mint(nb);
	c = mint(nc);

	d = mmul(a, b);

	if (mcmp(c, d) == 0)
		return;
	else
		throw new Error("test_mmulf error")

test_mdiv = ->
	i = 0
	j = 0
	m = 0
	logout("test mdiv\n");
	for i in [-100..100]
		for j in [-100..100]
			if (j)
				if i/j > 0
					expectedResult = Math.floor(i / j)
				else
					expectedResult = Math.ceil(i / j)
				test_mdivf(i, j, expectedResult);
	logout("ok\n");

test_mdivf = (na, nb, nc) ->

	a = mint(na);
	b = mint(nb);
	c = mint(nc);

	d = mdiv(a, b);

	if (mcmp(c, d) == 0)
		return;
	else
		debugger
		throw new Error("test_mdivf error")


test_mmod = ->
	i = 0
	j = 0
	m = 0
	logout("test mmod\n");
	for i in [-100..100]
		for j in [-100..100]
			if (j)
				test_mmodf(i, j, i % j);
	logout("ok\n");

test_mmodf = (na,nb,nc) ->

	a = mint(na);
	b = mint(nb);
	c = mint(nc);

	d = mmod(a, b);

	if (mcmp(c, d) == 0)
		return;
	else
		throw new Error("test_mmodf error")



