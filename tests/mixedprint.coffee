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

    "1.0*10^(-6)",
    "0.000001",

    # check that this doesn't return 0.0
    "1.0*10^(-7)",
    "0.000000...",

    # ------------------------------------------
    "maxFixedPrintoutDigits",
    "6",

    "maxFixedPrintoutDigits=20",
    "",

    "maxFixedPrintoutDigits",
    "20",

    "1.0*10^(-15)",
    "0.000000000000001",

    "printhuman",
    "0.000000000000001",

    "printcomputer",
    "0.000000000000001",

    "printlatex",
    "0.000000000000001",

    "printlist",
    "0.000000000000001",

    "print2dascii",
    "0.000000000000001",

    "forceFixedPrintout=0",
    "",

    "1.0*10^(-15)",
    "1.0*10^(-15)",

    "printhuman",
    "1.0*10^(-15)",

    "printcomputer",
    "1.0*10^(-15)",

    "printlatex",
    "1.0\\mathrm{e}{-15}",

    "printlist",
    "1.0*10^(-15)",

    "print2dascii",
    "1.0*10^(-15)",

    "forceFixedPrintout=1",
    "",

    "maxFixedPrintoutDigits=6",
    "",

    # ------------------------------------------

    "float(pi)",
    "3.141593...",

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

    # ------------------------------------------

    "(5/3)!",
    "(5/3)!",

    "printhuman",
    "(5/3)!",

    "printcomputer",
    "(5/3)!",

    "printlatex",
    "(\\frac{5}{3})!",

    "printlist",
    "(factorial 5/3)",

    "print2dascii",
    "  5\n(---)!\n  3",

    # bug #106 ---------------------------------
    # printing terms that are not "normalised"
    # following an eval, one can't assume that
    # the numbers are all leading, hence some
    # checks had to be refined when printing
    # the signs

    "clearall",
    "",

    "print(quote(k*(-2)))",
    "k*(-2)",

    "print(quote(k*(-1/2)))",
    "k*(-1/2)",

    "print(quote(k*2))",
    "k*2",

    "print(quote(k*1/2))",
    "k*1/2",

    "print(k*(-2))",
    "-2*k",

    "print(k*(-1/2))",
    "-1/2*k",

    "print(k*2)",
    "2*k",

    "print(k*1/2)",
    "1/2*k",

  ]
