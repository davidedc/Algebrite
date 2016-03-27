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

###
// small integer tests

static void test_mmulf(int, int, int);
static void test_mdivf(int, int, int);
static void test_mmodf(int, int, int);

void
test_mmul(void)
{
	int i, j, m;
	logout("test mmul\n");
	m = mtotal;
	for (i = -100; i <= 100; i++)
		for (j = -100; j <= 100; j++)
			test_mmulf(i, j, i * j);
	if (m != mtotal) {
		logout("memory leak\n");
		errout();
	}
	logout("ok\n");
}

static void
test_mmulf(int na, int nb, int nc)
{
	unsigned int *a, *b, *c, *d;

	a = mint(na);
	b = mint(nb);
	c = mint(nc);

	d = mmul(a, b);

	if (mcmp(c, d) == 0) {
		mfree(a);
		mfree(b);
		mfree(c);
		mfree(d);
		return;
	}

	sprintf(logbuf, "%d %d %d %d\n", na, nb, nc, *d * MSIGN(d));
	logout(logbuf);
	errout();
}

void
test_mdiv(void)
{
	int i, j, m;
	logout("test mdiv\n");
	m = mtotal;
	for (i = -100; i <= 100; i++)
		for (j = -100; j <= 100; j++)
			if (j)
				test_mdivf(i, j, i / j);
	if (m != mtotal) {
		logout("memory leak\n");
		errout();
	}
	logout("ok\n");
}

static void
test_mdivf(int na, int nb, int nc)
{
	unsigned int *a, *b, *c, *d;

	a = mint(na);
	b = mint(nb);
	c = mint(nc);

	d = mdiv(a, b);

	if (mcmp(c, d) == 0) {
		mfree(a);
		mfree(b);
		mfree(c);
		mfree(d);
		return;
	}

	sprintf(logbuf, "%d %d %d %d\n", na, nb, nc, *d * MSIGN(d));
	logout(logbuf);
	errout();
}

void
test_mmod(void)
{
	int i, j, m;
	logout("test mmod\n");
	m = mtotal;
	for (i = -100; i <= 100; i++)
		for (j = -100; j <= 100; j++)
			if (j)
				test_mmodf(i, j, i % j);
	if (m != mtotal) {
		logout("memory leak\n");
		errout();
	}
	logout("ok\n");
}

static void
test_mmodf(int na, int nb, int nc)
{
	unsigned int *a, *b, *c, *d;

	a = mint(na);
	b = mint(nb);
	c = mint(nc);

	d = mmod(a, b);

	if (mcmp(c, d) == 0) {
		mfree(a);
		mfree(b);
		mfree(c);
		mfree(d);
		return;
	}

	sprintf(logbuf, "%d %d %d %d\n", na, nb, nc, *d * MSIGN(d));
	logout(logbuf);
	errout();
}

#endif
###

