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



mgcd = (u,v) ->
	return bigInt.gcd(u,v)

#if SELFTEST

