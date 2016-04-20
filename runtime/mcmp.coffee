# Bignum compare
#
#	returns
#
#	-1		a < b
#
#	0		a = b
#
#	1		a > b



mcmp = (a,b) ->
	return a.compare b

# a is a bigint, n is a normal int
mcmpint = (a,n) ->
	b = bigInt(n)
	t = mcmp(a, b)
	return t

###
#if SELFTEST

void
test_mcmp(void)
{
	int i, j, k
	unsigned int *x, *y
	logout("testing mcmp\n")
	for (i = -1000; i < 1000; i++) {
		x = mint(i)
		for (j = -1000; j < 1000; j++) {
			y = mint(j)
			k = mcmp(x, y)
			if (i == j && k != 0) {
				logout("failed\n")
				errout()
			}
			if (i < j && k != -1) {
				logout("failed\n")
				errout()
			}
			if (i > j && k != 1) {
				logout("failed\n")
				errout()
			}
			mfree(y)
		}
		mfree(x)
	}
	logout("ok\n")
}

#endif
###
