test_contract = ->
  run_test [
    "contract(0)",
    "0",

    "contract(0.0)",
    "0",

    # this is same as contract(hilbertmatrix(20))
    # we are testing this because some versions of bigInt library
    # seemed to give problems with some gcds involved in these
    # additions of fractions
    "409741429887649/166966608033225 + 1/39",
    "414022624965424/166966608033225",

    # this is same as contract(hilbertmatrix(21))
    # we are testing this because some versions of bigInt library
    # seemed to give problems with some gcds involved in these
    # additions of fractions
    "414022624965424/166966608033225 + 1/41",
    "17141894231615609/6845630929362225",

    "contract(hilbert(50))",
    "3200355699626285671281379375916142064964/1089380862964257455695840764614254743075",

    "contract([[a,b],[c,d]])",
    "a+d",

    "contract([[1,2],[3,4]],1,2)",
    "5",

    "A=[[a11,a12],[a21,a22]]",
    "",

    "B=[[b11,b12],[b21,b22]]",
    "",

    "contract(outer(A,B),2,3)",
    "[[a11*b11+a12*b21,a11*b12+a12*b22],[a21*b11+a22*b21,a21*b12+a22*b22]]",

    "A=quote(A)",
    "",

    "B=quote(B)",
    "",
  ]
