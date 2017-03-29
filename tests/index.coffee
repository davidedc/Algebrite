test_index = ->
	run_test [

		"A=[[A11,A12],[A21,A22]]",
		"",

		"A[1,1]",
		"A11",

		"A[1,2]",
		"A12",

		"A[2,1]",
		"A21",

		"A[2,2]",
		"A22",

		"A[1]",
		"[A11,A12]",

		"A[1][2]",
		"A12",

		"A[2]",
		"[A21,A22]",

		"A[1]=[B11,B12]",
		"",

		"A",
		"[[B11,B12],[A21,A22]]",

		"A[2]=[B21,B22]",
		"",

		"A",
		"[[B11,B12],[B21,B22]]",

		"A=[[0,0],[0,0]]",
		"",

		"A[1,1]",
		"0",

		# index of scalar should throw an error

		"1[2]",
		"Stop: trying to access a scalar as a tensor",

		# clean up -----------------

		"clearall",
		"",

		# index of a non-allocated tensor
		# or index with a symbol instead of
		# a number

		"a[0]",
		"a[0]",

		"a[0,2]",
		"a[0,2]",


		"a[b]",
		"a[b]",

		"a[b,c]",
		"a[b,c]",

		"a = [1,2,3]",
		"",

		"a[b]",
		"a[b]",

	]
