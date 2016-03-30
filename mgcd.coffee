#-----------------------------------------------------------------------------
#
#	Bignum GCD
#
#	Uses the binary GCD algorithm.
#
#	See "The Art of Computer Programming" p. 338.
#
#	mgcd always returns a positive value
#
#	mgcd(0, 0) = 0
#
#	mgcd(u, 0) = |u|
#
#	mgcd(0, v) = |v|
#
#-----------------------------------------------------------------------------

#include "stdafx.h"
#include "defs.h"

mgcd = (u,v) ->
	return bigInt.gcd(u,v)

#if SELFTEST

###
test_mgcd = ->
	logout("testing mgcd\n");
	n = mtotal;
	for i in [1...100]
		a = mint(i);
		for j in [1...100]
			b = mint(j);
			c = mgcd(a, b);
			d = egcd(a, b);
			if (mcmp(c, d) != 0)
				logout("failed\n");
				errout();
			mfree(b);
			mfree(c);
			mfree(d);
		}
		mfree(a);
	}
	if (n != mtotal) {
		logout("memory leak\n");
		errout();
	}
	logout("ok\n");
}

# Euclid's algorithm

static unsigned int *
egcd(unsigned int *a, unsigned int *b)
{
	int sign;
	unsigned int *c;
	if (MZERO(b))
		stop("divide by zero");
	b = mcopy(b);
	if (MZERO(a))
		return b;
	sign = MSIGN(b);
	a = mcopy(a);
	while (!MZERO(b)) {
		c = mmod(a, b);
		mfree(a);
		a = b;
		b = c;
	}
	mfree(b);
	MSIGN(a) = sign;
	return a;
}

#endif
###