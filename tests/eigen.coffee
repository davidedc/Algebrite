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
    "[[0.038016...,0.0,0.0,0.0],[0.0,0.453835...,0.0,0.0],[0.0,0.0,2.203446...,0.0],[0.0,0.0,0.0,26.304703...]]",

    "eigenvec([[1,1,1,1],[1,2,3,4],[1,3,6,10],[1,4,10,20]])",
    "[[0.308686...,-0.723090...,0.594551...,-0.168412...],[0.787275...,-0.163234...,-0.532107...,0.265358...],[0.530366...,0.640332...,0.391832...,-0.393897...],[0.060187...,0.201173...,0.458082...,0.863752...]]",
    "eigen(hilbert(20))",
    "",

    # "contract" is the trace, but "trace" is a debugging flag in
    # Algebrite/Eigenmath
    # this one takes quite some time to finish because of the
    # "dot(transpose(Q),D,Q))" calculation. Note that since
    # D and Q are matrices of doubles, the whole result is a double.
    # also note that the result gives "-0.000000...", that's why I put the abs there
    # Note that this should be really "0" however, because of calculation errors,
    # it doesn't test equal to "0", so we get to this result
    "abs(contract(hilbert(20))-contract(dot(transpose(Q),D,Q)))",
    "0.000000...",

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
