test_eigen = ->
	run_test [
		"eigen(A)",
		"Stop: eigen: argument is not a square matrix",

		"eigenval(A)",
		"eigenval(A)",

		"eigenvec(A)",
		"eigenvec(A)",

		"eigen([1,2])",
		"Stop: eigen: argument is not a square matrix",

		"eigen([[1,2],[1,2]])",
		"Stop: eigen: matrix is not symmetrical",

		"eigenval([[1,1,1,1],[1,2,3,4],[1,3,6,10],[1,4,10,20]])",
		"[[0.038016,0.0,0.0,0.0],[0.0,0.453835,0.0,0.0],[0.0,0.0,2.20345,0.0],[0.0,0.0,0.0,26.3047]]",

		"eigenvec([[1,1,1,1],[1,2,3,4],[1,3,6,10],[1,4,10,20]])",
		"[[0.308686,-0.72309,0.594551,-0.168412],[0.787275,-0.163234,-0.532107,0.265358],[0.530366,0.640332,0.391832,-0.393897],[0.0601867,0.201173,0.458082,0.863752]]",

		"eigen(hilbert(50))",
		"",

		"1+trace(hilbert(50))-trace(dot(transpose(Q),D,Q))",
		"1",

		"D=quote(D)",
		"",

		"Q=quote(Q)",
		"",

		"A=hilbert(3)",
		"",

		"eigen(A)",
		"",

		"D-eigenval(A)",
		"[[0,0,0],[0,0,0],[0,0,0]]",

		"Q-eigenvec(A)",
		"[[0,0,0],[0,0,0],[0,0,0]]",

		"A=quote(A)",
		"",

		"D=quote(D)",
		"",

		"Q=quote(Q)",
		"",
	]
