test_mixedprint = ->
	run_test [

		"1.0",
		"1.0",

		"1111 * 1111.0",
		"1234321.0",

		"1111.0 * 1111",
		"1234321.0",

		"1111.0 * 1111.0",
		"1234321.0",

		"11111111 * 11111111.0",
		"123456787654321.0",

		"11111111.0 * 11111111",
		"123456787654321.0",

		"11111111.0 * 11111111.0",
		"123456787654321.0",

		# unfortunately using Numbers
		# at some point we hit the precision
		"111111111 * 111111111.0",
		"12345678987654320.0",

		# unfortunately using Numbers
		# at some point we hit the precision
		"111111111.0 * 111111111",
		"12345678987654320.0",

		# unfortunately using Numbers
		# at some point we hit the precision
		"111111111.0 * 111111111.0",
		"12345678987654320.0",

		"print(\"hello\")",
		"\"hello\"",

		"-sqrt(2)/2",
		"-1/2*2^(1/2)",

		# we can't get rid of the multiplication sign
		# in general, because expressions like
		# (x+1)(x-1) actually represent a function call
		# We could get rid of the multiplication sign
		# in these special cases where there are numeric
		# constants but we don't do that yet.
		"printhuman",
		"-1/2 2^(1/2)",

		"printcomputer",
		"-1/2*2^(1/2)",

		"printlatex",
		"-\\frac{\\sqrt{2}}{2}",

		"printlist",
		"(multiply -1/2 (power 2 1/2))",

		"printlist(a+b)\nprintlist(c+d)",
		"(add a b)(add c d)",

		"print2dascii",
		"   1   1/2\n- --- 2\n   2",

		"last2dasciiprint",
		"\"   1   1/2\n- --- 2\n   2\"",

		# checks that no extra newlines are
		# inserted
		"x=0\ny=2\nfor(do(x=sqrt(2+x),y=2*y/x,printcomputer(y)),k,1,2)",
		"2*2^(1/2)4*2^(1/2)/((2+2^(1/2))^(1/2))",

		"clearall",
		"",

		"print2dascii([[a,b],[c,d]])",
		"a   b\n\nc   d",

		"print2dascii(1/sqrt(-15))",
		"        1/2\n    (-1)\n- -----------\n    1/2  1/2\n   3    5",

		"print2dascii(x^(1/a))",
		" 1/a\nx",

		"print2dascii(x^(a/b))",
		" a/b\nx",

		"print2dascii(x^(a/2))",
		" 1/2 a\nx",

		"print2dascii(x^(1/(a+b)))",
		" 1/(a + b)\nx",

	]
