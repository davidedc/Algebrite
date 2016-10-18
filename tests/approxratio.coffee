test_approxratio = ->
	run_test [
		"approxratio(0.9054054)",
		"67/74",

		"approxratio(0.0102)",
		"1/98",

		"approxratio(0.518518)",
		"14/27",

		"approxratio(0.3333)",
		"1/3",

		"approxratio(0.5)",
		"1/2",

		"approxratio(3.14159)",
		"355/113",

		"approxratio(a*3.14)",
		"a*22/7",

		"approxratio(a*b)",
		"a*b",

		"approxratio((0.5*4)^(1/3))",
		"2^(1/3)",

		"approxratio(3.14)",
		"22/7",

		# see http://davidbau.com/archives/2010/03/14/the_mystery_of_355113.html
		"approxratio(3.14159)",
		"355/113",

		"approxratio(-3.14159)",
		"-355/113",

		"approxratio(0)",
		"0",

		"approxratio(0.0)",
		"0",

		"approxratio(2)",
		"2",

		"approxratio(2.0)",
		"2",

		# -------------------------------
		# checking some "long primes"
		# also called long period primes, or maximal period primes
		# i.e. those numbers whose reciprocal give
		# long repeating sequences
		# (long prime p gives repetition of p-1 digits).
		# big list here: https://oeis.org/A001913/b001913.txt
		# also see: https://oeis.org/A001913
		# -------------------------------

		# 1st long prime
		"approxratio(0.14)",
		"1/7",

		# 9th long prime, the biggest 2-digits long prime.
		# Often asked to
		# mental calculators to check their abilities.
		"approxratio(0.0103)",
		"1/97",

		# 60th long prime, the biggest 3-digits long prime.
		# Often asked to
		# mental calculators to check their abilities.
		"approxratio(0.001017)",
		"1/983",

		# 467th long prime, the biggest 4-digits long prime.
		"approxratio(0.00010033)",
		"1/9967",

		# 3617th long prime, the biggest 5-digits long prime.
		"approxratio(0.0000100011)",
		"1/99989",

		# 10000th long prime.
		"approxratio(0.00000323701)",
		"1/308927",

	]

