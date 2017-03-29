test_tensor = ->
	run_test [

		"[[a]]",
		"[[a]]",

		# ---------------------------------
		# basic parsing, promotion and printout
		# ---------------------------------

		"[[1,0],[0,0]]",
		"[[1,0],[0,0]]",

		# ---------------------------------
		# basic rank and shape checks
		# ---------------------------------

		# in general, the trick to count
		# rank (i.e. dimensions) is to count the
		# number of nested brackets
		# and the trick to determine the shape
		# is to count the commas proceeding
		# from the outermost to the
		# inner-most brackets.

		"rank(a)",
		"0",

		"rank([a,b,c])",
		"1",

		"shape([a,b,c])",
		"[3]",

		"rank([[a,b,c]])",
		"2",

		# traditional matrix 1x3
		# i.e. one row three columns
		# i.e. row vector
		"shape([[a,b,c]])",
		"[1,3]",

		"rank([[a],[b],[c]])",
		"2",

		# traditional matrix 3x1
		# i.e. one columns three rows
		# i.e. column vector
		"shape([[a],[b],[c]])",
		"[3,1]",

		"rank([[[a,b,c]]])",
		"3",

		"shape([[[a,b,c]]])",
		"[1,1,3]",

		"rank([[[a],[b],[c]]])",
		"3",

		"shape([[[a],[b],[c]]])",
		"[1,3,1]",

		"rank([[[a]],[[b]],[[c]]])",
		"3",

		"shape([[[a]],[[b]],[[c]]])",
		"[3,1,1]",


		# ---------------------------------
		# check tensor promotion
		# ---------------------------------

		"a=[1,2,3]",
		"",

		"rank(a)",
		"1",

		"b=[4,5,6]",
		"",

		"c=[7,8,9]",
		"",

		"rank([a,b,c])",
		"2",

		"[a,b,c]",
		"[[1,2,3],[4,5,6],[7,8,9]]",


		# -------------------------------------------------------
		# parsing, assigments and invokations calisthenics
		# mixes [] used for a) tensor building and b) tensor indexing
		# and mixes () used for a) function declarations
		# b) function invokation and c) precedence
		# Nests functions and matrices inside one another.
		# -------------------------------------------------------

		# --------------------

		"f(x) = x + 1",
		"",

		"a=[1,f,3]",
		"",

		"a[2]",
		"function (x) -> x+1",

		"a[f(1)]",
		"function (x) -> x+1",

		"a[a[f(1)](1)]",
		"function (x) -> x+1",

		"a[2](9)",
		"10",

		"a[f(1)](f(8))",
		"10",

		"a[a[f(1)](1)](a[f(1)](8))",
		"10",

		# --------------------

		"g(x) = x + 1",
		"",

		"f() = [1,g,3]",
		"",

		"a=[1,f,3]",
		"",

		"a[2]()[2](7)",
		"8",

		# --------------------

		"g(x) = x + 1",
		"",

		"f() = [[1,g,3],[0,0,0],[0,0,0]]",
		"",

		"a=[1,f,3]",
		"",

		"a[2]()[1][2](8)",
		"9",

		"(a[2]())[1][2](8)",
		"9",

		"((a[2]())[1])[2](8)",
		"9",

		"(((a[2]())[1])[2])(8)",
		"9",

		"(((a[a[1]+a[1]]())[a[1]])[a[1]+a[1]])(8)",
		"9",

		"f()[1][2](8)",
		"9",

		"f()[a[1]][a[1]+a[1]](8)",
		"9",

		# --------------------

		"g(x) = transpose(x)",
		"",

		"f() = [[1,g,3],[0,0,0],[0,0,0]]",
		"",

		"a=[1,f,3]",
		"",

		"a[2]()[1][2]([[1,2,3,4]])",
		"[[1],[2],[3],[4]]",

		# --------------------

		"unit(x)",
		"unit(x)",

		"unit(3)",
		"[[1,0,0],[0,1,0],[0,0,1]]",

		"unit(1)",
		"[[1]]",

		# cleanup

		"a=quote(a)",
		"",

		"b=quote(b)",
		"",

		"c=quote(c)",
		"",

		"f=quote(f)",
		"",

		"g=quote(g)",
		"",
	]
