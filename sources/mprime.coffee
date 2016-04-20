# Bignum prime test (returns 1 if prime, 0 if not)

# Uses Algorithm P (probabilistic primality test) from p. 395 of
# "The Art of Computer Programming, Volume 2" by Donald E. Knuth.




mprime = (n) ->
	return n.isProbablePrime()

#if SELFTEST

