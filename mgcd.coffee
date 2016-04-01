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

test_mgcd = ->
	logout("testing mgcd\n");
	for i in [1...100]
		a = mint(i);
		for j in [1...100]
			b = mint(j);
			c = mgcd(a, b);
			d = egcd(a, b);
			if (mcmp(c, d) != 0)
				throw new Error("test_mgcd failed")
	logout("ok\n");

# Euclid's algorithm

egcd = (a, b) ->
	sign = 0
	if (MZERO(b))
		stop("divide by zero");
	#b = mcopy(b);
	if (MZERO(a))
		return b;
	sign = MSIGN(b);
	#a = mcopy(a);
	while (!MZERO(b))
		c = mmod(a, b);
		#mfree(a);
		a = b;
		b = c;
	setSignTo(a,sign)
	return a;

