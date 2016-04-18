test_isprime = ->
	run_test [
		# 0 and 1 are not prime numbers

		"isprime(0)",
		"0",

		"isprime(1)",
		"0",

		"isprime(13)",
		"1",

		"isprime(14)",
		"0",

		# from the Prime Curios web page

		"isprime(9007199254740991)",
		"0",

		# The largest prime that JavaScript supports

		"isprime(2^53 - 111)",
		"1",

		# misc. primes

		"isprime(2^50-71)",
		"1",

		"isprime(2^40-87)",
		"1",

	]
