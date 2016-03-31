# Bignum power

#include "stdafx.h"
#include "defs.h"

# a is a bigint, n is a small normal int
mpow = (a,n) ->

	return a.pow n;

#if SELFTEST

test_mpow = ->
	logout("testing mpow\n");

	mem = mtotal;

	# small numbers

	for i  in [-10...10]
		a = mint(i);
		x = 1;
		for j in [0...10]
			b = mpow(a, j);
			c = mint(x);
			if (mcmp(b, c) != 0)
				sprintf(logbuf, "failed a=%d b=%d c=%d\n", a[0], b[0], c[0]);
				logout(logbuf);
				errout();
			mfree(b);
			mfree(c);
			x *= i;

	if (mem != mtotal)
		logout("memory leak\n");
		errout();

	logout("ok\n");

#endif
